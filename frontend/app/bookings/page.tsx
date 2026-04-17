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
        <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel Booking?"
                description="Are you sure you want to cancel this booking? This action cannot be undone."
                confirmText="CANCEL BOOKING"
                cancelText="GO BACK"
                variant="danger"
            />
            <Modal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onConfirm={handleConfirmAuth}
                title="Confirm Booking?"
                description="This will confirm the booking and reserve the item for the renter."
                confirmText="CONFIRM"
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="mb-4 sm:mb-0">
                        <h1 className="font-black uppercase tracking-tighter leading-none mb-1"
                            style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--text-primary)' }}>
                            {isRenter ? 'My Rentals' : 'Booking Requests'}
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-barlow), sans-serif', letterSpacing: '3px' }}>
                            @{user?.username}
                        </p>
                    </div>
                    <Link
                        href={isRenter ? "/tools" : "/tools/new"}
                        className="flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider no-underline transition-all duration-200"
                        style={{ background: 'var(--highlight)', color: 'var(--bg-primary)', borderRadius: 6 }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--highlight-hover)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--highlight)'}
                    >
                        {isRenter ? 'Browse Items' : 'List New Item'}
                    </Link>
                </div>

                {error && (
                    <div className="px-4 py-3 mb-6 text-sm" style={{ background: 'rgba(210,0,0,0.1)', border: '1px solid rgba(210,0,0,0.3)', borderRadius: 6, color: '#FF6666' }}>
                        {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center"
                        style={{ border: '2px dashed #1E1E1E', borderRadius: 8 }}>
                        <p className="text-xl font-black uppercase tracking-widest mb-2"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif' }}>No Bookings Yet</p>
                        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                            {isRenter ? 'Browse items and make your first booking.' : 'Your booking requests will appear here.'}
                        </p>
                        {isRenter && (
                            <Link href="/tools"
                                className="px-6 py-3 font-bold text-sm uppercase tracking-wider no-underline transition-all duration-200"
                                style={{ background: 'var(--highlight)', color: 'var(--bg-primary)', borderRadius: 6 }}>
                                Browse Items
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id}
                                className="p-6 transition-colors duration-200"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#D20000'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                            <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusColor(booking.status)}`} style={{ borderRadius: 4 }}>
                                                {booking.status}
                                            </div>
                                            <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                                                #{booking.id.split('-')[0]}
                                            </div>
                                        </div>
                                        <h3 className="font-black uppercase tracking-tight mb-1 transition-colors"
                                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', fontSize: '1.5rem', letterSpacing: '0.04em' }}>
                                            {booking.tool?.name ?? 'Item Removed'}
                                        </h3>
                                        <div className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                                            {booking.shop?.name ?? '—'}
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                            {[
                                                { label: 'Start', value: new Date(booking.start_datetime).toLocaleDateString(), sub: new Date(booking.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                                                { label: 'End', value: new Date(booking.end_datetime).toLocaleDateString(), sub: new Date(booking.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                                                { label: 'Quantity', value: booking.quantity.toString() },
                                                { label: 'Total', value: `₹${booking.total_amount}` },
                                            ].map(({ label, value, sub }) => (
                                                <div key={label}>
                                                    <div className="font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                                                    <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
                                                    {sub && <div style={{ color: '#D20000' }}>{sub}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[180px]">
                                        <div className={`text-center py-2 text-[10px] font-bold uppercase tracking-widest ${booking.payment_status === 'paid'
                                            ? 'bg-green-900/20 text-green-500 border border-green-900/50'
                                            : 'bg-yellow-900/20 text-yellow-500 border border-yellow-900/50'
                                            }`} style={{ borderRadius: 4 }}>
                                            Payment: {booking.payment_status}
                                        </div>

                                        {booking.status === 'confirmed' && booking.payment_status === 'pending' && isRenter && booking.payment_method === 'razorpay' && (
                                            <button
                                                onClick={() => handlePayClick(booking)}
                                                className="w-full py-3 text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer"
                                                style={{ background: '#D20000', color: 'white', border: 'none', borderRadius: 6 }}
                                            >
                                                Pay Now
                                            </button>
                                        )}

                                        {booking.status === 'pending' && (
                                            <div className="space-y-2">
                                                {!isRenter && (
                                                    <button
                                                        onClick={() => handleAuthClick(booking.id)}
                                                        className="w-full py-2.5 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                                                        style={{ background: 'rgba(0,200,80,0.1)', color: '#00C850', border: '1px solid rgba(0,200,80,0.2)', borderRadius: 6 }}
                                                    >
                                                        Confirm Booking
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleCancelClick(booking.id)}
                                                    className="w-full py-2.5 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                                                    style={{ background: 'rgba(210,0,0,0.1)', color: '#D20000', border: '1px solid rgba(210,0,0,0.2)', borderRadius: 6 }}
                                                >
                                                    {isRenter ? 'Cancel Booking' : 'Decline'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Chat button for active/confirmed bookings */}
                                        {(booking.status === 'active' || booking.status === 'confirmed') && (
                                            <Link href={`/chats/${booking.id}`}
                                                className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-widest no-underline transition-all duration-200"
                                                style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6 }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; (e.currentTarget as HTMLElement).style.color = '#D20000'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}>
                                                {isRenter ? 'Chat with Owner' : 'Chat with Renter'}
                                            </Link>
                                        )}
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
