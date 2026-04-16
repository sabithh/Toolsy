'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Package, IndianRupee, Clock, AlertCircle, Plus, Settings, Tag, Lock, Pencil, Trash2, Receipt, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';

interface DashboardStats {
    totalRevenue: number;
    activeRentals: number;
    totalInventory: number;
    pendingRequests: number;
    monthlyCommission: number;
}

const COMMISSION_RATE = 0.02; // 2%

export default function DashboardPage() {
    const { user, isAuthenticated, isRenter, accessToken, hasShop } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [myTools, setMyTools] = useState<any[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        activeRentals: 0,
        totalInventory: 0,
        pendingRequests: 0,
        monthlyCommission: 0,
    });
    const [toolToDelete, setToolToDelete] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        if (!loading && !isAuthenticated) router.push('/login');
        else if (!loading && user?.is_superuser) router.push('/admin');
        else if (!loading && isRenter) router.push('/bookings');
        else if (!loading && !hasShop && user?.user_type === 'provider') router.push('/shops/new');
    }, [isAuthenticated, isRenter, loading, router, hasShop, user]);

    useEffect(() => {
        if (isAuthenticated && accessToken && !isRenter) loadDashboardData();
        else if (isAuthenticated && isRenter) setLoading(false);
        else if (!isAuthenticated) setLoading(false);
    }, [isAuthenticated, accessToken, isRenter]);

    const loadDashboardData = async () => {
        try {
            const bookingsData = await api.getBookings(accessToken!);
            const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any).results || [];
            const revenue = bookings.reduce((sum: number, b: any) => sum + (b.payment_status === 'paid' ? parseFloat(b.total_amount) : 0), 0);
            const active = bookings.filter((b: any) => b.status === 'active' || b.status === 'confirmed').length;
            const pending = bookings.filter((b: any) => b.status === 'pending').length;

            // Calculate current month commission
            const now = new Date();
            const monthBookings = bookings.filter((b: any) => {
                const d = new Date(b.created_at || b.start_date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && b.payment_status === 'paid';
            });
            const monthRevenue = monthBookings.reduce((sum: number, b: any) => sum + parseFloat(b.total_amount), 0);

            const toolsData = await api.getMyTools(accessToken!);
            const tools = Array.isArray(toolsData) ? toolsData : (toolsData as any).results || [];
            setMyTools(tools);
            setStats({ totalRevenue: revenue, activeRentals: active, totalInventory: tools.length, pendingRequests: pending, monthlyCommission: monthRevenue * COMMISSION_RATE });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (toolId: string, toolName: string) => setToolToDelete({ id: toolId, name: toolName });

    const confirmDeleteTool = async () => {
        if (!toolToDelete) return;
        setDeletingId(toolToDelete.id);
        try {
            await api.deleteTool(accessToken!, toolToDelete.id);
            setMyTools(prev => prev.filter(t => t.id !== toolToDelete.id));
            setStats(prev => ({ ...prev, totalInventory: prev.totalInventory - 1 }));
            setToolToDelete(null);
        } catch {
            alert('Failed to delete item. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const cardStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem' };
    const statLabelStyle = { fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'var(--font-barlow), sans-serif' };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
                <div className="container-custom">
                    <div className="mb-10">
                        <Skeleton className="w-64 h-12 mb-2" style={{ background: 'var(--bg-surface-2)' }} />
                        <Skeleton className="w-48 h-4" style={{ background: 'var(--bg-surface-2)' }} />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        {[1,2,3,4].map(i => <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem', height: 120 }} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (!user || isRenter) return null;

    return (
        <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
            <div className="container-custom">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest px-2 py-1" style={{ background: 'rgba(210,0,0,0.1)', color: '#D20000', borderRadius: 4, border: '1px solid rgba(210,0,0,0.2)' }}>
                                Owner Dashboard
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                @{user.username}
                            </span>
                        </div>
                        <h1 className="font-black uppercase tracking-tighter leading-none"
                            style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--text-primary)' }}>
                            My Dashboard
                        </h1>
                    </div>
                    <div className="flex gap-3 mt-6 md:mt-0">
                        <Link href="/tools/new"
                            className="flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider no-underline transition-all duration-200"
                            style={{ background: '#D20000', color: 'white', borderRadius: 6, border: '1px solid #D20000' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#B10000'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D20000'}>
                            <Plus size={16} /> List Item
                        </Link>
                        <Link href="/shops/manage"
                            className="flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider no-underline transition-all duration-200"
                            style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', borderRadius: 6, border: '1px solid var(--border)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; (e.currentTarget as HTMLElement).style.color = '#D20000'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}>
                            <Settings size={16} /> Shop Settings
                        </Link>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {[
                        { icon: IndianRupee, label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, sub: 'All time', color: '#D20000' },
                        { icon: Clock, label: 'Active Rentals', value: stats.activeRentals.toString(), sub: 'Currently rented', color: '#00C850' },
                        { icon: AlertCircle, label: 'Pending Requests', value: stats.pendingRequests.toString(), sub: 'Awaiting approval', color: stats.pendingRequests > 0 ? '#F59E0B' : 'var(--text-muted)' },
                        { icon: Package, label: 'Listed Items', value: stats.totalInventory.toString(), sub: 'In your inventory', color: 'var(--text-muted)' },
                    ].map(({ icon: Icon, label, value, sub, color }) => (
                        <div key={label} style={cardStyle}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#D20000'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
                            <div className="flex justify-between items-start mb-4">
                                <Icon size={24} style={{ color }} />
                                <span style={statLabelStyle}>{label}</span>
                            </div>
                            <div className="text-3xl font-black mb-1"
                                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.02em' }}>{value}</div>
                            <div style={{ ...statLabelStyle, color: '#444444' }}>{sub}</div>
                        </div>
                    ))}
                </div>

                {/* Commission Billing Banner */}
                <div className="mb-10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    style={{ background: 'rgba(210,0,0,0.06)', border: '1px solid rgba(210,0,0,0.2)', borderRadius: 8 }}>
                    <div className="flex items-start gap-4">
                        <Receipt size={28} style={{ color: '#D20000', flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <h3 className="font-black uppercase tracking-wider mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.1em', fontSize: '1.1rem' }}>
                                This Month&apos;s Commission
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                2% platform fee on completed rentals · Due at month end
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-2xl font-black" style={{ color: '#D20000', fontFamily: 'var(--font-bebas), sans-serif' }}>
                                ₹{stats.monthlyCommission.toFixed(2)}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>pending</div>
                        </div>
                        <Link href="/billing"
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wider no-underline transition-all duration-200"
                            style={{ background: '#D20000', color: 'white', borderRadius: 6 }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#B10000'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D20000'}>
                            <TrendingUp size={14} /> View Billing
                        </Link>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* My Items table */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="font-black uppercase tracking-wider"
                                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', fontSize: '1.4rem' }}>
                                My Listed Items
                            </h2>
                            <Link href="/tools/new"
                                className="text-xs font-bold uppercase tracking-widest no-underline transition-colors"
                                style={{ color: '#D20000' }}>
                                + Add Item
                            </Link>
                        </div>

                        {myTools.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center"
                                style={{ background: 'var(--bg-surface)', border: '2px dashed #1E1E1E', borderRadius: 8 }}>
                                <Package size={36} className="mb-3" style={{ color: '#333333' }} />
                                <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                                    No items listed yet
                                </p>
                                <Link href="/tools/new"
                                    className="px-5 py-2.5 text-sm font-bold uppercase tracking-wider no-underline transition-all duration-200"
                                    style={{ background: '#D20000', color: 'white', borderRadius: 6 }}>
                                    List Your First Item
                                </Link>
                            </div>
                        ) : (
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                                {/* Header row */}
                                <div className="grid grid-cols-5 px-5 py-3 text-xs font-bold uppercase tracking-widest"
                                    style={{ background: '#0D0D0D', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-barlow), sans-serif' }}>
                                    <div className="col-span-2">Item</div>
                                    <div>Category</div>
                                    <div>Rate/day</div>
                                    <div>Actions</div>
                                </div>
                                {myTools.map((tool: any, idx: number) => (
                                    <div key={tool.id}
                                        className="grid grid-cols-5 px-5 py-4 items-center transition-colors"
                                        style={{ borderBottom: idx < myTools.length - 1 ? '1px solid var(--border)' : 'none' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#0D0D0D'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                                        <div className="col-span-2 flex items-center gap-3">
                                            <div>
                                                <p className="text-sm font-bold uppercase" style={{ color: 'var(--text-primary)' }}>{tool.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {tool.is_available ? (
                                                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5"
                                                            style={{ background: 'rgba(0,200,80,0.1)', color: '#00C850', borderRadius: 3, border: '1px solid rgba(0,200,80,0.2)' }}>
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 flex items-center gap-1"
                                                            style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)', borderRadius: 3, border: '1px solid var(--border)' }}>
                                                            <Lock size={9} /> Inactive
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold uppercase flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                            <Tag size={11} style={{ color: '#D20000' }} />
                                            {tool.category?.name || '—'}
                                        </div>
                                        <div className="font-black text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif' }}>
                                            ₹{tool.price_per_day}<span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>/day</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/tools/edit/${tool.id}`}
                                                className="p-1.5 transition-colors no-underline"
                                                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4 }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; (e.currentTarget as HTMLElement).style.color = '#D20000'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                                                <Pencil size={13} />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(tool.id, tool.name)}
                                                disabled={deletingId === tool.id}
                                                className="p-1.5 transition-colors cursor-pointer"
                                                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4, background: 'none' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; (e.currentTarget as HTMLElement).style.color = '#D20000'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                                                {deletingId === tool.id
                                                    ? <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin" />
                                                    : <Trash2 size={13} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick actions */}
                    <div>
                        <h2 className="font-black uppercase tracking-wider mb-5"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', fontSize: '1.4rem' }}>
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            {[
                                { href: '/tools/new', label: 'List New Item', desc: 'Add an item to rent out', hot: true },
                                { href: '/bookings', label: 'Manage Bookings', desc: 'View and respond to rental requests' },
                                { href: '/billing', label: 'View Billing', desc: 'Commission summary & payment history' },
                                { href: '/chats', label: 'Messages', desc: 'Chat with your renters' },
                                { href: '/shops/manage', label: 'Shop Settings', desc: 'Edit profile, location, categories' },
                            ].map(({ href, label, desc, hot }) => (
                                <Link key={href} href={href}
                                    className="block p-4 group no-underline transition-all duration-200"
                                    style={{ background: 'var(--bg-surface)', border: `1px solid ${hot ? 'rgba(210,0,0,0.3)' : 'var(--border)'}`, borderRadius: 8 }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = hot ? 'rgba(210,0,0,0.3)' : 'var(--border)'; }}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-sm uppercase tracking-wider mb-0.5"
                                                style={{ color: hot ? '#D20000' : 'var(--text-primary)' }}>{label}</div>
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                                        </div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {toolToDelete && (
                <Modal
                    isOpen={!!toolToDelete}
                    onClose={() => setToolToDelete(null)}
                    onConfirm={confirmDeleteTool}
                    title="Delete Item?"
                    description={`Are you sure you want to delete "${toolToDelete.name}"? This cannot be undone.`}
                    confirmText={deletingId === toolToDelete.id ? 'DELETING...' : 'DELETE'}
                    cancelText="CANCEL"
                    variant="danger"
                />
            )}
        </div>
    );
}
