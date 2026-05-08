"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
    approveVerification,
    rejectVerification,
    resolveStatus,
    statusLabel,
    statusTone,
    VerificationStatus,
} from "@/lib/verification";
import { notifyMatchFanOut, notifyVerificationDecision } from "@/lib/notifications";
import HlaEditor from "@/app/components/HlaEditor";
import { HlaTyping, hasHla } from "@/lib/hla";

type PendingUser = {
    id: string;
    fullName?: string;
    email?: string;
    nic?: string;
    contact?: string;
    address?: string;
    bloodGroup?: string;
    role?: string;
    urgency?: string;
    gender?: string;
    dob?: string;
    hlaReportURL?: string;
    medicalReportURL?: string;
    hla?: HlaTyping;
    verificationStatus?: VerificationStatus;
    verified?: boolean;
    verificationRequestedAt?: string;
    verificationNotes?: string;
    verifiedAt?: string;
};

type FilterRole = "all" | "patient" | "donor";
type FilterStatus = "pending" | "all" | "verified" | "rejected";

export default function DoctorVerificationsPage() {
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [doctorUid, setDoctorUid] = useState<string | null>(null);
    const [role, setRole] = useState<FilterRole>("all");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("pending");
    const [search, setSearch] = useState("");
    const [working, setWorking] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; message: string } | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setDoctorUid(user?.uid ?? null);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const snap = await getDocs(collection(db, "users"));
                if (cancelled) return;
                const rows = snap.docs
                    .map((d) => ({ id: d.id, ...(d.data() as any) }))
                    .filter((u) => u.role === "patient" || u.role === "donor");
                setUsers(rows);
            } catch (err) {
                console.error(err);
                setFeedback({ type: "err", message: "Failed to load verification queue." });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        const effectiveStatus = term ? "all" : statusFilter;
        return users
            .filter((u) => (role === "all" ? true : u.role === role))
            .filter((u) => (effectiveStatus === "all" ? true : resolveStatus(u) === effectiveStatus))
            .filter((u) => {
                if (!term) return true;
                return [u.fullName, u.email, u.nic, u.contact]
                    .filter(Boolean)
                    .some((v) => v!.toString().toLowerCase().includes(term));
            })
            .sort((a, b) => (b.verificationRequestedAt || "").localeCompare(a.verificationRequestedAt || ""));
    }, [users, role, statusFilter, search]);

    const pendingCount = users.filter((u) => resolveStatus(u) === "pending").length;

    const handleApprove = async (id: string) => {
        if (!doctorUid) return;
        setWorking(`approve:${id}`);
        setFeedback(null);
        try {
            const target = users.find((u) => u.id === id);
            const role = (target?.role === "donor" ? "donor" : "patient") as "patient" | "donor";
            await approveVerification(id, doctorUid, notes[id] || "");
            setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, verified: true, verificationStatus: "verified", verifiedAt: new Date().toISOString(), verifiedBy: doctorUid } : u)));
            await notifyVerificationDecision({ uid: id, role, approved: true, notes: notes[id], doctorUid });
            await notifyMatchFanOut({ uid: id, role });
            setFeedback({ type: "ok", message: "Verification approved." });
        } catch (err) {
            console.error(err);
            setFeedback({ type: "err", message: "Failed to approve." });
        } finally {
            setWorking(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!doctorUid) return;
        setWorking(`reject:${id}`);
        setFeedback(null);
        try {
            const target = users.find((u) => u.id === id);
            const role = (target?.role === "donor" ? "donor" : "patient") as "patient" | "donor";
            await rejectVerification(id, doctorUid, notes[id] || "");
            setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, verified: false, verificationStatus: "rejected", verifiedAt: new Date().toISOString(), verifiedBy: doctorUid } : u)));
            await notifyVerificationDecision({ uid: id, role, approved: false, notes: notes[id], doctorUid });
            setFeedback({ type: "ok", message: "Verification rejected." });
        } catch (err) {
            console.error(err);
            setFeedback({ type: "err", message: "Failed to reject." });
        } finally {
            setWorking(null);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-[#1A1C1E] tracking-tight">Verification queue</h1>
                    <p className="text-slate-500 mt-1">Approve patients and donors so they become eligible for matching.</p>
                </div>
                <div className="text-sm text-slate-400">
                    {loading ? "Loading…" : `${pendingCount} pending requests`}
                </div>
            </div>

            {feedback && (
                <div className={`p-4 rounded-2xl text-sm font-semibold ${feedback.type === "ok" ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    {feedback.message}
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-6 space-y-4">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by NIC, name, email, or phone — matches any status"
                        className="w-full bg-gray-50 border-0 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                    />
                </div>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        {(["all", "patient", "donor"] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${role === r ? "bg-[#008080] text-white shadow-md" : "bg-gray-50 text-slate-500 hover:bg-gray-100"}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap lg:ml-auto">
                        {(["pending", "verified", "rejected", "all"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                disabled={!!search.trim()}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed ${statusFilter === s && !search.trim() ? "bg-[#1A1C1E] text-white shadow-md" : "bg-gray-50 text-slate-500 hover:bg-gray-100"}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                {search.trim() && (
                    <p className="text-xs font-medium text-slate-400">Status filter is disabled while searching — matches from any status are shown.</p>
                )}
            </div>

            {loading ? (
                <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#008080]"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm py-20 text-center text-slate-400 font-medium text-sm">
                    Nothing to review.
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filtered.map((user) => {
                        const status = resolveStatus(user);
                        const tone = statusTone(status);
                        return (
                            <div key={user.id} className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-6 space-y-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center font-bold shrink-0">
                                            {(user.fullName || user.email || "?").substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-[#1A1C1E] truncate">{user.fullName || "Unnamed"}</h3>
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${tone.badge}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`}></span>
                                        {statusLabel(status)}
                                    </span>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NIC — match against the ID presented in person</p>
                                    <p className="font-mono text-base font-bold text-[#1A1C1E] tracking-wider">{user.nic || "No NIC on file"}</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood</p>
                                        <p className="font-bold text-[#008080]">{user.bloodGroup || "—"}</p>
                                    </div>
                                    {user.role === "patient" && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Urgency</p>
                                            <p className="font-bold text-[#1A1C1E]">{user.urgency || "—"}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                                        <p className="font-bold text-[#1A1C1E] truncate">{user.contact || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of birth</p>
                                        <p className="font-bold text-[#1A1C1E]">{user.dob || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                                        <p className="font-bold text-[#1A1C1E]">{user.gender || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</p>
                                        <p className="font-bold text-[#1A1C1E] truncate" title={user.address}>{user.address || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requested</p>
                                        <p className="font-bold text-[#1A1C1E]">{user.verificationRequestedAt ? new Date(user.verificationRequestedAt).toLocaleDateString() : "—"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {user.hlaReportURL ? (
                                        <a href={user.hlaReportURL} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#008080] hover:underline">View HLA report</a>
                                    ) : (
                                        <span className="text-xs text-slate-300">No HLA report</span>
                                    )}
                                    {user.medicalReportURL ? (
                                        <a href={user.medicalReportURL} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#008080] hover:underline">View medical report</a>
                                    ) : (
                                        <span className="text-xs text-slate-300">No medical report</span>
                                    )}
                                </div>

                                {user.verificationNotes && status !== "pending" && (
                                    <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Previous notes</p>
                                        {user.verificationNotes}
                                    </div>
                                )}

                                {doctorUid && (
                                    <HlaEditor
                                        uid={user.id}
                                        initial={user.hla}
                                        actorRole="doctor"
                                        actorUid={doctorUid}
                                        onSaved={(next) =>
                                            setUsers((prev) =>
                                                prev.map((u) => (u.id === user.id ? { ...u, hla: next } : u)),
                                            )
                                        }
                                    />
                                )}

                                {!hasHla(user.hla) && (
                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-xs text-amber-700">
                                        No HLA typing on file. The user can match on ABO compatibility only until HLA is added.
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <textarea
                                        rows={2}
                                        placeholder="Notes for this decision (optional)"
                                        value={notes[user.id] || ""}
                                        onChange={(e) => setNotes((prev) => ({ ...prev, [user.id]: e.target.value }))}
                                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20 transition-all resize-none"
                                    />
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            disabled={working === `approve:${user.id}`}
                                            onClick={() => handleApprove(user.id)}
                                            className="px-5 py-2.5 bg-[#008080] hover:bg-[#006967] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-60"
                                        >
                                            {working === `approve:${user.id}` ? "Approving…" : "Approve & verify"}
                                        </button>
                                        <button
                                            disabled={working === `reject:${user.id}`}
                                            onClick={() => handleReject(user.id)}
                                            className="px-5 py-2.5 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all disabled:opacity-60"
                                        >
                                            {working === `reject:${user.id}` ? "Rejecting…" : "Reject"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
