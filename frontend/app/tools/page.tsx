'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, MapPin, Package, IndianRupee, Crosshair, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { getImageUrl } from '@/lib/utils';

interface Tool {
    id: string;
    name: string;
    description: string;
    price_per_day: number;
    deposit_amount: number;
    quantity_available: number;
    shop: {
        name: string;
        address: string;
    };
    category?: {
        name: string;
    };
    images: string[];
}

export default function BrowsePage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isNearbyLoading, setIsNearbyLoading] = useState(false);
    const [isNearbyActive, setIsNearbyActive] = useState(false);

    useEffect(() => { loadTools(); }, []);

    const loadTools = async () => {
        setLoading(true);
        try {
            const data = await api.getTools();
            setTools(Array.isArray(data) ? data : (data as any).results || []);
        } catch (err) {
            console.error('Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    const handleNearbyToggle = () => {
        if (isNearbyActive) { setIsNearbyActive(false); loadTools(); return; }
        if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
        setIsNearbyLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const data = await api.getNearbyTools(position.coords.latitude, position.coords.longitude);
                    setTools(Array.isArray(data) ? data : (data as any).results || []);
                    setIsNearbyActive(true);
                } catch { alert('Failed to find nearby items'); }
                finally { setIsNearbyLoading(false); }
            },
            () => { setIsNearbyLoading(false); alert('Please allow location access.'); }
        );
    };

    const filteredTools = tools.filter(tool =>
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        (tool.description || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-20 pb-24 md:pb-12" style={{ background: 'var(--bg-primary)' }}>
            <div className="container-custom">

                {/* Header */}
                <div className="mb-10 pt-8">
                    <h1 className="font-black uppercase tracking-tighter leading-none mb-2"
                        style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: 'var(--text-primary)' }}>
                        Browse
                        <span style={{ color: 'var(--highlight)' }}> Items</span>
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-barlow), sans-serif', letterSpacing: '4px' }}>
                        Rent Anything · Kerala
                    </p>
                </div>

                {/* Search Bar — sticky on mobile */}
                <div className="mb-8 sticky top-[68px] z-30 py-4"
                    style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search anything to rent..."
                                className="w-full p-4 pr-12 text-sm font-semibold transition-all"
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 6,
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#D20000'}
                                onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                            />
                            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <button
                            onClick={handleNearbyToggle}
                            disabled={isNearbyLoading}
                            className="flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                            style={{
                                background: isNearbyActive ? 'var(--highlight)' : 'var(--bg-surface)',
                                color: isNearbyActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                                border: `1px solid ${isNearbyActive ? 'var(--highlight)' : 'var(--border)'}`,
                                borderRadius: 6,
                            }}
                        >
                            {isNearbyLoading ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
                            {isNearbyActive ? 'Reset' : 'Near Me'}
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                                <Skeleton className="w-full" style={{ aspectRatio: '4/3', background: 'var(--bg-surface-2)' }} />
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredTools.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <Package size={48} className="mb-4" style={{ color: '#333333' }} />
                        <h2 className="text-2xl font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif' }}>
                            No Items Found
                        </h2>
                        <p className="text-sm uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Try a different search</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTools.map((tool) => (
                            <Link
                                key={tool.id}
                                href={`/tools/${tool.id}`}
                                className="group no-underline block"
                                style={{ borderRadius: 8, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid var(--border)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 30px rgba(210,0,0,0.12)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                            >
                                {/* Image container — 4:3, object-fit contain */}
                                <div style={{ aspectRatio: '4/3', background: 'var(--bg-surface-2)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {/* Status badge */}
                                    <div style={{
                                        position: 'absolute', top: 10, right: 10, zIndex: 10,
                                        padding: '3px 10px', borderRadius: 20, fontSize: '0.65rem',
                                        fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                                        background: tool.quantity_available > 0 ? 'rgba(0,200,80,0.15)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${tool.quantity_available > 0 ? '#00C850' : '#333333'}`,
                                        color: tool.quantity_available > 0 ? '#00C850' : 'var(--text-muted)',
                                    }}>
                                        {tool.quantity_available > 0 ? 'Available' : 'Unavailable'}
                                    </div>

                                    {tool.images && tool.images.length > 0 ? (
                                        <img
                                            src={getImageUrl(tool.images[0])}
                                            alt={tool.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1, padding: '12px' }}
                                        />
                                    ) : (
                                        <Package size={56} style={{ color: '#333333' }} />
                                    )}
                                    {/* Bottom fade overlay */}
                                    <div style={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
                                        background: 'linear-gradient(to top, rgba(17,17,17,0.9), transparent)',
                                        pointerEvents: 'none',
                                    }} />
                                </div>

                                {/* Card info */}
                                <div className="p-4">
                                    <h3 className="font-black uppercase tracking-tight leading-tight mb-1 line-clamp-2 group-hover:text-[#D20000] transition-colors"
                                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', fontSize: '1.2rem', letterSpacing: '0.04em' }}>
                                        {tool.name}
                                    </h3>
                                    {tool.shop?.name && (
                                        <p className="text-xs mb-3 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                            <MapPin size={11} style={{ color: '#D20000', flexShrink: 0 }} />
                                            {tool.shop.name}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-black" style={{ color: '#D20000', fontFamily: 'var(--font-bebas), sans-serif' }}>
                                                    ₹{Number(tool.price_per_day).toFixed(0)}
                                                </span>
                                                <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>/day</span>
                                            </div>
                                        </div>
                                        {tool.category?.name && (
                                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1"
                                                style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)', borderRadius: 4, fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                                                {tool.category.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile Bottom Nav */}
            <div className="mobile-bottom-nav justify-around">
                <Link href="/tools" className="flex flex-col items-center gap-1 px-4 py-2 no-underline" style={{ color: '#D20000' }}>
                    <Search size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Browse</span>
                </Link>
                <Link href="/bookings" className="flex flex-col items-center gap-1 px-4 py-2 no-underline" style={{ color: 'var(--text-muted)' }}>
                    <Package size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Rentals</span>
                </Link>
                <Link href="/chats" className="flex flex-col items-center gap-1 px-4 py-2 no-underline" style={{ color: 'var(--text-muted)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Messages</span>
                </Link>
                <Link href="/dashboard" className="flex flex-col items-center gap-1 px-4 py-2 no-underline" style={{ color: 'var(--text-muted)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
                </Link>
            </div>
        </div>
    );
}
