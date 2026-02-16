'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import LocationViewer from '@/components/ui/LocationViewer';
import TiltCard from '@/components/ui/TiltCard';
import Modal from '@/components/ui/Modal';
import { getImageUrl } from '@/lib/utils'; // Added import
import { Search } from 'lucide-react';

interface Tool {
    id: string;
    name: string;
    description: string;
    brand?: string;
    model_number?: string;
    condition: string;
    price_per_hour: number;
    price_per_day: number;
    price_per_week: number;
    deposit_amount: number;
    quantity_available: number;
    quantity_total: number;
    minimum_rental_duration: number;
    specifications?: Record<string, any>;
    is_available: boolean;
    shop: {
        id: string;
        name: string;
        address: string;
        phone: string;
        email: string;
        rating_average: number;
        total_ratings: number;
        location_lat: number;
        location_lng: number;

        description?: string;
        owner: {
            id: string;
            username: string;
        };
    };
    category?: {
        name: string;
    };
    images: string[];
}

export default function ToolDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap the params Promise (Next.js 15+)
    const resolvedParams = use(params);

    const router = useRouter();
    const { user, accessToken, isAuthenticated, isRenter } = useAuth();
    const { showToast } = useToast();
    const [tool, setTool] = useState<Tool | null>(null);
    const [shopTools, setShopTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Booking form state
    const [bookingData, setBookingData] = useState({
        quantity: 1,
        start_datetime: '',
        end_datetime: '',
        payment_method: 'razorpay' as 'razorpay' | 'cash_on_return',
        notes: '',
    });

    useEffect(() => {
        loadTool();
    }, [resolvedParams.id]);

    const loadTool = async () => {
        try {
            const data = await api.getTool(resolvedParams.id);
            const toolData = data as Tool;
            setTool(toolData);

            // Load other tools from this shop
            if (toolData.shop?.id) {
                loadShopInventory(toolData.shop.id);
            }
        } catch (err: any) {
            setError('Failed to load tool details');
        } finally {
            setLoading(false);
        }
    };

    const loadShopInventory = async (shopId: string) => {
        try {
            const data = await api.getTools({ shop: shopId });
            // Filter out current tool and limit to 3
            const otherTools = (Array.isArray(data) ? data : (data as any).results || [])
                .filter((t: any) => t.id !== resolvedParams.id)
                .slice(0, 3);
            setShopTools(otherTools);
        } catch (err) {
            console.error('Failed to load shop inventory', err);
        }
    };

    const calculateTotalPrice = () => {
        if (!tool || !bookingData.start_datetime || !bookingData.end_datetime) return 0;

        const start = new Date(bookingData.start_datetime);
        const end = new Date(bookingData.end_datetime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const days = Math.ceil(hours / 24);

        if (days <= 0) return 0;

        return (parseFloat(tool.price_per_day.toString()) * days * bookingData.quantity) + parseFloat(tool.deposit_amount.toString());
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!isRenter) {
            setError('Only renters can book tools');
            return;
        }

        setBookingLoading(true);

        try {
            const totalPrice = calculateTotalPrice();
            if (totalPrice === 0) throw new Error("Invalid duration");

            const rentalPrice = totalPrice - (tool?.deposit_amount || 0);

            await api.createBooking(accessToken!, {
                tool_id: resolvedParams.id,
                quantity: bookingData.quantity,
                start_datetime: bookingData.start_datetime,
                end_datetime: bookingData.end_datetime,
                rental_price: rentalPrice,
                deposit_amount: tool?.deposit_amount || 0,
                payment_method: bookingData.payment_method,
                notes: bookingData.notes,
            });

            setSuccess('Booking created successfully! Check your bookings page.');
            setTimeout(() => router.push('/bookings'), 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to create booking');
            setBookingLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setShowDeleteModal(false); // Close modal first
            await api.deleteTool(accessToken!, tool!.id);
            showToast('Tool deleted successfully', 'success');
            // Force hard redirect to ensure fresh state
            window.location.href = '/tools';
        } catch (err: any) {
            setError(err.message || 'Failed to delete tool');
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#DC2626] flex items-center justify-center">
                <div className="text-xl font-black uppercase tracking-widest text-black">Initializing Datastream...</div>
            </div>
        );
    }

    if (!tool) {
        return (
            <div className="min-h-screen bg-[#DC2626] flex flex-col items-center justify-center p-8 text-center">
                <div className="text-4xl font-black uppercase text-black mb-4">Unit Not Found</div>
                <Link href="/tools" className="text-white bg-black px-6 py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                    Return to Database
                </Link>
            </div>
        );
    }

    const totalPrice = calculateTotalPrice();

    return (
        <div className="min-h-screen bg-[#DC2626] text-black py-24">

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="TERMINATE UNIT?"
                description="This action will permanently remove this tool from the network. This action cannot be undone."
                confirmText="DELETE PERMANENTLY"
                cancelText="ABORT"
                variant="danger"
            />
            <div className="container-custom">
                <Link href="/tools" className="inline-block mb-12 text-sm font-bold uppercase tracking-widest text-black/60 hover:text-white transition-colors">
                    &larr; Return to Database
                </Link>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Tool Details - Left Side */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Hero Image */}
                        <div className="relative aspect-video bg-black border border-black overflow-hidden group">
                            {tool.images && tool.images.length > 0 ? (
                                <img
                                    src={getImageUrl(tool.images[0])}
                                    alt={tool.name}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#111]">
                                    <span className="text-white/20 font-mono uppercase tracking-widest">No Visual Data</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-[#DC2626] text-black text-xs font-bold px-2 py-1 uppercase tracking-widest">
                                Reference Image
                            </div>
                        </div>

                        {/* Header Section */}
                        <div className="border-l-4 border-black pl-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border ${tool.quantity_available > 0
                                        ? 'border-black text-black'
                                        : 'border-white text-white'
                                        }`}>
                                        {tool.quantity_available > 0 ? 'STATUS: ONLINE' : 'STATUS: OFFLINE'}
                                    </span>
                                    <span className="text-black/60 font-mono text-xs">ID: {tool.id.substring(0, 8)}</span>
                                </div>

                                {/* Owner Controls */}
                                {user && tool.shop.owner && user.id === tool.shop.owner.id && (
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/tools/edit/${tool.id}`}
                                            className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest hover:bg-[#DC2626] transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={handleDeleteClick}
                                            className="border border-black text-black px-3 py-1 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                                {tool.name}
                            </h1>
                            <p className="text-xl text-black/80 font-mono leading-relaxed border-t border-black/10 pt-6">
                                {tool.description}
                            </p>
                        </div>

                        {/* Specs Grid */}
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-4">
                                <span className="w-8 h-1 bg-black"></span>
                                Technical Specifications
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 bg-black border border-black">
                                <div className="p-6 border-b md:border-b-0 md:border-r border-white/10 text-white">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-2">Category</h3>
                                    <p className="text-lg font-bold uppercase">{tool.category?.name || 'N/A'}</p>
                                </div>
                                <div className="p-6 border-b border-white/10 text-white">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-2">Brand / Model</h3>
                                    <p className="text-lg font-bold uppercase">{tool.brand || 'GENERIC'} / {tool.model_number || 'N/A'}</p>
                                </div>
                                <div className="p-6 border-b md:border-b-0 md:border-r border-white/10 text-white">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-2">Condition</h3>
                                    <p className="text-lg font-bold uppercase">{tool.condition}</p>
                                </div>
                                <div className="p-6 text-white">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-2">Availability</h3>
                                    <p className="text-lg font-bold uppercase font-mono">{tool.quantity_available} / {tool.quantity_total} UNITS</p>
                                </div>
                            </div>
                        </div>

                        {/* Logistics Module (Map & Contact) */}
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-4">
                                <span className="w-8 h-1 bg-black"></span>
                                Logistics Node
                            </h2>
                            <div className="bg-black border border-black grid grid-cols-1 md:grid-cols-2">
                                {/* Left: Map */}
                                <div className="h-[300px] md:h-auto border-b md:border-b-0 md:border-r border-white/10 relative">
                                    <LocationViewer lat={tool.shop.location_lat} lng={tool.shop.location_lng} popupText={tool.shop.name} />
                                    <div className="absolute bottom-4 left-4 right-4 bg-black/90 p-3 border border-white/10 backdrop-blur pointer-events-none">
                                        <div className="text-xs font-mono text-[#DC2626]">COORDINATES_LOCKED</div>
                                        <div className="text-white text-xs truncate">{tool.shop.address}</div>
                                    </div>
                                </div>
                                {/* Right: Info */}
                                <div className="p-8 text-white flex flex-col justify-center">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-black uppercase leading-none mb-2">{tool.shop.name}</h3>
                                        {tool.shop.description && (
                                            <p className="text-gray-400 text-sm">{tool.shop.description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-4 font-mono text-sm">
                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                            <span className="text-[#DC2626]">RATING</span>
                                            <span>{tool.shop.rating_average ? Number(tool.shop.rating_average).toFixed(1) : 'N/A'} ({tool.shop.total_ratings || 0})</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                            <span className="text-[#DC2626]">COMMS</span>
                                            <span className="text-white/60 truncate max-w-[150px]">{tool.shop.email}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                            <span className="text-[#DC2626]">DISTANCE</span>
                                            <span>-- KM (CALC)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shop Inventory (More from this Node) */}
                        {shopTools.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-4">
                                    <span className="w-8 h-1 bg-black"></span>
                                    Node Arsenal (More from Shop)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-black border border-black p-1">
                                    {shopTools.map(t => (
                                        <TiltCard key={t.id} className="h-full">
                                            <Link href={`/tools/${t.id}`} className="block h-full bg-[#111] p-6 border border-white/5 hover:border-[#DC2626] group transition-colors">
                                                <div className="text-xs font-mono text-[#DC2626] mb-2">{t.category?.name || 'GENERIC'}</div>
                                                <div className="text-lg font-black text-white uppercase mb-4 leading-none group-hover:text-[#DC2626]">{t.name}</div>
                                                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                                                    <span className="font-bold text-white">₹{t.price_per_day}/DAY</span>
                                                    <Search size={14} className="text-gray-500 group-hover:text-white" />
                                                </div>
                                            </Link>
                                        </TiltCard>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Booking Form - Right Side */}
                    <div className="lg:col-span-1">
                        <div className="active sticky top-24 border-2 border-black bg-black p-8 relative">
                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-8 h-8 bg-[#DC2626]"></div>

                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-white">
                                Requisition<br />Form
                            </h2>

                            {error && (
                                <div className="bg-[#DC2626]/20 text-[#DC2626] p-4 text-xs font-mono mb-6 border border-[#DC2626]">
                                    ERR: {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-900/20 text-green-500 p-4 text-xs font-mono mb-6 border border-green-500">
                                    SUCCESS: {success}
                                </div>
                            )}

                            {!isAuthenticated ? (
                                <div className="text-center py-12 border border-dashed border-white/20">
                                    <p className="text-gray-500 font-mono mb-6">AUTHENTICATION REQUIRED</p>
                                    <Link href="/login" className="block w-full bg-[#DC2626] text-black font-bold uppercase tracking-widest py-4 hover:bg-white transition-colors">
                                        Initialize Login
                                    </Link>
                                </div>
                            ) : !isRenter ? (
                                <div className="text-center py-12 border border-red-900/30">
                                    <p className="text-red-500 font-mono">ACCESS DENIED: PROVIDER ACCOUNT</p>
                                </div>
                            ) : tool.quantity_available === 0 ? (
                                <div className="text-center py-12 border border-white/10 bg-[#111]">
                                    <p className="text-gray-500 font-mono">STOCK DEPLETED</p>
                                </div>
                            ) : (
                                <form onSubmit={handleBooking} className="space-y-6">
                                    {/* Form Fields - Reusing previous logic but simplified for brevity in this replace call since I'm overwriting the whole file */}
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-2">
                                            <label>Units Required</label>
                                            <span>Max: {tool.quantity_available}</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            max={tool.quantity_available}
                                            className="w-full bg-[#111] border border-white/20 p-4 text-white font-mono focus:outline-none focus:border-[#DC2626] transition-colors"
                                            value={bookingData.quantity}
                                            onChange={(e) =>
                                                setBookingData({ ...bookingData, quantity: parseInt(e.target.value) })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-2">Start</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-[#111] border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626]"
                                                value={bookingData.start_datetime}
                                                onChange={(e) =>
                                                    setBookingData({ ...bookingData, start_datetime: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-2">End</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-[#111] border border-white/20 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#DC2626]"
                                                value={bookingData.end_datetime}
                                                onChange={(e) =>
                                                    setBookingData({ ...bookingData, end_datetime: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-2">Payment</label>
                                        <select
                                            className="w-full bg-[#111] border border-white/20 p-4 text-white font-mono text-sm focus:outline-none focus:border-[#DC2626]"
                                            value={bookingData.payment_method}
                                            onChange={(e) =>
                                                setBookingData({
                                                    ...bookingData,
                                                    payment_method: e.target.value as 'razorpay' | 'cash_on_return',
                                                })
                                            }
                                        >
                                            <option value="razorpay">DIGITAL (RAZORPAY)</option>
                                            <option value="cash_on_return">PHYSICAL (CASH)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-2">Notes</label>
                                        <textarea
                                            className="w-full bg-[#111] border border-white/20 p-4 text-white font-mono text-sm focus:outline-none focus:border-[#DC2626]"
                                            rows={2}
                                            placeholder="// OPTIONAL INSTRUCTIONS"
                                            value={bookingData.notes}
                                            onChange={(e) =>
                                                setBookingData({ ...bookingData, notes: e.target.value })
                                            }
                                        />
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="bg-[#111] p-6 border border-white/10 space-y-3 font-mono text-sm">
                                        <div className="flex justify-between text-gray-400">
                                            <span>BASE_RATE</span>
                                            <span>₹{tool.price_per_day}/DAY</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>DEPOSIT</span>
                                            <span>₹{tool.deposit_amount}</span>
                                        </div>
                                        {totalPrice > 0 && (
                                            <div className="flex justify-between text-xl font-bold text-white border-t border-white/10 pt-4 mt-2">
                                                <span>TOTAL</span>
                                                <span className="text-[#DC2626]">₹{totalPrice.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-[#DC2626] text-black font-black uppercase tracking-widest py-5 hover:bg-white hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#DC2626] hover:border-black flex items-center justify-center gap-2"
                                        disabled={bookingLoading || !bookingData.start_datetime || !bookingData.end_datetime}
                                    >
                                        <Search size={16} />
                                        {bookingLoading ? 'PROCESSING...' : 'CONFIRM REQUISITION'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
