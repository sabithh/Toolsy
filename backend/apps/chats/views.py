from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.bookings.models import Booking
from apps.users.notifications import send_push
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer


class ChatRoomListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Show chat rooms for bookings where user is renter or shop owner
        rooms = ChatRoom.objects.select_related(
            'booking', 'booking__tool', 'booking__shop', 'booking__shop__owner', 'booking__renter'
        ).filter(
            booking__renter=user
        ) | ChatRoom.objects.select_related(
            'booking', 'booking__tool', 'booking__shop', 'booking__shop__owner', 'booking__renter'
        ).filter(
            booking__shop__owner=user
        )
        rooms = rooms.order_by('-booking__created_at').distinct()
        serializer = ChatRoomSerializer(rooms, many=True, context={'request': request})
        return Response(serializer.data)


class ChatRoomDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        user = request.user

        if booking.renter != user and booking.shop.owner != user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        room, _ = ChatRoom.objects.get_or_create(booking=booking)
        serializer = ChatRoomSerializer(room, context={'request': request})
        return Response(serializer.data)


class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        user = request.user

        if booking.renter != user and booking.shop.owner != user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        room, _ = ChatRoom.objects.get_or_create(booking=booking)
        # Mark messages from the other party as read when this user loads the chat
        room.messages.exclude(sender=user).filter(is_read=False).update(is_read=True)
        messages = room.messages.select_related('sender').all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        user = request.user

        if booking.renter != user and booking.shop.owner != user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        room, _ = ChatRoom.objects.get_or_create(booking=booking)
        message = Message.objects.create(room=room, sender=user, message=message_text)

        # Push the other party
        recipient = booking.shop.owner if user == booking.renter else booking.renter
        preview = message_text if len(message_text) <= 80 else message_text[:77] + '...'
        send_push(
            recipient,
            f'New message from {user.username}',
            preview,
            data={'type': 'chat', 'booking_id': str(booking.id)},
        )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
