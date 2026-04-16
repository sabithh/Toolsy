'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Modal from '@/components/ui/Modal';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Search, Calendar, LayoutDashboard, LogOut, LogIn, UserPlus, Plus, Menu, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

function VaadakaLogo() {
    const { isLight } = useTheme();

    // Mode 1 (red theme): dark bg icon — V is red, stands out against red page
    // Mode 2 (light theme): red bg icon — V is white, classic brand mark
    const iconBg = isLight ? '#D20000' : '#0A0A0A';
    const vStroke = isLight ? 'white' : '#D20000';
    const eyeletFill = isLight ? 'white' : '#D20000';
    const eyeletInner = isLight ? '#D20000' : '#0A0A0A';

    return (
        <div className="flex items-center gap-3">
            <div style={{
                width: 44,
                height: 44,
                background: iconBg,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.35s ease',
            }}>
                <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 32, height: 32 }}>
                    <path d="M18 22 L45 68 L72 22"
                        stroke={vStroke}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none" />
                    <circle cx="18" cy="22" r="9" fill={eyeletFill} />
                    <circle cx="18" cy="22" r="4.5" fill={eyeletInner} />
                </svg>
            </div>
            <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-0">
                    <span style={{
                        fontFamily: 'var(--font-noto-ml), serif',
                        fontSize: '1.35rem',
                        fontWeight: 700,
                        color: '#D20000',
                        lineHeight: 1,
                    }}>വാ</span>
                    <span style={{
                        fontFamily: 'var(--font-bebas), sans-serif',
                        fontSize: '1.5rem',
                        fontWeight: 400,
                        color: 'var(--text-primary)',
                        letterSpacing: '0.05em',
                        lineHeight: 1,
                    }}>DAKA</span>
                    <span style={{ color: '#D20000', fontFamily: 'var(--font-bebas), sans-serif', fontSize: '1.5rem', lineHeight: 1 }}>.</span>
                </div>
                <span style={{
                    fontFamily: 'var(--font-barlow), sans-serif',
                    fontSize: '0.55rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    marginTop: '2px',
                }}>Rent Anything · Kerala</span>
            </div>
        </div>
    );
}

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

    const navLinkStyle = {
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
        borderRadius: 6,
    };

    return (
        <>
            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
                title="Log out?"
                description="You will be signed out of your Vaadaka session."
                confirmText="LOGOUT"
                variant="danger"
            />

            <nav className="fixed top-0 left-0 right-0 z-50">
                <div style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)', transition: 'background 0.35s ease' }}>
                    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link
                                href={isAuthenticated ? (user?.is_superuser ? '/admin' : user?.user_type === 'provider' ? '/dashboard' : '/tools') : '/'}
                                className="flex items-center group no-underline"
                            >
                                <VaadakaLogo />
                            </Link>

                            {/* Desktop Nav Links */}
                            <div className="hidden md:flex items-center gap-3">
                                <Link
                                    href="/tools"
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 no-underline"
                                    style={navLinkStyle}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; (e.currentTarget as HTMLElement).style.color = '#D20000'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                                >
                                    <Search size={16} />
                                    <span>Browse</span>
                                </Link>

                                {isAuthenticated ? (
                                    <>
                                        {!user?.is_superuser && (
                                            <Link
                                                href="/bookings"
                                                className="flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 no-underline"
                                                style={navLinkStyle}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; (e.currentTarget as HTMLElement).style.color = '#D20000'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                                            >
                                                <Calendar size={16} />
                                                <span>Rentals</span>
                                            </Link>
                                        )}

                                        {user?.is_superuser ? (
                                            <Link
                                                href="/admin"
                                                className="flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 no-underline"
                                                style={navLinkStyle}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; (e.currentTarget as HTMLElement).style.color = '#D20000'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                                            >
                                                <LayoutDashboard size={16} />
                                                <span>Admin</span>
                                            </Link>
                                        ) : user?.user_type === 'provider' && (
                                            <>
                                                <Link
                                                    href="/tools/new"
                                                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 no-underline"
                                                    style={{ background: '#D20000', color: 'white', borderRadius: 6, border: '1px solid #D20000' }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#B10000'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#D20000'; }}
                                                >
                                                    <Plus size={16} />
                                                    <span>List Item</span>
                                                </Link>
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 no-underline"
                                                    style={navLinkStyle}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; (e.currentTarget as HTMLElement).style.color = '#D20000'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                                                >
                                                    <LayoutDashboard size={16} />
                                                    <span>Dashboard</span>
                                                </Link>
                                            </>
                                        )}

                                        <div className="flex items-center gap-3 pl-3" style={{ borderLeft: '1px solid var(--border)' }}>
                                            <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                                                {user?.username}
                                            </span>
                                            <button
                                                onClick={() => setIsLogoutModalOpen(true)}
                                                className="flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                                                style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6 }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; (e.currentTarget as HTMLElement).style.color = '#D20000'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                                            >
                                                <LogOut size={16} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 no-underline"
                                            style={{ color: 'var(--text-muted)' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                                        >
                                            <LogIn size={16} />
                                            <span>Login</span>
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 no-underline"
                                            style={{ background: '#D20000', color: 'white', borderRadius: 6, border: '1px solid #D20000' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#B10000'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#D20000'; }}
                                        >
                                            <UserPlus size={16} />
                                            <span>Join Now</span>
                                        </Link>
                                    </>
                                )}

                                {/* Theme Toggle */}
                                <ThemeToggle />
                            </div>

                            {/* Mobile: theme toggle + hamburger */}
                            <div className="md:hidden flex items-center gap-3">
                                <ThemeToggle />
                                <button
                                    className="p-2 transition-colors cursor-pointer"
                                    style={{ color: 'var(--text-primary)' }}
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                        </div>

                        {/* Mobile dropdown menu */}
                        {isMobileMenuOpen && (
                            <div className="md:hidden pt-4 pb-2 space-y-2" style={{ borderTop: '1px solid var(--border)', marginTop: '0.75rem' }}>
                                <Link href="/tools" className="flex items-center gap-3 px-3 py-3 text-sm font-bold uppercase tracking-wider no-underline" style={{ color: 'var(--text-primary)' }} onClick={() => setIsMobileMenuOpen(false)}>
                                    <Search size={16} style={{ color: '#D20000' }} /> Browse
                                </Link>
                                {isAuthenticated ? (
                                    <>
                                        {!user?.is_superuser && (
                                            <Link href="/bookings" className="flex items-center gap-3 px-3 py-3 text-sm font-bold uppercase tracking-wider no-underline" style={{ color: 'var(--text-primary)' }} onClick={() => setIsMobileMenuOpen(false)}>
                                                <Calendar size={16} style={{ color: '#D20000' }} /> My Rentals
                                            </Link>
                                        )}
                                        {user?.user_type === 'provider' && (
                                            <>
                                                <Link href="/tools/new" className="flex items-center gap-3 px-3 py-3 text-sm font-bold uppercase tracking-wider no-underline" style={{ color: '#D20000' }} onClick={() => setIsMobileMenuOpen(false)}>
                                                    <Plus size={16} /> List Item
                                                </Link>
                                                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 text-sm font-bold uppercase tracking-wider no-underline" style={{ color: 'var(--text-primary)' }} onClick={() => setIsMobileMenuOpen(false)}>
                                                    <LayoutDashboard size={16} style={{ color: '#D20000' }} /> Dashboard
                                                </Link>
                                            </>
                                        )}
                                        <button onClick={() => { setIsLogoutModalOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-3 py-3 text-sm font-bold uppercase tracking-wider w-full text-left cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                            <LogOut size={16} style={{ color: '#D20000' }} /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="flex items-center gap-3 px-3 py-3 text-sm font-bold uppercase tracking-wider no-underline" style={{ color: 'var(--text-primary)' }} onClick={() => setIsMobileMenuOpen(false)}>
                                            <LogIn size={16} style={{ color: '#D20000' }} /> Login
                                        </Link>
                                        <Link href="/register" className="flex items-center gap-3 px-3 py-3 text-sm font-bold uppercase tracking-wider no-underline" style={{ color: '#D20000' }} onClick={() => setIsMobileMenuOpen(false)}>
                                            <UserPlus size={16} /> Join Now
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}
