'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { X, CreditCard, Loader2 } from 'lucide-react';

interface PaymentModalProps {
    booking: {
        id: string;
        tool_name: string;
        total_amount: number;
        start_date: string;
        end_date: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({ booking, isOpen, onClose, onSuccess }: PaymentModalProps) {
    const { token, user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handlePayment = async () => {
        if (!token) return;

        setLoading(true);
        try {
            // 1. Create Order
            const order = await api.createPayment(token, booking.id);

            // 2. Open Checkout
            await openRazorpayCheckout({
                orderId: order.order_id,
                amount: order.amount,
                currency: order.currency,
                key: order.key,
                bookingId: booking.id,
                name: 'Toolsy Rental',
                description: `Payment for ${booking.tool_name}`,
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: '', // Add contact if available in user profile
                },
                onSuccess: async (response) => {
                    try {
                        await api.verifyPayment(token, booking.id, {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        showToast('Payment successful! Booking activated.', 'success');
                        onSuccess();
                        onClose();
                    } catch (error) {
                        console.error('Verification failed', error);
                        showToast('Payment verification failed', 'error');
                    }
                },
                onError: (error) => {
                    console.error('Payment failed', error);
                    showToast(error.message || 'Payment failed', 'error');
                    setLoading(false);
                },
            });
        } catch (error: any) {
            console.error('Order creation failed', error);
            showToast(error.message || 'Failed to initiate payment', 'error');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-secondary border border-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Complete Payment
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tool</span>
                            <span className="font-medium text-white">{booking.tool_name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Duration</span>
                            <span className="text-white">
                                {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="border-t border-gray-800 pt-2 flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Total Amount</span>
                            <span className="text-xl font-bold text-primary">₹{booking.total_amount}</span>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-primary hover:bg-red-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Pay Now
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-gray-500">
                        Secured by Razorpay. Refunds processed automatically on cancellation.
                    </p>
                </div>
            </div>
        </div>
    );
}
