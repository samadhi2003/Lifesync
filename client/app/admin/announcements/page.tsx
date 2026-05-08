"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { broadcastAnnouncement } from "@/lib/notifications";

type TargetKind = "role" | "user";
type RoleTarget = "all" | "patient" | "donor" | "doctor";

export default function AnnouncementsPage() {
    const [actorUid, setActorUid] = useState<string | null>(null);
    const [targetKind, setTargetKind] = useState<TargetKind>("role");
    const [roleTarget, setRoleTarget] = useState<RoleTarget>("all");
    const [userUid, setUserUid] = useState("");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [link, setLink] = useState("");
    const [sending, setSending] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; message: string } | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setActorUid(u?.uid ?? null));
        return () => unsub();
    }, []);

    const handleSend = async () => {
        if (!actorUid) {
            setFeedback({ type: "err", message: "Not signed in." });
            return;
        }
        if (!title.trim() || !body.trim()) {
            setFeedback({ type: "err", message: "Title and body are required." });
            return;
        }
        if (targetKind === "user" && !userUid.trim()) {
            setFeedback({ type: "err", message: "Enter a user UID." });
            return;
        }
        setSending(true);
        setFeedback(null);
        try {
            const count = await broadcastAnnouncement({
                title: title.trim(),
                body: body.trim(),
                link: link.trim() || undefined,
                actorUid,
                target:
                    targetKind === "user"
                        ? { kind: "user", uid: userUid.trim() }
                        : { kind: "role", role: roleTarget },
            });
            setFeedback({
                type: "ok",
                message: `Sent to ${count} recipient${count === 1 ? "" : "s"}.`,
            });
            setTitle("");
            setBody("");
            setLink("");
        } catch (err) {
            console.error(err);
            setFeedback({ type: "err", message: "Failed to send announcement." });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-3xl font-black text-[#1A1C1E] tracking-tight">Send announcement</h1>
                <p className="text-slate-500 mt-1">
                    Broadcast a notification to a role or a single user. Each recipient gets it in their bell and inbox.
                </p>
            </div>

            {feedback && (
                <div className={`p-4 rounded-2xl text-sm font-semibold ${feedback.type === "ok" ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    {feedback.message}
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-50 shadow-sm p-8 space-y-6">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Target</p>
                    <div className="flex gap-2">
                        {(["role", "user"] as const).map((k) => (
                            <button
                                key={k}
                                onClick={() => setTargetKind(k)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${targetKind === k ? "bg-[#008080] text-white shadow-md" : "bg-gray-50 text-slate-500 hover:bg-gray-100"}`}
                            >
                                {k === "role" ? "By role" : "Specific user"}
                            </button>
                        ))}
                    </div>
                </div>

                {targetKind === "role" ? (
                    <div className="flex flex-wrap gap-2">
                        {(["all", "patient", "donor", "doctor"] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRoleTarget(r)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${roleTarget === r ? "bg-[#1A1C1E] text-white shadow-md" : "bg-gray-50 text-slate-500 hover:bg-gray-100"}`}
                            >
                                {r === "all" ? "All non-admin users" : `${r}s`}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Recipient UID</label>
                        <input
                            value={userUid}
                            onChange={(e) => setUserUid(e.target.value)}
                            placeholder="Firestore users/{uid}"
                            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-mono text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                        />
                    </div>
                )}

                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={120}
                        placeholder="Scheduled maintenance Friday"
                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-bold text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Body</label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={4}
                        maxLength={500}
                        placeholder="Match results may be slow on Friday between 10pm and midnight."
                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20 transition-all resize-none"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Link (optional)</label>
                    <input
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="/dashboard/patient/matches"
                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        disabled={sending}
                        onClick={handleSend}
                        className="px-6 py-3 bg-[#008080] hover:bg-[#006967] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all disabled:opacity-60"
                    >
                        {sending ? "Sending…" : "Send announcement"}
                    </button>
                </div>
            </div>
        </div>
    );
}
