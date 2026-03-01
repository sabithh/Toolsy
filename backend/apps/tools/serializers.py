from rest_framework import serializers
from apps.tools.models import Tool, ToolCategory, Review
from apps.shops.serializers import ShopSerializer


class ToolCategorySerializer(serializers.ModelSerializer):
    """Serializer for ToolCategory"""
    
    class Meta:
        model = ToolCategory
        fields = ['id', 'name', 'slug', 'icon', 'parent']


class ToolSerializer(serializers.ModelSerializer):
    """Serializer for Tool model"""
    
    shop = ShopSerializer(read_only=True)
    category = ToolCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ToolCategory.objects.all(),
        source='category',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Tool
        fields = [
            'id', 'shop', 'category', 'category_id', 'name', 'description',
            'brand', 'model_number', 'condition', 'images',
            'quantity_available', 'quantity_total',
            'price_per_hour', 'price_per_day', 'price_per_week',
            'minimum_rental_duration', 'deposit_amount',
            'specifications', 'is_available',
            'created_at', 'updated_at', 'in_stock'
        ]
        read_only_fields = ['id', 'shop', 'created_at', 'updated_at', 'in_stock']


class ToolCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tools"""
    
    class Meta:
        model = Tool
        fields = [
            'category', 'name', 'description', 'brand', 'model_number',
            'condition', 'images', 'quantity_total', 'quantity_available',
            'price_per_hour', 'price_per_day', 'price_per_week',
            'minimum_rental_duration', 'deposit_amount',
            'specifications', 'is_available'
        ]


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    
    reviewer = serializers.StringRelatedField(read_only=True)
    shop_name = serializers.CharField(source='shop.name', read_only=True, allow_null=True)
    tool_name = serializers.CharField(source='tool.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'booking', 'reviewer', 'shop', 'shop_name',
            'tool', 'tool_name', 'rating', 'comment', 'created_at'
        ]
        read_only_fields = ['id', 'reviewer', 'created_at']
    
    def create(self, validated_data):
        """Create review and update ratings"""
        validated_data['reviewer'] = self.context['request'].user
        review = super().create(validated_data)
        return review
