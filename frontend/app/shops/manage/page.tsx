'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import { Store, MapPin, Phone, Mail, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import LocationPicker from '@/components/ui/LocationPicker';

export default function ManageShopPage() {
    const router = useRouter();
    const { accessToken, user, isAuthenticated, loading: authLoading } = useAuth();
    const { showToast } = useToast();

    const [shopId, setShopId] = useState<string | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        location_lat: 0,
        location_lng: 0,
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        } else if (isAuthenticated && accessToken) {
            fetchShopDetails();
        }
    }, [isAuthenticated, accessToken, authLoading, router]);

    const fetchShopDetails = async () => {
        try {
            const shops = await api.getMyShops(accessToken!);
            if (shops && shops.length > 0) {
                const shop = shops[0]; // Assuming single shop for now
                setShopId(shop.id);
                setFormData({
                    name: shop.name,
                    description: shop.description,
                    address: shop.address,
                    phone: shop.phone || user?.phone || '',
                    email: shop.email || user?.email || '',
                    location_lat: shop.location_lat,
                    location_lng: shop.location_lng,
                });
            } else {
                // No shop found? Redirect to create
                router.push('/shops/new');
            }
        } catch (error) {
            console.error('Failed to fetch shop', error);
            showToast('Failed to load shop data', 'error');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopId || !accessToken) return;

        setSaving(true);
        try {
            await api.updateShop(accessToken, shopId, formData);
            showToast('Shop Protocol Updated', 'success');
        } catch (err: any) {
            console.error('Update failed', err);
            showToast(err.message || 'Update failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen bg-[#DC2626] pt-24 pb-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <Skeleton className="w-64 h-8 mb-4 bg-black/20" />
                    <Skeleton className="w-full h-96 bg-black/20" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#DC2626] pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-black font-bold uppercase tracking-widest hover:text-white transition-colors mb-6">
                        <ArrowLeft size={16} /> Return to Command
                    </Link>
                    <div className="border-l-4 border-black pl-8">
                        <h1 className="text-6xl font-black uppercase tracking-tighter text-black mb-4">
                            Node<br />
                            <span className="text-white">Configuration</span>
                        </h1>
                        <p className="text-xl font-bold uppercase tracking-widest text-black/60">
                            Update Operational Parameters
                        </p>
                    </div>
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

                                <LocationPicker
                                    lat={parseFloat(String(formData.location_lat || 0))}
                                    lng={parseFloat(String(formData.location_lng || 0))}
                                    onLocationChange={(lat, lng) => setFormData(prev => ({ ...prev, location_lat: lat, location_lng: lng }))}
                                />

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-[#DC2626]">
                                        Physical Address
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-[#111] border border-white/20 p-4 text-white placeholder-white/30 focus:outline-none focus:border-[#DC2626] transition-colors font-mono"
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
                                disabled={saving}
                                className="w-full bg-[#DC2626] hover:bg-white text-black font-black uppercase tracking-widest py-6 text-xl transition-all duration-300 border-2 border-[#DC2626] hover:border-white mt-12 flex items-center justify-center gap-3"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save /> Update Protocol
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
