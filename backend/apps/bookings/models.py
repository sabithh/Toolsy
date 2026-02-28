import uuid
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator
from apps.tools.models import Tool
from apps.shops.models import Shop


class Booking(models.Model):
    """Booking model for tool rentals"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active'),
        ('returned', 'Returned'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('razorpay', 'Razorpay'),
        ('cash_on_return', 'Cash on Return'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    renter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
        limit_choices_to={'user_type': 'renter'}
    )
    tool = models.ForeignKey(
        Tool,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    
    # Booking details
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    duration_hours = models.IntegerField(validators=[MinValueValidator(1)])
    
    # Pricing
    rental_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.00)]
    )
    deposit_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0.00)]
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.00)]
    )
    
    # Status
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending'
    )
    payment_status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='razorpay'
    )
    
    # Razorpay fields (nullable for cash payments)
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    
    # Pickup/return times
    pickup_time = models.DateTimeField(null=True, blank=True)
    return_time = models.DateTimeField(null=True, blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bookings'
        indexes = [
            models.Index(fields=['renter']),
            models.Index(fields=['shop']),
            models.Index(fields=['status']),
            models.Index(fields=['start_datetime']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"Booking {self.id} - {self.tool.name}"
    
    def save(self, *args, **kwargs):
        """Calculate total amount and validate dates"""
        if self.start_datetime and self.end_datetime:
            # Calculate duration in hours
            duration = (self.end_datetime - self.start_datetime).total_seconds() / 3600
            self.duration_hours = max(1, int(duration))
            
            # rental_price is per-unit; multiply by quantity, then add deposit
            quantity = self.quantity or 1
            self.total_amount = (self.rental_price * quantity) + self.deposit_amount
        
        super().save(*args, **kwargs)


class Notification(models.Model):
    """Notification model for users"""
    
    TYPE_CHOICES = [
        ('booking', 'Booking'),
        ('payment', 'Payment'),
        ('review', 'Review'),
        ('subscription', 'Subscription'),
    ]
    
    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    
    # Notification details
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    
    # Related object (generic foreign key can be added later)
    related_object_id = models.CharField(max_length=100, blank=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
