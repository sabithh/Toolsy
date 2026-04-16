'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import { Upload, DollarSign, Package, Tag, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import TiltCard from '@/components/ui/TiltCard';

export default function AddToolPage() {
    const { user, isAuthenticated, accessToken, isRenter, hasShop } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price_per_day: '',
        deposit_amount: '',
        quantity_available: '1',
        category_id: '',
        is_available: true,
        image: null as File | null
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Categories from API
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data: any = await api.getCategories();
                const categoryList = Array.isArray(data) ? data : data.results;
                setCategories(categoryList);
            } catch (error) {
                console.error('Failed to load categories', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (isRenter) {
            router.push('/tools');
        } else if (!hasShop && user?.user_type === 'provider') {
            router.push('/shops/new');
        }
    }, [isAuthenticated, isRenter, router, hasShop, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Create FormData for multipart upload
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price_per_day', formData.price_per_day);
            data.append('deposit_amount', formData.deposit_amount);
            data.append('quantity_available', formData.quantity_available);
            data.append('is_available', 'true'); // Explicitly set to available
            // data.append('shop', '1'); // Backend likely infers shop from user, or we select one. 
            // Assuming simplified flow where backend uses user's default/first shop or we need to fetch shops first.
            // For now, let's assume the backend handles the shop association or we fail and I fix it.

            if (formData.category_id) {
                data.append('category', formData.category_id);
            }

            if (formData.image) {
                data.append('image', formData.image);
            }

            // For now, just logging because we might need to fetch a valid shop ID first
            // But let's try pushing it.
            // Wait, we need a Shop ID. Most Providers have one shop. 
            // Let's quickly check if we need to pass shop_id.
            // If so, we might need to fetch `api.getShops({ owner: user.id })` first.
            // Let's assume user.shop_id or similar exists? Or just fetch shops.

            await api.createTool(accessToken!, data);
            showToast('Tool deployed successfully!', 'success');
            router.push('/tools');
        } catch (err: any) {
            console.error('Failed to create tool', err);
            showToast(err.message || 'Failed to deploy unit. Check console.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <div className="container-custom max-w-4xl">
                {/* Header */}
                <div className="mb-10">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 font-bold uppercase tracking-widest transition-colors mb-6 no-underline text-sm"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="font-black uppercase tracking-tighter leading-none mb-2"
                        style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', color: 'var(--text-primary)' }}>
                        List New Item
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '3px' }}>
                        Add an item to rent out on Vaadaka
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="p-8 space-y-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                    <Tag size={14} style={{ color: '#D20000' }} /> Unit Designation (Name)
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full p-4 font-bold uppercase tracking-wide outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)' }} onFocus={e => (e.target as HTMLElement).style.borderColor='#D20000'} onBlur={e => (e.target as HTMLElement).style.borderColor='var(--border)'}
                                    placeholder="e.g. MAKITA IMPACT DRILL X2"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    className="w-full p-4 font-mono text-sm outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: '#999999' }} onFocus={e => (e.target as HTMLElement).style.borderColor='#D20000'} onBlur={e => (e.target as HTMLElement).style.borderColor='var(--border)'}
                                    placeholder="Technical specifications, condition report, included accessories..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Grid: Price & Deposit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                        <DollarSign size={14} style={{ color: '#D20000' }} /> Daily Rate
                                    </label>
                                    <input
                                        type="number"
                                        name="price_per_day"
                                        required
                                        min="0"
                                        className="w-full p-4 font-bold font-mono outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)' }} onFocus={e => (e.target as HTMLElement).style.borderColor='#D20000'} onBlur={e => (e.target as HTMLElement).style.borderColor='var(--border)'}
                                        placeholder="0.00"
                                        value={formData.price_per_day}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                        Security Deposit
                                    </label>
                                    <input
                                        type="number"
                                        name="deposit_amount"
                                        required
                                        min="0"
                                        className="w-full p-4 font-bold font-mono outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)' }} onFocus={e => (e.target as HTMLElement).style.borderColor='#D20000'} onBlur={e => (e.target as HTMLElement).style.borderColor='var(--border)'}
                                        placeholder="0.00"
                                        value={formData.deposit_amount}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Grid: Qty & Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                        <Package size={14} style={{ color: '#D20000' }} /> Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity_available"
                                        required
                                        min="1"
                                        className="w-full p-4 font-bold font-mono outline-none transition-colors" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)' }} onFocus={e => (e.target as HTMLElement).style.borderColor='#D20000'} onBlur={e => (e.target as HTMLElement).style.borderColor='var(--border)'}
                                        value={formData.quantity_available}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                        Class (Category)
                                    </label>
                                    <select
                                        name="category_id"
                                        className="w-full p-4 font-bold uppercase tracking-wide outline-none transition-colors appearance-none" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)' }} onFocus={e => (e.target as HTMLElement).style.borderColor='#D20000'} onBlur={e => (e.target as HTMLElement).style.borderColor='var(--border)'}
                                        value={formData.category_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Class...</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full font-black uppercase tracking-widest py-5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer" style={{ background: '#D20000', color: 'white', border: 'none', borderRadius: 6 }}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Initializing...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={24} />
                                        Deploy Unit
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
                                Visual Log (Image)
                            </label>
                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                />
                                <div className={`aspect-square flex flex-col items-center justify-center transition-colors ${previewUrl ? 'p-0 overflow-hidden' : 'p-8'}`} style={{ border: `2px dashed #1E1E1E`, borderRadius: 8, background: 'var(--bg-surface)' }}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center opacity-40">
                                            <Upload size={48} className="mx-auto mb-4" />
                                            <span className="font-bold uppercase tracking-widest text-sm">Upload Scan</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Live Preview Card */}
                        {previewUrl && (
                            <div>
                                <label className="text-xs font-bold text-black uppercase tracking-widest block mb-2">
                                    Network Preview
                                </label>
                                <TiltCard>
                                    <div className="group relative bg-[#0a0a0a] border border-[#1a1a1a] flex flex-col h-full aspect-[4/5] overflow-hidden">
                                        {/* Active Badge (Top Right) */}
                                        <div className="absolute top-6 right-6 z-10">
                                            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest border border-green-500 text-green-500">
                                                ACTIVE
                                            </div>
                                        </div>

                                        {/* Circle Decorator (Left Center) */}
                                        <div className="absolute top-1/2 left-12 -translate-y-1/2 w-8 h-8 rounded-full border border-white/20 z-0"></div>

                                        {/* Image (Centered) */}
                                        <div className="flex-1 relative flex items-center justify-center p-6 z-0 bg-black/40">
                                            <div className="relative w-full h-full">
                                                {/* Accent Glow */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-red-500/20 blur-[60px] rounded-full transition-colors duration-500"></div>
                                                <img src={previewUrl} className="w-full h-full object-contain relative z-10 drop-shadow-2xl" alt="Preview" />
                                            </div>
                                        </div>

                                        {/* Bottom Info Section */}
                                        <div className="p-6 pt-0 pb-8 mt-auto relative z-10 bg-gradient-to-t from-black via-black/80 to-transparent">
                                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-none line-clamp-2">
                                                {formData.name || 'UNIT NAME'}
                                            </h3>

                                            <div className="border-t border-white/10 pt-4 flex items-end justify-between">
                                                <div className="text-3xl font-black text-white leading-none">
                                                    ₹{Number(formData.price_per_day || 0).toFixed(2)}
                                                </div>
                                                <div className="text-xs font-mono text-gray-500 uppercase pb-1">
                                                    /DAY
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TiltCard>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
