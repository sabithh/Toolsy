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
    const { accessToken, user, isAuthenticated, isLoading: authLoading } = useAuth();
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
                const shop = shops[0];
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
            showToast('Shop settings updated', 'success');
        } catch (err: any) {
            console.error('Update failed', err);
            showToast(err.message || 'Update failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-6" style={{ background: 'var(--bg-primary)' }}>
                <div className="max-w-3xl mx-auto">
                    <Skeleton className="w-64 h-8 mb-4" />
                    <Skeleton className="w-full h-96" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-6" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <Link href="/dashboard"
                        className="inline-flex items-center gap-2 font-bold uppercase tracking-widest transition-colors mb-6 no-underline text-sm"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <div style={{ borderLeft: '3px solid var(--highlight)', paddingLeft: '1.25rem' }}>
                        <h1 className="font-black uppercase tracking-tighter leading-none mb-2"
                            style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--text-primary)' }}>
                            Shop Settings
                        </h1>
                        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '3px' }}>
                            Update your shop information
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
                                    <Store style={{ color: '#D20000' }} size={24} />
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white">
                                        Identity
                                    </h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: '#D20000' }}>
                                        Shop Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-4 font-mono outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)' }} onFocus={e => (e.target as HTMLElement).style.borderColor='#D20000'} onBlur={e => (e.target as HTMLElement).style.borderColor='var(--border)'}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: '#D20000' }}>
                                        Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full p-4 font-mono outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)' }} onFocus={e => (e.target as HTMLElement).style.borderColor='#D20000'} onBlur={e => (e.target as HTMLElement).style.borderColor='var(--border)'}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="space-y-6 pt-8">
                                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                                    <MapPin style={{ color: '#D20000' }} size={24} />
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white">
                                        Coordinates
                                    </h3>
                                </div>

                                <LocationPicker
                                    lat={parseFloat(String(formData.location_lat || 0))}
                                    lng={parseFloat(String(formData.location_lng || 0))}
                                    onLocationChange={(lat: number, lng: number) => setFormData(prev => ({ ...prev, location_lat: lat, location_lng: lng }))}
                                />

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: '#D20000' }}>
                                        Physical Address
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-4 font-mono outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)' }} onFocus={e => (e.target as HTMLElement).style.borderColor='#D20000'} onBlur={e => (e.target as HTMLElement).style.borderColor='var(--border)'}
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="space-y-6 pt-8">
                                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                                    <Phone style={{ color: '#D20000' }} size={24} />
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white">
                                        Comms
                                    </h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: '#D20000' }}>
                                            Ext. Link (Phone)
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                            <input
                                                type="tel"
                                                className="w-full p-4 pl-12 font-mono outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)' }} onFocus={e => (e.target as HTMLElement).style.borderColor='#D20000'} onBlur={e => (e.target as HTMLElement).style.borderColor='var(--border)'}
                                                placeholder="+91 00000 00000"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: '#D20000' }}>
                                            Net Link (Email)
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                            <input
                                                type="email"
                                                className="w-full p-4 pl-12 font-mono outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)' }} onFocus={e => (e.target as HTMLElement).style.borderColor='#D20000'} onBlur={e => (e.target as HTMLElement).style.borderColor='var(--border)'}
                                                placeholder="shop@vaadaka.in"
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
                                className="w-full font-black uppercase tracking-widest py-6 text-xl transition-all duration-300 mt-12 flex items-center justify-center gap-3"
                                style={{ background: '#D20000', color: 'white', border: 'none', borderRadius: 6 }}
                                onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#B10000'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#D20000'; }}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} /> Save Changes
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
