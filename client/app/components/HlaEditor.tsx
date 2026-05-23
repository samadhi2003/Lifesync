"use client";

import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HlaTyping, LOCI, LOCUS_LABEL, Locus, pruneTyping, hasHla } from "@/lib/hla";

type Props = {
    uid: string;
    initial?: HlaTyping;
    actorRole: "patient" | "donor" | "doctor" | "admin";
    actorUid: string;
    onSaved?: (next: HlaTyping) => void;
};

const empty: HlaTyping = {};

const LOCUS_HINTS: Record<Locus, string> = {
    A: "e.g. 31, 33",
    B: "e.g. 35, 55",
    C: "e.g. 01, 04",
    DRB1: "e.g. 04, 07",
    DRB345: "e.g. DRB4*01, DRB4*01(N)",
    DQA1: "e.g. 02, 03",
    DQB1: "e.g. 03, 03",
    DPA1: "e.g. 01, 01",
    DPB1: "e.g. 02, 04",
};

export default function HlaEditor({ uid, initial, actorRole, actorUid, onSaved }: Props) {
    const [draft, setDraft] = useState<HlaTyping>(initial || empty);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; message: string } | null>(null);
    const [labReference, setLabReference] = useState(initial?.labReference || "");

    useEffect(() => {
        setDraft(initial || empty);
        setLabReference(initial?.labReference || "");
    }, [initial]);

    const setAllele = (locus: Locus, index: 0 | 1, value: string) => {
        setDraft((prev) => {
            const current = prev[locus] || ["", ""];
            const next: [string, string] = [current[0] || "", current[1] || ""];
            next[index] = value;
            return { ...prev, [locus]: next };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setFeedback(null);
        try {
            const payload = pruneTyping({
                ...draft,
                labReference: labReference || undefined,
                enteredBy: actorUid,
                enteredByRole: actorRole,
                enteredAt: new Date().toISOString(),
            });
            await updateDoc(doc(db, "users", uid), { hla: payload });
            setFeedback({ type: "ok", message: "HLA typing saved." });
            setEditing(false);
            onSaved?.(payload);
        } catch (err) {
            console.error(err);
            setFeedback({ type: "err", message: "Failed to save HLA typing." });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setDraft(initial || empty);
        setLabReference(initial?.labReference || "");
        setEditing(false);
        setFeedback(null);
    };

    const startEditing = () => {
        setEditing(true);
        setFeedback(null);
    };

    const present = hasHla(initial);
    const lockedNotice = !editing && present && (
        <p className="text-[10px] text-slate-400 font-medium">
            Last updated {initial?.enteredAt ? new Date(initial.enteredAt).toLocaleDateString() : "—"}
            {initial?.enteredByRole ? ` by ${initial.enteredByRole}` : ""}
            {initial?.labReference ? ` · Lab ref ${initial.labReference}` : ""}
        </p>
    );

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#008080] mb-1">HLA Typing</p>
                    <h3 className="text-lg font-bold text-[#1A1C1E]">Histocompatibility report</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Transcribe each locus from a Histocompatibility Type-match Report. Enter both alleles per row. Use the broad serological number (e.g. <span className="font-mono">31</span>, <span className="font-mono">35</span>); null alleles can be marked as <span className="font-mono">DRB4*01(N)</span>.
                    </p>
                </div>
                {!editing && actorRole !== "doctor" && (
                    <button
                        onClick={startEditing}
                        className="px-4 py-2 bg-[#008080] hover:bg-[#006967] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                    >
                        {present ? "Edit HLA" : "Add HLA"}
                    </button>
                )}
            </div>

            {feedback && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${feedback.type === "ok" ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    {feedback.message}
                </div>
            )}

            {!present && !editing && (
                <p className="text-sm text-slate-400 font-medium">No HLA typing on file yet.</p>
            )}

            {present && !editing && (
                <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-gray-50">
                                <th className="text-left py-3 px-4">Locus</th>
                                <th className="text-left py-3 px-4">Allele 1</th>
                                <th className="text-left py-3 px-4">Allele 2</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LOCI.map((locus) => {
                                const pair = initial?.[locus];
                                const a1 = pair?.[0]?.trim() || "—";
                                const a2 = pair?.[1]?.trim() || "—";
                                const empty = a1 === "—" && a2 === "—";
                                return (
                                    <tr key={locus} className={`border-b border-gray-50 ${empty ? "bg-slate-50" : "bg-white"}`}>
                                        <td className="py-3 px-4 font-bold text-[#1A1C1E]">{LOCUS_LABEL[locus]}</td>
                                        <td className="py-3 px-4 font-mono text-slate-700">{a1}</td>
                                        <td className="py-3 px-4 font-mono text-slate-700">{a2}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <th className="text-left px-2">Locus</th>
                                <th className="text-left px-2">Allele 1</th>
                                <th className="text-left px-2">Allele 2</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LOCI.map((locus) => {
                                const pair = draft[locus] || ["", ""];
                                return (
                                    <tr key={locus}>
                                        <td className="px-2 align-middle">
                                            <span className="font-bold text-[#1A1C1E] text-sm">{LOCUS_LABEL[locus]}</span>
                                        </td>
                                        <td className="px-2">
                                            <input
                                                value={pair[0] || ""}
                                                placeholder={LOCUS_HINTS[locus].split(",")[0]?.replace("e.g.", "").trim()}
                                                onChange={(e) => setAllele(locus, 0, e.target.value)}
                                                className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm font-mono text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20"
                                            />
                                        </td>
                                        <td className="px-2">
                                            <input
                                                value={pair[1] || ""}
                                                placeholder={LOCUS_HINTS[locus].split(",")[1]?.trim()}
                                                onChange={(e) => setAllele(locus, 1, e.target.value)}
                                                className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm font-mono text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block">Lab reference (optional)</label>
                        <input
                            value={labReference}
                            onChange={(e) => setLabReference(e.target.value)}
                            placeholder="e.g. 3578/24M"
                            className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm font-mono text-[#1A1C1E] focus:ring-2 focus:ring-[#008080]/20"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-5 py-2.5 bg-[#008080] hover:bg-[#006967] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-60"
                        >
                            {saving ? "Saving…" : "Save HLA"}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-5 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {!editing && lockedNotice}
        </div>
    );
}
