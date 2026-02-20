'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import { X, Calendar, Clock, CreditCard, Banknote, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookingModalProps {
    tool: {
        id: string;
        name: string;
        price_per_day: number;
        deposit_amount: number;
        shop: {
            name: string;
        }
    };
    isOpen: boolean;
    onClose: () => void;
}

export default function BookingModal({ tool, isOpen, onClose }: BookingModalProps) {
    const { user, accessToken } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cash_on_return'>('razorpay');
    const [notes, setNotes] = useState('');

    // Calculated values
    const [duration, setDuration] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Minimum 1 day
            const days = diffDays || 1;

            setDuration(days);
            setTotalPrice((tool.price_per_day * days * quantity) + Number(tool.deposit_amount));
        }
    }, [startDate, endDate, quantity, tool]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) {
            showToast('Please login to book tools', 'error');
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            await api.createBooking(accessToken, {
                tool_id: tool.id,
                start_datetime: new Date(startDate).toISOString(),
                end_datetime: new Date(endDate).toISOString(),
                quantity,
                payment_method: paymentMethod,
                notes
            });

            showToast('Booking request sent successfully!', 'success');
            onClose();
            router.push('/bookings');
        } catch (error: any) {
            console.error('Booking failed', error);
            showToast(error.message || 'Failed to create booking', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Get today's date for min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-secondary border border-gray-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-black/40">
                    <div>
                        <h3 className="text-xl font-bold text-white">Book Tool</h3>
                        <p className="text-sm text-gray-400">Request rental from {tool.shop.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Date Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" /> Start Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    min={today}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" /> End Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    min={startDate || today}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Rate per day</span>
                                <span className="text-white">₹{tool.price_per_day}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Duration</span>
                                <span className="text-white">{duration} days</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Deposit (Refundable)</span>
                                <span className="text-white">₹{tool.deposit_amount}</span>
                            </div>
                            <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                                <span className="font-bold text-white">Total Estimated</span>
                                <span className="text-2xl font-black text-primary">₹{totalPrice}</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-300">Payment Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('razorpay')}
                                    className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'razorpay'
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-black/50 border-gray-800 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    <CreditCard className="w-6 h-6" />
                                    <span className="text-sm font-bold">Online (Razorpay)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cash_on_return')}
                                    className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cash_on_return'
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-black/50 border-gray-800 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    <Banknote className="w-6 h-6" />
                                    <span className="text-sm font-bold">Cash on Return</span>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {paymentMethod === 'razorpay'
                                    ? 'You will be asked to pay after the shop confirms your booking.'
                                    : 'Pay directly when you return the item.'}
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Message to Shop (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any special requirements or pickup time preference..."
                                className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors h-24 resize-none"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-black/40">
                    <button
                        form="booking-form"
                        type="submit"
                        disabled={loading || !startDate || !endDate}
                        className="w-full py-4 bg-primary hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing Request...
                            </>
                        ) : (
                            'Confirm Booking Request'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
