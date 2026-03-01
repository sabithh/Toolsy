'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import { Store, MapPin, Phone, Mail } from 'lucide-react';

export default function CreateShopPage() {
    const router = useRouter();
    const { accessToken, hasShop } = useAuth();
    const { showToast } = useToast();

    // Redirect if already has shop
    useEffect(() => {
        if (hasShop) {
            router.push('/dashboard');
        }
    }, [hasShop, router]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        // Default coordinates for now
        location_lat: 0,
        location_lng: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) return;

        setLoading(true);
        setError('');

        try {
            await api.createShop(accessToken, formData);
            showToast('Shop Protocol Initialized', 'success');
            // Force reload to update user context with hasShop=true
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.message || 'Failed to initialize shop');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#DC2626] pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-12 border-l-4 border-black pl-8">
                    <h1 className="text-6xl font-black uppercase tracking-tighter text-black mb-4">
                        Initialize<br />
                        <span className="text-white">Shop Node</span>
                    </h1>
                    <p className="text-xl font-bold uppercase tracking-widest text-black/60">
                        Establish your protocol presence
                    </p>
                </div>

                <div className="bg-black p-8 md:p-12 relative overflow-hidden">
                    {/* Decorative Grid */}
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `linear-gradient(#333 1px, transparent 1px),
                            linear-gradient(90deg, #333 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }}
                    ></div>

                    <div className="relative z-10">
                        {error && (
                            <div className="bg-red-900/50 border border-red-500 text-red-500 px-6 py-4 mb-8 font-mono text-sm">
                                ERROR: {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Info Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                                    <Store className="text-[#DC2626]" size={24} />
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white">
                                        Identity
                                    </h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-[#DC2626]">
                                        Shop Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#111] border border-white/20 p-4 text-white placeholder-white/30 focus:outline-none focus:border-[#DC2626] transition-colors font-mono"
                                        placeholder="ENTER DESIGNATION"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-[#DC2626]">
                                        Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full bg-[#111] border border-white/20 p-4 text-white placeholder-white/30 focus:outline-none focus:border-[#DC2626] transition-colors font-mono"
                                        placeholder="OPERATIONAL PARAMETERS..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="space-y-6 pt-8">
                                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                                    <MapPin className="text-[#DC2626]" size={24} />
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white">
                                        Coordinates
                                    </h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-[#DC2626]">
                                        Physical Address
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#111] border border-white/20 p-4 text-white placeholder-white/30 focus:outline-none focus:border-[#DC2626] transition-colors font-mono"
                                        placeholder="SECTOR / ZONE / UNIT"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="space-y-6 pt-8">
                                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                                    <Phone className="text-[#DC2626]" size={24} />
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white">
                                        Comms
                                    </h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[#DC2626]">
                                            Ext. Link (Phone)
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                            <input
                                                type="tel"
                                                className="w-full bg-[#111] border border-white/20 p-4 pl-12 text-white placeholder-white/30 focus:outline-none focus:border-[#DC2626] transition-colors font-mono"
                                                placeholder="+1 (000) 000-0000"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[#DC2626]">
                                            Net Link (Email)
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                            <input
                                                type="email"
                                                className="w-full bg-[#111] border border-white/20 p-4 pl-12 text-white placeholder-white/30 focus:outline-none focus:border-[#DC2626] transition-colors font-mono"
                                                placeholder="NODE@GRID.NET"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#DC2626] hover:bg-white text-black font-black uppercase tracking-widest py-6 text-xl transition-all duration-300 border-2 border-[#DC2626] hover:border-white mt-12"
                            >
                                {loading ? 'INITIALIZING...' : 'ESTABLISH PROTOCOL'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
