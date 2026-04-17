from rest_framework import serializers
from .models import ChatRoom, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'message', 'sender', 'created_at']

    def get_sender(self, obj):
        return {'id': str(obj.sender.id), 'username': obj.sender.username}


class ChatRoomSerializer(serializers.ModelSerializer):
    booking_id = serializers.CharField(source='booking.id')
    item_name = serializers.CharField(source='booking.tool.name', default='')
    tool = serializers.SerializerMethodField()
    booking = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'booking_id', 'item_name', 'tool', 'booking',
                  'last_message', 'last_message_time', 'unread_count']

    def get_tool(self, obj):
        return {'name': obj.booking.tool.name}

    def get_booking(self, obj):
        return {'status': obj.booking.status}

    def get_last_message(self, obj):
        last = obj.messages.last()
        return last.message if last else None

    def get_last_message_time(self, obj):
        last = obj.messages.last()
        return last.created_at.isoformat() if last else None

    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.exclude(sender=user).filter(is_read=False).count()
