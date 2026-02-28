'use client';

import { useAuth } from '@/contexts/AuthContext';
import SubscriptionBanner from '@/components/provider/SubscriptionBanner';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push('/login');
        } else if (user.is_superuser) {
            router.push('/admin');
        }
    }, [user, isLoading, router]);

    if (isLoading) return (
        <div className="min-h-screen bg-black px-6 py-10 animate-pulse">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="h-8 w-48 bg-neutral-800 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-28 bg-neutral-800 rounded-xl" />
                    ))}
                </div>
                <div className="h-64 bg-neutral-800 rounded-xl" />
            </div>
        </div>
    );

    if (!user || user.is_superuser) return null;

    return (
        <div className="container-custom py-8 min-h-screen">
            <h1 className="text-3xl font-primary font-bold mb-8 text-white uppercase tracking-wider">
                Provider Dashboard
            </h1>

            {user.user_type === 'provider' && user.subscription_status !== 'active' && (
                <SubscriptionBanner />
            )}

            {children}
        </div>
    );
}
