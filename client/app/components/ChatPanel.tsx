"use client";

import { useEffect, useRef, useState } from "react";
import {
    ChatMessage,
    sendChatMessage,
    subscribeChatMessages,
} from "@/lib/chats";

type Props = {
    chatId: string;
    currentUid: string;
    currentName?: string;
    partnerUid: string;
    partnerName: string;
    partnerRole: "patient" | "donor";
};

export default function ChatPanel({
    chatId,
    currentUid,
    currentName,
    partnerUid,
    partnerName,
    partnerRole,
}: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const unsub = subscribeChatMessages(chatId, setMessages);
        return () => unsub();
    }, [chatId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text || sending) return;
        setSending(true);
        setDraft("");
        try {
            await sendChatMessage({
                chatId,
                senderUid: currentUid,
                senderName: currentName,
                recipientUid: partnerUid,
                recipientRole: partnerRole,
                text,
            });
        } catch (err) {
            console.error("Failed to send chat message:", err);
            setDraft(text);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Chat with {partnerName}</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {messages.length} message{messages.length === 1 ? "" : "s"}
                </span>
            </div>
            <div
                ref={scrollRef}
                className="bg-slate-50/60 border border-gray-100 rounded-2xl p-4 h-72 overflow-y-auto space-y-2"
            >
                {messages.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm font-medium pt-20">
                        No messages yet. Say hello.
                    </p>
                ) : (
                    messages.map((m) => {
                        const mine = m.senderUid === currentUid;
                        return (
                            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                                        mine
                                            ? "bg-[#00796B] text-white rounded-br-sm"
                                            : "bg-white text-slate-700 border border-gray-100 rounded-bl-sm"
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                                    <p className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-slate-400"}`}>
                                        {formatTime(m.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                    disabled={sending}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00796B]/30 disabled:opacity-60"
                />
                <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="px-5 py-3 bg-[#00796B] hover:bg-[#00695C] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                >
                    {sending ? "…" : "Send"}
                </button>
            </form>
        </div>
    );
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const today = new Date();
    const sameDay =
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
    return sameDay
        ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        : d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
