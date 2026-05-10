/**
 * Verification workflow for patients and donors.
 *
 * Patients and donors must be reviewed and approved by a doctor before they
 * show up in match results for either side. The source of truth is the `users`
 * document in Firestore; `verified: true` is the final gate the matching code
 * reads, and `verificationStatus` tracks where a user is in the flow.
 *
 * A doctor's own verification is handled separately by administrators — see
 * `/admin/doctors`.
 */

import {
    doc,
    serverTimestamp,
    updateDoc,
    FieldValue,
} from "firebase/firestore";
import { db } from "./firebase";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type VerificationFields = {
    verified?: boolean;
    verificationStatus?: VerificationStatus;
    verificationRequestedAt?: string;
    verifiedAt?: string;
    verifiedBy?: string;
    verificationNotes?: string;
};

export function resolveStatus(user: VerificationFields | null | undefined): VerificationStatus {
    if (!user) return "unverified";
    if (user.verificationStatus) return user.verificationStatus;
    return user.verified ? "verified" : "unverified";
}

export function isVerified(user: VerificationFields | null | undefined): boolean {
    return resolveStatus(user) === "verified";
}

export async function requestVerification(uid: string): Promise<void> {
    await updateDoc(doc(db, "users", uid), {
        verificationStatus: "pending" satisfies VerificationStatus,
        verificationRequestedAt: new Date().toISOString(),
        verificationNotes: "",
    });
}

export async function approveVerification(uid: string, doctorUid: string, notes?: string): Promise<void> {
    const payload: Record<string, string | boolean | FieldValue> = {
        verified: true,
        verificationStatus: "verified" satisfies VerificationStatus,
        verifiedBy: doctorUid,
        verifiedAt: new Date().toISOString(),
    };
    if (notes !== undefined) payload.verificationNotes = notes;
    await updateDoc(doc(db, "users", uid), payload);
}

export async function rejectVerification(uid: string, doctorUid: string, notes?: string): Promise<void> {
    const payload: Record<string, string | boolean | FieldValue> = {
        verified: false,
        verificationStatus: "rejected" satisfies VerificationStatus,
        verifiedBy: doctorUid,
        verifiedAt: new Date().toISOString(),
    };
    if (notes !== undefined) payload.verificationNotes = notes;
    await updateDoc(doc(db, "users", uid), payload);
}

export function statusLabel(status: VerificationStatus): string {
    switch (status) {
        case "verified":
            return "Verified";
        case "pending":
            return "Pending review";
        case "rejected":
            return "Rejected";
        default:
            return "Not verified";
    }
}

export function statusTone(status: VerificationStatus): {
    badge: string;
    dot: string;
    card: string;
    text: string;
    subtext: string;
} {
    switch (status) {
        case "verified":
            return { 
                badge: "bg-white/10 text-white border-white/20", 
                dot: "bg-teal-300", 
                card: "bg-gradient-to-br from-[#008080] to-[#004D4D] text-white shadow-teal-900/20",
                text: "text-white",
                subtext: "text-teal-50/80"
            };
        case "pending":
            return { 
                badge: "bg-white/10 text-white border-white/20", 
                dot: "bg-amber-300", 
                card: "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-amber-900/20",
                text: "text-white",
                subtext: "text-amber-50/80"
            };
        case "rejected":
            return { 
                badge: "bg-white/10 text-white border-white/20", 
                dot: "bg-red-300", 
                card: "bg-gradient-to-br from-red-600 to-red-800 text-white shadow-red-900/20",
                text: "text-white",
                subtext: "text-red-50/80"
            };
        default:
            return { 
                badge: "bg-white/10 text-white border-white/20", 
                dot: "bg-slate-300", 
                card: "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-slate-900/20",
                text: "text-white",
                subtext: "text-slate-50/80"
            };
    }
}
