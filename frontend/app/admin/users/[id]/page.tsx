'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import {
    User as UserIcon, Mail, Phone, Calendar, Package,
    Shield, ShieldOff, Trash2, ArrowLeft, Wrench,
    CreditCard, CheckCircle, XCircle, Crown, Loader2,
    ToggleLeft, ToggleRight, Edit3, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

type SubscriptionStatus = 'active' | 'expired' | 'pending' | null;

export default function UserDetailsPage() {
    const { id } = useParams();
    const { accessToken } = useAuth();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [tools, setTools] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSubModal, setShowSubModal] = useState(false);
    const [subForm, setSubForm] = useState({ status: 'active', months: 1 });
    const [saving, setSaving] = useState(false);

    const loadAll = useCallback(async () => {
        if (!accessToken || !id) return;
        try {
            const [userData, toolsData, subData] = await Promise.all([
                api.getAdminUser(accessToken, id as string),
                api.adminGetUserTools(accessToken, id as string).catch(() => []),
                api.adminGetUserSubscription(accessToken, id as string).catch(() => null),
            ]);
            setUser(userData);
            setTools(toolsData || []);
            setSubscription(subData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [accessToken, id]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const handleDelete = async () => {
        if (!accessToken) return;
        setSaving(true);
        try {
            await api.adminDeleteUser(accessToken, id as string);
            router.push('/admin/users');
        } catch (e: any) {
            alert(e.message || 'Delete failed');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleVerify = async () => {
        if (!accessToken) return;
        const res = await api.adminToggleVerifyUser(accessToken, id as string);
        setUser((u: any) => ({ ...u, is_verified: res.is_verified }));
    };

    const handleToggleActive = async () => {
        if (!accessToken) return;
        const res = await api.adminToggleActiveUser(accessToken, id as string);
        setUser((u: any) => ({ ...u, is_active: res.is_active }));
    };

    const handleEditSub = async () => {
        if (!accessToken) return;
        setSaving(true);
        try {
            const res = await api.adminEditSubscription(accessToken, id as string, subForm);
            setSubscription(res);
            setShowSubModal(false);
        } catch (e: any) {
            alert(e.message || 'Failed to update subscription');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-[#DC2626]" size={32} />
        </div>
    );
    if (!user) return <div className="text-white p-8">User not found.</div>;

    const isProvider = user.user_type === 'provider';
    const subStatus: SubscriptionStatus = subscription?.status ?? null;

    return (
        <div className="space-y-6 pb-12">
            {/* Back */}
            <Link href="/admin/users" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                <ArrowLeft size={16} /> Back to Users
            </Link>

            {/* ── Profile Card ── */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {user.profile_image ? (
                            <img src={user.profile_image} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-neutral-700" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-[#DC2626]/20 border-2 border-[#DC2626]/40 flex items-center justify-center text-3xl font-black text-[#DC2626]">
                                {user.username?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl font-black text-white">{user.first_name} {user.last_name}</h1>
                                <p className="text-gray-400 font-mono text-sm">@{user.username}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* User Type Badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isProvider
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                        : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                    }`}>
                                    {isProvider ? '🔧 Tool Owner' : '🛒 Buyer / Renter'}
                                </span>
                                {/* Verified Badge */}
                                {user.is_verified && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-green-500/10 text-green-400 border-green-500/30">
                                        ✓ Verified
                                    </span>
                                )}
                                {user.is_superuser && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-red-500/10 text-red-400 border-red-500/30">
                                        <Crown size={10} className="inline mr-1" /> Superuser
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Mail size={14} className="text-[#DC2626]" />
                                <span>{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Phone size={14} className="text-[#DC2626]" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Calendar size={14} className="text-[#DC2626]" />
                                <span>Joined {new Date(user.created_at || user.date_joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Package size={14} className="text-[#DC2626]" />
                                <span>{user.total_bookings ?? 0} Bookings</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {!user.is_superuser && (
                            <div className="flex flex-wrap gap-2">
                                <button onClick={handleToggleVerify}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-neutral-700 text-gray-300 hover:border-green-500 hover:text-green-400 transition-colors">
                                    {user.is_verified ? <><ShieldOff size={14} /> Unverify</> : <><Shield size={14} /> Verify</>}
                                </button>
                                <button onClick={handleToggleActive}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-neutral-700 text-gray-300 hover:border-yellow-500 hover:text-yellow-400 transition-colors">
                                    {user.is_active !== false ? <><ToggleRight size={14} /> Deactivate</> : <><ToggleLeft size={14} /> Activate</>}
                                </button>
                                <button onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-red-900 text-red-400 hover:bg-red-900/20 transition-colors">
                                    <Trash2 size={14} /> Delete User
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Subscription Card (providers only) ── */}
            {isProvider && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <CreditCard size={20} className="text-[#DC2626]" /> Subscription
                        </h2>
                        <button onClick={() => setShowSubModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 hover:bg-[#DC2626]/20 transition-colors">
                            <Edit3 size={12} /> Edit
                        </button>
                    </div>

                    {subscription ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-neutral-800/50 rounded-lg p-3">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</div>
                                <div className={`font-bold text-sm flex items-center gap-1 ${subStatus === 'active' ? 'text-green-400' : subStatus === 'expired' ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                    {subStatus === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    {subStatus?.toUpperCase()}
                                </div>
                            </div>
                            <div className="bg-neutral-800/50 rounded-lg p-3">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Start</div>
                                <div className="text-white text-sm font-medium">
                                    {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString() : '—'}
                                </div>
                            </div>
                            <div className="bg-neutral-800/50 rounded-lg p-3">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expires</div>
                                <div className="text-white text-sm font-medium">
                                    {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : '—'}
                                </div>
                            </div>
                            <div className="bg-neutral-800/50 rounded-lg p-3">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount</div>
                                <div className="text-white text-sm font-medium">₹{subscription.amount ?? 0}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm py-4 text-center border border-neutral-800 rounded-lg">
                            No subscription found for this provider.
                            <button onClick={() => setShowSubModal(true)} className="ml-2 text-[#DC2626] hover:underline">Grant one</button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tools List (providers only) ── */}
            {isProvider && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Wrench size={20} className="text-[#DC2626]" /> Listed Tools ({tools.length})
                    </h2>
                    {tools.length === 0 ? (
                        <div className="text-gray-500 text-sm text-center py-6 border border-neutral-800 rounded-lg">
                            No tools listed yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-800">
                                        <th className="text-left py-2 px-3 text-gray-500 font-medium uppercase text-xs tracking-wider">Tool</th>
                                        <th className="text-left py-2 px-3 text-gray-500 font-medium uppercase text-xs tracking-wider">Category</th>
                                        <th className="text-left py-2 px-3 text-gray-500 font-medium uppercase text-xs tracking-wider">Price/day</th>
                                        <th className="text-left py-2 px-3 text-gray-500 font-medium uppercase text-xs tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tools.map((tool: any) => (
                                        <tr key={tool.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                                            <td className="py-3 px-3 text-white font-medium">{tool.name}</td>
                                            <td className="py-3 px-3 text-gray-400">{tool['category__name'] || '—'}</td>
                                            <td className="py-3 px-3 text-white">₹{tool.price_per_day}</td>
                                            <td className="py-3 px-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${tool.is_available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                    {tool.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Delete Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-red-900 rounded-xl p-8 max-w-md w-full text-center">
                        <AlertTriangle className="text-red-400 mx-auto mb-4" size={40} />
                        <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
                        <p className="text-gray-400 mb-6 text-sm">
                            This will permanently delete <span className="text-white font-bold">@{user.username}</span> and all their data. This cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-2 border border-neutral-700 text-gray-400 rounded-lg hover:text-white transition-colors text-sm font-bold">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={saving}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Subscription Modal ── */}
            {showSubModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <CreditCard className="text-[#DC2626]" size={20} /> Edit Subscription
                        </h3>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Status</label>
                                <select value={subForm.status} onChange={e => setSubForm(f => ({ ...f, status: e.target.value }))}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#DC2626]">
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                            {subForm.status === 'active' && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Duration (months)</label>
                                    <input type="number" min={1} max={24} value={subForm.months}
                                        onChange={e => setSubForm(f => ({ ...f, months: parseInt(e.target.value) || 1 }))}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#DC2626]" />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowSubModal(false)}
                                className="flex-1 py-2 border border-neutral-700 text-gray-400 rounded-lg hover:text-white transition-colors text-sm font-bold">
                                Cancel
                            </button>
                            <button onClick={handleEditSub} disabled={saving}
                                className="flex-1 py-2 bg-[#DC2626] hover:bg-red-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
