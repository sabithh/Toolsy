'use client';

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Modal from '@/components/ui/Modal';
import { Search, Calendar, LayoutDashboard, LogOut, LogIn, UserPlus, Plus } from 'lucide-react';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter(); // Navbar doesn't use router yet, might need to import it
    const { showToast } = useToast();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutConfirm = () => {
        logout();
        setIsLogoutModalOpen(false);
        showToast('Logged out successfully', 'success');
        router.push('/');
    };

    return (
        <>
            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
                title="Disconnect?"
                description="You are about to terminate your session. All active unsaved operations will be halted."
                confirmText="LOGOUT"
                variant="danger"
            />

            <nav className="fixed top-0 left-0 right-0 z-50">
                <div className="bg-[#DC2626]/90 backdrop-blur-md border-b border-black/10 transition-colors duration-300">
                    <div className="max-w-[1920px] mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link
                                href={isAuthenticated ? (user?.is_superuser ? '/admin' : user?.user_type === 'provider' ? '/dashboard' : '/tools') : '/'}
                                className="flex items-center gap-4 group"
                            >
                                <div className="relative rounded-sm overflow-hidden border border-black/10 group-hover:border-black transition-colors">
                                    <Image
                                        src="/logo.png"
                                        alt="Toolsy"
                                        width={40}
                                        height={40}
                                        className="relative object-cover"
                                    />
                                </div>
                                <span className="text-2xl font-black text-black uppercase tracking-widest group-hover:text-white transition-colors duration-300">
                                    Toolsy
                                </span>
                            </Link>

                            {/* Nav Links */}
                            <div className="flex items-center gap-6">
                                {/* Tools Button */}
                                <Link
                                    href="/tools"
                                    className="flex items-center gap-2 px-6 py-2 border border-black/20 hover:border-black hover:bg-black hover:text-white text-black font-bold uppercase tracking-wider transition-all duration-300 no-underline"
                                >
                                    <Search size={18} />
                                    <span>Tools</span>
                                </Link>

                                {isAuthenticated ? (
                                    <>
                                        {!user?.is_superuser && (
                                            <Link
                                                href="/bookings"
                                                className="flex items-center gap-2 px-6 py-2 border border-black/20 hover:border-black hover:bg-black hover:text-white text-black font-bold uppercase tracking-wider transition-all duration-300 no-underline"
                                            >
                                                <Calendar size={18} />
                                                <span>Bookings</span>
                                            </Link>
                                        )}

                                        {user?.is_superuser ? (
                                            <Link
                                                href="/admin"
                                                className="flex items-center gap-2 px-6 py-2 border border-black/20 hover:border-black hover:bg-black hover:text-white text-black font-bold uppercase tracking-wider transition-all duration-300 no-underline"
                                            >
                                                <LayoutDashboard size={18} />
                                                <span>Admin</span>
                                            </Link>
                                        ) : user?.user_type === 'provider' && (
                                            <>
                                                <Link
                                                    href="/tools/new"
                                                    className="flex items-center gap-2 px-6 py-2 bg-[#DC2626] hover:bg-white hover:text-[#DC2626] border border-[#DC2626] text-black font-bold uppercase tracking-wider transition-all duration-300 no-underline"
                                                >
                                                    <Plus size={18} />
                                                    <span>Deploy</span>
                                                </Link>
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-2 px-6 py-2 border border-black/20 hover:border-black hover:bg-black hover:text-white text-black font-bold uppercase tracking-wider transition-all duration-300 no-underline"
                                                >
                                                    <LayoutDashboard size={18} />
                                                    <span>Dashboard</span>
                                                </Link>
                                            </>
                                        )}

                                        <div className="flex items-center gap-4 pl-4 border-l border-black/10">
                                            <div className="font-bold text-black/60 uppercase tracking-wide">
                                                {user?.username}
                                            </div>
                                            <button
                                                onClick={() => setIsLogoutModalOpen(true)}
                                                className="flex items-center gap-2 px-6 py-2 bg-black hover:bg-black/80 text-white font-bold uppercase tracking-wider transition-all duration-300"
                                            >
                                                <LogOut size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="flex items-center gap-2 px-6 py-2 text-black/60 hover:text-black font-bold uppercase tracking-wider transition-colors no-underline"
                                        >
                                            <LogIn size={18} />
                                            <span>Login</span>
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="flex items-center gap-2 px-6 py-2 bg-black hover:bg-black/80 text-white font-bold uppercase tracking-wider transition-all duration-300 no-underline"
                                        >
                                            <UserPlus size={18} />
                                            <span>Join Now</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
