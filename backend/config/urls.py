"""
Main URL configuration for Toolsy API
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from apps.users.setup_views import SetupAdminView, MigrateDatabaseView


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # JWT Authentication
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Apps
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.shops.urls')),
    path('api/', include('apps.tools.urls')),
    path('api/', include('apps.bookings.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/admin/', include('apps.admin_dashboard.urls')),
    path('api/subscriptions/', include('apps.subscriptions.urls')),
    
    # One-time admin setup (disabled after first superuser is created)
    path('api/setup/create-admin/', SetupAdminView.as_view(), name='setup-admin'),
    path('api/setup/migrate/', MigrateDatabaseView.as_view(), name='setup-migrate'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Serve media files in all environments (production uses Render's filesystem or CDN)
# Note: for ephemeral filesystems (Render free tier), images reset on redeploy.
# Migrate to Cloudinary or S3 to persist images permanently.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
