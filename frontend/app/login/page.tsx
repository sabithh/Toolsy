'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { showToast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.username, formData.password);
            showToast('Welcome back to Vaadaka!', 'success');
            router.push('/dashboard');
        } catch (err: any) {
            const raw = (err.message || '').toLowerCase();
            if (raw.includes('no active account') || raw.includes('given credentials') || raw.includes('incorrect')) {
                setError('Incorrect username or password.');
            } else {
                setError(err.message || 'Login failed. Check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '0.875rem 1rem',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'border-color 0.2s',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        marginBottom: '0.4rem',
        fontFamily: 'var(--font-barlow), sans-serif',
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)', backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>

            {/* Left panel — hero */}
            <div className="hidden lg:flex w-1/2 flex-col justify-center p-16 relative"
                style={{ background: '#080808', borderRight: '1px solid var(--border)' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(210,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(210,0,0,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-12">
                        <div style={{ width: 40, height: 40, background: '#D20000', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 90 90" fill="none" style={{ width: 28, height: 28 }}>
                                <path d="M18 22 L45 68 L72 22" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <circle cx="18" cy="22" r="9" fill="white" />
                                <circle cx="18" cy="22" r="4.5" fill="#D20000" />
                            </svg>
                        </div>
                        <span style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '1.5rem', color: '#FFFFFF', letterSpacing: '0.05em' }}>
                            VAA<span style={{ color: '#D20000' }}>DAKA</span><span style={{ color: '#D20000' }}>.</span>
                        </span>
                    </div>
                    <h1 className="font-black uppercase tracking-tighter leading-[0.85] mb-8"
                        style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(4rem, 8vw, 7rem)', color: '#FFFFFF' }}>
                        Rent<br />
                        <span style={{ color: '#D20000' }}>Anything</span><br />
                        Near You
                    </h1>
                    <div style={{ borderLeft: '3px solid #D20000', paddingLeft: '1.25rem' }}>
                        <p className="text-base font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-barlow), sans-serif', letterSpacing: '3px' }}>
                            Kerala&apos;s rental platform.<br />
                            <span style={{ color: '#FFFFFF' }}>No ownership required.</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="font-black uppercase tracking-tighter mb-1"
                            style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '2.5rem', color: 'var(--text-primary)', lineHeight: 1 }}>
                            Log In
                        </h2>
                        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-barlow), sans-serif', letterSpacing: '3px' }}>
                            Welcome back to Vaadaka
                        </p>
                    </div>

                    {error && (
                        <div className="px-4 py-3 mb-6 text-sm font-mono"
                            style={{ background: 'rgba(210,0,0,0.1)', border: '1px solid rgba(210,0,0,0.3)', borderRadius: 6, color: '#FF6666' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label style={labelStyle}>Username</label>
                            <input type="text" style={inputStyle} required autoComplete="username"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#D20000'}
                                onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} style={inputStyle} required autoComplete="current-password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#D20000'}
                                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full font-black uppercase tracking-widest py-4 mt-2 transition-all duration-200 cursor-pointer"
                            style={{
                                background: loading ? 'var(--text-muted)' : 'var(--highlight)',
                                color: 'var(--bg-primary)',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: '1rem',
                                fontFamily: 'var(--font-bebas), sans-serif',
                                letterSpacing: '0.1em',
                            }}
                            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = 'var(--highlight-hover)'; }}
                            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = 'var(--highlight)'; }}
                        >
                            {loading ? 'Logging in...' : 'Log In to Vaadaka'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-bold no-underline transition-colors"
                            style={{ color: 'var(--text-primary)' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--highlight)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}>
                            Join Vaadaka →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
