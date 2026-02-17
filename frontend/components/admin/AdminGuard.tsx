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
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
    }

    if (!user?.is_superuser) {
        return null;
    }

    return <>{children}</>;
}
