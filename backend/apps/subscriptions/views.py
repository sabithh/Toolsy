from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import Subscription
import razorpay

class CreateSubscriptionOrderView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.user_type != 'provider':
            return Response({'error': 'Only providers can subscribe'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check active subscription
        active_sub = user.subscriptions.filter(status='active', end_date__gt=timezone.now()).exists()
        if active_sub:
             return Response({'message': 'You already have an active subscription'}, status=status.HTTP_400_BAD_REQUEST)

        amount = 200  # in INR
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            order = client.order.create({
                'amount': amount * 100,  # in paise
                'currency': 'INR',
                'notes': {'type': 'subscription', 'user_id': str(user.id)}
            })
            sub = Subscription.objects.create(
                user=user,
                razorpay_order_id=order['id'],
                amount=amount,
                status='pending'
            )
            return Response({
                'order_id': order['id'],
                'amount': amount,
                'key': settings.RAZORPAY_KEY_ID,
                'subscription_id': str(sub.id)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifySubscriptionPaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        try:
            razorpay_payment_id = data.get('razorpay_payment_id')
            razorpay_order_id = data.get('razorpay_order_id')
            razorpay_signature = data.get('razorpay_signature')
            
            if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
                 return Response({'error': 'Missing payment details'}, status=status.HTTP_400_BAD_REQUEST)

            if verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
                sub = Subscription.objects.get(razorpay_order_id=razorpay_order_id)
                sub.status = 'active'
                sub.razorpay_payment_id = razorpay_payment_id
                sub.start_date = timezone.now()
                sub.end_date = timezone.now() + timedelta(days=30)
                sub.save()
                return Response({'status': 'subscription activated'})
            else:
                return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
        except Subscription.DoesNotExist:
             return Response({'error': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
