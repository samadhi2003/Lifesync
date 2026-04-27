/**
 * Compatibility scoring used across the UI.
 *
 * When both sides have HLA typing on file we score the actual histocompatibility
 * with CREG-aware locus comparison (see lib/hla.ts). When one or both sides
 * haven't been HLA-typed yet, we fall back to a deterministic seeded score so
 * the UI stays stable; the caller can read `provisional` to render that as
 * "HLA pending" in the UI.
 */

import { hasHla, HlaScoreResult, HlaTyping, scoreHla } from "./hla";

const ABO_COMPATIBILITY: Record<string, string[]> = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

export function isBloodCompatible(patientBlood?: string, donorBlood?: string): boolean {
    if (!patientBlood || !donorBlood) return false;
    return ABO_COMPATIBILITY[patientBlood]?.includes(donorBlood) ?? false;
}

function hash(input: string): number {
    let h = 0;
    for (let i = 0; i < input.length; i++) {
        h = (h * 31 + input.charCodeAt(i)) >>> 0;
    }
    return h;
}

function seededScore(seed: string, min: number, max: number): number {
    if (!seed) return min;
    const span = max - min + 1;
    return (hash(seed) % span) + min;
}

type Subject = {
    uid?: string;
    id?: string;
    bloodGroup?: string;
    hla?: HlaTyping | null;
} | null | undefined;

export type MatchDetail = {
    score: number;
    provisional: boolean;
    abo: { compatible: boolean; missing: boolean };
    hla: HlaScoreResult;
};

/**
 * Full match detail. Use this when you want the per-locus breakdown.
 */
export function computeMatch(patient: Subject, donor: Subject): MatchDetail {
    const patientBlood = patient?.bloodGroup;
    const donorBlood = donor?.bloodGroup;
    const aboMissing = !patientBlood || !donorBlood;
    const aboCompatible = !aboMissing && isBloodCompatible(patientBlood, donorBlood);

    const hla = scoreHla(patient?.hla, donor?.hla);

    if (!aboMissing && !aboCompatible) {
        // ABO incompatible — hard fail. Cap below the "compatible" floor so
        // these always sort to the bottom of any list.
        return {
            score: Math.min(hla.bothSidesHaveData ? hla.score : 30, 30),
            provisional: !hla.bothSidesHaveData,
            abo: { compatible: false, missing: false },
            hla,
        };
    }

    if (hla.bothSidesHaveData) {
        return {
            score: hla.score,
            provisional: false,
            abo: { compatible: aboCompatible, missing: aboMissing },
            hla,
        };
    }

    // Fallback: deterministic seeded score in [60, 99] so the UI is usable
    // before users get HLA-typed by their referring doctors.
    const patientId = patient?.uid || patient?.id || "";
    const donorId = donor?.uid || donor?.id || "";
    const seed = `${patientId}:${donorId}` || donorId || patientId;
    return {
        score: seededScore(seed, 60, 99),
        provisional: true,
        abo: { compatible: aboCompatible, missing: aboMissing },
        hla,
    };
}

/**
 * Backwards-compatible numeric percentage used by existing match cards.
 */
export function computeMatchPercentage(patient: Subject, donor: Subject): number {
    return computeMatch(patient, donor).score;
}

export function hasHlaTyping(user: Subject): boolean {
    return hasHla(user?.hla);
}

export function selfMatchPercentage(user: Subject): number {
    const seed = user?.uid || user?.id || "";
    return seededScore(seed, 60, 99);
}

export function matchLabel(match: number): string {
    if (match >= 80) return "Elite";
    if (match >= 60) return "Strong";
    if (match >= 40) return "Moderate";
    return "Low";
}

export function matchLevel(match: number): "High" | "Medium" | "Low" {
    if (match >= 80) return "High";
    if (match >= 60) return "Medium";
    return "Low";
}
