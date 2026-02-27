'use client';

import AdminGuard from '@/components/admin/AdminGuard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
    ];

    return (
        <AdminGuard>
            <div className="flex min-h-screen bg-neutral-900 text-white font-secondary">
                {/* Sidebar */}
                <aside className="w-64 bg-black border-r border-neutral-800 fixed h-full z-10 hidden md:flex flex-col">
                    <div className="p-6 border-b border-neutral-800">
                        <h1 className="text-2xl font-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 font-bold">
                            TOOLSY ADMIN
                        </h1>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium tracking-wide">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-neutral-800">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-neutral-800 flex justify-around p-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Icon size={24} />
                                <span className="text-[10px] mt-1 font-medium tracking-wide">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Main Content */}
                <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
