from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from .models import DeviceToken
from .serializers import UserSerializer, UserRegistrationSerializer, UserProfileSerializer

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User CRUD operations"""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_queryset(self):
        """Restrict non-admins to only their own user data"""
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.is_superuser):
            return User.objects.all()
        return User.objects.filter(pk=user.pk)
    
    def get_permissions(self):
        """Custom permissions based on action"""
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return UserRegistrationSerializer
        if self.action in ['me', 'update_profile']:
            return UserProfileSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='device-token')
    def register_device_token(self, request):
        """Register or refresh an FCM device token for the current user."""
        token = (request.data.get('token') or '').strip()
        platform = (request.data.get('platform') or 'android').strip().lower()
        if not token:
            return Response({'detail': 'token is required'}, status=status.HTTP_400_BAD_REQUEST)
        if platform not in dict(DeviceToken.PLATFORM_CHOICES):
            platform = 'android'
        obj, _ = DeviceToken.objects.update_or_create(
            token=token,
            defaults={'user': request.user, 'platform': platform, 'is_active': True},
        )
        return Response({
            'id': str(obj.id),
            'platform': obj.platform,
            'created': obj.created_at,
        })

    @action(detail=False, methods=['delete'], url_path='device-token')
    def delete_device_token(self, request):
        """Deactivate a device token (e.g. on logout)."""
        token = (request.data.get('token') or request.query_params.get('token') or '').strip()
        if not token:
            return Response({'detail': 'token is required'}, status=status.HTTP_400_BAD_REQUEST)
        DeviceToken.objects.filter(user=request.user, token=token).update(is_active=False)
        return Response(status=status.HTTP_204_NO_CONTENT)
