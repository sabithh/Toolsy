'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
    id: string;
    username: string;
    email: string;
    user_type: 'renter' | 'provider';
    first_name?: string;
    last_name?: string;
    phone?: string;
    has_shop?: boolean;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isProvider: boolean;
    isRenter: boolean;
    hasShop: boolean;
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
        isAuthenticated: !!user,
        isProvider: user?.user_type === 'provider',
        isRenter: user?.user_type === 'renter',
        hasShop: !!user?.has_shop,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
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
