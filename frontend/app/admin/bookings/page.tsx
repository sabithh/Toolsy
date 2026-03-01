'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Loader } from 'lucide-react';

export default function BookingsPage() {
    const { accessToken } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search — wait 400ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (accessToken) {
            loadBookings();
        }
    }, [accessToken, debouncedSearch]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminBookings(accessToken!, debouncedSearch);
            setBookings(data.results || data);
        } catch (error) {
            console.error('Failed to load bookings', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Global Bookings</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-64"
                    />
                </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-800 text-gray-400 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Tool</th>
                                <th className="px-6 py-4">Renter</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        {booking.id.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        {booking.tool?.name || 'Unknown Tool'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {booking.renter?.username || 'Unknown User'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">
                                        <div>{new Date(booking.start_datetime).toLocaleDateString()}</div>
                                        <div>{new Date(booking.end_datetime).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                                            booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                'bg-gray-500/10 text-gray-400'
                                            }`}>
                                            {booking.status?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${booking.payment_status === 'paid' ? 'bg-green-500/10 text-green-400' :
                                            'bg-red-500/10 text-red-400'
                                            }`}>
                                            {booking.payment_status?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white font-medium">
                                        ₹{booking.total_amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="p-8 flex justify-center text-gray-500">
                        <Loader className="animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
