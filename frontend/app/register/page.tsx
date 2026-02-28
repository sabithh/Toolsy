'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const { showToast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password_confirm) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await register(formData);
            showToast('Welcome to the Network', 'success');
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#DC2626] flex text-black font-sans">
            {/* Left Side - Typography - Black */}
            <div className="hidden xl:flex w-1/3 bg-black items-center justify-center p-12 relative overflow-hidden border-r border-[#DC2626]/20">
                <div className="relative z-10 max-w-sm">
                    <h1 className="text-7xl font-black uppercase tracking-tighter leading-none mb-8 text-white">
                        Join<br />
                        <span className="text-[#DC2626]">The</span><br />
                        Grid
                    </h1>
                    <div className="space-y-8 mt-16 font-mono text-sm text-gray-400">
                        <div className="border-l-2 border-[#DC2626] pl-4">
                            <h3 className="text-white font-bold uppercase mb-1">Renter Access</h3>
                            <p>Instant booking protocol. Real-time availability checks.</p>
                        </div>
                        <div className="border-l-2 border-white/20 pl-4">
                            <h3 className="text-white font-bold uppercase mb-1">Provider Node</h3>
                            <p>Inventory management system. Automated revenue streams.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form - Red */}
            <div className="w-full xl:w-2/3 flex items-center justify-center p-8 lg:p-24 bg-[#DC2626] overflow-y-auto">
                <div className="max-w-2xl w-full">
                    <div className="mb-12">
                        <h2 className="text-4xl font-black uppercase tracking-widest mb-2 text-black">Initialize Account</h2>
                        <div className="h-1 w-20 bg-black"></div>
                    </div>

                    {error && (
                        <div className="bg-black/10 border border-black text-black px-6 py-4 mb-8 font-mono text-sm">
                            ERROR: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* User Type */}
                        <div className="space-y-4">
                            <label className="block text-xs font-bold uppercase tracking-widest text-black/60">Select Protocol</label>
                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    type="button"
                                    className={`p-6 border text-left transition-all duration-300 group ${formData.user_type === 'renter'
                                        ? 'bg-black border-black text-white'
                                        : 'bg-[#B91C1C] border-black/10 text-black/60 hover:border-black/40 hover:text-black'
                                        }`}
                                    onClick={() => setFormData({ ...formData, user_type: 'renter' })}
                                >
                                    <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Option A</div>
                                    <div className="font-black text-xl uppercase tracking-wider">Rent Tools</div>
                                </button>
                                <button
                                    type="button"
                                    className={`p-6 border text-left transition-all duration-300 group ${formData.user_type === 'provider'
                                        ? 'bg-black border-black text-white'
                                        : 'bg-[#B91C1C] border-black/10 text-black/60 hover:border-black/40 hover:text-black'
                                        }`}
                                    onClick={() => setFormData({ ...formData, user_type: 'provider' })}
                                >
                                    <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Option B</div>
                                    <div className="font-black text-xl uppercase tracking-wider">List Inventory</div>
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
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
                                <label className="block text-xs font-bold uppercase tracking-widest text-black/60">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-[#B91C1C] border border-black/20 p-4 text-white placeholder-white/50 focus:outline-none focus:border-black transition-colors font-mono"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-black/60">First Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#B91C1C] border border-black/20 p-4 text-white placeholder-white/50 focus:outline-none focus:border-black transition-colors font-mono"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-black/60">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#B91C1C] border border-black/20 p-4 text-white placeholder-white/50 focus:outline-none focus:border-black transition-colors font-mono"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-black/60">Communication Link</label>
                            <input
                                type="tel"
                                className="w-full bg-[#B91C1C] border border-black/20 p-4 text-white placeholder-white/50 focus:outline-none focus:border-black transition-colors font-mono"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 (000) 000-0000"
                            />
                        </div>



                        <div className="grid md:grid-cols-2 gap-6">
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

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-black/60">Confirm</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full bg-[#B91C1C] border border-black/20 p-4 text-white placeholder-white/50 focus:outline-none focus:border-black transition-colors font-mono"
                                        value={formData.password_confirm}
                                        onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white font-black uppercase tracking-widest py-5 hover:bg-white hover:text-black transition-colors duration-300 mt-8 border-2 border-black"
                            disabled={loading}
                        >
                            {loading ? 'Initializing...' : 'Establish Connection'}
                        </button>
                    </form>

                    <p className="mt-12 text-center text-black/60 text-sm font-mono">
                        ALREADY CONNECTED?{' '}
                        <Link href="/login" className="text-black hover:text-white uppercase font-bold tracking-wider ml-2">
                            Login &rarr;
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
