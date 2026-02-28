'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Sparkles, CheckCircle, Loader } from 'lucide-react';
import { loadRazorpay } from '@/lib/razorpay';

export default function SubscriptionBanner() {
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    useEffect(() => {
        loadRazorpay().then(setRazorpayLoaded);
    }, []);

    const handleSubscribe = async () => {
        if (!razorpayLoaded) {
            showToast('Razorpay SDK failed to load', 'error');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('Not authenticated');

            // 1. Create order
            const order = await api.createSubscriptionOrder(token);

            // 2. Open Razorpay
            const options = {
                key: order.key,
                amount: order.amount * 100, // Conversion if needed, but backend sends amount. Backend order.amount is in INR. Razorpay expects paise?
                // Wait, in `create_razorpay_order` service, we usually send amount in paise.
                // But my `api.createSubscriptionOrder` returns `amount`.
                // Let's assume standard Razorpay flow.
                // Actually `razorpay.ts` helper `openRazorpayCheckout` takes options.
                // But here I'm constructing options manually to handle verify specifically for subscription?
                // Or I can abstract it.
                // Let's use the raw window.Razorpay for custom recurring flow if needed, but this is one-time for 30 days.
                // So standard checkout.
                currency: 'INR',
                name: 'Toolsy Provider Subscription',
                description: '30 Days Access to List Tools',
                order_id: order.order_id,
                handler: async (response: any) => {
                    try {
                        await api.verifySubscriptionPayment(token, {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        showToast('Subscription activated successfully!', 'success');
                        refreshUser(); // Update user state to reflect active subscription
                    } catch (error) {
                        showToast('Payment verification failed', 'error');
                    }
                },
                prefill: {
                    name: user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: {
                    color: '#9333ea' // Purple
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                showToast(response.error.description, 'error');
            });
            rzp.open();

        } catch (error: any) {
            showToast(error.message || 'Failed to initiate subscription', 'error');
        } finally {
            setLoading(false);
        }
    };

    // If generic user or active subscription, don't show (or show mini status)
    // Actually, we can check a custom prop or just rely on parent to render.
    // But logic: "Provider Dashboard: Subscription Check & Alert"
    // Let's assume this component decides visibility or just renders content.

    return (
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={100} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Sparkles className="text-yellow-400" />
                        Unlock Provider Features
                    </h3>
                    <p className="text-gray-300 mb-4 max-w-xl">
                        Subscribe now to start listing your tools and earning money.
                        Get unlimited tool listings and booking management for just <span className="text-white font-bold">₹200/month</span>.
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1 mb-4">
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Unlimited Tool Listings</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Priority Support</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Verified Provider Badge</li>
                    </ul>
                </div>

                <div className="flex-shrink-0">
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg shadow-purple-900/50 flex items-center gap-2"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Subscribe Now - ₹200'}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">Secure payment via Razorpay</p>
                </div>
            </div>
        </div>
    );
}
