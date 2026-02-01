from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone', 'profile_image', 
            'location_lat', 'location_lng',
            'is_verified', 'created_at', 'updated_at',
            'has_shop'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at', 'has_shop']

    has_shop = serializers.SerializerMethodField()

    def get_has_shop(self, obj):
        return obj.shops.exists() if hasattr(obj, 'shops') else False


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'user_type', 'phone'
        ]
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        """Create new user"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Detailed serializer for user profile with additional info"""
    
    total_bookings = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    has_shop = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone', 'profile_image',
            'location_lat', 'location_lng',
            'is_verified', 'created_at', 'updated_at',
            'total_bookings', 'total_reviews',
            'has_shop'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at', 'has_shop']
    
    def get_total_bookings(self, obj):
        """Get total number of bookings"""
        return obj.bookings.count()
    
    def get_total_reviews(self, obj):
        """Get total number of reviews written"""
        return obj.reviews.count()

    def get_has_shop(self, obj):
        return obj.shops.exists() if hasattr(obj, 'shops') else False
