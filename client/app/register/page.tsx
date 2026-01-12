"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RegisterContent() {
    const searchParams = useSearchParams();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    useEffect(() => {
        const role = searchParams.get("role");
        if (role && ["patient", "donor", "doctor"].includes(role)) {
            setSelectedRole(role);
        }
    }, [searchParams]);

    const roles = [
        {
            id: "patient",
            title: "Patient",
            description: "Seeking a donor",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-[#008080]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            ),
        },
        {
            id: "donor",
            title: "Donor",
            description: "Offering to help",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-[#008080]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            id: "doctor",
            title: "Doctor",
            description: "Medical staff",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-[#008080]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="7" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="17" cy="5" r="1.5" fill="currentColor" />
                    <path d="M7 6v3a5 5 0 0 0 10 0V6" />
                    <path d="M12 14v3" />
                    <circle cx="12" cy="19" r="2.5" strokeWidth="2.5" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#E6F7F8] flex flex-col items-center justify-center p-6 font-sans">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center gap-2">
                <div className="relative h-12 w-12">
                    <Image src="/logo.png" alt="LifeSync Logo" fill className="object-contain" />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-[#006967] tracking-wider uppercase">LifeSync</span>
                    <span className="text-[8px] text-[#008080] opacity-70 uppercase tracking-widest font-medium">Hope Match Save Lives</span>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,105,103,0.1)] p-12 max-w-2xl w-full text-center border border-white/50">
                <h1 className="text-3xl font-bold text-[#006967] mb-2">Join LifeSync</h1>
                <p className="text-gray-400 text-sm mb-12">Connecting patients, donors, and doctors to save lives together</p>

                <div className="text-left mb-6">
                    <h2 className="text-[#006967] font-bold text-sm">I am joining as:</h2>
                </div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`flex flex-col items-center p-8 rounded-2xl border-2 transition-all duration-350 group relative overflow-hidden ${selectedRole === role.id
                                ? "border-[#008080] bg-[#F0FBFC] shadow-lg scale-[1.02]"
                                : "border-gray-100 hover:border-teal-200 hover:shadow-md hover:scale-[1.02] bg-white"
                                }`}
                        >
                            <div className={`mb-4 transition-transform duration-300 group-hover:scale-110 ${selectedRole === role.id ? "scale-110" : ""}`}>
                                {role.icon}
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1">{role.title}</h3>
                            <p className="text-[10px] text-gray-400">{role.description}</p>

                            {selectedRole === role.id && (
                                <div className="absolute top-2 right-2">
                                    <div className="bg-[#008080] rounded-full p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Next Button */}
                {/* Changed Link href to point to /register/[role] */}
                <Link href={selectedRole ? `/register/${selectedRole}` : "#"} className="block w-full">
                    <button
                        className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 shadow-lg ${selectedRole
                            ? "bg-[#008080] hover:bg-[#006967] hover:shadow-teal-200 transform hover:-translate-y-0.5"
                            : "bg-gray-300 cursor-not-allowed"
                            }`}
                        disabled={!selectedRole}
                    >
                        Next
                    </button>
                </Link>

                {/* Footer */}
                <div className="mt-8 text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login/sign-in" className="text-[#008080] font-bold hover:underline decoration-2 underline-offset-4 cursor-pointer">
                        Login
                    </Link>
                </div>
            </div>

            {/* Legal Footer */}
            <div className="mt-12 text-[10px] text-gray-400 max-w-sm text-center leading-relaxed">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-[#008080] hover:underline">
                    Terms of service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#008080] hover:underline">
                    Privacy policy
                </Link>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#E6F7F8] flex items-center justify-center text-[#008080]">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
