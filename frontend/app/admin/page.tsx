'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Wrench, Calendar, IndianRupee, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const { accessToken } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken) {
            loadStats();
        }
    }, [accessToken]);

    const loadStats = async () => {
        try {
            const data = await api.getAdminStats(accessToken!);
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading stats...</div>;

    const cards = [
        {
            title: 'Total Users',
            value: stats?.total_users || 0,
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            trend: `+${stats?.recent_activity?.new_users || 0} this month`
        },
        {
            title: 'Total Tools',
            value: stats?.total_tools || 0,
            icon: Wrench,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            trend: 'Active listings'
        },
        {
            title: 'Total Bookings',
            value: stats?.total_bookings || 0,
            icon: Calendar,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            trend: `+${stats?.recent_activity?.new_bookings || 0} this month`
        },
        {
            title: 'Total Revenue',
            value: `₹${stats?.total_revenue || 0}`,
            icon: IndianRupee,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10',
            trend: 'Lifetime earnings'
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
                <p className="text-gray-400">Welcome back, Administrator.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl hover:border-neutral-700 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${card.bg}`}>
                                    <Icon className={card.color} size={24} />
                                </div>
                                <span className="text-xs font-medium bg-neutral-800 text-gray-300 px-2 py-1 rounded">
                                    {card.trend}
                                </span>
                            </div>
                            <h3 className="text-gray-400 text-sm font-medium mb-1">{card.title}</h3>
                            <p className="text-2xl font-bold text-white">{card.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions or Recent Activity could go here */}
        </div>
    );
}
