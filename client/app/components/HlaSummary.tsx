import { HlaScoreResult, summarizeHla } from "@/lib/hla";

export default function HlaSummary({ result }: { result: HlaScoreResult }) {
    if (!result.hasData) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                HLA pending
            </span>
        );
    }
    if (!result.bothSidesHaveData) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Awaiting counterpart HLA
            </span>
        );
    }
    const tone = result.isZeroMismatch
        ? "text-teal-700"
        : result.totalMismatches === 0
            ? "text-teal-700"
            : result.totalMismatches <= 2
                ? "text-amber-600"
                : "text-red-600";
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.39 4.84L20 7.72l-4 3.9.94 5.48L12 14.77 7.06 17.1 8 11.62l-4-3.9 5.61-.88L12 2z" />
            </svg>
            {summarizeHla(result)}
        </span>
    );
}
