from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from apps.bookings.models import Booking
from apps.payments.services import _get_client
import razorpay
import json
import logging

logger = logging.getLogger(__name__)

class RazorpayWebhookView(APIView):
    """
    Handle Razorpay webhooks
    """
    authentication_classes = []  # Webhook doesn't use JWT auth
    permission_classes = []      # Open endpoint for Razorpay

    def post(self, request):
        webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
        webhook_signature = request.headers.get('X-Razorpay-Signature')

        if not webhook_signature:
            return Response({'error': 'Missing signature'}, status=status.HTTP_400_BAD_REQUEST)

        if not webhook_secret:
            logger.error("RAZORPAY_WEBHOOK_SECRET not configured")
            return Response({'error': 'Webhook not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Verify webhook signature using shared lazy client
            _get_client().utility.verify_webhook_signature(
                request.body.decode('utf-8'),
                webhook_signature,
                webhook_secret
            )

            event = json.loads(request.body)
            event_type = event.get('event')
            payload = event.get('payload', {})

            if event_type == 'payment.captured':
                payment_entity = payload.get('payment', {}).get('entity', {})
                order_id = payment_entity.get('order_id')
                payment_id = payment_entity.get('id')
                
                # Find booking by order_id
                try:
                    booking = Booking.objects.get(razorpay_order_id=order_id)
                    
                    if booking.payment_status != 'paid':
                        booking.payment_status = 'paid'
                        booking.status = 'active'  # Promote to active, matching verify_payment flow
                        booking.razorpay_payment_id = payment_id
                        booking.save(update_fields=['payment_status', 'status', 'razorpay_payment_id'])
                        logger.info(f"Payment captured and booking {booking.id} activated via webhook")
                        
                except Booking.DoesNotExist:
                    logger.warning(f"Booking not found for order_id: {order_id}")

            return Response({'status': 'ok'})

        except razorpay.errors.SignatureVerificationError:
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Webhook error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
