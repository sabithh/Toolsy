'use client';

import { useAuth } from '@/contexts/AuthContext';
import SubscriptionBanner from '@/components/provider/SubscriptionBanner';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    if (!user) {
        router.push('/login');
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
