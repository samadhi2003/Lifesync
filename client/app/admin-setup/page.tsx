"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type State =
    | { kind: "checking" }
    | { kind: "sealed"; adminName?: string }
    | { kind: "needs-signin" }
    | { kind: "ready"; uid: string; email: string; fullName: string }
    | { kind: "promoted" };

export default function AdminSetupPage() {
    const router = useRouter();
    const [state, setState] = useState<State>({ kind: "checking" });
    const [working, setWorking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setError(null);
            try {
                const existing = await getDocs(
                    query(collection(db, "users"), where("role", "==", "admin"), limit(1))
                );
                if (!existing.empty) {
                    const data = existing.docs[0].data() as Record<string, string>;
                    setState({ kind: "sealed", adminName: data.fullName || data.email });
                    return;
                }

                if (!user) {
                    setState({ kind: "needs-signin" });
                    return;
                }

                const mySnap = await getDoc(doc(db, "users", user.uid));
                const myData = mySnap.exists() ? (mySnap.data() as Record<string, string>) : {};
                setState({
                    kind: "ready",
                    uid: user.uid,
                    email: myData.email || user.email || "",
                    fullName: myData.fullName || user.displayName || "",
                });
            } catch (err) {
                console.error("Admin setup check failed:", err);
                setError("Failed to check admin status. Check your Firestore rules and try again.");
            }
        });
        return () => unsubscribe();
    }, []);

    const promoteSelf = async () => {
        if (state.kind !== "ready") return;
        setWorking(true);
        setError(null);
        try {
            // Re-verify no admin slipped in between page load and button click.
            const existing = await getDocs(
                query(collection(db, "users"), where("role", "==", "admin"), limit(1)),
            );
            if (!existing.empty) {
                setState({ kind: "sealed" });
                return;
            }

            const mySnap = await getDoc(doc(db, "users", state.uid));
            if (mySnap.exists()) {
                await updateDoc(doc(db, "users", state.uid), { role: "admin", verified: true });
            } else {
                await setDoc(doc(db, "users", state.uid), {
                    email: state.email,
                    fullName: state.fullName,
                    role: "admin",
                    verified: true,
                    createdAt: new Date().toISOString(),
                });
            }
            setState({ kind: "promoted" });
            setTimeout(() => router.push("/admin"), 1200);
        } catch (err) {
            console.error("Promote failed:", err);
            setError("Failed to promote account. Try again or set the role manually in Firebase.");
        } finally {
            setWorking(false);
        }
    };

    const signOutAndReset = async () => {
        await signOut(auth);
        router.push("/login/sign-in?redirect=/admin-setup");
    };

    return (
        <div className="min-h-screen bg-[#E6F7F8] flex items-center justify-center px-6 py-12 font-sans">
            <div className="max-w-xl w-full bg-white rounded-[2rem] border border-white/50 shadow-xl p-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#008080] mb-3">LifeSync Admin Setup</p>
                <h1 className="text-3xl font-black text-gray-900 mb-3">First-admin bootstrap</h1>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    This page promotes one account to <span className="font-bold text-[#008080]">admin</span>. It only
                    works while no admin exists on LifeSync. Once an admin is in place, further admins must be assigned
                    from the Users page inside the console.
                </p>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-sm font-semibold">
                        {error}
                    </div>
                )}

                {state.kind === "checking" && (
                    <div className="flex items-center gap-3 text-slate-500">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#008080]"></div>
                        <span className="text-sm font-medium">Checking for an existing admin…</span>
                    </div>
                )}

                {state.kind === "sealed" && (
                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 text-sm">
                            An administrator already exists
                            {state.adminName ? <> (<span className="font-bold">{state.adminName}</span>)</> : ""}.
                            This setup page is now locked.
                        </div>
                        <Link
                            href="/login/sign-in"
                            className="block text-center w-full py-3 bg-[#008080] hover:bg-[#006967] text-white font-bold rounded-xl transition-all"
                        >
                            Go to sign-in
                        </Link>
                    </div>
                )}

                {state.kind === "needs-signin" && (
                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 text-sm">
                            No admin exists yet. Sign in with the account you want to promote, then come back to this page.
                            Don&apos;t have an account? <Link href="/register" className="font-bold underline">Register first</Link>.
                        </div>
                        <Link
                            href="/login/sign-in?redirect=/admin-setup"
                            className="block text-center w-full py-3 bg-[#008080] hover:bg-[#006967] text-white font-bold rounded-xl transition-all"
                        >
                            Sign in
                        </Link>
                    </div>
                )}

                {state.kind === "ready" && (
                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-teal-50 border border-teal-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-teal-700 mb-2">Signed in as</p>
                            <p className="font-bold text-[#1A1C1E]">{state.fullName || "(no name on file)"}</p>
                            <p className="text-xs text-slate-500">{state.email || "(no email)"}</p>
                        </div>
                        <button
                            onClick={promoteSelf}
                            disabled={working}
                            className="w-full py-4 bg-[#008080] hover:bg-[#006967] text-white font-bold rounded-xl transition-all disabled:opacity-60"
                        >
                            {working ? "Promoting…" : "Promote this account to admin"}
                        </button>
                        <button
                            onClick={signOutAndReset}
                            className="w-full py-3 text-slate-500 font-semibold text-sm hover:text-slate-700 transition-colors"
                        >
                            Sign in as a different account
                        </button>
                    </div>
                )}

                {state.kind === "promoted" && (
                    <div className="p-6 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800">
                        <p className="font-bold mb-1">You&apos;re now an administrator.</p>
                        <p className="text-sm">Redirecting to the admin console…</p>
                    </div>
                )}
            </div>
        </div>
    );
}
