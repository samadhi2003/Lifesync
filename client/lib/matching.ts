/**
 * Deterministic compatibility calculation used across the UI.
 *
 * We do not yet have the Flask HLA matching service connected, so
 * match percentages are derived from a stable hash of the donor/patient
 * pair so that the same two users always see the same number.
 *
 * When the real ML endpoint is wired in, replace this with a call that
 * consumes HLA data and returns a genuine compatibility score.
 */

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

/**
 * Returns a stable score in [min, max] for the given seed.
 */
function seededScore(seed: string, min: number, max: number): number {
    if (!seed) return min;
    const span = max - min + 1;
    return (hash(seed) % span) + min;
}

/**
 * Compatibility score 0-100 between a patient and a donor.
 * Incompatible blood groups cap the score low; otherwise we return a
 * deterministic value so the UI stays stable across renders.
 */
export function computeMatchPercentage(
    patient: { uid?: string; id?: string; bloodGroup?: string } | null | undefined,
    donor: { uid?: string; id?: string; bloodGroup?: string } | null | undefined,
): number {
    const patientId = patient?.uid || patient?.id || "";
    const donorId = donor?.uid || donor?.id || "";
    const seed = `${patientId}:${donorId}`;

    if (patient?.bloodGroup && donor?.bloodGroup) {
        if (!isBloodCompatible(patient.bloodGroup, donor.bloodGroup)) {
            return seededScore(seed || donorId || patientId, 20, 45);
        }
    }

    return seededScore(seed || donorId || patientId, 60, 99);
}

/**
 * Score for a single user when no counterpart is available (e.g. donor
 * browsing their own match list before accepting). Produces a stable
 * number in the 60-99 range.
 */
export function selfMatchPercentage(user: { uid?: string; id?: string } | null | undefined): number {
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
