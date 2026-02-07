"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): boolean => {
        return password.length >= 6;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        // Validate inputs
        const errors: { [key: string]: string } = {};
        if (!email || !validateEmail(email)) {
            errors.email = "Valid email is required";
        }
        if (!password || !validatePassword(password)) {
            errors.password = "Password must be at least 6 characters";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirect to dashboard or home page on success
            // TODO: Ideally check user role and redirect to specific dashboard
            router.push("/dashboard/patient");
        } catch (err: any) {
            console.error("Login error:", err);
            setError("Failed to login. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E6F7F8] flex flex-col items-center justify-center p-6 font-sans">
            {/* Logo */}
            <div className="mb-6 flex flex-col items-center gap-2">
                <div className="relative h-12 w-12">
                    <Image src="/logo.png" alt="LifeSync Logo" fill className="object-contain" />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-[#006967] tracking-wider uppercase">LifeSync</span>
                    <span className="text-[8px] text-[#008080] opacity-70 uppercase tracking-widest font-medium">Hope Match Save Lives</span>

                </div>
            </div>

            {/* Page Title */}

            {/* Main Card */}
            <div className="bg-white rounded-[1rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-10 max-w-xl w-full border border-white/50">
                <h2 className="text-xl font-bold text-gray-900 mb-10">Welcome back to Lifesync</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleLogin}>
                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your Email"
                            className={`w-full p-4 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all ${fieldErrors.email ? 'border-red-500' : 'border-gray-200'
                                }`}
                        />
                        {fieldErrors.email && (
                            <p className="text-red-500 text-xs ml-1">{fieldErrors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your Password"
                            className={`w-full p-4 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all ${fieldErrors.password ? 'border-red-500' : 'border-gray-200'
                                }`}
                        />
                        {fieldErrors.password && (
                            <p className="text-red-500 text-xs ml-1">{fieldErrors.password}</p>
                        )}
                        <Link href="/forgot-password" className="text-[#008080] text-sm font-bold block mt-2 hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <div className="pt-4">
                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-[#008080] hover:bg-[#006967] text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-teal-100 transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-[#008080] font-bold hover:underline decoration-1 underline-offset-4">
                        Signup
                    </Link>
                </div>
            </div>
        </div>
    );
}
