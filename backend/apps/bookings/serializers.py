from rest_framework import serializers
from apps.bookings.models import Booking, Notification
from apps.tools.serializers import ToolSerializer
from apps.shops.serializers import ShopSerializer
from apps.users.serializers import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model"""
    
    renter = UserSerializer(read_only=True)
    tool = ToolSerializer(read_only=True)
    shop = ShopSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'renter', 'tool', 'shop', 'quantity',
            'start_datetime', 'end_datetime', 'duration_hours',
            'rental_price', 'deposit_amount', 'total_amount',
            'status', 'payment_status', 'payment_method',
            'razorpay_order_id', 'razorpay_payment_id',
            'pickup_time', 'return_time', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'renter', 'duration_hours', 'total_amount',
            'created_at', 'updated_at'
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""
    
    tool_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'tool_id', 'quantity', 'start_datetime', 'end_datetime',
            'rental_price', 'deposit_amount', 'payment_method', 'notes'
        ]
    
    def validate(self, attrs):
        """Validate booking data"""
        tool_id = attrs.get('tool_id')
        quantity = attrs.get('quantity', 1)
        start_time = attrs.get('start_datetime')
        end_time = attrs.get('end_datetime')
        
        # Validate tool exists
        from apps.tools.models import Tool
        try:
            tool = Tool.objects.get(id=tool_id)
        except Tool.DoesNotExist:
            raise serializers.ValidationError({'tool_id': 'Tool not found'})
        
        # Validate quantity
        if tool.quantity_available < quantity:
            raise serializers.ValidationError({
                'quantity': f'Only {tool.quantity_available} available'
            })
        
        # Validate dates
        if start_time >= end_time:
            raise serializers.ValidationError({
                'end_datetime': 'End time must be after start time'
            })
        
        attrs['tool'] = tool
        attrs['shop'] = tool.shop
        
        return attrs
    
    def create(self, validated_data):
        """Create booking and decrement tool quantity"""
        tool_id = validated_data.pop('tool_id')
        tool = validated_data['tool']
        
        # Decrement quantity
        tool.quantity_available -= validated_data['quantity']
        tool.save(update_fields=['quantity_available'])
        
        # Create booking
        validated_data['renter'] = self.context['request'].user
        booking = super().create(validated_data)
        
        return booking


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'type', 'title', 'message',
            'is_read', 'related_object_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
