import { api } from './api';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = RAZORPAY_SCRIPT;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

interface PaymentOptions {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
    bookingId: string;
    onSuccess: (response: any) => void;
    onError: (error: any) => void;
    name?: string;
    description?: string;
    image?: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
}

export const openRazorpayCheckout = async (options: PaymentOptions) => {
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
        options.onError(new Error('Razorpay SDK failed to load'));
        return;
    }

    const rzpOptions = {
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        name: options.name || 'Toolsy',
        description: options.description || 'Tool Rental Payment',
        image: options.image || '/icon.png',
        order_id: options.orderId,
        handler: async function (response: any) {
            try {
                options.onSuccess(response);
            } catch (error) {
                options.onError(error);
            }
        },
        prefill: options.prefill,
        theme: {
            color: '#DC2626', // Crimson Red
        },
        modal: {
            ondismiss: function () {
                options.onError(new Error('Payment cancelled by user'));
            },
        },
    };

    const rzp = new window.Razorpay(rzpOptions);
    rzp.on('payment.failed', function (response: any) {
        options.onError(response.error);
    });
    rzp.open();
};
