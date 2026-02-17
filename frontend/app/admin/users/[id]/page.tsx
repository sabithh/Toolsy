'use client';

import { useState, useEffect } from 'react';
import { api, User } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Package, CreditCard, User as UserIcon, MapPin, Loader, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function UserDetailsPage() {
    const { id } = useParams();
    const { accessToken } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken && id) {
            loadUser();
        }
    }, [accessToken, id]);

    const loadUser = async () => {
        try {
            const data = await api.getAdminUser(accessToken!, id as string);
            setUser(data);
        } catch (error) {
            console.error('Failed to load user', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader className="animate-spin text-white" /></div>;
    if (!user) return <div className="p-8 text-white">User not found</div>;

    return (
        <div className="space-y-8">
            <Link href="/admin/users" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
                <ArrowLeft size={16} /> Back to Users
            </Link>

            <div className="flex items-start gap-6 bg-neutral-900 border border-neutral-800 p-8 rounded-xl">
                {user.profile_image ? (
                    <img src={user.profile_image} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-neutral-800" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center text-3xl font-bold text-gray-500">
                        {user.username[0].toUpperCase()}
                    </div>
                )}

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">{user.username}</h1>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <UserIcon size={14} />
                                <span>{user.first_name} {user.last_name}</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full mx-1"></span>
                                <span>{user.email}</span>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.user_type === 'provider'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                            {user.user_type?.toUpperCase()}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="bg-neutral-800/50 p-4 rounded-lg">
                            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                                <Calendar size={12} /> Joined
                            </div>
                            <div className="text-white font-medium">
                                {new Date(user.created_at || '').toLocaleDateString()}
                            </div>
                        </div>
                        <div className="bg-neutral-800/50 p-4 rounded-lg">
                            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                                <Package size={12} /> Total Bookings
                            </div>
                            <div className="text-white font-medium">
                                {user.total_bookings || 0}
                            </div>
                        </div>
                        <div className="bg-neutral-800/50 p-4 rounded-lg">
                            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                                <CreditCard size={12} /> Subscription
                            </div>
                            <div className="text-white font-medium">
                                {/* TODO: Fetch actual subscription status */}
                                {user.user_type === 'provider' ? 'Active (Trial)' : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional sections for Tools, Bookings History, Reviews could go here */}
        </div>
    );
}
