from django.urls import path
from .views import RazorpayWebhookView

urlpatterns = [
    path('webhook/', RazorpayWebhookView.as_view(), name='razorpay-webhook'),
]
