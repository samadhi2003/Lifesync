/**
 * Patient -> Donor request workflow.
 *
 * A patient sends a request to a donor from the matches grid. The donor sees
 * pending requests on their home page and can Accept (which moves the
 * patient onto the donor's accepted list) or Ignore (which dismisses it).
 *
 * Stored in the top-level `requests` collection with deterministic doc id
 * `${patientUid}_${donorUid}` so re-clicking is idempotent.
 */

import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    query,
    setDoc,
    Unsubscribe,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebase";
import { createNotification } from "./notifications";

export type RequestStatus = "pending" | "accepted" | "ignored";

export type ConnectionRequest = {
    id: string;
    patientUid: string;
    donorUid: string;
    patientName?: string;
    donorName?: string;
    patientBloodGroup?: string;
    patientUrgency?: string;
    patientLocation?: string;
    score?: number;
    status: RequestStatus;
    createdAt: string;
    updatedAt: string;
};

const COLLECTION = "requests";

export function requestId(patientUid: string, donorUid: string): string {
    return `${patientUid}_${donorUid}`;
}

export async function getRequestForPair(
    patientUid: string,
    donorUid: string,
): Promise<ConnectionRequest | null> {
    const snap = await getDoc(doc(db, COLLECTION, requestId(patientUid, donorUid)));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<ConnectionRequest, "id">) };
}

export async function createRequest(args: {
    patientUid: string;
    donorUid: string;
    patientName?: string;
    donorName?: string;
    patientBloodGroup?: string;
    patientUrgency?: string;
    patientLocation?: string;
    score?: number;
}): Promise<void> {
    const id = requestId(args.patientUid, args.donorUid);
    const now = new Date().toISOString();
    await setDoc(
        doc(db, COLLECTION, id),
        {
            patientUid: args.patientUid,
            donorUid: args.donorUid,
            patientName: args.patientName ?? null,
            donorName: args.donorName ?? null,
            patientBloodGroup: args.patientBloodGroup ?? null,
            patientUrgency: args.patientUrgency ?? null,
            patientLocation: args.patientLocation ?? null,
            score: args.score ?? null,
            status: "pending" satisfies RequestStatus,
            createdAt: now,
            updatedAt: now,
        },
        { merge: true },
    );

    await createNotification({
        recipientUid: args.donorUid,
        recipientRole: "donor",
        type: "match",
        title: "New patient request",
        body: `${args.patientName || "A patient"} requested to connect with you${
            typeof args.score === "number" ? ` (${args.score}% match)` : ""
        }.`,
        link: `/dashboard/donor/matches/${args.patientUid}`,
        createdBy: args.patientUid,
        meta: { requestId: id, counterpartyUid: args.patientUid },
    }).catch((err) => console.warn("notify donor failed:", err));
}

export async function acceptRequest(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
        status: "accepted" satisfies RequestStatus,
        updatedAt: new Date().toISOString(),
    });

    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return;
    const data = snap.data() as Omit<ConnectionRequest, "id">;
    await createNotification({
        recipientUid: data.patientUid,
        recipientRole: "patient",
        type: "match",
        title: "Request accepted",
        body: `${data.donorName || "A donor"} accepted your request. You can now reach out.`,
        link: `/dashboard/patient/matches/${data.donorUid}`,
        createdBy: data.donorUid,
        meta: { requestId: id, counterpartyUid: data.donorUid },
    }).catch((err) => console.warn("notify patient failed:", err));
}

export async function ignoreRequest(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
        status: "ignored" satisfies RequestStatus,
        updatedAt: new Date().toISOString(),
    });
}

/**
 * Real-time stream of requests addressed to this donor, optionally
 * filtered by status. Pending → donor home. Accepted → donor matches.
 */
export function subscribeRequestsForDonor(
    donorUid: string,
    status: RequestStatus | "all",
    callback: (items: ConnectionRequest[]) => void,
): Unsubscribe {
    const constraints = [where("donorUid", "==", donorUid)];
    if (status !== "all") constraints.push(where("status", "==", status));
    const q = query(collection(db, COLLECTION), ...constraints);
    return onSnapshot(
        q,
        (snap) => {
            const items = snap.docs
                .map((d) => ({ id: d.id, ...(d.data() as Omit<ConnectionRequest, "id">) }))
                .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
            callback(items);
        },
        (err) => console.error("Donor requests subscription error:", err),
    );
}

/**
 * Real-time stream of requests this patient has sent.
 */
export function subscribeRequestsForPatient(
    patientUid: string,
    callback: (items: ConnectionRequest[]) => void,
): Unsubscribe {
    const q = query(collection(db, COLLECTION), where("patientUid", "==", patientUid));
    return onSnapshot(
        q,
        (snap) => {
            const items = snap.docs
                .map((d) => ({ id: d.id, ...(d.data() as Omit<ConnectionRequest, "id">) }))
                .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
            callback(items);
        },
        (err) => console.error("Patient requests subscription error:", err),
    );
}

