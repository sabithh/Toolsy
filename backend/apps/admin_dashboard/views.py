from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.utils import timezone
from apps.tools.models import Tool
from apps.bookings.models import Booking
from apps.users.serializers import UserProfileSerializer
from apps.bookings.serializers import BookingSerializer

User = get_user_model()

class IsSuperUser(permissions.BasePermission):
    """
    Allows access only to superusers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]

    def get(self, request):
        total_users = User.objects.count()
        total_tools = Tool.objects.count()
        total_bookings = Booking.objects.count()
        
        # Calculate total revenue (completed bookings)
        total_revenue = Booking.objects.filter(
            payment_status='paid'
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        # Recent activity (last 30 days)
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        new_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()
        new_bookings = Booking.objects.filter(created_at__gte=thirty_days_ago).count()

        return Response({
            'total_users': total_users,
            'total_tools': total_tools,
            'total_bookings': total_bookings,
            'total_revenue': total_revenue,
            'recent_activity': {
                'new_users': new_users,
                'new_bookings': new_bookings
            }
        })

class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']

    @action(detail=True, methods=['post'])
    def toggle_verify(self, request, pk=None):
        user = self.get_object()
        user.is_verified = not user.is_verified
        user.save()
        return Response({'status': 'verification toggled', 'is_verified': user.is_verified})
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({'status': 'activation toggled', 'is_active': user.is_active})

class AdminBookingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'tool__name', 'renter__username', 'renter__email']
