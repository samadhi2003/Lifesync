/**
 * HLA typing model and CREG-aware match scoring.
 *
 * Source references:
 *  - WHO Nomenclature Committee for Factors of the HLA System
 *  - Rodey CREG (cross-reactive epitope group) tables for HLA-A and HLA-B
 *  - UNOS / OPTN kidney allocation policy on 6-antigen matching
 *  - Eurotransplant ETKAS scoring weights
 *
 * Two people inherit two alleles per locus. For a donor → patient match we
 * count how many donor alleles the patient does NOT carry (mismatches), at
 * each locus. Lower is better. Class II (DRB1) carries the heaviest weight
 * for long-term graft survival, with class I (A, B) following.
 *
 * CREG handling: alleles within the same broad serological group (e.g. A23
 * and A24 are both A9) are immunologically similar and count as a partial
 * (half-credit) match instead of a full mismatch — matching Sri Lankan and
 * Eurotransplant lab report conventions.
 */

export type Locus =
    | "A"
    | "B"
    | "C"
    | "DRB1"
    | "DRB345"
    | "DQA1"
    | "DQB1"
    | "DPA1"
    | "DPB1";

export const LOCI: Locus[] = [
    "A",
    "B",
    "C",
    "DRB1",
    "DRB345",
    "DQA1",
    "DQB1",
    "DPA1",
    "DPB1",
];

export type AllelePair = [string, string];

export type HlaTyping = {
    A?: AllelePair;
    B?: AllelePair;
    C?: AllelePair;
    DRB1?: AllelePair;
    DRB345?: AllelePair;
    DQA1?: AllelePair;
    DQB1?: AllelePair;
    DPA1?: AllelePair;
    DPB1?: AllelePair;
    enteredBy?: string;
    enteredByRole?: "patient" | "donor" | "doctor" | "admin";
    enteredAt?: string;
    labReference?: string;
    reportURL?: string;
};

export type LocusResult = {
    fullMatches: number; // 0-2
    crossReactive: number; // 0-2
    mismatches: number; // 0-2
    donorNullCount: number;
};

export type HlaScoreResult = {
    hasData: boolean;
    bothSidesHaveData: boolean;
    perLocus: Partial<Record<Locus, LocusResult>>;
    totalFullMatches: number;
    totalCrossReactive: number;
    totalMismatches: number;
    sixAntigenMatches: number; // matches across A + B + DRB1 (max 6)
    isZeroMismatch: boolean;
    score: number; // 0-100
};

/* -------------------------------------------------------------------------- */
/* Allele normalization                                                       */
/* -------------------------------------------------------------------------- */

export function isNullAllele(allele: string): boolean {
    if (!allele) return false;
    return /\(\s*[NQLS]\s*\)/i.test(allele);
}

/**
 * Reduces an allele string to its lowest-resolution numeric token so that
 * a serological "31" matches a high-res "31:01" entered by a different
 * doctor. Strips locus prefixes ("A*"), null markers, and resolution
 * suffixes — keeps only the broadest field.
 */
export function normalizeAllele(allele: string): string {
    if (!allele) return "";
    let s = allele.trim();
    // strip null/expression markers
    s = s.replace(/\(\s*[NQLS]\s*\)/gi, "");
    // strip locus prefix like "A*", "B*", "DRB1*"
    s = s.replace(/^[A-Z]+\d*\*?/i, "");
    // keep only the first colon-separated field
    if (s.includes(":")) s = s.split(":")[0];
    // strip any trailing non-digits
    s = s.replace(/[^0-9]/g, "");
    // pad single digits so "1" and "01" compare equal
    if (/^\d+$/.test(s)) s = String(parseInt(s, 10));
    return s;
}

/* -------------------------------------------------------------------------- */
/* CREG (cross-reactive group) tables                                         */
/* -------------------------------------------------------------------------- */

/**
 * Maps each split serological antigen to the broad CREG it belongs to.
 * Two alleles that share any broad code are cross-reactive.
 *
 * Sourced from the WHO HLA Nomenclature broad/split table and the
 * commonly used Rodey CREG groupings for HLA-A and HLA-B.
 */
const CREG: Partial<Record<Locus, Record<string, string[]>>> = {
    A: {
        // A9 broad
        "23": ["A9"],
        "24": ["A9"],
        // A10 broad
        "25": ["A10"],
        "26": ["A10"],
        "34": ["A10"],
        "66": ["A10"],
        // A19 broad
        "29": ["A19"],
        "30": ["A19"],
        "31": ["A19"],
        "32": ["A19"],
        "33": ["A19"],
        "74": ["A19"],
        // A28 broad
        "68": ["A28"],
        "69": ["A28"],
    },
    B: {
        // B5 broad
        "51": ["B5"],
        "52": ["B5"],
        // B12 broad
        "44": ["B12"],
        "45": ["B12"],
        // B14 broad
        "64": ["B14"],
        "65": ["B14"],
        // B15 broad
        "62": ["B15"],
        "63": ["B15"],
        "75": ["B15"],
        "76": ["B15"],
        "77": ["B15"],
        // B16 broad
        "38": ["B16"],
        "39": ["B16"],
        // B17 broad
        "57": ["B17"],
        "58": ["B17"],
        // B21 broad
        "49": ["B21"],
        "50": ["B21"],
        // B22 broad
        "54": ["B22"],
        "55": ["B22"],
        "56": ["B22"],
        // B40 broad
        "60": ["B40"],
        "61": ["B40"],
        // B70 broad
        "71": ["B70"],
        "72": ["B70"],
    },
    DRB1: {
        // DR2 broad
        "15": ["DR2"],
        "16": ["DR2"],
        // DR3 broad
        "17": ["DR3"],
        "18": ["DR3"],
        // DR5 broad
        "11": ["DR5"],
        "12": ["DR5"],
        // DR6 broad
        "13": ["DR6"],
        "14": ["DR6"],
    },
};

function broadCodes(allele: string, locus: Locus): string[] {
    const norm = normalizeAllele(allele);
    if (!norm) return [];
    const table = CREG[locus];
    if (!table) return [];
    return table[norm] || [];
}

function shareCREG(a: string, b: string, locus: Locus): boolean {
    const ba = broadCodes(a, locus);
    const bb = broadCodes(b, locus);
    if (ba.length === 0 || bb.length === 0) return false;
    return ba.some((code) => bb.includes(code));
}

/* -------------------------------------------------------------------------- */
/* Per-locus comparison                                                       */
/* -------------------------------------------------------------------------- */

export function compareLocus(
    patient: AllelePair | undefined,
    donor: AllelePair | undefined,
    locus: Locus,
): LocusResult {
    const result: LocusResult = {
        fullMatches: 0,
        crossReactive: 0,
        mismatches: 0,
        donorNullCount: 0,
    };
    if (!patient || !donor) return result;

    const patientNormalized = patient.map(normalizeAllele).filter(Boolean);
    if (patientNormalized.length === 0) return result;

    for (const donorAllele of donor) {
        if (!donorAllele) continue;
        if (isNullAllele(donorAllele)) {
            result.donorNullCount += 1;
            continue;
        }
        const donorNorm = normalizeAllele(donorAllele);
        if (!donorNorm) continue;

        if (patientNormalized.includes(donorNorm)) {
            result.fullMatches += 1;
            continue;
        }

        const crossReactive = patient.some((p) => p && shareCREG(p, donorAllele, locus));
        if (crossReactive) {
            result.crossReactive += 1;
        } else {
            result.mismatches += 1;
        }
    }

    return result;
}

/* -------------------------------------------------------------------------- */
/* Scoring                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Per-locus weight when both alleles fully match (cross-reactive = half).
 * Matches the clinical emphasis: DRB1 (class II) is the strongest predictor
 * of graft survival; A and B follow; minor loci contribute small bonuses.
 *
 * Total of expressed loci = 100 when every weighted locus has data.
 */
const LOCUS_WEIGHT: Record<Locus, number> = {
    DRB1: 30,
    A: 20,
    B: 20,
    DQB1: 15,
    C: 10,
    DRB345: 2,
    DQA1: 1,
    DPA1: 1,
    DPB1: 1,
};

function hasAnyAllele(pair: AllelePair | undefined): boolean {
    return !!pair && pair.some((a) => !!normalizeAllele(a || ""));
}

function pairsBothPresent(
    patientPair: AllelePair | undefined,
    donorPair: AllelePair | undefined,
): boolean {
    return hasAnyAllele(patientPair) && hasAnyAllele(donorPair);
}

export function hasHla(typing: HlaTyping | null | undefined): boolean {
    if (!typing) return false;
    return LOCI.some((locus) => hasAnyAllele(typing[locus]));
}

export function scoreHla(
    patient: HlaTyping | null | undefined,
    donor: HlaTyping | null | undefined,
): HlaScoreResult {
    const empty: HlaScoreResult = {
        hasData: false,
        bothSidesHaveData: false,
        perLocus: {},
        totalFullMatches: 0,
        totalCrossReactive: 0,
        totalMismatches: 0,
        sixAntigenMatches: 0,
        isZeroMismatch: false,
        score: 0,
    };

    const patientHasData = hasHla(patient);
    const donorHasData = hasHla(donor);
    if (!patientHasData && !donorHasData) return empty;

    const result: HlaScoreResult = {
        ...empty,
        hasData: patientHasData || donorHasData,
        bothSidesHaveData: patientHasData && donorHasData,
    };

    if (!result.bothSidesHaveData) return result;

    let achieved = 0;
    let possible = 0;

    for (const locus of LOCI) {
        const patientPair = patient?.[locus];
        const donorPair = donor?.[locus];
        if (!pairsBothPresent(patientPair, donorPair)) continue;

        const cmp = compareLocus(patientPair, donorPair, locus);
        result.perLocus[locus] = cmp;

        result.totalFullMatches += cmp.fullMatches;
        result.totalCrossReactive += cmp.crossReactive;
        result.totalMismatches += cmp.mismatches;

        // expected pairs to match against (excluding donor null alleles)
        const expressed = 2 - cmp.donorNullCount;
        if (expressed <= 0) continue;

        const weight = LOCUS_WEIGHT[locus];
        const fraction =
            (cmp.fullMatches + 0.5 * cmp.crossReactive) / expressed;
        achieved += weight * fraction;
        possible += weight;
    }

    if (locusFullyScored(result, "A") && locusFullyScored(result, "B") && locusFullyScored(result, "DRB1")) {
        const ab = result.perLocus.A!;
        const bb = result.perLocus.B!;
        const dr = result.perLocus.DRB1!;
        result.sixAntigenMatches = ab.fullMatches + bb.fullMatches + dr.fullMatches;
        result.isZeroMismatch =
            ab.mismatches === 0 &&
            ab.crossReactive === 0 &&
            bb.mismatches === 0 &&
            bb.crossReactive === 0 &&
            dr.mismatches === 0 &&
            dr.crossReactive === 0;
    }

    result.score = possible > 0 ? Math.round((achieved / possible) * 100) : 0;
    return result;
}

function locusFullyScored(result: HlaScoreResult, locus: Locus): boolean {
    return !!result.perLocus[locus];
}

/* -------------------------------------------------------------------------- */
/* Display helpers                                                            */
/* -------------------------------------------------------------------------- */

export function summarizeHla(result: HlaScoreResult): string {
    if (!result.hasData) return "No HLA on file";
    if (!result.bothSidesHaveData) return "HLA pending";
    const parts: string[] = [];
    if (result.isZeroMismatch) parts.push("Zero mismatch");
    parts.push(`${result.sixAntigenMatches}/6 antigen match`);
    if (result.totalCrossReactive > 0) parts.push(`${result.totalCrossReactive} cross-reactive`);
    if (result.totalMismatches > 0) parts.push(`${result.totalMismatches} mismatch${result.totalMismatches > 1 ? "es" : ""}`);
    return parts.join(" · ");
}

export const LOCUS_LABEL: Record<Locus, string> = {
    A: "HLA-A",
    B: "HLA-B",
    C: "HLA-C",
    DRB1: "HLA-DRB1",
    DRB345: "HLA-DRB3/4/5",
    DQA1: "HLA-DQA1",
    DQB1: "HLA-DQB1",
    DPA1: "HLA-DPA1",
    DPB1: "HLA-DPB1",
};

/* -------------------------------------------------------------------------- */
/* Sanitization                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Strip empty pairs and undefined keys before writing to Firestore — Firestore
 * rejects undefined values and we'd rather not store empty `["",""]` arrays.
 */
export function pruneTyping(typing: HlaTyping): HlaTyping {
    const out: HlaTyping = {};
    for (const locus of LOCI) {
        const pair = typing[locus];
        if (!pair) continue;
        const [a = "", b = ""] = pair;
        if (a.trim() || b.trim()) {
            out[locus] = [a.trim(), b.trim()];
        }
    }
    if (typing.enteredBy) out.enteredBy = typing.enteredBy;
    if (typing.enteredByRole) out.enteredByRole = typing.enteredByRole;
    if (typing.enteredAt) out.enteredAt = typing.enteredAt;
    if (typing.labReference) out.labReference = typing.labReference.trim();
    if (typing.reportURL) out.reportURL = typing.reportURL;
    return out;
}
