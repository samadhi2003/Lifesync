import Link from "next/link";
import { resolveStatus, statusLabel, statusTone, VerificationFields } from "@/lib/verification";

export default function VerificationGate({
    user,
    profileHref,
    audience,
}: {
    user: VerificationFields | null | undefined;
    profileHref: string;
    audience: "patient" | "donor";
}) {
    const status = resolveStatus(user);
    if (status === "verified") return null;

    const tone = statusTone(status);
    const counterpart = audience === "patient" ? "donors" : "patients";
    const copy = (() => {
        switch (status) {
            case "pending":
                return {
                    title: "Your verification is being reviewed",
                    body: `A LifeSync doctor is reviewing your profile. You'll be matched with verified ${counterpart} as soon as your verification is approved.`,
                    cta: "View status",
                };
            case "rejected":
                return {
                    title: "Verification was rejected",
                    body: `A doctor did not approve your last verification request. Open your profile to see their notes and re-submit with any corrections.`,
                    cta: "Open profile",
                };
            default:
                return {
                    title: "Get verified to see matches",
                    body: `LifeSync only matches verified ${audience}s with verified ${counterpart}. Submit your profile for a doctor's review to unlock matching.`,
                    cta: "Request verification",
                };
        }
    })();

    return (
        <div className={`mb-8 ${tone.card} rounded-[2rem] p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center gap-6`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/10 text-white border border-white/20`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            </div>
            <div className="flex-1">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${tone.subtext}`}>{statusLabel(status)}</p>
                <h2 className={`text-xl font-bold mb-1 ${tone.text}`}>{copy.title}</h2>
                <p className={`text-sm leading-relaxed ${tone.subtext}`}>{copy.body}</p>
            </div>
            <Link
                href={profileHref}
                className={`inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:bg-white/90 active:scale-95 transition-all shrink-0`}
            >
                {copy.cta}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </Link>
        </div>
    );
}
