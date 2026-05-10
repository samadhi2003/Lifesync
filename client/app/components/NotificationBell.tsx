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
    const seenIdsRef = useRef<Set<string> | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, setUser);
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!user) {
            seenIdsRef.current = null;
            return;
        }
        const unsub = subscribeToNotifications(user.uid, (next) => {
            // First snapshot for this user → just record ids without firing
            // OS toasts (otherwise every existing unread fires on page load).
            if (seenIdsRef.current === null) {
                seenIdsRef.current = new Set(next.map((n) => n.id));
                setItems(next);
                return;
            }
            const seen = seenIdsRef.current;
            const fresh = next.filter((n) => !seen.has(n.id) && !n.read);
            for (const item of fresh) {
                seen.add(item.id);
                fireOsNotification(item);
            }
            // Also catch ids that disappeared so re-arrivals can re-fire.
            const stillPresent = new Set(next.map((n) => n.id));
            for (const id of Array.from(seen)) {
                if (!stillPresent.has(id)) seen.delete(id);
            }
            setItems(next);
        });
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

    const handleTestNotification = () => {
        try {
            if (!("Notification" in window) || Notification.permission !== "granted") {
                alert("Notifications aren't allowed in this browser yet.");
                return;
            }
            new Notification("LifeSync test", {
                body: "If you're seeing this, OS-level notifications work.",
                tag: "lifesync-test",
            });
        } catch (err) {
            console.warn("Test notification failed:", err);
            alert("Failed to fire test notification — check the console for details.");
        }
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

                    <div className="px-5 py-3 bg-slate-50/60 border-b border-gray-100 flex items-center justify-between gap-3">
                        <div className="text-[11px] font-medium text-slate-500">
                            OS toasts:{" "}
                            <span className={
                                pushPermission === "granted" ? "text-teal-700 font-bold" :
                                pushPermission === "denied" ? "text-red-600 font-bold" :
                                pushPermission === "unsupported" ? "text-slate-500 font-bold" :
                                "text-amber-700 font-bold"
                            }>
                                {pushPermission === "granted" ? "Enabled" :
                                 pushPermission === "denied" ? "Blocked in browser" :
                                 pushPermission === "unsupported" ? "Unsupported" :
                                 "Not enabled"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {pushPermission !== "granted" && pushPermission !== "denied" && pushPermission !== "unsupported" && (
                                <button
                                    onClick={handleEnablePush}
                                    disabled={pushBusy}
                                    className="px-3 py-1.5 bg-[#008080] hover:bg-[#006967] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg disabled:opacity-50"
                                >
                                    {pushBusy ? "…" : "Enable"}
                                </button>
                            )}
                            {pushPermission === "granted" && (
                                <button
                                    onClick={handleTestNotification}
                                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-lg"
                                >
                                    Test
                                </button>
                            )}
                        </div>
                    </div>

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

function fireOsNotification(item: AppNotification): void {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
        const href = resolveLink(item);
        const n = new Notification(item.title, {
            body: item.body,
            tag: item.id,
            data: { href },
        });
        n.onclick = () => {
            try {
                window.focus();
                if (href) window.location.assign(href);
                n.close();
            } catch {
                /* noop */
            }
        };
    } catch (err) {
        console.warn("OS notification failed:", err);
    }
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

function NotificationRow({ item, onClick }: { item: AppNotification; onClick: () => void }) {
    const tone = TONE_BY_TYPE[item.type] || TONE_BY_TYPE.announcement;
    const href = resolveLink(item);
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
    if (href) {
        return (
            <Link href={href} onClick={onClick} className="block">
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
