'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/ui/Modal';
import PaymentModal from '@/components/PaymentModal';

interface Booking {
    id: string;
    tool: {
        name: string;
    };
    shop: {
        name: string;
    };
    quantity: number;
    start_datetime: string;
    end_datetime: string;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
}

export default function BookingsPage() {
    const { accessToken, isAuthenticated, isRenter, user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [bookingToAuth, setBookingToAuth] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [bookingToPay, setBookingToPay] = useState<Booking | null>(null);

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            loadBookings();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, accessToken]);

    const loadBookings = async () => {
        try {
            const data = await api.getBookings(accessToken!);
            setBookings(Array.isArray(data) ? data : (data as any).results || []);
        } catch (err: any) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleAuthClick = (id: string) => {
        setBookingToAuth(id);
        setShowAuthModal(true);
    };

    const handleConfirmAuth = async () => {
        if (!bookingToAuth) return;

        try {
            await api.confirmBooking(accessToken!, bookingToAuth);
            setShowAuthModal(false);
            setBookingToAuth(null);
            loadBookings();
        } catch (err: any) {
            alert('Failed to authorize: ' + err.message);
            setShowAuthModal(false);
        }
    };

    const handleCancelClick = (id: string) => {
        setBookingToCancel(id);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;

        try {
            await api.cancelBooking(accessToken!, bookingToCancel);
            setShowCancelModal(false);
            setBookingToCancel(null);
            loadBookings(); // Reload bookings
        } catch (err: any) {
            alert('Failed to cancel booking: ' + err.message);
            setShowCancelModal(false);
        }
    };

    const handlePayClick = (booking: Booking) => {
        setBookingToPay(booking);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = () => {
        loadBookings();
        setShowPaymentModal(false);
        setBookingToPay(null);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-900/20 text-yellow-500 border border-yellow-900/50',
            confirmed: 'bg-blue-900/20 text-blue-500 border border-blue-900/50',
            active: 'bg-green-900/20 text-green-500 border border-green-900/50',
            returned: 'bg-gray-800 text-gray-400 border border-gray-700',
            cancelled: 'bg-red-900/20 text-red-500 border border-red-900/50',
        };
        return colors[status] || 'bg-gray-800 text-gray-400';
    };

    return (
        <div className="min-h-screen bg-[#DC2626] text-black py-24">
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
                title="ABORT REQUISITION?"
                description="Are you sure you want to cancel this booking? This action cannot be undone."
                confirmText="CONFIRM ABORT"
                cancelText="RETURN"
                variant="danger"
            />
            <Modal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onConfirm={handleConfirmAuth}
                title="AUTHORIZE TRANSACTION?"
                description="This will confirm the booking and reserve the inventory. This action initiates the rental contract."
                confirmText="AUTHORIZE"
                cancelText="CANCEL"
                variant="success"
            />
            {bookingToPay && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                    booking={{
                        id: bookingToPay.id,
                        tool_name: bookingToPay.tool.name,
                        total_amount: bookingToPay.total_amount,
                        start_date: bookingToPay.start_datetime,
                        end_date: bookingToPay.end_datetime
                    }}
                />
            )}
            <div className="container-custom">
                <div className="flex justify-between items-end mb-16 border-b border-black pb-8">
                    <div>
                        <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-2 text-black">
                            {isRenter ? 'Mission' : 'Shop'} <span className="text-white">Logs</span>
                        </h1>
                        <p className="text-black/60 font-mono text-sm uppercase tracking-widest">
                            // DATABASE_ID: {user?.username}
                        </p>
                    </div>
                    <Link
                        href={isRenter ? "/tools" : "/tools/new"}
                        className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors border-2 border-black"
                    >
                        {isRenter ? 'New Requisition' : 'Deploy Unit'}
                    </Link>
                </div>

                {error && (
                    <div className="bg-black/10 border border-black text-black p-4 font-mono mb-8 flex items-center gap-4">
                        <span className="font-bold">ERROR_CODE:</span> {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="border border-dashed border-black/20 p-24 text-center">
                        <p className="text-2xl font-black uppercase tracking-widest text-[#333] mb-4">No Active Logs Found</p>
                        <p className="text-black/60 font-mono mb-8">INITIATE A NEW TRANSACTION PROTOCOL</p>
                        {isRenter && (
                            <Link href="/tools" className="inline-block border border-black/30 px-8 py-3 hover:border-black hover:bg-black hover:text-white transition-colors font-bold uppercase tracking-wider text-black">
                                Access Tool Database
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="relative border-l border-black ml-4 md:ml-12 space-y-12 pl-12">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="relative group">
                                {/* Timeline Node */}
                                <div className="absolute -left-[53px] top-0 w-3 h-3 bg-black rotate-45 group-hover:scale-150 transition-transform"></div>

                                <div className="bg-black border border-black p-8 hover:border-white transition-colors duration-300">
                                    <div className="flex flex-col md:flex-row justify-between gap-8">
                                        {/* Main Details */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </div>
                                                <div className="text-gray-500 font-mono text-xs">
                                                    ID: {booking.id.split('-')[0]}
                                                </div>
                                            </div>

                                            <h3 className="text-3xl font-black uppercase tracking-tight mb-2 text-white group-hover:text-[#DC2626] transition-colors">
                                                {booking.tool.name}
                                            </h3>
                                            <div className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-6">
                                                Provider Node: {booking.shop.name}
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-6 font-mono text-xs text-gray-400">
                                                <div>
                                                    <div className="text-gray-600 mb-1">REQ_START</div>
                                                    <div className="text-white">{new Date(booking.start_datetime).toLocaleDateString()}</div>
                                                    <div className="text-[#DC2626]">{new Date(booking.start_datetime).toLocaleTimeString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-600 mb-1">REQ_END</div>
                                                    <div className="text-white">{new Date(booking.end_datetime).toLocaleDateString()}</div>
                                                    <div className="text-[#DC2626]">{new Date(booking.end_datetime).toLocaleTimeString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-600 mb-1">UNITS</div>
                                                    <div className="text-white text-lg">{booking.quantity}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-600 mb-1">TOTAL_VAL</div>
                                                    <div className="text-white text-lg">₹{booking.total_amount}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions / Payment Status */}
                                        <div className="flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 min-w-[200px]">
                                            <div className={`w-full text-center py-2 text-xs font-bold uppercase tracking-widest ${booking.payment_status === 'paid'
                                                ? 'bg-green-900/20 text-green-500 border border-green-900/50'
                                                : 'bg-yellow-900/20 text-yellow-500 border border-yellow-900/50'
                                                }`}>
                                                PAYMENT: {booking.payment_status}
                                            </div>

                                            {booking.status === 'confirmed' && booking.payment_status === 'pending' && isRenter && booking.payment_method === 'razorpay' && (
                                                <button
                                                    onClick={() => handlePayClick(booking)}
                                                    className="w-full bg-[#DC2626] text-white hover:bg-red-700 py-3 text-xs font-bold uppercase tracking-widest transition-colors mb-4 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                                                >
                                                    Pay Now
                                                </button>
                                            )}

                                            {booking.status === 'pending' && (
                                                <div className="w-full space-y-3 mt-4">
                                                    {!isRenter && (
                                                        <button
                                                            onClick={() => handleAuthClick(booking.id)}
                                                            className="w-full border border-green-900/50 text-green-500 hover:bg-green-900/20 py-3 text-xs font-bold uppercase tracking-widest transition-colors"
                                                        >
                                                            Authorize Request
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleCancelClick(booking.id)}
                                                        className="w-full border border-red-900/50 text-red-500 hover:bg-red-900/20 py-3 text-xs font-bold uppercase tracking-widest transition-colors"
                                                    >
                                                        {isRenter ? 'Abort Request' : 'Decline Request'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
