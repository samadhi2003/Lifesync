/**
 * Browser push via Firebase Cloud Messaging.
 *
 * The bell component calls `enablePush(uid)` after the user opts in. We save
 * the FCM token in `pushTokens/{uid}` so future deliveries can look them up
 * by uid. Foreground messages are surfaced via the in-app event hook;
 * background messages are handled by `public/firebase-messaging-sw.js`.
 *
 * Note: actual push delivery requires a server holding the FCM server key.
 * `sendPushToUid` here is a no-op placeholder that logs intent — wire it to
 * a Cloud Function or HTTPS endpoint when the backend lands.
 */

import { arrayUnion, arrayRemove, doc, getDoc, setDoc } from "firebase/firestore";
import { db, app } from "./firebase";

type Messaging = import("firebase/messaging").Messaging;

let cachedMessaging: Messaging | null = null;

async function getMessagingIfSupported(): Promise<Messaging | null> {
    if (typeof window === "undefined") return null;
    if (cachedMessaging) return cachedMessaging;
    try {
        const { getMessaging, isSupported } = await import("firebase/messaging");
        if (!(await isSupported())) return null;
        cachedMessaging = getMessaging(app);
        return cachedMessaging;
    } catch (err) {
        console.warn("Messaging unavailable:", err);
        return null;
    }
}

export async function isPushSupported(): Promise<boolean> {
    return (await getMessagingIfSupported()) !== null;
}

export async function getPushPermissionState(): Promise<NotificationPermission | "unsupported"> {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    return Notification.permission;
}

async function registerSwWithConfig(): Promise<ServiceWorkerRegistration | null> {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;

    // Pass the Firebase config to the SW via query params so it can boot
    // without bundling the env vars itself.
    const params = new URLSearchParams({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    });
    const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params.toString()}`, {
        scope: "/firebase-cloud-messaging-push-scope",
    });

    // FCM's getToken() will call PushManager.subscribe(), which needs an
    // *active* worker. register() resolves as soon as the SW is registered,
    // possibly still in `installing` state — wait until it's active.
    if (!registration.active) {
        await new Promise<void>((resolve) => {
            const sw = registration.installing || registration.waiting;
            if (!sw) {
                resolve();
                return;
            }
            const onState = () => {
                if (sw.state === "activated") {
                    sw.removeEventListener("statechange", onState);
                    resolve();
                }
            };
            sw.addEventListener("statechange", onState);
        });
    }

    return registration;
}

export async function enablePush(uid: string): Promise<{ ok: boolean; reason?: string; token?: string }> {
    const messaging = await getMessagingIfSupported();
    if (!messaging) return { ok: false, reason: "Push is not supported in this browser." };

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
        return {
            ok: false,
            reason: "Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY — add it from Firebase console > Cloud Messaging > Web push certificates.",
        };
    }

    if ("Notification" in window && Notification.permission === "default") {
        const result = await Notification.requestPermission();
        if (result !== "granted") return { ok: false, reason: "Browser permission was not granted." };
    } else if ("Notification" in window && Notification.permission !== "granted") {
        return { ok: false, reason: "Browser notifications are blocked for this site." };
    }

    try {
        const swRegistration = await registerSwWithConfig();
        const { getToken, onMessage } = await import("firebase/messaging");
        const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: swRegistration ?? undefined,
        });
        if (!token) return { ok: false, reason: "Could not obtain a push token." };

        await setDoc(
            doc(db, "pushTokens", uid),
            { tokens: arrayUnion(token), updatedAt: new Date().toISOString() },
            { merge: true },
        );

        // Foreground listener — show a tiny native notification so the user
        // sees the message even when they're already on the site.
        onMessage(messaging, (payload) => {
            const title = payload.notification?.title || payload.data?.title || "Notification";
            const body = payload.notification?.body || payload.data?.body || "";
            try {
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(title, { body });
                }
            } catch (err) {
                console.warn("Failed to surface foreground notification:", err);
            }
        });

        return { ok: true, token };
    } catch (err) {
        console.error("enablePush error:", err);
        return { ok: false, reason: (err as Error).message || "Unknown error." };
    }
}

export async function disablePush(uid: string): Promise<void> {
    const messaging = await getMessagingIfSupported();
    if (!messaging) return;
    try {
        const { getToken, deleteToken } = await import("firebase/messaging");
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) return;
        const token = await getToken(messaging, { vapidKey });
        if (token) {
            await deleteToken(messaging);
            await setDoc(
                doc(db, "pushTokens", uid),
                { tokens: arrayRemove(token), updatedAt: new Date().toISOString() },
                { merge: true },
            );
        }
    } catch (err) {
        console.warn("disablePush error:", err);
    }
}

/**
 * Placeholder: real push delivery needs a server holding the FCM server key
 * (Cloud Function, Netlify Function, or any backend). We read the saved
 * tokens here so the integration point is obvious — replace the fetch URL
 * with your endpoint when it lands. Until then this no-ops gracefully.
 */
export async function sendPushToUid(
    uid: string,
    payload: { title: string; body: string; link?: string },
): Promise<void> {
    const endpoint = process.env.NEXT_PUBLIC_PUSH_ENDPOINT;
    if (!endpoint) return; // soft-fail; in-app inbox still works

    try {
        const tokenDoc = await getDoc(doc(db, "pushTokens", uid));
        const tokens: string[] = (tokenDoc.data()?.tokens as string[]) || [];
        if (tokens.length === 0) return;

        await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tokens, ...payload }),
        });
    } catch (err) {
        console.warn("sendPushToUid failed:", err);
    }
}
