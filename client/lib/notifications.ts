/**
 * In-app notifications backed by the `notifications` Firestore collection.
 *
 * Notifications are read in real-time via onSnapshot from the bell component
 * and the inbox page. Match fan-out (donor approved -> notify compatible
 * patients, etc.) is done client-side because the project has no backend
 * yet — this is fine while the user count is small; if it grows, move the
 * fan-out into a Cloud Function reading the same shape.
 */

import {
    addDoc,
    collection,
    doc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    Unsubscribe,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { computeMatchPercentage } from "./matching";
import { isVerified } from "./verification";
import { sendPushToUid } from "./push";

export type NotificationType =
    | "match"
    | "verification"
    | "medical_report"
    | "announcement";

export type AppNotification = {
    id: string;
    recipientUid: string;
    recipientRole?: "patient" | "donor" | "doctor" | "admin";
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
    read: boolean;
    createdAt: string;
    createdBy?: string;
    meta?: Record<string, unknown>;
};

type CreateInput = Omit<AppNotification, "id" | "read" | "createdAt"> & {
    createdAt?: string;
};

const COLLECTION = "notifications";

export async function createNotification(input: CreateInput): Promise<string> {
    const payload = {
        ...input,
        read: false,
        createdAt: input.createdAt ?? new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, COLLECTION), payload);
    // Fire push in the background; do not block writes if it fails.
    sendPushToUid(input.recipientUid, {
        title: input.title,
        body: input.body,
        link: input.link,
    }).catch((err) => console.warn("Push delivery failed:", err));
    return ref.id;
}

export function subscribeToNotifications(
    uid: string,
    callback: (items: AppNotification[]) => void,
    max = 30,
): Unsubscribe {
    const q = query(
        collection(db, COLLECTION),
        where("recipientUid", "==", uid),
        orderBy("createdAt", "desc"),
        limit(max),
    );
    return onSnapshot(
        q,
        (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppNotification, "id">) }));
            callback(items);
        },
        (err) => {
            // Most likely cause is the composite index missing — log loudly so the
            // dev sees the auto-create link Firestore prints to the console.
            console.error("Notification subscription error:", err);
        },
    );
}

export async function markRead(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { read: true });
}

export async function markAllRead(uid: string): Promise<void> {
    const q = query(
        collection(db, COLLECTION),
        where("recipientUid", "==", uid),
        where("read", "==", false),
    );
    const snap = await getDocs(q);
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
}

/* ------------------------------------------------------------------ */
/*                       Trigger helpers                              */
/* ------------------------------------------------------------------ */

export async function notifyVerificationDecision(args: {
    uid: string;
    role: "patient" | "donor";
    approved: boolean;
    notes?: string;
    doctorUid: string;
}): Promise<void> {
    const link = `/dashboard/${args.role}/profile`;
    const title = args.approved ? "You're verified" : "Verification declined";
    const body = args.approved
        ? `A doctor approved your account. You can now appear in match results.`
        : `A doctor declined your verification request.${args.notes ? ` Note: ${args.notes}` : ""}`;
    await createNotification({
        recipientUid: args.uid,
        recipientRole: args.role,
        type: "verification",
        title,
        body,
        link,
        createdBy: args.doctorUid,
        meta: { approved: args.approved, notes: args.notes ?? "" },
    });
}

/**
 * Fan out match notifications when a donor or patient becomes eligible.
 * Eligible means verified by a doctor; we then scan the opposite side and
 * write a "new match" entry per compatible counterparty (>=70% score).
 */
export async function notifyMatchFanOut(args: {
    uid: string;
    role: "patient" | "donor";
}): Promise<void> {
    const usersSnap = await getDocs(collection(db, "users"));
    const all = usersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));

    const self = all.find((u) => u.id === args.uid);
    if (!self) return;

    const oppositeRole = args.role === "donor" ? "patient" : "donor";
    const candidates = all.filter(
        (u) => (u as { role?: string }).role === oppositeRole && isVerified(u as Parameters<typeof isVerified>[0]),
    );

    const SCORE_FLOOR = 70;
    const newSelfName = (self as { fullName?: string }).fullName || (args.role === "donor" ? "A new donor" : "A new patient");

    const writes: Promise<unknown>[] = [];
    for (const candidate of candidates) {
        const score = args.role === "donor"
            ? computeMatchPercentage(candidate as never, self as never)
            : computeMatchPercentage(self as never, candidate as never);
        if (score < SCORE_FLOOR) continue;

        const link = `/dashboard/${oppositeRole}/matches`;
        writes.push(
            createNotification({
                recipientUid: candidate.id as string,
                recipientRole: oppositeRole,
                type: "match",
                title: args.role === "donor" ? "New compatible donor" : "New compatible patient",
                body: `${newSelfName} matches with you at ${score}%.`,
                link,
                meta: { counterpartyUid: args.uid, score },
            }),
        );
    }
    await Promise.all(writes);
}

/**
 * When a patient or donor uploads a medical/HLA report, notify every
 * verified doctor so someone can review it. The "assigned doctor" concept
 * doesn't exist yet — broadcasting to verified doctors is the closest
 * approximation.
 */
export async function notifyDoctorsOfReport(args: {
    uid: string;
    uploaderName: string;
    role: "patient" | "donor";
    reportType: "hla" | "medical";
}): Promise<void> {
    const doctorsSnap = await getDocs(
        query(collection(db, "users"), where("role", "==", "doctor")),
    );
    const verifiedDoctors = doctorsSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
        .filter((d) => isVerified(d as Parameters<typeof isVerified>[0]));

    const reportLabel = args.reportType === "hla" ? "HLA report" : "medical report";
    const body = `${args.uploaderName || "A user"} (${args.role}) uploaded a new ${reportLabel}.`;
    const link = "/dashboard/doctor/verifications";

    await Promise.all(
        verifiedDoctors.map((doctor) =>
            createNotification({
                recipientUid: doctor.id,
                recipientRole: "doctor",
                type: "medical_report",
                title: "New report uploaded",
                body,
                link,
                createdBy: args.uid,
                meta: { uploaderUid: args.uid, role: args.role, reportType: args.reportType },
            }),
        ),
    );
}

/**
 * Admin-driven broadcast. `target` is either a single uid or a role to
 * fan out across.
 */
export async function broadcastAnnouncement(args: {
    title: string;
    body: string;
    link?: string;
    actorUid: string;
    target:
        | { kind: "user"; uid: string }
        | { kind: "role"; role: "patient" | "donor" | "doctor" | "all" };
}): Promise<number> {
    let recipients: { id: string; role?: string }[];
    if (args.target.kind === "user") {
        recipients = [{ id: args.target.uid }];
    } else {
        const targetRole = args.target.role;
        const usersSnap = await getDocs(collection(db, "users"));
        const all = usersSnap.docs.map((d) => ({
            id: d.id,
            role: (d.data() as { role?: string }).role,
        }));
        recipients = targetRole === "all"
            ? all.filter((u) => u.role && u.role !== "admin")
            : all.filter((u) => u.role === targetRole);
    }

    await Promise.all(
        recipients.map((r) =>
            createNotification({
                recipientUid: r.id,
                recipientRole: r.role as AppNotification["recipientRole"],
                type: "announcement",
                title: args.title,
                body: args.body,
                link: args.link,
                createdBy: args.actorUid,
            }),
        ),
    );
    return recipients.length;
}
