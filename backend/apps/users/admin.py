from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, DeviceToken


@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'platform', 'is_active', 'created_at')
    list_filter = ('platform', 'is_active')
    search_fields = ('user__username', 'token')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for custom User model"""
    
    list_display = ('username', 'email', 'user_type', 'is_verified', 'is_staff', 'created_at')
    list_filter = ('user_type', 'is_verified', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'phone')
    ordering = ('-created_at',)
    
    # Add custom fields to fieldsets
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {
            'fields': ('user_type', 'phone', 'profile_image', 'location_lat', 'location_lng', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    # Add custom fields to add_fieldsets (when creating new user)
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Fields', {
            'fields': ('user_type', 'phone', 'profile_image')
        }),
    )
