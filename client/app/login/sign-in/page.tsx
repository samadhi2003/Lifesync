"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function SignInPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

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
                <h2 className="text-xl font-bold text-gray-900 mb-10">Welcome to the Lifesync</h2>

                <form className="space-y-6">
                    {/* Username */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 block">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your Username"
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your Password"
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all"
                        />
                        <Link href="/forgot-password" className="text-[#008080] text-sm font-bold block mt-2 hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <div className="pt-4">
                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-[#008080] hover:bg-[#006967] text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-teal-100 transform hover:-translate-y-0.5"
                        >
                            Login
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
