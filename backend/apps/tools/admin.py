from django.contrib import admin
from .models import ToolCategory, Tool, Review


@admin.register(ToolCategory)
class ToolCategoryAdmin(admin.ModelAdmin):
    """Admin interface for ToolCategory model"""
    list_display = ('name', 'slug', 'parent')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    """Admin interface for Tool model"""
    list_display = (
        'name', 'shop', 'category', 'condition',
        'price_per_day', 'quantity_available', 'is_available', 'created_at'
    )
    list_filter = ('condition', 'is_available', 'category', 'created_at')
    search_fields = ('name', 'shop__name', 'brand', 'model_number')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('shop', 'category', 'name', 'description')
        }),
        ('Details', {
            'fields': ('brand', 'model_number', 'condition', 'specifications')
        }),
        ('Media', {
            'fields': ('images',)
        }),
        ('Inventory', {
            'fields': ('quantity_total', 'quantity_available', 'is_available')
        }),
        ('Pricing', {
            'fields': ('price_per_hour', 'price_per_day', 'price_per_week', 'deposit_amount')
        }),
        ('Rental Terms', {
            'fields': ('minimum_rental_duration',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin interface for Review model"""
    list_display = ('reviewer', 'shop', 'tool', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('reviewer__username', 'shop__name', 'tool__name', 'comment')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
