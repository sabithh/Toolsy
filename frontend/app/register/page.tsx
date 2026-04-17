'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Eye, EyeOff, ShoppingBag, Tag, ArrowRight, CheckCircle } from 'lucide-react';

type UserRole = 'renter' | 'provider' | null;

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register } = useAuth();
    const { showToast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        user_type: 'renter' as 'renter' | 'provider',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Pre-select role from URL query param (e.g. /register?role=provider)
    useEffect(() => {
        const role = searchParams.get('role');
        if (role === 'provider') {
            setSelectedRole('provider');
            setFormData(f => ({ ...f, user_type: 'provider' }));
        }
    }, [searchParams]);

    const handleRoleSelect = (role: 'renter' | 'provider') => {
        setSelectedRole(role);
        setFormData(f => ({ ...f, user_type: role }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.password_confirm) { setError('Passwords do not match'); return; }
        setLoading(true);
        try {
            await register(formData);
            showToast('Welcome to Vaadaka!', 'success');
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
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
            {/* Left panel */}
            <div className="hidden xl:flex w-[380px] flex-shrink-0 flex-col justify-center p-12 relative"
                style={{ background: '#080808', borderRight: '1px solid var(--border)' }}>
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-8">
                        <div style={{ width: 36, height: 36, background: '#D20000', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 90 90" fill="none" style={{ width: 26, height: 26 }}>
                                <path d="M18 22 L45 68 L72 22" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <circle cx="18" cy="22" r="9" fill="white" />
                                <circle cx="18" cy="22" r="4.5" fill="#D20000" />
                            </svg>
                        </div>
                        <span style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '1.4rem', color: '#FFFFFF', letterSpacing: '0.05em' }}>
                            VAA<span style={{ color: '#D20000' }}>DAKA</span><span style={{ color: '#D20000' }}>.</span>
                        </span>
                    </div>
                    <h2 className="font-black uppercase tracking-tighter leading-none mb-4"
                        style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '3.5rem', color: '#FFFFFF', lineHeight: 0.9 }}>
                        Join<br /><span style={{ color: '#D20000' }}>Kerala's</span><br />Network
                    </h2>
                </div>
                <div className="space-y-6">
                    {[
                        { label: 'Free to join', desc: 'No subscription fees ever' },
                        { label: 'Rent anything', desc: 'Tools, gear, equipment nearby' },
                        { label: 'Earn easily', desc: '2% commission only on rentals' },
                    ].map(item => (
                        <div key={item.label} className="flex items-start gap-3">
                            <CheckCircle size={16} style={{ color: '#D20000', flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <div className="text-sm font-bold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{item.label}</div>
                                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-start justify-center p-6 md:p-12 overflow-y-auto">
                <div className="w-full max-w-xl pt-24 pb-12">

                    {/* STEP INDICATOR */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex items-center gap-2">
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: selectedRole ? 'var(--highlight)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--bg-primary)' }}>
                                {selectedRole ? '✓' : '1'}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: selectedRole ? 'var(--text-primary)' : 'var(--text-muted)' }}>Choose role</span>
                        </div>
                        <div style={{ flex: 1, height: 1, background: selectedRole ? 'var(--highlight)' : 'var(--border)' }} />
                        <div className="flex items-center gap-2">
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: selectedRole ? 'var(--highlight)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--bg-primary)' }}>2</div>
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: selectedRole ? 'var(--text-primary)' : 'var(--text-muted)' }}>Your details</span>
                        </div>
                    </div>

                    {/* ROLE SELECTION (Step 1) */}
                    {!selectedRole ? (
                        <div>
                            <h1 className="font-black uppercase tracking-tighter mb-2"
                                style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '2.5rem', color: 'var(--text-primary)', lineHeight: 1 }}>
                                How will you use Vaadaka?
                            </h1>
                            <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>Pick one to get started — you can always change later.</p>

                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* Renter card */}
                                <button
                                    onClick={() => handleRoleSelect('renter')}
                                    className="text-left p-7 transition-all duration-200 group cursor-pointer"
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10 }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                                >
                                    <div className="mb-5">
                                        <div style={{ width: 48, height: 48, background: 'var(--bg-surface-2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ShoppingBag size={24} style={{ color: '#D20000' }} />
                                        </div>
                                    </div>
                                    <div className="font-black uppercase tracking-wide mb-2 text-lg"
                                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.08em' }}>
                                        I want to RENT things
                                    </div>
                                    <p className="text-sm mb-5" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        Browse and book items listed by owners near you.
                                    </p>
                                    <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider"
                                        style={{ color: 'var(--text-primary)' }}>
                                        Join as Renter <ArrowRight size={16} />
                                    </div>
                                </button>

                                {/* Owner card */}
                                <button
                                    onClick={() => handleRoleSelect('provider')}
                                    className="text-left p-7 transition-all duration-200 cursor-pointer"
                                    style={{ background: 'var(--bg-surface)', border: '1px solid #D20000', borderRadius: 10 }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#150000'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'; }}
                                >
                                    <div className="mb-5">
                                        <div style={{ width: 48, height: 48, background: 'rgba(210,0,0,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Tag size={24} style={{ color: '#D20000' }} />
                                        </div>
                                    </div>
                                    <div className="font-black uppercase tracking-wide mb-2 text-lg"
                                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.08em' }}>
                                        I want to LIST things
                                    </div>
                                    <p className="text-sm mb-5" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        List your items and earn by renting them out.
                                    </p>
                                    <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider"
                                        style={{ color: '#D20000' }}>
                                        Join as Owner <ArrowRight size={16} />
                                    </div>
                                </button>
                            </div>

                            <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                Already have an account?{' '}
                                <Link href="/login" className="font-bold no-underline transition-colors"
                                    style={{ color: 'var(--text-primary)' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--highlight)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}>
                                    Log in →
                                </Link>
                            </p>
                        </div>
                    ) : (
                        /* REGISTRATION FORM (Step 2) */
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    onClick={() => setSelectedRole(null)}
                                    className="text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0 }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
                                >
                                    ← Back
                                </button>
                            </div>
                            <h1 className="font-black uppercase tracking-tighter mb-1"
                                style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '2.2rem', color: 'var(--text-primary)', lineHeight: 1 }}>
                                {selectedRole === 'renter' ? 'Renter Registration' : 'Owner Registration'}
                            </h1>
                            <div className="flex items-center gap-2 mb-8">
                                {selectedRole === 'renter'
                                    ? <><ShoppingBag size={14} style={{ color: 'var(--highlight)' }} /><span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Renter Account</span></>
                                    : <><Tag size={14} style={{ color: 'var(--highlight)' }} /><span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Owner Account</span></>
                                }
                            </div>

                            {error && (
                                <div className="px-4 py-3 mb-6 text-sm font-mono"
                                    style={{ background: 'rgba(210,0,0,0.1)', border: '1px solid rgba(210,0,0,0.3)', borderRadius: 6, color: '#FF6666' }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label style={labelStyle}>First Name</label>
                                        <input type="text" style={inputStyle}
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                            onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#D20000'}
                                            onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Last Name</label>
                                        <input type="text" style={inputStyle}
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                            onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#D20000'}
                                            onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={labelStyle}>Username</label>
                                    <input type="text" style={inputStyle} required
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#D20000'}
                                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    <input type="email" style={inputStyle} required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#D20000'}
                                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Phone Number</label>
                                    <input type="tel" style={inputStyle} placeholder="+91 00000 00000"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#D20000'}
                                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label style={labelStyle}>Password</label>
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} style={inputStyle} required
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
                                    <div>
                                        <label style={labelStyle}>Confirm Password</label>
                                        <input type={showPassword ? 'text' : 'password'} style={inputStyle} required
                                            value={formData.password_confirm}
                                            onChange={e => setFormData({ ...formData, password_confirm: e.target.value })}
                                            onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#D20000'}
                                            onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full font-black uppercase tracking-widest py-4 transition-all duration-200 cursor-pointer mt-2"
                                    style={{
                                        background: loading ? 'var(--text-muted)' : 'var(--highlight)',
                                        color: 'var(--bg-primary)',
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: '0.95rem',
                                        fontFamily: 'var(--font-bebas), sans-serif',
                                        letterSpacing: '0.1em',
                                    }}
                                >
                                    {loading ? 'Creating account...' : `Create ${selectedRole === 'renter' ? 'Renter' : 'Owner'} Account`}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                Already have an account?{' '}
                                <Link href="/login" className="font-bold no-underline transition-colors"
                                    style={{ color: 'var(--text-primary)' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--highlight)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}>
                                    Log in →
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
