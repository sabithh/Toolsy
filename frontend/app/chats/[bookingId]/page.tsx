'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ArrowLeft, Send, Package } from 'lucide-react';

export default function ChatPage() {
    const { user, isAuthenticated, accessToken } = useAuth();
    const router = useRouter();
    const params = useParams();
    const bookingId = params.bookingId as string;

    const [messages, setMessages] = useState<any[]>([]);
    const [chatInfo, setChatInfo] = useState<any>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isArchived, setIsArchived] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && !isAuthenticated) router.push('/login');
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && accessToken && bookingId) loadChat();
        else setLoading(false);
    }, [isAuthenticated, accessToken, bookingId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadChat = async () => {
        try {
            const [roomData, msgData] = await Promise.all([
                api.getChatRoom(accessToken!, bookingId),
                api.getChatMessages(accessToken!, bookingId),
            ]);
            setChatInfo(roomData);
            setMessages(Array.isArray(msgData) ? msgData : []);
            // Mark archived if rental ended
            if (roomData?.booking?.status === 'completed' || roomData?.booking?.status === 'cancelled') {
                setIsArchived(true);
            }
        } catch {
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || sending || isArchived) return;
        setSending(true);
        const msg = input.trim();
        setInput('');
        // Optimistic update
        setMessages(prev => [...prev, {
            id: Date.now(),
            message: msg,
            sender: { id: user?.id, username: user?.username },
            created_at: new Date().toISOString(),
            pending: true,
        }]);
        try {
            const sent = await api.sendChatMessage(accessToken!, bookingId, msg);
            setMessages(prev => prev.map(m => m.pending ? sent : m));
        } catch {
            // Remove the optimistic message on failure
            setMessages(prev => prev.filter(m => !m.pending));
            setInput(msg);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dt: string) => {
        const d = new Date(dt);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dt: string) => {
        const d = new Date(dt);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return 'Today';
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString();
    };

    // Group messages by date
    const groupedMessages: { date: string; items: any[] }[] = [];
    for (const msg of messages) {
        const d = formatDate(msg.created_at);
        const last = groupedMessages[groupedMessages.length - 1];
        if (last && last.date === d) last.items.push(msg);
        else groupedMessages.push({ date: d, items: [msg] });
    }

    const isMine = (msg: any) => msg.sender?.id === user?.id || msg.sender?.username === user?.username;

    return (
        <div className="min-h-screen flex flex-col pt-[68px]" style={{ background: 'var(--bg-primary)' }}>
            {/* Chat header */}
            <div className="flex-shrink-0 px-4 py-4 flex items-center gap-4"
                style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 68, zIndex: 20 }}>
                <Link href="/chats"
                    className="p-2 transition-colors no-underline flex-shrink-0"
                    style={{ color: 'var(--text-muted)', borderRadius: 6 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
                    <ArrowLeft size={20} />
                </Link>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Package size={18} style={{ color: '#D20000' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black uppercase tracking-wide text-sm truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.08em' }}>
                        {chatInfo?.item_name || chatInfo?.tool?.name || 'Booking Chat'}
                    </h3>
                    <div className="flex items-center gap-2">
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                            Booking #{bookingId?.slice(0, 8)}
                        </p>
                        {isArchived && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5"
                                style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)', borderRadius: 3, border: '1px solid var(--border)' }}>
                                Archived
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-6" style={{ minHeight: 0 }}>
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-5 h-5 border-2 border-[#D20000] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                            No messages yet
                        </p>
                        <p className="text-xs mt-2" style={{ color: '#333333' }}>
                            Start the conversation below
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        {groupedMessages.map(({ date, items }) => (
                            <div key={date}>
                                {/* Date separator */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1"
                                        style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20 }}>
                                        {date}
                                    </span>
                                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    {items.map((msg: any) => (
                                        <div key={msg.id}
                                            className={`flex ${isMine(msg) ? 'justify-end' : 'justify-start'}`}>
                                            <div className={isMine(msg) ? 'chat-bubble-sent' : 'chat-bubble-received'}
                                                style={{ opacity: msg.pending ? 0.7 : 1 }}>
                                                {!isMine(msg) && (
                                                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1"
                                                        style={{ color: '#D20000' }}>
                                                        {msg.sender?.username}
                                                    </div>
                                                )}
                                                <p className="text-sm" style={{ lineHeight: 1.5 }}>{msg.message}</p>
                                                <div className={`text-[10px] mt-1 ${isMine(msg) ? 'text-right' : 'text-left'}`}
                                                    style={{ color: isMine(msg) ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>
                                                    {msg.pending ? 'Sending...' : formatTime(msg.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input bar */}
            <div className="flex-shrink-0 px-4 py-4"
                style={{
                    background: 'var(--bg-surface)',
                    borderTop: '1px solid var(--border)',
                    paddingBottom: `calc(1rem + env(safe-area-inset-bottom))`,
                }}>
                {isArchived ? (
                    <div className="text-center py-2 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        This chat is archived — rental has ended
                    </div>
                ) : (
                    <div className="flex gap-3 max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 text-sm transition-all"
                            style={{
                                background: 'var(--bg-surface-2)',
                                border: '1px solid var(--border)',
                                borderRadius: 24,
                                padding: '0.625rem 1rem',
                                color: 'var(--text-primary)',
                                outline: 'none',
                            }}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#D20000'}
                            onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || sending}
                            className="flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0"
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                background: input.trim() && !sending ? '#D20000' : 'var(--bg-surface-2)',
                                border: 'none',
                                color: input.trim() && !sending ? 'white' : 'var(--text-muted)',
                            }}
                        >
                            {sending
                                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                : <Send size={17} />
                            }
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
