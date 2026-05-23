"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const validateEmail = (value: string): boolean =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setInfo(null);

        if (!email || !validateEmail(email)) {
            setError("Enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email.trim());
            // Don't disclose whether the email exists — uniform success message.
            setInfo("If an account exists for that email, a reset link has been sent. Check your inbox (and spam folder).");
        } catch (err) {
            const code = (err as { code?: string }).code || "";
            // Firebase returns auth/invalid-email for malformed input; everything
            // else (auth/user-not-found, auth/too-many-requests, etc.) we still
            // present as a success to avoid leaking which emails are registered.
            if (code === "auth/invalid-email") {
                setError("That email address looks invalid.");
            } else if (code === "auth/too-many-requests") {
                setError("Too many attempts. Please wait a moment and try again.");
            } else {
                console.error("Password reset error:", err);
                setInfo("If an account exists for that email, a reset link has been sent. Check your inbox (and spam folder).");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E6F7F8] flex flex-col items-center justify-center p-6 font-sans">
            <div className="mb-6 flex flex-col items-center gap-2">
                <div className="relative h-12 w-12">
                    <Image src="/logo.png" alt="LifeSync Logo" fill className="object-contain" />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-[#006967] tracking-wider uppercase">LifeSync</span>
                    <span className="text-[8px] text-[#008080] opacity-70 uppercase tracking-widest font-medium">Hope Match Save Lives</span>
                </div>
            </div>

            <div className="bg-white rounded-[1rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-10 max-w-xl w-full border border-white/50">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Reset your password</h2>
                <p className="text-sm text-gray-500 mb-8">Enter the email associated with your account and we&apos;ll send you a link to set a new password.</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                {info && (
                    <div className="mb-4 p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded">
                        {info}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={loading}
                            className="w-full p-4 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all border-gray-200 disabled:opacity-60"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-[#008080] hover:bg-[#006967] text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-teal-100 transform hover:-translate-y-0.5 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Sending..." : "Send reset link"}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Remembered it?{" "}
                    <Link href="/login/sign-in" className="text-[#008080] font-bold hover:underline decoration-1 underline-offset-4">
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
