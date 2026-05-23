"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";

type Status = "checking" | "unauthenticated" | "forbidden" | "ok";

export type AdminProfile = {
    uid: string;
    fullName: string;
    email: string;
    photoURL?: string;
};

export default function AdminGuard({ children, onReady }: { children: React.ReactNode; onReady?: (profile: AdminProfile) => void }) {
    const router = useRouter();
    const [status, setStatus] = useState<Status>("checking");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setStatus("unauthenticated");
                return;
            }

            try {
                const snap = await getDoc(doc(db, "users", user.uid));
                const role = snap.exists() ? (snap.data() as Record<string, unknown>).role : null;
                if (role === "admin") {
                    const data = snap.data() as Record<string, unknown>;
                    onReady?.({
                        uid: user.uid,
                        fullName: (data.fullName as string) || user.displayName || "Administrator",
                        email: (data.email as string) || user.email || "",
                        photoURL: data.photoURL as string | undefined,
                    });
                    setStatus("ok");
                } else {
                    setStatus("forbidden");
                }
            } catch (err) {
                console.error("Admin guard error:", err);
                setStatus("forbidden");
            }
        });

        return () => unsubscribe();
    }, [onReady]);

    if (status === "checking") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#008080] mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Verifying administrator access…</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
                <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-10 text-center">
                    <h1 className="text-2xl font-black text-gray-900 mb-3">Administrator sign-in required</h1>
                    <p className="text-gray-500 mb-8 text-sm">You need to be signed in with an admin account to access this area.</p>
                    <Link href="/login/sign-in" className="inline-block w-full py-3 bg-[#008080] hover:bg-[#006967] text-white font-bold rounded-xl transition-all">
                        Go to sign-in
                    </Link>
                </div>
            </div>
        );
    }

    if (status === "forbidden") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
                <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-10 text-center">
                    <h1 className="text-2xl font-black text-gray-900 mb-3">Access denied</h1>
                    <p className="text-gray-500 mb-6 text-sm">
                        Your account does not have administrator privileges. If no admin exists yet, you can bootstrap
                        one at <Link href="/admin-setup" className="font-bold text-[#008080] underline">/admin-setup</Link>.
                    </p>
                    <div className="flex gap-3">
                        <Link href="/" className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl transition-all hover:bg-slate-200">
                            Home
                        </Link>
                        <button
                            onClick={async () => {
                                await signOut(auth);
                                router.push("/login/sign-in");
                            }}
                            className="flex-1 py-3 bg-[#008080] hover:bg-[#006967] text-white font-bold rounded-xl transition-all"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
