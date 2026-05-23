"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
    AppNotification,
    NotificationType,
    markAllRead,
    markRead,
    subscribeToNotifications,
} from "@/lib/notifications";

const TYPE_FILTERS: { label: string; value: "all" | NotificationType }[] = [
    { label: "All", value: "all" },
    { label: "Matches", value: "match" },
    { label: "Verifications", value: "verification" },
    { label: "Reports", value: "medical_report" },
    { label: "Announcements", value: "announcement" },
];

export default function NotificationsInbox() {
    const [user, setUser] = useState<User | null>(null);
    const [items, setItems] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | NotificationType>("all");

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (!u) {
                setItems([]);
                setLoading(false);
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!user) return;
        const unsub = subscribeToNotifications(
            user.uid,
            (next) => {
                setItems(next);
                setLoading(false);
            },
            100,
        );
        return () => unsub();
    }, [user]);

    const filtered = useMemo(
        () => (filter === "all" ? items : items.filter((i) => i.type === filter)),
        [items, filter],
    );
    const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

    const handleClick = async (id: string) => {
        try {
            await markRead(id);
        } catch (err) {
            console.warn("markRead failed:", err);
        }
    };

    const handleMarkAll = async () => {
        if (!user) return;
        try {
            await markAllRead(user.uid);
        } catch (err) {
            console.warn("markAllRead failed:", err);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-[#1A1C1E] tracking-tight">Notifications</h1>
                    <p className="text-slate-500 mt-1">{unreadCount} unread of {items.length} total</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAll}
                        className="px-4 py-2 bg-[#008080] hover:bg-[#006967] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-50 shadow-sm p-3 flex flex-wrap gap-2">
                {TYPE_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                            filter === f.value
                                ? "bg-[#008080] text-white shadow-md"
                                : "bg-gray-50 text-slate-500 hover:bg-gray-100"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-50 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#008080]"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 text-sm font-medium">Nothing here.</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filtered.map((item) => (
                            <Row key={item.id} item={item} onClick={() => handleClick(item.id)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function resolveLink(item: AppNotification): string | undefined {
    if (item.type === "match") {
        const meta = (item.meta || {}) as { counterpartyUid?: string; patientUid?: string; donorUid?: string };
        const role = item.recipientRole;
        const counterpartyUid =
            meta.counterpartyUid ||
            (role === "donor" ? meta.patientUid : undefined) ||
            (role === "patient" ? meta.donorUid : undefined);
        if (counterpartyUid && (role === "patient" || role === "donor")) {
            return `/dashboard/${role}/matches/${counterpartyUid}`;
        }
    }
    return item.link;
}

function Row({ item, onClick }: { item: AppNotification; onClick: () => void }) {
    const dot = DOT_BY_TYPE[item.type] || "bg-slate-400";
    const href = resolveLink(item);
    const inner = (
        <div className={`px-6 py-4 flex items-start gap-4 hover:bg-slate-50/40 transition-colors ${item.read ? "" : "bg-teal-50/30"}`}>
            <span className={`mt-2 w-2 h-2 rounded-full shrink-0 ${item.read ? "bg-transparent border border-slate-200" : dot}`}></span>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <p className="font-bold text-[#1A1C1E]">{item.title}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
                        {new Date(item.createdAt).toLocaleString()}
                    </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.body}</p>
            </div>
        </div>
    );
    if (href) {
        return (
            <Link href={href} onClick={onClick} className="block">
                {inner}
            </Link>
        );
    }
    return (
        <button onClick={onClick} className="w-full text-left">
            {inner}
        </button>
    );
}

const DOT_BY_TYPE: Record<string, string> = {
    match: "bg-teal-500",
    verification: "bg-purple-500",
    medical_report: "bg-orange-500",
    announcement: "bg-blue-500",
};
