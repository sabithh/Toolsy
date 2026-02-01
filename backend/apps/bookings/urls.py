from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
