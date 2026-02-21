'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    isProvider: boolean;
    isRenter: boolean;
    hasShop: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on mount
        const storedToken = localStorage.getItem('accessToken');
        const storedRefresh = localStorage.getItem('refreshToken');

        if (storedToken) {
            setAccessToken(storedToken);
            fetchUser(storedToken).catch(() => {
                // Token might be expired, try refresh
                if (storedRefresh) {
                    refreshAccessToken(storedRefresh);
                } else {
                    logout();
                }
            });
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (token: string) => {
        try {
            const userData = await api.getCurrentUser(token);
            setUser(userData as User);
        } finally {
            setLoading(false);
        }
    };

    const refreshAccessToken = async (refreshToken: string) => {
        try {
            const { access } = await api.refreshToken(refreshToken);
            localStorage.setItem('accessToken', access);
            setAccessToken(access);
            await fetchUser(access);
        } catch (error) {
            logout();
        }
    };

    const login = async (username: string, password: string) => {
        const { access, refresh } = await api.login(username, password);
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        setAccessToken(access);
        await fetchUser(access);
    };

    const register = async (data: any) => {
        await api.register(data);
        // Auto-login after registration
        await login(data.username, data.password);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setUser(null);
    };

    const value = {
        user,
        accessToken,
        login,
        register,
        logout,
        refreshUser: () => (accessToken ? fetchUser(accessToken) : Promise.resolve()),
        isAuthenticated: !!user,
        isProvider: user?.user_type === 'provider',
        isRenter: user?.user_type === 'renter',
        hasShop: !!user?.has_shop,
        isLoading: loading,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#DC2626] flex items-center justify-center">
                <div className="w-full max-w-sm px-8 space-y-4 animate-pulse">
                    {/* Logo skeleton */}
                    <div className="h-8 w-32 bg-black/20 rounded mx-auto mb-8" />
                    {/* Content skeletons */}
                    <div className="h-4 bg-black/20 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-black/20 rounded w-1/2 mx-auto" />
                    <div className="h-4 bg-black/20 rounded w-2/3 mx-auto" />
                </div>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
