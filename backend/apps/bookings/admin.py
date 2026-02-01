from django.contrib import admin
from .models import Booking, Notification


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin interface for Booking model"""
    list_display = (
        'id', 'renter', 'tool', 'shop', 'status',
        'payment_status', 'payment_method', 'total_amount', 'created_at'
    )
    list_filter = ('status', 'payment_status', 'payment_method', 'created_at')
    search_fields = (
        'id', 'renter__username', 'tool__name',
        'shop__name', 'razorpay_order_id'
    )
    ordering = ('-created_at',)
    readonly_fields = ('total_amount', 'duration_hours', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('renter', 'tool', 'shop', 'quantity')
        }),
        ('Schedule', {
            'fields': (
                'start_datetime', 'end_datetime', 'duration_hours',
                'pickup_time', 'return_time'
            )
        }),
        ('Pricing', {
            'fields': ('rental_price', 'deposit_amount', 'total_amount')
        }),
        ('Payment', {
            'fields': (
                'payment_method', 'payment_status',
                'razorpay_order_id', 'razorpay_payment_id'
            )
        }),
        ('Status', {
            'fields': ('status', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin interface for Notification model"""
    list_display = ('title', 'user', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
