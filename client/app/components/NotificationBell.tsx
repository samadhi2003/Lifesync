"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
    AppNotification,
    markAllRead,
    markRead,
    subscribeToNotifications,
} from "@/lib/notifications";
import { enablePush, getPushPermissionState, isPushSupported } from "@/lib/push";

type Props = {
    inboxHref?: string;
    /** Color of the bell icon (used to adapt to light/dark headers). */
    tone?: "light" | "dark";
};

export default function NotificationBell({ inboxHref = "/dashboard/notifications", tone = "dark" }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [items, setItems] = useState<AppNotification[]>([]);
    const [open, setOpen] = useState(false);
    const [pushSupported, setPushSupported] = useState(false);
    const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">("default");
    const [pushBusy, setPushBusy] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, setUser);
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!user) return;
        const unsub = subscribeToNotifications(user.uid, setItems);
        return () => unsub();
    }, [user]);

    useEffect(() => {
        (async () => {
            setPushSupported(await isPushSupported());
            setPushPermission(await getPushPermissionState());
        })();
    }, []);

    useEffect(() => {
        if (!open) return;
        const onClickAway = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickAway);
        return () => document.removeEventListener("mousedown", onClickAway);
    }, [open]);

    const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

    if (!user) return null;

    const handleClick = async (item: AppNotification) => {
        if (!item.read) {
            try {
                await markRead(item.id);
            } catch (err) {
                console.warn("markRead failed:", err);
            }
        }
        setOpen(false);
    };

    const handleMarkAll = async () => {
        if (!user) return;
        try {
            await markAllRead(user.uid);
        } catch (err) {
            console.warn("markAllRead failed:", err);
        }
    };

    const handleEnablePush = async () => {
        if (!user) return;
        setPushBusy(true);
        const result = await enablePush(user.uid);
        setPushBusy(false);
        setPushPermission(await getPushPermissionState());
        if (!result.ok && result.reason) alert(result.reason);
    };

    const iconColor = tone === "light" ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-[#008080]";

    return (
        <div className="relative" ref={containerRef}>
            <button
                aria-label="Notifications"
                onClick={() => setOpen((v) => !v)}
                className={`relative p-2 transition-colors ${iconColor}`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-slate-900/10 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <div>
                            <p className="text-sm font-black text-[#1A1C1E]">Notifications</p>
                            <p className="text-[11px] text-slate-400 font-medium">{unreadCount} unread</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAll}
                                className="text-[10px] font-bold uppercase tracking-widest text-[#008080] hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {pushSupported && pushPermission !== "granted" && pushPermission !== "denied" && (
                        <div className="px-5 py-3 bg-teal-50/60 border-b border-teal-100/60 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold text-[#006967]">Enable browser push</p>
                                <p className="text-[11px] text-slate-500">Get notified even when this tab is closed.</p>
                            </div>
                            <button
                                onClick={handleEnablePush}
                                disabled={pushBusy}
                                className="px-3 py-1.5 bg-[#008080] hover:bg-[#006967] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg disabled:opacity-50"
                            >
                                {pushBusy ? "…" : "Enable"}
                            </button>
                        </div>
                    )}

                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                        {items.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-xs font-medium">No notifications yet.</div>
                        ) : (
                            items.slice(0, 8).map((item) => (
                                <NotificationRow key={item.id} item={item} onClick={() => handleClick(item)} />
                            ))
                        )}
                    </div>

                    <Link
                        href={inboxHref}
                        onClick={() => setOpen(false)}
                        className="block text-center text-[10px] font-black uppercase tracking-widest text-[#008080] hover:bg-teal-50/40 py-3 border-t border-gray-50"
                    >
                        View all
                    </Link>
                </div>
            )}
        </div>
    );
}

function NotificationRow({ item, onClick }: { item: AppNotification; onClick: () => void }) {
    const tone = TONE_BY_TYPE[item.type] || TONE_BY_TYPE.announcement;
    const Inner = (
        <div className={`flex gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors ${item.read ? "" : "bg-teal-50/30"}`}>
            <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.read ? "bg-transparent" : tone.dot}`}></span>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-bold text-[#1A1C1E] truncate">{item.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">{relativeTime(item.createdAt)}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mt-0.5">{item.body}</p>
            </div>
        </div>
    );
    if (item.link) {
        return (
            <Link href={item.link} onClick={onClick} className="block">
                {Inner}
            </Link>
        );
    }
    return (
        <button onClick={onClick} className="w-full text-left">
            {Inner}
        </button>
    );
}

const TONE_BY_TYPE: Record<string, { dot: string }> = {
    match: { dot: "bg-teal-500" },
    verification: { dot: "bg-purple-500" },
    medical_report: { dot: "bg-orange-500" },
    announcement: { dot: "bg-blue-500" },
};

function relativeTime(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diff = Date.now() - then;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(iso).toLocaleDateString();
}
