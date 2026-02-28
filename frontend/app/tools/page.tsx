'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, MapPin, Package, IndianRupee, ShieldCheck } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { getImageUrl } from '@/lib/utils'; // Added import

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

export default function ToolsPage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadTools();
    }, []);

    const loadTools = async () => {
        setLoading(true);
        try {
            const data = await api.getTools();
            setTools(Array.isArray(data) ? data : (data as any).results || []);
        } catch (err) {
            console.error('Failed to load tools');
        } finally {
            setLoading(false);
        }
    };

    const filteredTools = tools.filter(tool =>
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase())
    );



    return (
        <div className="min-h-screen bg-[#DC2626] text-black pt-24 pb-12">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-16 border-l-4 border-black pl-8">
                    <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4 text-black">
                        Tool<br />Inventory
                    </h1>
                    <p className="text-xl text-black/60 font-mono">
                        // ACCESSING GLOBAL DATABASE...
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="mb-12 sticky top-24 z-30 bg-[#DC2626]/95 backdrop-blur border-y border-black/10 py-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                placeholder="SEARCH PROTOCOL_ID OR NAME"
                                className="w-full bg-[#B91C1C] border border-black/20 p-4 text-white placeholder-white/50 font-bold uppercase tracking-widest focus:outline-none focus:border-black transition-colors"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-black">
                                <Search size={24} />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-black border border-black text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black hover:border-black transition-colors flex items-center gap-2">
                                <Package size={18} /> Available
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tools Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1 bg-black border border-black p-1">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-[#111] p-8 border border-white/5 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-8">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-4 w-1/3" />
                                    <div className="space-y-3 mt-8">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                                    <div>
                                        <Skeleton className="h-3 w-10 mb-1" />
                                        <Skeleton className="h-8 w-24" />
                                    </div>
                                    <Skeleton className="h-12 w-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredTools.length === 0 ? (
                    <div className="bg-black border border-black/10 p-20 text-center">
                        <div className="inline-block p-6 border-2 border-white/10 rounded-full mb-6">
                            <Package size={48} className="text-gray-500" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-2">No Units Found</h2>
                        <p className="text-gray-500 font-mono">ADJUST SEARCH PARAMETERS</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1 bg-black border border-black p-1">
                        {filteredTools.map((tool) => (
                            <TiltCard key={tool.id} className="h-full">
                                <Link
                                    href={`/tools/${tool.id}`}
                                    className="group relative bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#DC2626] transition-colors duration-300 flex flex-col h-full aspect-[4/5] overflow-hidden"
                                >
                                    {/* Active Badge (Top Right) */}
                                    <div className="absolute top-6 right-6 z-10">
                                        <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${tool.quantity_available > 0
                                            ? 'border-green-500  text-green-500'
                                            : 'border-red-500 text-red-500'
                                            }`}>
                                            {tool.quantity_available > 0 ? 'ACTIVE' : 'OFFLINE'}
                                        </div>
                                    </div>

                                    {/* Circle Decorator (Left Center) */}
                                    <div className="absolute top-1/2 left-12 -translate-y-1/2 w-8 h-8 rounded-full border border-white/20 z-0"></div>

                                    {/* Image (Centered) */}
                                    <div className="flex-1 relative flex items-center justify-center p-6 z-0 bg-black/40">
                                        <div className="relative w-full h-full">
                                            {/* Accent Glow */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-red-500/20 blur-[60px] rounded-full group-hover:bg-red-500/40 transition-colors duration-500"></div>

                                            {tool.images && tool.images.length > 0 ? (
                                                <img
                                                    src={getImageUrl(tool.images[0])}
                                                    alt={tool.name}
                                                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package size={64} className="text-[#333]" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom Info Section */}
                                    <div className="p-6 pt-0 pb-8 mt-auto relative z-10 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 group-hover:text-[#DC2626] transition-colors leading-none line-clamp-2">
                                            {tool.name}
                                        </h3>

                                        <div className="border-t border-white/10 pt-4 flex items-end justify-between">
                                            <div className="text-3xl font-black text-white leading-none">
                                                ₹{Number(tool.price_per_day).toFixed(2)}
                                            </div>
                                            <div className="text-xs font-mono text-gray-500 uppercase pb-1">
                                                /DAY
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </TiltCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
