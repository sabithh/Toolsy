from django.urls import path
from .views import ChatRoomListView, ChatRoomDetailView, MessageListView

urlpatterns = [
    path('chats/', ChatRoomListView.as_view(), name='chat-list'),
    path('chats/<uuid:booking_id>/', ChatRoomDetailView.as_view(), name='chat-detail'),
    path('chats/<uuid:booking_id>/messages/', MessageListView.as_view(), name='chat-messages'),
]
