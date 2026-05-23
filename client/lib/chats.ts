/**
 * Direct messaging between a patient and a donor after a request is accepted.
 *
 * Stored as `chats/{chatId}/messages/{msgId}` where `chatId = ${patientUid}_${donorUid}`
 * (same shape as the `requests` collection key, so a chat trivially maps to a
 * connection). Messages are append-only documents; reads use onSnapshot for
 * real-time delivery.
 *
 * The client only opens the chat panel once `requests/{chatId}.status === "accepted"`,
 * so unauthorized chat creation is gated at the UI layer. Production
 * deployments should mirror that in firestore.rules.
 */

import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { requestId } from "./requests";
import { createNotification } from "./notifications";

export type ChatMessage = {
    id: string;
    senderUid: string;
    text: string;
    createdAt: string;
};

export function chatId(patientUid: string, donorUid: string): string {
    return requestId(patientUid, donorUid);
}

export function subscribeChatMessages(
    chatId: string,
    callback: (items: ChatMessage[]) => void,
): Unsubscribe {
    const q = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "asc"),
    );
    return onSnapshot(
        q,
        (snap) => {
            const items = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<ChatMessage, "id">),
            }));
            callback(items);
        },
        (err) => console.error("Chat subscription error:", err),
    );
}

export async function sendChatMessage(args: {
    chatId: string;
    senderUid: string;
    senderName?: string;
    recipientUid: string;
    recipientRole: "patient" | "donor";
    text: string;
}): Promise<void> {
    const text = args.text.trim();
    if (!text) return;
    await addDoc(collection(db, "chats", args.chatId, "messages"), {
        senderUid: args.senderUid,
        text,
        createdAt: new Date().toISOString(),
    });

    // Background notification for the partner — failures shouldn't block sending.
    createNotification({
        recipientUid: args.recipientUid,
        recipientRole: args.recipientRole,
        type: "announcement",
        title: "New message",
        body: `${args.senderName || "Your match"}: ${text.slice(0, 80)}${text.length > 80 ? "…" : ""}`,
        link: `/dashboard/${args.recipientRole}/matches`,
        createdBy: args.senderUid,
        meta: { chatId: args.chatId },
    }).catch((err) => console.warn("Chat notification failed:", err));
}
