import { HlaScoreResult, HlaTyping, LOCI, LOCUS_LABEL, Locus, summarizeHla } from "@/lib/hla";

function format(pair: HlaTyping[Locus]): string {
    if (!pair) return "—";
    return pair.filter(Boolean).join(", ") || "—";
}

function locusToneClass(result: HlaScoreResult, locus: Locus): string {
    const r = result.perLocus[locus];
    if (!r) return "bg-slate-50";
    if (r.mismatches > 0) return "bg-red-50";
    if (r.crossReactive > 0) return "bg-amber-50";
    if (r.fullMatches > 0) return "bg-teal-50";
    return "bg-slate-50";
}

function locusVerdict(result: HlaScoreResult, locus: Locus): string {
    const r = result.perLocus[locus];
    if (!r) return "Missing";
    const parts: string[] = [];
    if (r.fullMatches) parts.push(`${r.fullMatches} match`);
    if (r.crossReactive) parts.push(`${r.crossReactive} CREG`);
    if (r.mismatches) parts.push(`${r.mismatches} mismatch`);
    if (r.donorNullCount) parts.push(`${r.donorNullCount} null`);
    return parts.join(" · ") || "—";
}

export default function HlaCompareTable({
    patient,
    donor,
    result,
}: {
    patient: HlaTyping | null | undefined;
    donor: HlaTyping | null | undefined;
    result: HlaScoreResult;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="text-lg font-bold text-[#1A1C1E]">HLA comparison</h3>
                <span className="text-sm font-medium text-slate-500">{summarizeHla(result)}</span>
            </div>
            <div className="overflow-x-auto bg-white border border-gray-100 rounded-3xl shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-gray-50">
                            <th className="text-left py-3 px-4">Locus</th>
                            <th className="text-left py-3 px-4">Patient</th>
                            <th className="text-left py-3 px-4">Donor</th>
                            <th className="text-left py-3 px-4">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {LOCI.map((locus) => (
                            <tr key={locus} className={`border-b border-gray-50 ${locusToneClass(result, locus)}`}>
                                <td className="py-3 px-4 font-bold text-[#1A1C1E]">{LOCUS_LABEL[locus]}</td>
                                <td className="py-3 px-4 font-mono text-slate-700">{format(patient?.[locus])}</td>
                                <td className="py-3 px-4 font-mono text-slate-700">{format(donor?.[locus])}</td>
                                <td className="py-3 px-4 text-xs font-semibold text-slate-600">{locusVerdict(result, locus)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {result.bothSidesHaveData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Stat label="Score" value={`${result.score}%`} accent />
                    <Stat label="6-antigen match" value={`${result.sixAntigenMatches}/6`} />
                    <Stat label="Cross-reactive" value={`${result.totalCrossReactive}`} />
                    <Stat label="Mismatches" value={`${result.totalMismatches}`} />
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className={`rounded-2xl border p-4 ${accent ? "bg-[#008080] text-white border-[#008080]" : "bg-white border-gray-100"}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${accent ? "text-white/70" : "text-slate-400"}`}>{label}</p>
            <p className={`text-2xl font-black ${accent ? "text-white" : "text-[#1A1C1E]"}`}>{value}</p>
        </div>
    );
}
