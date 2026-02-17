from rest_framework import serializers
from .models import Subscription

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['id', 'user', 'start_date', 'end_date', 'status', 'amount', 'created_at']
        read_only_fields = ['id', 'user', 'start_date', 'end_date', 'status', 'amount', 'created_at']
