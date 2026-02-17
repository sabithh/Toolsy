from rest_framework import viewsets, status
from django.conf import settings
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from apps.bookings.models import Booking, Notification
from apps.payments.services import create_razorpay_order, verify_payment_signature
from .serializers import (
    BookingSerializer, BookingCreateSerializer, NotificationSerializer
)


class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet for Booking operations"""
    
    queryset = Booking.objects.select_related(
        'renter', 
        'tool', 
        'tool__category',
        'shop', 
        'shop__owner'
    ).all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'payment_method']
    ordering_fields = ['created_at', 'start_datetime']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter bookings based on user"""
        user = self.request.user
        
        # Providers see bookings for their shops
        if user.user_type == 'provider':
            return self.queryset.filter(shop__owner=user)
        
        # Renters see their own bookings
        return self.queryset.filter(renter=user)
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a pending booking (shop owner only)"""
        booking = self.get_object()
        
        # Only shop owner can confirm
        if booking.shop.owner != request.user:
            return Response(
                {'error': 'Only shop owner can confirm bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status != 'pending':
            return Response(
                {'error': 'Only pending bookings can be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'confirmed'
        booking.save(update_fields=['status'])
        
        # Send notification to renter
        Notification.objects.create(
            user=booking.renter,
            type='booking',
            title='Booking Confirmed',
            message=f'Your booking for {booking.tool.name} has been confirmed. Please complete payment to activate it.'
        )
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        # Only renter or shop owner can cancel
        if booking.renter != request.user and booking.shop.owner != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status in ['returned', 'cancelled']:
            return Response(
                {'error': 'Cannot cancel completed or cancelled booking'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Restore tool quantity
        booking.tool.quantity_available += booking.quantity
        booking.tool.save(update_fields=['quantity_available'])
        
        booking.status = 'cancelled'
        booking.save(update_fields=['status'])
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)



    @action(detail=True, methods=['post'])
    def create_payment(self, request, pk=None):
        """Create Razorpay order for booking"""
        booking = self.get_object()
        
        # Validation
        if booking.status != 'confirmed':
             return Response(
                {'error': 'Booking must be confirmed before payment'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if booking.payment_status == 'paid':
            return Response(
                {'error': 'Booking is already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if booking.payment_method != 'razorpay':
            return Response(
                {'error': 'Payment method is not Razorpay'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            order = create_razorpay_order(booking)
            booking.razorpay_order_id = order['id']
            booking.save(update_fields=['razorpay_order_id'])
            
            return Response({
                'order_id': order['id'],
                'amount': order['amount'],
                'currency': order['currency'],
                'key': settings.RAZORPAY_KEY_ID
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        """Verify Razorpay payment"""
        booking = self.get_object()
        
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        if not razorpay_payment_id or not razorpay_signature:
            return Response(
                {'error': 'Missing payment details'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not booking.razorpay_order_id:
            return Response(
                {'error': 'Order ID not found for booking'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            is_valid = verify_payment_signature(
                booking.razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            )
            
            if is_valid:
                booking.payment_status = 'paid'
                booking.razorpay_payment_id = razorpay_payment_id
                booking.status = 'active'  # Automatically activate paid booking
                booking.save(update_fields=['payment_status', 'razorpay_payment_id', 'status'])
                
                # Notify both parties
                Notification.objects.create(
                    user=booking.renter,
                    type='payment',
                    title='Payment Successful',
                    message=f'Payment for {booking.tool.name} was successful. Your booking is active!'
                )
                
                Notification.objects.create(
                    user=booking.shop.owner,
                    type='payment',
                    title='Payment Received',
                    message=f'Payment received for booking {booking.id}'
                )
                
                return Response({'status': 'Payment verified successfully'})
            else:
                return Response(
                    {'error': 'Invalid payment signature'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Notification operations"""
    
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get current user's notifications"""
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().update(is_read=True)
        return Response({'status': 'All notifications marked as read'})
