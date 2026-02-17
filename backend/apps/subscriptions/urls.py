from django.urls import path
from .views import CreateSubscriptionOrderView, VerifySubscriptionPaymentView

urlpatterns = [
    path('create_order/', CreateSubscriptionOrderView.as_view(), name='subscription-create-order'),
    path('verify_payment/', VerifySubscriptionPaymentView.as_view(), name='subscription-verify-payment'),
]
