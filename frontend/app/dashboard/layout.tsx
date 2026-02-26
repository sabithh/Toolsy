'use client';

import { useAuth } from '@/contexts/AuthContext';
import SubscriptionBanner from '@/components/provider/SubscriptionBanner';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

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

    if (!user) {
        router.push('/login');
        return null;
    }

    // Redirect admins immediately from the layout to prevent flashing
    if (user.is_superuser) {
        router.push('/admin');
        return null;
    }

    // Only for providers
    // If renter tries to access dashboard? usually they have nothing there or just bookings.
    // Assuming Dashboard is mainly for Providers based on previous context.

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
