import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Supports both tool renters and shop providers.
    """
    USER_TYPE_CHOICES = [
        ('renter', 'Renter'),
        ('provider', 'Provider'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # User type
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='renter'
    )
    
    # Contact information
    phone = models.CharField(max_length=15, blank=True, null=True)
    # Override email to enforce uniqueness (AbstractUser doesn't do this by default)
    email = models.EmailField(unique=True)

    
    # Profile
    profile_image = models.ImageField(
        upload_to='profile_images/',
        blank=True,
        null=True
    )
    
    # Geolocation (requires PostGIS - optional for SQLite)
    # Note: In SQLite mode, location will be stored as CharField
    # In production with PostGIS, this becomes a PointField
    location_lat = models.FloatField(null=True, blank=True, help_text="Latitude")
    location_lng = models.FloatField(null=True, blank=True, help_text="Longitude")
    
    # Verification
    is_verified = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['user_type']),
        ]
        # GiST index for location will be added in migration
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    @property
    def is_provider(self):
        """Check if user is a shop provider"""
        return self.user_type == 'provider'
    
    @property
    def is_renter(self):
        """Check if user is a tool renter"""
        return self.user_type == 'renter'
