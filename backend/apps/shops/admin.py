from django.contrib import admin
from .models import Shop


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    """Admin interface for Shop model"""
    
    list_display = (
        'name', 'owner', 'subscription_tier', 'rating_average',
        'total_ratings', 'is_active', 'created_at'
    )
    list_filter = ('subscription_tier', 'is_active', 'created_at')
    search_fields = ('name', 'owner__username', 'owner__email', 'address')
    ordering = ('-created_at',)
    readonly_fields = ('rating_average', 'total_ratings', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('owner', 'name', 'description')
        }),
        ('Location', {
            'fields': ('address', 'location_lat', 'location_lng')
        }),
        ('Contact', {
            'fields': ('phone', 'email')
        }),
        ('Business Hours', {
            'fields': ('business_hours',),
            'classes': ('collapse',)
        }),
        ('Subscription', {
            'fields': ('subscription_tier', 'subscription_expires_at')
        }),
        ('Ratings', {
            'fields': ('rating_average', 'total_ratings'),
            'classes': ('collapse',)
        }),
        ('Media', {
            'fields': ('images',),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
