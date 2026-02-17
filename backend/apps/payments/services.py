import razorpay
from django.conf import settings
from rest_framework.exceptions import ValidationError

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

def create_razorpay_order(booking):
    """
    Create a Razorpay order for a booking
    """
    amount = int(booking.total_amount * 100)  # Convert to paise
    currency = 'INR'
    
    try:
        data = {
            'amount': amount,
            'currency': currency,
            'receipt': str(booking.id),
            'notes': {
                'booking_id': str(booking.id),
                'tool_name': booking.tool.name,
                'renter_id': str(booking.renter.id)
            }
        }
        order = client.order.create(data=data)
        return order
    except Exception as e:
        raise ValidationError(f"Error creating Razorpay order: {str(e)}")

def verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    """
    Verify the payment signature returned by Razorpay
    """
    try:
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        client.utility.verify_payment_signature(params_dict)
        return True
    except razorpay.errors.SignatureVerificationError:
        return False
    except Exception as e:
        raise ValidationError(f"Error verifying payment signature: {str(e)}")

def process_refund(payment_id, amount=None):
    """
    Process a refund for a payment
    amount is optional (full refund if not provided)
    """
    try:
        data = {}
        if amount:
            data['amount'] = int(amount * 100)  # Convert to paise
            
        return client.payment.refund(payment_id, data)
    except Exception as e:
        # Log error here
        print(f"Refund error: {str(e)}")
        return None
