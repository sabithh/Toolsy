'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/utils';
import { ArrowLeft, MapPin, Star, ShieldCheck, Package, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import BookingModal from '@/components/BookingModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import Modal from '@/components/ui/Modal';
import { Edit2, Trash2 } from 'lucide-react';

export default function ToolDetailsPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const [tool, setTool] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (id) {
            loadTool();
        }
    }, [id]);

    const loadTool = async () => {
        try {
            const data = await api.getTool(id as string);
            setTool(data);
        } catch (err) {
            setError('Failed to load tool details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTool = async () => {
        try {
            setIsDeleting(true);
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('Not authenticated');

            await api.deleteTool(token, tool.id);
            showToast('Tool deleted successfully', 'success');
            router.push('/dashboard');
        } catch (error: any) {
            showToast(error.message || 'Failed to delete tool', 'error');
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary pt-24 pb-12 flex items-center justify-center">
                <div className="text-white animate-pulse">LOADING TOOL DATA...</div>
            </div>
        );
    }

    if (error || !tool) {
        return (
            <div className="min-h-screen bg-secondary pt-24 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl text-white font-bold mb-2">Tool Not Found</h2>
                    <Link href="/tools" className="text-primary hover:underline">
                        Return to Inventory
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12">
            <div className="container-custom">
                {/* Back Button */}
                <Link href="/tools" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors uppercase tracking-widest text-sm font-bold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
                </Link>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-[#111] border border-white/10 rounded-xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            {tool.images && tool.images.length > 0 ? (
                                <img
                                    src={getImageUrl(tool.images[0])}
                                    alt={tool.name}
                                    className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package size={64} className="text-gray-700" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border rounded ${tool.quantity_available > 0
                                    ? 'border-green-500/50 bg-green-500/10 text-green-400'
                                    : 'border-red-500/50 bg-red-500/10 text-red-400'
                                    }`}>
                                    {tool.quantity_available > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest border border-white/20 text-gray-400 rounded">
                                    {tool.category?.name || 'Tool'}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                                {tool.name}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-400">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{tool.shop?.address ? tool.shop.address : 'Location N/A'}</span>
                                </div>
                                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                <div className="flex items-center gap-1 text-primary">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span>{tool.shop?.rating || 'New'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end gap-2 border-b border-white/10 pb-8">
                            <div className="text-5xl font-black text-white leading-none">
                                ₹{Math.floor(tool.price_per_day)}
                            </div>
                            <div className="text-sm font-mono text-gray-400 uppercase mb-2">
                                / Per Day
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Description</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {tool.description}
                            </p>
                        </div>

                        <div className="bg-[#111] p-6 rounded-xl border border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Shop Provider</span>
                                <span className="font-bold text-white">{tool.shop?.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Security Deposit</span>
                                <span className="font-bold text-white">₹{tool.deposit_amount}</span>
                            </div>
                        </div>

                        <div className="pt-4">
                            {user?.id === tool.shop?.owner?.id ? (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => router.push(`/tools/edit/${tool.id}`)}
                                        className="flex-1 py-5 bg-black text-white border border-white/20 hover:bg-white hover:text-black font-black uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-3"
                                    >
                                        <Edit2 className="w-6 h-6" />
                                        Edit Unit
                                    </button>
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="flex-1 py-5 bg-[#DC2626] text-white hover:bg-red-700 font-black uppercase tracking-widest text-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center justify-center gap-3"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                        Decommission
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsBookingModalOpen(true)}
                                        disabled={tool.quantity_available <= 0}
                                        className="w-full py-5 bg-white text-black hover:bg-gray-200 font-black uppercase tracking-widest text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        <ShieldCheck className="w-6 h-6" />
                                        {tool.quantity_available > 0 ? 'Book This Tool' : 'Currently Unavailable'}
                                    </button>
                                    <p className="text-center text-xs text-gray-500 mt-4 uppercase tracking-wider">
                                        Secure booking • Verified Shop • Instant Confirmation
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                tool={tool}
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteTool}
                title="Decommission Tool"
                description={`Are you sure you want to permanently remove ${tool?.name} from your inventory? This action cannot be undone and will cancel any pending requests.`}
                confirmText={isDeleting ? "DECOMMISSIONING..." : "CONFIRM DELETION"}
                cancelText="CANCEL"
                variant="danger"
            />
        </div>
    );
}
