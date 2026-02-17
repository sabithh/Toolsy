'use client';

import { useState, useEffect } from 'react';
import { api, User } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Search, CheckCircle, XCircle, Shield, ShieldAlert, Loader } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';

export default function UsersPage() {
    const { accessToken } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (accessToken) {
            loadUsers();
        }
    }, [accessToken, search]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminUsers(accessToken!, search);
            setUsers(data.results || data);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVerify = async (userId: string) => {
        try {
            const result = await api.adminToggleVerifyUser(accessToken!, userId);
            setUsers(users.map(u => u.id === userId ? { ...u, is_verified: result.is_verified } : u));
            showToast('User verification updated', 'success');
        } catch (error) {
            showToast('Failed to update verification', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
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
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.profile_image ? (
                                                <img src={user.profile_image} alt="" className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-white">{user.username}</div>
                                                <div className="text-gray-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.user_type === 'provider'
                                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {user.user_type?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_verified ? (
                                            <span className="flex items-center gap-1 text-green-400 text-xs">
                                                <CheckCircle size={14} /> Verified
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-gray-500 text-xs">
                                                <XCircle size={14} /> Unverified
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(user.created_at || '').toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleToggleVerify(user.id)}
                                            className="text-gray-400 hover:text-white transition-colors"
                                            title="Toggle Verification"
                                        >
                                            {user.is_verified ? <ShieldAlert size={18} className="text-yellow-500" /> : <Shield size={18} className="text-green-500" />}
                                        </button>
                                        <Link href={`/admin/users/${user.id}`} className="text-blue-400 hover:text-blue-300 text-xs underline">
                                            View Details
                                        </Link>
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
