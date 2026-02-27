'use client';

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Modal from '@/components/ui/Modal';
import { Search, Calendar, LayoutDashboard, LogOut, LogIn, UserPlus, Plus, Menu, X } from 'lucide-react';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

                            {/* Desktop Nav Links */}
                            <div className="hidden lg:flex items-center gap-6">
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

                            {/* Mobile Menu Toggle */}
                            <button
                                className="lg:hidden flex items-center p-2 text-black"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Side Menu */}
                    {isMobileMenuOpen && (
                        <div className="lg:hidden bg-[#DC2626] border-t border-black/10 absolute top-full left-0 right-0 shadow-xl overflow-y-auto max-h-[calc(100vh-80px)]">
                            <div className="flex flex-col p-4 gap-4">
                                <Link
                                    href="/tools"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-4 border border-black/20 text-black font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                                >
                                    <Search size={20} />
                                    <span>Tools</span>
                                </Link>

                                {isAuthenticated ? (
                                    <>
                                        {!user?.is_superuser && (
                                            <Link
                                                href="/bookings"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 p-4 border border-black/20 text-black font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                                            >
                                                <Calendar size={20} />
                                                <span>Bookings</span>
                                            </Link>
                                        )}

                                        {user?.is_superuser ? (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 p-4 border border-black/20 text-black font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                                            >
                                                <LayoutDashboard size={20} />
                                                <span>Admin</span>
                                            </Link>
                                        ) : user?.user_type === 'provider' && (
                                            <>
                                                <Link
                                                    href="/tools/new"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 p-4 border border-black flex-1 text-black font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                                                >
                                                    <Plus size={20} />
                                                    <span>Deploy Tool</span>
                                                </Link>
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 p-4 border border-black/20 text-black font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                                                >
                                                    <LayoutDashboard size={20} />
                                                    <span>Dashboard</span>
                                                </Link>
                                            </>
                                        )}

                                        <div className="p-4 border border-black/20">
                                            <p className="font-bold text-black/60 uppercase tracking-wide mb-4">
                                                Welcome, {user?.username}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    setIsLogoutModalOpen(true);
                                                }}
                                                className="flex items-center gap-3 w-full p-4 bg-black text-white font-bold uppercase tracking-wider"
                                            >
                                                <LogOut size={20} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 p-4 border border-black/20 text-black font-bold uppercase tracking-wider hover:bg-black/5 transition-colors"
                                        >
                                            <LogIn size={20} />
                                            <span>Login</span>
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 p-4 bg-black text-white font-bold uppercase tracking-wider"
                                        >
                                            <UserPlus size={20} />
                                            <span>Join Now</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}
