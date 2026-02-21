'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!user?.is_superuser) {
                router.push('/');
            }
        }
    }, [isAuthenticated, user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex animate-pulse">
                {/* Sidebar skeleton */}
                <div className="w-56 bg-neutral-900 border-r border-neutral-800 p-6 space-y-4 hidden md:block">
                    <div className="h-8 w-28 bg-neutral-800 rounded mb-8" />
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-5 bg-neutral-800 rounded w-3/4" />)}
                </div>
                {/* Main content skeleton */}
                <div className="flex-1 p-8 space-y-6">
                    <div className="h-8 w-48 bg-neutral-800 rounded" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-neutral-800 rounded-xl" />)}
                    </div>
                    <div className="h-64 bg-neutral-800 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!user?.is_superuser) {
        return null;
    }

    return <>{children}</>;
}
