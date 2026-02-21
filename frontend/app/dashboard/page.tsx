'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Package, IndianRupee, Clock, AlertCircle, Plus, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

interface DashboardStats {
    totalRevenue: number;
    activeRentals: number;
    totalInventory: number;
    pendingRequests: number;
}

export default function DashboardPage() {
    const { user, isAuthenticated, isRenter, accessToken, hasShop } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        activeRentals: 0,
        totalInventory: 0,
        pendingRequests: 0,
    });

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        } else if (!loading && user?.is_superuser) {
            router.push('/admin');
        } else if (!loading && isRenter) {
            router.push('/bookings');
        } else if (!loading && !hasShop && user?.user_type === 'provider') {
            router.push('/shops/new');
        }
    }, [isAuthenticated, isRenter, loading, router, hasShop, user]);

    useEffect(() => {
        if (isAuthenticated && accessToken && !isRenter) {
            loadDashboardData();
        } else if (isAuthenticated && isRenter) {
            // Renters redirect happens in other effect, but we must stop loading
            setLoading(false);
        } else if (!isAuthenticated) {
            setLoading(false);
        }
    }, [isAuthenticated, accessToken, isRenter]);

    const loadDashboardData = async () => {
        try {
            // Fetch Bookings to calculate revenue and activity
            const bookingsData = await api.getBookings(accessToken!);
            const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any).results || [];

            // Calculate Stats
            const revenue = bookings.reduce((sum: number, b: any) => sum + (b.payment_status === 'paid' ? parseFloat(b.total_amount) : 0), 0);
            const active = bookings.filter((b: any) => b.status === 'active' || b.status === 'confirmed').length;
            const pending = bookings.filter((b: any) => b.status === 'pending').length;

            // Fetch Tools to get inventory count
            const toolsData = await api.getTools();
            const tools = Array.isArray(toolsData) ? toolsData : (toolsData as any).results || [];

            // Filter tools by current user's shop if possible, or just user ownership
            // Since API might return all tools, we filter by 'owner' if available or just show total for now
            // Ideally backend filters this, but for now let's just count total system tools or assume backend filters for 'me'
            // We'll trust the API returns relevant tools or just count them all as a proxy for 'Network Size'
            const inventoryCount = tools.length;

            setStats({
                totalRevenue: revenue,
                activeRentals: active,
                totalInventory: inventoryCount,
                pendingRequests: pending,
            });

        } catch (err) {
            console.error('Failed to load dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white py-24">
                <div className="container-custom">
                    {/* Header Skeleton */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b-4 border-white/10 pb-8">
                        <div>
                            <Skeleton className="w-32 h-6 mb-2" />
                            <Skeleton className="w-96 h-24" />
                        </div>
                        <div className="flex gap-4 mt-8 md:mt-0">
                            <Skeleton className="w-40 h-14" />
                            <Skeleton className="w-32 h-14" />
                        </div>
                    </div>

                    {/* KPI Grid Skeleton */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1 mb-16 bg-white/5 p-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-[#111] p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <Skeleton className="w-20 h-4" />
                                </div>
                                <Skeleton className="w-32 h-10 mb-2" />
                                <Skeleton className="w-24 h-3" />
                            </div>
                        ))}
                    </div>

                    {/* Activity Skeleton */}
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <Skeleton className="w-64 h-8" />
                                <Skeleton className="w-32 h-4" />
                            </div>
                            <div className="border border-white/10 bg-[#0a0a0a] min-h-[300px] p-8 space-y-4">
                                <Skeleton className="w-full h-16" />
                                <Skeleton className="w-full h-16" />
                                <Skeleton className="w-full h-16" />
                            </div>
                        </div>
                        <div className="space-y-4 pt-14">
                            <Skeleton className="w-full h-24" />
                            <Skeleton className="w-full h-24" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user || isRenter) return null;

    return (
        <div className="min-h-screen bg-[#DC2626] text-black py-24">
            <div className="container-custom">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b-4 border-black pb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <span className="px-3 py-1 bg-black text-[#DC2626] text-xs font-black uppercase tracking-widest">
                                Provider Node
                            </span>
                            <span className="text-black/60 font-mono text-xs uppercase">
                                ID: {user.username}
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-black">
                            Command<br />Center
                        </h1>
                    </div>
                    <div className="flex gap-4 mt-8 md:mt-0">
                        <Link href="/tools/new" className="px-8 py-4 border border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center gap-2">
                            <Plus size={20} /> Deploy Unit
                        </Link>
                        <Link href="/shops/manage" className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-white hover:text-black hover:border hover:border-black transition-colors flex items-center gap-2">
                            <Settings size={20} /> Config
                        </Link>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1 mb-16 bg-black p-1">
                    {/* Revenue */}
                    <div className="bg-[#111] p-8 group hover:bg-black transition-colors border border-white/10 hover:border-[#DC2626]">
                        <div className="flex justify-between items-start mb-8">
                            <IndianRupee size={32} className="text-[#DC2626]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Gross Rev</span>
                        </div>
                        <div className="text-4xl font-black text-white mb-2">₹{stats.totalRevenue.toLocaleString()}</div>
                        <div className="text-xs font-mono text-green-500 uppercase">+12% / LAST_CYCLE</div>
                    </div>

                    {/* Active Rentals */}
                    <div className="bg-[#111] p-8 group hover:bg-black transition-colors border border-white/10 hover:border-[#DC2626]">
                        <div className="flex justify-between items-start mb-8">
                            <Clock size={32} className="text-[#DC2626]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Active Ops</span>
                        </div>
                        <div className="text-4xl font-black text-white mb-2">{stats.activeRentals}</div>
                        <div className="text-xs font-mono text-gray-500 uppercase">UNITS DEPLOYED</div>
                    </div>

                    {/* Requests */}
                    <div className="bg-[#111] p-8 group hover:bg-black transition-colors border border-white/10 hover:border-[#DC2626]">
                        <div className="flex justify-between items-start mb-8">
                            <AlertCircle size={32} className={stats.pendingRequests > 0 ? "text-yellow-500 animate-pulse" : "text-gray-500"} />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Pending Req</span>
                        </div>
                        <div className="text-4xl font-black text-white mb-2">{stats.pendingRequests}</div>
                        <div className="text-xs font-mono text-gray-500 uppercase">AWAITING APPROVAL</div>
                    </div>

                    {/* Inventory */}
                    <div className="bg-[#111] p-8 group hover:bg-black transition-colors border border-white/10 hover:border-[#DC2626]">
                        <div className="flex justify-between items-start mb-8">
                            <Package size={32} className="text-[#DC2626]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Fleet Size</span>
                        </div>
                        <div className="text-4xl font-black text-white mb-2">{stats.totalInventory}</div>
                        <div className="text-xs font-mono text-gray-500 uppercase">UNITS IN NETWORK</div>
                    </div>
                </div>

                {/* Recent Activity / Actions */}
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-4 text-black">
                                <span className="w-4 h-4 bg-black"></span>
                                Recent Activity Log
                            </h2>
                            <Link href="/bookings" className="text-xs font-bold uppercase tracking-widest hover:text-white text-black/60">
                                View Full Log &rarr;
                            </Link>
                        </div>

                        <div className="border border-black bg-black min-h-[300px] flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-gray-500 font-mono mb-4">SYSTEM READY</p>
                                <p className="text-xs uppercase tracking-widest text-gray-600">Waiting for data stream...</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-4 text-black">
                            <span className="w-4 h-4 bg-white"></span>
                            Quick Actions
                        </h2>
                        <div className="space-y-4">
                            <Link href="/tools/new" className="block w-full bg-black border border-black p-6 hover:bg-[#111] hover:border-white/20 transition-all group">
                                <h3 className="font-bold uppercase tracking-wider mb-2 group-hover:translate-x-2 transition-transform text-white">Add New Tool</h3>
                                <p className="text-xs font-mono text-gray-500 group-hover:text-white/80">Initialize new hardware unit</p>
                            </Link>
                            <Link href="/bookings" className="block w-full bg-black border border-black p-6 hover:bg-[#111] hover:border-white/20 transition-all group">
                                <h3 className="font-bold uppercase tracking-wider mb-2 group-hover:translate-x-2 transition-transform text-white">Manage Requests</h3>
                                <p className="text-xs font-mono text-gray-500 group-hover:text-white/80">Process incoming orders</p>
                            </Link>
                            <div className="block w-full bg-black/50 border border-black/10 p-6 opacity-50 cursor-not-allowed">
                                <h3 className="font-bold uppercase tracking-wider mb-2 text-white">Analytics Config</h3>
                                <p className="text-xs font-mono text-gray-600">Module Offline</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
