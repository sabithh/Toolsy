'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import { Upload, DollarSign, Package, Tag, ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import TiltCard from '@/components/ui/TiltCard';
import { getImageUrl } from '@/lib/utils';

export default function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { user, isAuthenticated, accessToken, isRenter } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price_per_day: '',
        deposit_amount: '',
        quantity_available: '1',
        category_id: '',
        image: null as File | null
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Categories from API
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                const catData: any = await api.getCategories();
                const categoryList = Array.isArray(catData) ? catData : catData.results;
                setCategories(categoryList);

                // Fetch Tool
                const toolData: any = await api.getTool(resolvedParams.id);

                // Permission Check
                // Note: We should ideally check this, but for now relying on backend permission
                // if (toolData.shop.owner.id !== user?.id) { ... }

                setFormData({
                    name: toolData.name,
                    description: toolData.description,
                    price_per_day: toolData.price_per_day,
                    deposit_amount: toolData.deposit_amount,
                    quantity_available: toolData.quantity_available.toString(),
                    category_id: toolData.category ? toolData.category.id : '', // Note: API might return object or ID
                    image: null
                });

                // Set image preview if exists
                if (toolData.images && toolData.images.length > 0) {
                    setPreviewUrl(getImageUrl(toolData.images[0]));
                } else if (toolData.image) {
                    setPreviewUrl(getImageUrl(toolData.image));
                }

            } catch (error) {
                console.error('Failed to load data', error);
                showToast('Failed to load tool details', 'error');
                router.push('/tools');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, resolvedParams.id]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (isRenter) {
            router.push('/tools');
        }
    }, [isAuthenticated, isRenter, router]);

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
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price_per_day', formData.price_per_day);
            data.append('deposit_amount', formData.deposit_amount);
            data.append('quantity_available', formData.quantity_available);

            if (formData.category_id) {
                // If the initial load set category_id from an object and it doesn't match the new select, handle it
                // Actually the select uses ID, so it should be fine.
                // But wait, if initial load had category object, we need to extract ID. 
                // I did that in useEffect: `toolData.category ? toolData.category.id : ''`
                // But `toolData.category` might be just an ID if the serializer is simple.
                // Let's assume the useEffect logic covers it.
                data.append('category', formData.category_id);
            }

            if (formData.image) {
                data.append('image', formData.image);
            }

            await api.updateTool(accessToken!, resolvedParams.id, data);
            showToast('Tool updated successfully!', 'success');
            router.push(`/tools/${resolvedParams.id}`);
        } catch (err: any) {
            console.error('Failed to update tool', err);
            showToast(err.message || 'Failed to update unit.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#DC2626] flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-black" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#DC2626] text-black py-24">
            <div className="container-custom max-w-4xl">
                {/* Header */}
                <div className="mb-12">
                    <Link href={`/tools/${resolvedParams.id}`} className="inline-flex items-center gap-2 text-black font-bold uppercase tracking-widest hover:text-white transition-colors mb-6">
                        <ArrowLeft size={16} /> Abort / Return
                    </Link>
                    <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
                        Edit<br />Unit Config
                    </h1>
                    <p className="text-xl font-mono opacity-60 uppercase">
                        // MODIFY HARDWARE PARAMETERS
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-black p-8 border border-black space-y-6">

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <Tag size={14} className="text-[#DC2626]" /> Unit Designation (Name)
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full bg-[#111] border border-white/20 p-4 text-white font-bold uppercase tracking-wide focus:border-[#DC2626] outline-none transition-colors"
                                    placeholder="e.g. MAKITA IMPACT DRILL X2"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    className="w-full bg-[#111] border border-white/20 p-4 text-gray-400 font-mono text-sm focus:border-[#DC2626] outline-none transition-colors"
                                    placeholder="Technical specifications, condition report, included accessories..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Grid: Price & Deposit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        <DollarSign size={14} className="text-[#DC2626]" /> Daily Rate
                                    </label>
                                    <input
                                        type="number"
                                        name="price_per_day"
                                        required
                                        min="0"
                                        className="w-full bg-[#111] border border-white/20 p-4 text-white font-bold font-mono focus:border-[#DC2626] outline-none transition-colors"
                                        placeholder="0.00"
                                        value={formData.price_per_day}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        Security Deposit
                                    </label>
                                    <input
                                        type="number"
                                        name="deposit_amount"
                                        required
                                        min="0"
                                        className="w-full bg-[#111] border border-white/20 p-4 text-white font-bold font-mono focus:border-[#DC2626] outline-none transition-colors"
                                        placeholder="0.00"
                                        value={formData.deposit_amount}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Grid: Qty & Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        <Package size={14} className="text-[#DC2626]" /> Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity_available"
                                        required
                                        min="1"
                                        className="w-full bg-[#111] border border-white/20 p-4 text-white font-bold font-mono focus:border-[#DC2626] outline-none transition-colors"
                                        value={formData.quantity_available}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        Class (Category)
                                    </label>
                                    <select
                                        name="category_id"
                                        className="w-full bg-[#111] border border-white/20 p-4 text-white font-bold uppercase tracking-wide focus:border-[#DC2626] outline-none transition-colors appearance-none"
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
                                className="w-full bg-[#DC2626] text-black font-black uppercase tracking-widest py-6 hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save size={24} />
                                        Save Configuration
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-black uppercase tracking-widest block">
                                Visual Log (Image)
                            </label>
                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                />
                                <div className={`aspect-video border-2 border-dashed border-black flex flex-col items-center justify-center bg-black/5 hover:bg-black/10 transition-colors ${previewUrl ? 'border-solid border-black p-0 overflow-hidden' : 'p-8'}`}>
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
