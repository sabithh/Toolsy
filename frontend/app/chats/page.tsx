'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { MessageCircle, Package, ArrowRight } from 'lucide-react';

export default function ChatsPage() {
    const { isAuthenticated, accessToken, user } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!loading && !isAuthenticated) router.push('/login');
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && accessToken) loadChats();
        else setLoading(false);
    }, [isAuthenticated, accessToken]);

    const loadChats = async () => {
        try {
            const data = await api.getChatRooms(accessToken!);
            setChats(Array.isArray(data) ? data : []);
        } catch (e) {
            // Chat API may not be implemented yet on backend
            setChats([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
            <div className="container-custom max-w-2xl">
                <div className="mb-8">
                    <h1 className="font-black uppercase tracking-tighter leading-none mb-2"
                        style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: 'var(--text-primary)' }}>
                        Messages
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-barlow), sans-serif', letterSpacing: '3px' }}>
                        Chats from your active bookings
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1,2,3].map(i => (
                            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, height: 80 }} />
                        ))}
                    </div>
                ) : chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                        <MessageCircle size={48} className="mb-4" style={{ color: '#333333' }} />
                        <h2 className="text-xl font-black uppercase tracking-wider mb-2"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif' }}>
                            No Messages Yet
                        </h2>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                            Chats are created automatically when a booking is made.
                        </p>
                        <Link href="/tools"
                            className="flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-wider no-underline transition-all duration-200"
                            style={{ background: '#D20000', color: 'white', borderRadius: 6 }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#B10000'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#D20000'}>
                            Browse Items <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {chats.map((chat: any) => (
                            <Link key={chat.id} href={`/chats/${chat.booking_id}`}
                                className="flex items-center gap-4 p-4 no-underline transition-all duration-200"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D20000'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
                                {/* Avatar */}
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Package size={20} style={{ color: '#D20000' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-sm uppercase tracking-wide truncate" style={{ color: 'var(--text-primary)' }}>
                                            {chat.item_name || chat.tool?.name || 'Booking Chat'}
                                        </h3>
                                        <span className="text-xs ml-2 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                                            {chat.last_message_time ? new Date(chat.last_message_time).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                            {chat.last_message || 'No messages yet'}
                                        </p>
                                        {chat.unread_count > 0 && (
                                            <span className="text-xs font-bold px-1.5 py-0.5 ml-2 flex-shrink-0"
                                                style={{ background: '#D20000', color: 'white', borderRadius: 10, minWidth: 20, textAlign: 'center' }}>
                                                {chat.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: '#333333' }}>
                                        #{chat.booking_id?.slice(0, 8)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
