import uuid
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator


class Shop(models.Model):
    """Tool rental shop model"""
    
    SUBSCRIPTION_TIER_CHOICES = [
        ('basic', 'Basic'),
        ('premium', 'Premium'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Owner relationship
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shops',
        limit_choices_to={'user_type': 'provider'}
    )
    
    # Shop information
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    address = models.TextField()
    
    # Geolocation (stored as lat/lng for SQLite, PointField for PostGIS)
    location_lat = models.FloatField(help_text="Shop latitude")
    location_lng = models.FloatField(help_text="Shop longitude")
    
    # Contact information
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    
    # Business hours (JSON field)
    business_hours = models.JSONField(
        default=dict,
        blank=True,
        help_text="Business hours in JSON format: {mon: {open: 09:00, close: 18:00}, ...}"
    )
    
    # Ratings
    rating_average = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0.00)]
    )
    total_ratings = models.IntegerField(default=0)
    
    # Subscription
    subscription_tier = models.CharField(
        max_length=10,
        choices=SUBSCRIPTION_TIER_CHOICES,
        default='basic'
    )
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Images (JSON array of URLs)
    images = models.JSONField(
        default=list,
        blank=True,
        help_text="Array of image URLs"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'shops'
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['subscription_tier']),
            models.Index(fields=['is_active']),
        ]
        # GiST index for location will be added in migration
    
    def __str__(self):
        return self.name
    
    @property
    def has_active_subscription(self):
        """Check if shop has active subscription"""
        if not self.subscription_expires_at:
            return False
        from django.utils import timezone
        return self.subscription_expires_at > timezone.now()
    
    def update_rating(self):
        """Recalculate average rating from reviews"""
        from apps.tools.models import Review
        reviews = Review.objects.filter(shop=self)
        if reviews.exists():
            self.total_ratings = reviews.count()
            self.rating_average = reviews.aggregate(
                avg=models.Avg('rating')
            )['avg'] or 0.00
        else:
            # Reset to zero when last review is deleted
            self.total_ratings = 0
            self.rating_average = 0.00
        self.save(update_fields=['rating_average', 'total_ratings'])
