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
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.username, formData.password);
            showToast('Access Granted', 'success');
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#DC2626] flex text-black font-sans">
            {/* Left Side - Typography - Now Black */}
            <div className="hidden lg:flex w-1/2 bg-black items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(#DC2626 1px, transparent 1px),
                        linear-gradient(90deg, #DC2626 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>
                <div className="relative z-10">
                    <h1 className="text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-8 text-white mix-blend-normal">
                        Rent<br />Build<br />Create
                    </h1>
                    <p className="text-xl font-bold uppercase tracking-widest text-[#DC2626] border-l-4 border-[#DC2626] pl-6">
                        Access professional tools<br />without ownership.
                    </p>
                </div>
            </div>

            {/* Right Side - Form - Now Red with Black Text */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-[#DC2626]">
                <div className="max-w-md w-full">
                    <div className="mb-12">
                        <h2 className="text-4xl font-black uppercase tracking-widest mb-2 text-black">Login</h2>
                        <div className="h-1 w-20 bg-black"></div>
                    </div>

                    {error && (
                        <div className="bg-black/10 border border-black text-black px-6 py-4 mb-8 font-mono text-sm">
                            ERROR: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-black/60">Username</label>
                            <input
                                type="text"
                                className="w-full bg-[#B91C1C] border border-black/20 p-4 text-white placeholder-white/50 focus:outline-none focus:border-black transition-colors font-mono"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-black/60">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full bg-[#B91C1C] border border-black/20 p-4 text-white placeholder-white/50 focus:outline-none focus:border-black transition-colors font-mono"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white font-black uppercase tracking-widest py-5 hover:bg-white hover:text-black transition-colors duration-300 border-2 border-black"
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Access Dashboard'}
                        </button>
                    </form>

                    <p className="mt-12 text-center text-black/60 text-sm font-mono">
                        NO ACCOUNT?{' '}
                        <Link href="/register" className="text-black hover:text-white uppercase font-bold tracking-wider ml-2">
                            Initialize &rarr;
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
