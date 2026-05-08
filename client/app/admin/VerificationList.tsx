"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";

type Row = {
    id: string;
    fullName?: string;
    email?: string;
    contact?: string;
    address?: string;
    bloodGroup?: string;
    specialization?: string;
    hospital?: string;
    licenseNumber?: string;
    hlaReportURL?: string;
    medicalReportURL?: string;
    verified?: boolean;
    createdAt?: string;
    [key: string]: any;
};

type Column = { label: string; key: keyof Row };

export default function VerificationList({
    role,
    title,
    description,
    extraColumns = [],
    accent = "bg-[#008080]",
}: {
    role: "donor" | "doctor";
    title: string;
    description: string;
    extraColumns?: Column[];
    accent?: string;
}) {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<"pending" | "verified" | "all">("pending");
    const [search, setSearch] = useState("");
    const [pending, setPending] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; message: string } | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const snap = await getDocs(query(collection(db, "users"), where("role", "==", role)));
                if (cancelled) return;
                setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
            } catch (err) {
                console.error(err);
                setFeedback({ type: "err", message: "Failed to load users." });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [role]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return rows
            .filter((r) => (status === "all" ? true : status === "verified" ? !!r.verified : !r.verified))
            .filter((r) => {
                if (!term) return true;
                return [r.fullName, r.email, r.contact, r.hospital, r.specialization]
                    .filter(Boolean)
                    .some((v) => v!.toString().toLowerCase().includes(term));
            })
            .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }, [rows, status, search]);

    const handleToggle = async (id: string, next: boolean) => {
        setPending(`verify:${id}`);
        setFeedback(null);
        try {
            await updateDoc(doc(db, "users", id), { verified: next });
            setRows((prev) => prev.map((r) => (r.id === id ? { ...r, verified: next } : r)));
            await createNotification({
                recipientUid: id,
                recipientRole: role,
                type: "verification",
                title: next ? "You're verified" : "Verification revoked",
                body: next
                    ? "An administrator approved your account."
                    : "An administrator revoked your verification status.",
                link: `/dashboard/${role}/profile`,
                createdBy: auth.currentUser?.uid,
                meta: { approved: next, source: "admin" },
            });
            setFeedback({ type: "ok", message: next ? "Marked as verified." : "Verification revoked." });
        } catch (err) {
            console.error(err);
            setFeedback({ type: "err", message: "Failed to update verification." });
        } finally {
            setPending(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this user's Firestore profile? The auth account must be removed separately in the Firebase console.")) return;
        setPending(`delete:${id}`);
        setFeedback(null);
        try {
            await deleteDoc(doc(db, "users", id));
            setRows((prev) => prev.filter((r) => r.id !== id));
            setFeedback({ type: "ok", message: "Profile deleted." });
        } catch (err) {
            console.error(err);
            setFeedback({ type: "err", message: "Failed to delete." });
        } finally {
            setPending(null);
        }
    };

    const pendingCount = rows.filter((r) => !r.verified).length;
    const verifiedCount = rows.filter((r) => r.verified).length;

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-[#1A1C1E] tracking-tight">{title}</h1>
                    <p className="text-slate-500 mt-1">{description}</p>
                </div>
                <div className="text-sm text-slate-400">
                    {loading ? "Loading…" : `${filtered.length} of ${rows.length} ${role}s`}
                </div>
            </div>

            {feedback && (
                <div className={`p-4 rounded-2xl text-sm font-semibold ${feedback.type === "ok" ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    {feedback.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`rounded-[2rem] p-8 text-white shadow-xl ${accent}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70 mb-4">Pending</p>
                    <p className="text-5xl font-black">{loading ? "—" : pendingCount}</p>
                </div>
                <div className="rounded-[2rem] p-8 bg-white border border-gray-50 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Verified</p>
                    <p className="text-5xl font-black text-[#1A1C1E]">{loading ? "—" : verifiedCount}</p>
                </div>
                <div className="rounded-[2rem] p-8 bg-white border border-gray-50 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Total</p>
                    <p className="text-5xl font-black text-[#1A1C1E]">{loading ? "—" : rows.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-6 flex flex-col md:flex-row gap-4">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, hospital…"
                    className="flex-1 bg-gray-50 border-0 rounded-xl px-5 py-3 text-sm font-medium text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                />
                <div className="flex items-center gap-2">
                    {(["pending", "verified", "all"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${status === s ? "bg-[#008080] text-white shadow-md" : "bg-gray-50 text-slate-500 hover:bg-gray-100"}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#008080]"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-24 text-center text-slate-400 text-sm font-medium">Nothing here yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-gray-50">
                                    <th className="text-left py-4 px-6">{role === "doctor" ? "Doctor" : "Donor"}</th>
                                    {extraColumns.map((c) => (
                                        <th key={c.key.toString()} className="text-left py-4 px-4">{c.label}</th>
                                    ))}
                                    <th className="text-left py-4 px-4">Contact</th>
                                    <th className="text-left py-4 px-4">Documents</th>
                                    <th className="text-left py-4 px-4">Status</th>
                                    <th className="text-right py-4 px-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((row) => (
                                    <tr key={row.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center font-bold">
                                                    {(row.fullName || row.email || "?").substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#1A1C1E]">{row.fullName || "Unnamed"}</p>
                                                    <p className="text-xs text-slate-400">{row.email || "—"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {extraColumns.map((c) => (
                                            <td key={c.key.toString()} className="py-4 px-4 text-slate-500">
                                                {(row[c.key as string] as string) || "—"}
                                            </td>
                                        ))}
                                        <td className="py-4 px-4 text-slate-500">
                                            <p>{row.contact || "—"}</p>
                                            <p className="text-xs text-slate-400">{row.address || ""}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                {row.hlaReportURL ? (
                                                    <a href={row.hlaReportURL} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#008080] hover:underline">HLA</a>
                                                ) : (
                                                    <span className="text-xs text-slate-300">HLA</span>
                                                )}
                                                {row.medicalReportURL ? (
                                                    <a href={row.medicalReportURL} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#008080] hover:underline">Medical</a>
                                                ) : (
                                                    <span className="text-xs text-slate-300">Medical</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${row.verified ? "bg-teal-50 text-teal-700 border-teal-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                                {row.verified ? "Verified" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    disabled={pending === `verify:${row.id}`}
                                                    onClick={() => handleToggle(row.id, !row.verified)}
                                                    className={`text-xs font-bold transition-colors ${row.verified ? "text-slate-500 hover:text-slate-700" : "text-[#008080] hover:text-[#006967]"} disabled:opacity-50`}
                                                >
                                                    {pending === `verify:${row.id}` ? "Saving…" : row.verified ? "Unverify" : "Verify"}
                                                </button>
                                                <button
                                                    disabled={pending === `delete:${row.id}`}
                                                    onClick={() => handleDelete(row.id)}
                                                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                                >
                                                    {pending === `delete:${row.id}` ? "Deleting…" : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
