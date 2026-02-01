from rest_framework import serializers
from apps.shops.models import Shop
from apps.users.serializers import UserSerializer


class ShopSerializer(serializers.ModelSerializer):
    """Serializer for Shop model"""
    
    owner = UserSerializer(read_only=True)
    distance = serializers.SerializerMethodField()
    
    class Meta:
        model = Shop
        fields = [
            'id', 'owner', 'name', 'description', 'address',
            'location_lat', 'location_lng', 'phone', 'email',
            'business_hours', 'rating_average', 'total_ratings',
            'subscription_tier', 'subscription_expires_at',
            'is_active', 'images', 'created_at', 'updated_at',
            'distance'
        ]
        read_only_fields = [
            'id', 'owner', 'rating_average', 'total_ratings',
            'created_at', 'updated_at'
        ]
    
    def get_distance(self, obj):
        """Calculate distance from request location (if provided)"""
        # This will be calculated in the view if lat/lng are in request
        return getattr(obj, 'distance', None)


class ShopCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating shops"""
    
    class Meta:
        model = Shop
        fields = [
            'name', 'description', 'address',
            'location_lat', 'location_lng', 'phone', 'email',
            'business_hours', 'images'
        ]
    
    def create(self, validated_data):
        """Create shop with current user as owner"""
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ShopDetailSerializer(serializers.ModelSerializer):
    """Detailed shop serializer with tools count and reviews"""
    
    owner = UserSerializer(read_only=True)
    tools_count = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Shop
        fields = [
            'id', 'owner', 'name', 'description', 'address',
            'location_lat', 'location_lng', 'phone', 'email',
            'business_hours', 'rating_average', 'total_ratings',
            'subscription_tier', 'subscription_expires_at',
            'is_active', 'images', 'created_at', 'updated_at',
            'tools_count', 'reviews_count'
        ]
    
    def get_tools_count(self, obj):
        """Get total number of tools"""
        return obj.tools.filter(is_available=True).count()
    
    def get_reviews_count(self, obj):
        """Get total number of reviews"""
        return obj.reviews.count()
