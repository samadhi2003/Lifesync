/* global importScripts, firebase, self, clients */

// Firebase Cloud Messaging service worker.
// Registered by client/lib/push.ts with the Firebase web config passed in
// via query params so we don't have to bundle env vars into the SW.

importScripts("https://www.gstatic.com/firebasejs/11.3.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.3.1/firebase-messaging-compat.js");

const url = new URL(self.location.href);
const firebaseConfig = {
    apiKey: url.searchParams.get("apiKey"),
    authDomain: url.searchParams.get("authDomain"),
    projectId: url.searchParams.get("projectId"),
    storageBucket: url.searchParams.get("storageBucket"),
    messagingSenderId: url.searchParams.get("messagingSenderId"),
    appId: url.searchParams.get("appId"),
};

if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        const title = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || "LifeSync";
        const body = (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || "";
        const link = (payload.data && payload.data.link) || "/";
        self.registration.showNotification(title, {
            body,
            icon: "/logo.png",
            data: { link },
        });
    });
}

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const link = (event.notification.data && event.notification.data.link) || "/";
    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
            for (const win of wins) {
                if ("focus" in win) {
                    win.focus();
                    if ("navigate" in win) win.navigate(link);
                    return;
                }
            }
            if (clients.openWindow) return clients.openWindow(link);
        }),
    );
});
