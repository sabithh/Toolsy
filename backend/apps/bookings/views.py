from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from apps.bookings.models import Booking, Notification
from .serializers import (
    BookingSerializer, BookingCreateSerializer, NotificationSerializer
)


class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet for Booking operations"""
    
    queryset = Booking.objects.select_related('renter', 'tool', 'shop').all()
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
