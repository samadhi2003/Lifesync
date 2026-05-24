"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type PatientRecord = {
    id: string;
    name?: string;
    bloodGroup?: string;
    urgency?: string;
    onDialysis?: boolean;
    hlaUrl?: string;
    doctorId?: string;
    createdAt?: string;
    status?: string;
};

const STATUS_OPTIONS = ["Searching", "Matched", "On Hold", "Closed"];

export default function AdminPatientsPage() {
    const [records, setRecords] = useState<PatientRecord[]>([]);
    const [doctorNames, setDoctorNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [urgency, setUrgency] = useState("all");
    const [pending, setPending] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; message: string } | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [patientsSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, "patients")),
                    getDocs(collection(db, "users")),
                ]);
                if (cancelled) return;

                setRecords(patientsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PatientRecord)));

                const map: Record<string, string> = {};
                usersSnap.docs.forEach((d) => {
                    const data = d.data();
                    if (data.role === "doctor") {
                        map[d.id] = data.fullName || data.email || d.id;
                    }
                });
                setDoctorNames(map);
            } catch (err) {
                console.error(err);
                setFeedback({ type: "err", message: "Failed to load patient records." });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        return records
            .filter((r) => (urgency === "all" ? true : (r.urgency || "").toLowerCase() === urgency))
            .filter((r) => {
                if (!term) return true;
                return (
                    (r.name || "").toLowerCase().includes(term) ||
                    (r.bloodGroup || "").toLowerCase().includes(term) ||
                    (doctorNames[r.doctorId || ""] || "").toLowerCase().includes(term)
                );
            })
            .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }, [records, query, urgency, doctorNames]);

    const handleStatus = async (id: string, newStatus: string) => {
        setPending(`status:${id}`);
        setFeedback(null);
        try {
            await updateDoc(doc(db, "patients", id), { status: newStatus });
            setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
            setFeedback({ type: "ok", message: "Status updated." });
        } catch (err) {
            console.error(err);
            setFeedback({ type: "err", message: "Failed to update status." });
        } finally {
            setPending(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this patient record?")) return;
        setPending(`delete:${id}`);
        setFeedback(null);
        try {
            await deleteDoc(doc(db, "patients", id));
            setRecords((prev) => prev.filter((r) => r.id !== id));
            setFeedback({ type: "ok", message: "Record deleted." });
        } catch (err) {
            console.error(err);
            setFeedback({ type: "err", message: "Failed to delete record." });
        } finally {
            setPending(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-[#1A1C1E] tracking-tight">Patient records</h1>
                    <p className="text-slate-500 mt-1">Clinical entries saved by doctors searching for donors.</p>
                </div>
                <div className="text-sm text-slate-400">
                    {loading ? "Loading…" : `${filtered.length} of ${records.length} records`}
                </div>
            </div>

            {feedback && (
                <div className={`p-4 rounded-2xl text-sm font-semibold ${feedback.type === "ok" ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    {feedback.message}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-6 flex flex-col md:flex-row gap-4">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by patient, doctor, or blood group"
                    className="flex-1 bg-gray-50 border-0 rounded-xl px-5 py-3 text-sm font-medium text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                />
                <div className="flex items-center gap-2 flex-wrap">
                    {(["all", "Critical", "High", "Moderate"] as const).map((u) => (
                        <button
                            key={u}
                            onClick={() => setUrgency(u.toLowerCase())}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${urgency === u.toLowerCase()
                                ? "bg-[#008080] text-white shadow-md"
                                : "bg-gray-50 text-slate-500 hover:bg-gray-100"
                                }`}
                        >
                            {u}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#008080]"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-24 text-center text-slate-400 text-sm font-medium">No records match your filters.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-gray-50">
                                    <th className="text-left py-4 px-6">Patient</th>
                                    <th className="text-left py-4 px-4">Urgency</th>
                                    <th className="text-left py-4 px-4">Blood</th>
                                    <th className="text-left py-4 px-4">Dialysis</th>
                                    <th className="text-left py-4 px-4">Saved by</th>
                                    <th className="text-left py-4 px-4">Status</th>
                                    <th className="text-right py-4 px-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-[#1A1C1E]">{record.name || "Unnamed"}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                                                {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "—"}
                                            </p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${(record.urgency || "").toLowerCase() === "critical"
                                                ? "bg-red-50 text-red-600 border-red-100"
                                                : (record.urgency || "").toLowerCase() === "high"
                                                    ? "bg-orange-50 text-orange-600 border-orange-100"
                                                    : "bg-teal-50 text-teal-600 border-teal-100"
                                                }`}>
                                                {record.urgency || "—"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 font-bold text-[#008080]">{record.bloodGroup || "—"}</td>
                                        <td className="py-4 px-4 text-slate-500">{record.onDialysis ? "Yes" : "No"}</td>
                                        <td className="py-4 px-4 text-slate-500">{doctorNames[record.doctorId || ""] || "—"}</td>
                                        <td className="py-4 px-4">
                                            <select
                                                disabled={pending === `status:${record.id}`}
                                                value={record.status || "Searching"}
                                                onChange={(e) => handleStatus(record.id, e.target.value)}
                                                className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20"
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {record.hlaUrl && (
                                                    <a
                                                        href={record.hlaUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-bold text-[#008080] hover:underline"
                                                    >
                                                        HLA
                                                    </a>
                                                )}
                                                <button
                                                    disabled={pending === `delete:${record.id}`}
                                                    onClick={() => handleDelete(record.id)}
                                                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                                >
                                                    {pending === `delete:${record.id}` ? "Deleting…" : "Delete"}
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
