import { VerificationFields, resolveStatus, statusLabel, statusTone } from "@/lib/verification";

type Size = "sm" | "md";

export default function VerifiedBadge({
    user,
    size = "sm",
    showLabel = false,
}: {
    user: VerificationFields | null | undefined;
    size?: Size;
    showLabel?: boolean;
}) {
    const status = resolveStatus(user);
    if (status !== "verified") return null;

    const tone = statusTone(status);
    const iconClass = size === "md" ? "h-4 w-4" : "h-3 w-3";

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone.badge}`}
            title={statusLabel(status)}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.39 4.84L20 7.72l-4 3.9.94 5.48L12 14.77 7.06 17.1 8 11.62l-4-3.9 5.61-.88L12 2z" />
            </svg>
            {showLabel ? "Verified" : ""}
        </span>
    );
}

export function VerificationStatusPill({ user }: { user: VerificationFields | null | undefined }) {
    const status = resolveStatus(user);
    const tone = statusTone(status);
    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${tone.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`}></span>
            {statusLabel(status)}
        </span>
    );
}
