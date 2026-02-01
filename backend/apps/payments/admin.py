from django.contrib import admin
from .models import ShopSubscription


@admin.register(ShopSubscription)
class ShopSubscriptionAdmin(admin.ModelAdmin):
    """Admin interface for ShopSubscription model"""
    list_display = (
        'shop', 'plan', 'amount', 'status',
        'starts_at', 'expires_at', 'created_at'
    )
    list_filter = ('plan', 'status', 'created_at')
    search_fields = ('shop__name', 'razorpay_subscription_id')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Subscription Details', {
            'fields': ('shop', 'plan', 'amount', 'razorpay_subscription_id')
        }),
        ('Period', {
            'fields': ('starts_at', 'expires_at')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
