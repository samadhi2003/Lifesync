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
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone.badge}`}
            title={statusLabel(status)}
        >
            <span className={`w-1 h-1 rounded-full ${tone.dot}`}></span>
            {showLabel ? "Verified" : "Verified"}
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
