'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Receipt, CheckCircle, Clock, AlertCircle, IndianRupee, ArrowLeft } from 'lucide-react';

const COMMISSION_RATE = 0.02;

interface BillingMonth {
    month: string;
    year: number;
    monthIndex: number;
    bookings: any[];
    totalRentalAmount: number;
    commission: number;
    status: 'paid' | 'pending' | 'overdue';
}

function buildBillingHistory(bookings: any[]): BillingMonth[] {
    const map: Record<string, BillingMonth> = {};
    const now = new Date();

    for (const b of bookings) {
        if (b.payment_status !== 'paid') continue;
        const d = new Date(b.created_at || b.start_date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!map[key]) {
            map[key] = {
                month: d.toLocaleString('default', { month: 'long' }),
                year: d.getFullYear(),
                monthIndex: d.getMonth(),
                bookings: [],
                totalRentalAmount: 0,
                commission: 0,
                status: 'pending',
            };
        }
        map[key].bookings.push(b);
        map[key].totalRentalAmount += parseFloat(b.total_amount);
    }

    return Object.values(map)
        .map(m => {
            m.commission = m.totalRentalAmount * COMMISSION_RATE;
            const isCurrentMonth = m.monthIndex === now.getMonth() && m.year === now.getFullYear();
            const monthEnd = new Date(m.year, m.monthIndex + 1, 0);
            const dueDate = new Date(monthEnd);
            dueDate.setDate(dueDate.getDate() + 7);
            if (isCurrentMonth) m.status = 'pending';
            else if (now > dueDate) m.status = 'overdue';
            else m.status = 'pending';
            return m;
        })
        .sort((a, b) => b.year - a.year || b.monthIndex - a.monthIndex);
}

export default function BillingPage() {
    const { user, isAuthenticated, accessToken, isRenter } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [billingHistory, setBillingHistory] = useState<BillingMonth[]>([]);
    const [currentMonth, setCurrentMonth] = useState<BillingMonth | null>(null);

    useEffect(() => {
        if (!loading && !isAuthenticated) router.push('/login');
        if (!loading && isRenter) router.push('/bookings');
    }, [loading, isAuthenticated, isRenter, router]);

    useEffect(() => {
        if (isAuthenticated && accessToken && !isRenter) loadBilling();
        else if (!isAuthenticated || isRenter) setLoading(false);
    }, [isAuthenticated, accessToken, isRenter]);

    const loadBilling = async () => {
        try {
            const data = await api.getBookings(accessToken!);
            const bookings = Array.isArray(data) ? data : (data as any).results || [];
            const history = buildBillingHistory(bookings);
            const now = new Date();
            const cur = history.find(m => m.monthIndex === now.getMonth() && m.year === now.getFullYear()) || null;
            setBillingHistory(history);
            setCurrentMonth(cur);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, React.CSSProperties> = {
            paid: { background: 'rgba(0,200,80,0.1)', color: '#00C850', border: '1px solid rgba(0,200,80,0.2)' },
            pending: { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' },
            overdue: { background: 'rgba(210,0,0,0.1)', color: '#D20000', border: '1px solid rgba(210,0,0,0.2)' },
        };
        return (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1"
                style={{ borderRadius: 4, ...styles[status] }}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--highlight)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
            <div className="container-custom max-w-4xl">

                {/* Header */}
                <div className="mb-10">
                    <Link href="/dashboard"
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 no-underline transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
                        <ArrowLeft size={14} /> Back to Dashboard
                    </Link>
                    <h1 className="font-black uppercase tracking-tighter leading-none mb-2"
                        style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--text-primary)' }}>
                        Billing
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-barlow), sans-serif', letterSpacing: '3px' }}>
                        2% Commission · Pay at Month End
                    </p>
                </div>

                {/* How it works */}
                <div className="mb-8 p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>How Commission Works</h3>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        {[
                            { step: '01', text: 'You earn from completed rentals — no upfront subscription.' },
                            { step: '02', text: 'At month end, we calculate 2% of your total rental income.' },
                            { step: '03', text: 'Pay within 7 days or listings are paused until payment.' },
                        ].map(({ step, text }) => (
                            <div key={step} className="flex gap-3">
                                <span className="font-black text-xl flex-shrink-0"
                                    style={{ color: '#D20000', fontFamily: 'var(--font-bebas), sans-serif' }}>{step}</span>
                                <span style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current month summary */}
                {currentMonth ? (
                    <div className="mb-8 p-6"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--highlight)' }}>
                                    Current Month
                                </div>
                                <h2 className="font-black uppercase tracking-tight"
                                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', fontSize: '1.8rem' }}>
                                    {currentMonth.month} {currentMonth.year}
                                </h2>
                            </div>
                            {statusBadge(currentMonth.status)}
                        </div>

                        <div className="grid sm:grid-cols-3 gap-6 mb-6">
                            {[
                                { label: 'Completed Rentals', value: currentMonth.bookings.length.toString() },
                                { label: 'Rental Income', value: `₹${currentMonth.totalRentalAmount.toLocaleString()}` },
                                { label: 'Commission Due (2%)', value: `₹${currentMonth.commission.toFixed(2)}`, highlight: true },
                            ].map(({ label, value, highlight }) => (
                                <div key={label}>
                                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                                    <div className="text-2xl font-black"
                                        style={{ color: highlight ? 'var(--highlight)' : 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif' }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Rental breakdown */}
                        {currentMonth.bookings.length > 0 && (
                            <div style={{ borderTop: "1px solid var(--border)", paddingTop: '1rem' }}>
                                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                                    Rental Breakdown
                                </div>
                                <div className="space-y-2">
                                    {currentMonth.bookings.map((b: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div style={{ color: 'var(--text-primary)' }}>{b.tool?.name || `Booking #${b.id?.slice(0,8)}`}</div>
                                            <div className="flex items-center gap-4">
                                                <span style={{ color: 'var(--text-primary)' }}>₹{parseFloat(b.total_amount).toLocaleString()}</span>
                                                <span style={{ color: 'var(--highlight)', fontSize: '0.75rem' }}>
                                                    −₹{(parseFloat(b.total_amount) * COMMISSION_RATE).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mb-8 p-8 text-center"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                        <Receipt size={36} className="mx-auto mb-3" style={{ color: '#333333' }} />
                        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                            No completed rentals this month yet
                        </p>
                    </div>
                )}

                {/* History */}
                {billingHistory.filter(m => {
                    const now = new Date();
                    return !(m.monthIndex === now.getMonth() && m.year === now.getFullYear());
                }).length > 0 && (
                    <div>
                        <h3 className="font-black uppercase tracking-wider mb-4"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', fontSize: '1.3rem' }}>
                            Past Bills
                        </h3>
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                            <div className="grid grid-cols-4 px-5 py-3 text-xs font-bold uppercase tracking-widest"
                                style={{ background: '#0D0D0D', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                <div>Month</div>
                                <div>Rentals</div>
                                <div>Commission</div>
                                <div>Status</div>
                            </div>
                            {billingHistory
                                .filter(m => {
                                    const now = new Date();
                                    return !(m.monthIndex === now.getMonth() && m.year === now.getFullYear());
                                })
                                .map((m, i, arr) => (
                                    <div key={`${m.year}-${m.monthIndex}`}
                                        className="grid grid-cols-4 px-5 py-4 items-center"
                                        style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{m.month} {m.year}</div>
                                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{m.bookings.length}</div>
                                        <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>₹{m.commission.toFixed(2)}</div>
                                        <div className="flex items-center gap-3">
                                            {statusBadge(m.status)}
                                            {m.status !== 'paid' && (
                                                <button
                                                    className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 transition-all duration-200 cursor-pointer"
                                                    style={{ background: '#D20000', color: 'white', borderRadius: 4, border: 'none' }}
                                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#B10000'}
                                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D20000'}
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
