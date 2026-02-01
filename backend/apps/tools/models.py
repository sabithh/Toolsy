import uuid
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.shops.models import Shop


class ToolCategory(models.Model):
    """Tool categories for classification"""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(
        max_length=50,
        blank=True,
        help_text="Icon name or SVG reference"
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    
    class Meta:
        db_table = 'tool_categories'
        verbose_name_plural = 'Tool Categories'
    
    def __str__(self):
        return self.name


class Tool(models.Model):
    """Tool listing model"""
    
    CONDITION_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name='tools'
    )
    category = models.ForeignKey(
        ToolCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='tools'
    )
    
    # Basic information
    name = models.CharField(max_length=200)
    description = models.TextField()
    brand = models.CharField(max_length=100, blank=True)
    model_number = models.CharField(max_length=100, blank=True)
    condition = models.CharField(
        max_length=10,
        choices=CONDITION_CHOICES,
        default='good'
    )
    
    # Images
    images = models.JSONField(
        default=list,
        blank=True,
        help_text="Array of image URLs"
    )
    
    # Quantity management
    quantity_available = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0)]
    )
    quantity_total = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    
    # Pricing
    price_per_hour = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.01)]
    )
    price_per_day = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    price_per_week = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.01)]
    )
    
    # Rental terms
    minimum_rental_duration = models.IntegerField(
        default=1,
        help_text="Minimum rental duration in hours"
    )
    deposit_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0.00)]
    )
    
    # Specifications (JSON)
    specifications = models.JSONField(
        default=dict,
        blank=True,
        help_text="Tool specifications in JSON format"
    )
    
    # Availability
    is_available = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tools'
        indexes = [
            models.Index(fields=['shop']),
            models.Index(fields=['category']),
            models.Index(fields=['is_available']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.shop.name}"
    
    @property
    def in_stock(self):
        """Check if tool is currently in stock"""
        return self.quantity_available > 0


class Review(models.Model):
    """Review model for tools and shops"""
    
    # Relationships
    booking = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='review'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True
    )
    tool = models.ForeignKey(
        Tool,
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True
    )
    
    # Review content
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reviews'
        indexes = [
            models.Index(fields=['shop']),
            models.Index(fields=['tool']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"Review by {self.reviewer.username} - {self.rating}★"
    
    def save(self, *args, **kwargs):
        """Update shop/tool ratings after saving review"""
        super().save(*args, **kwargs)
        if self.shop:
            self.shop.update_rating()
        if self.tool:
            # Update tool rating if needed
            pass
