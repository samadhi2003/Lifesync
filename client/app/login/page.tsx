"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const handleRoleSelect = (role: string) => {
        setSelectedRole(role);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0FEFF] font-sans">
            <div className="mb-8 flex flex-col items-center">
                {/* Logo Placeholder - simplified based on typical structure */}
                <div className="mb-2">
                    <Image
                        src="/logo.png"
                        alt="LifeSync Logo"
                        width={60}
                        height={60}
                        className="h-16 w-auto"
                    />
                </div>
            </div>

            <div className="w-full max-w-[600px] rounded-lg bg-white p-10 shadow-sm border border-gray-200">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold text-[#147B72]">Join LifeSync</h1>
                    <p className="text-sm text-gray-400">Create your account in 3 steps</p>
                </div>

                <div className="mb-4">
                    <h2 className="mb-4 text-sm font-semibold text-[#147B72]">I am joining as:</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {/* Patient Card */}
                        <button
                            onClick={() => handleRoleSelect("patient")}
                            className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all hover:border-[#147B72] ${selectedRole === "patient"
                                    ? "border-[#147B72] bg-[#F0FEFF]"
                                    : "border-gray-300 bg-white"
                                }`}
                        >
                            <div className="mb-2 text-[#147B72]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                            </div>
                            <span className="mb-1 text-sm font-semibold text-[#4A4A4A]">Patient</span>
                            <span className="text-[10px] text-gray-400">Seeking a donor</span>
                        </button>

                        {/* Donor Card */}
                        <button
                            onClick={() => handleRoleSelect("donor")}
                            className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all hover:border-[#147B72] ${selectedRole === "donor"
                                    ? "border-[#147B72] bg-[#F0FEFF]"
                                    : "border-gray-300 bg-white"
                                }`}
                        >
                            <div className="mb-2 text-[#147B72]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <line x1="19" x2="19" y1="8" y2="14" />
                                    <line x1="22" x2="16" y1="11" y2="11" />
                                </svg>
                            </div>
                            <span className="mb-1 text-sm font-semibold text-[#4A4A4A]">Donor</span>
                            <span className="text-[10px] text-gray-400">Offering to help</span>
                        </button>

                        {/* Doctor Card */}
                        <button
                            onClick={() => handleRoleSelect("doctor")}
                            className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all hover:border-[#147B72] ${selectedRole === "doctor"
                                    ? "border-[#147B72] bg-[#F0FEFF]"
                                    : "border-gray-300 bg-white"
                                }`}
                        >
                            <div className="mb-2 text-[#147B72]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M5.8 11.3 2 12.7c-1.3.4-1.3 2.3 0 2.8l2.9 1 3.8-3.7" />
                                    <path d="M17.8 11.7 21 12.7c1.3.4 1.3 2.3 0 2.8l-2.9 1-3.8-3.7" />
                                    <circle cx="12" cy="7" r="4" />
                                    <path d="M7.5 16.1C8.6 18.2 10 20 12.5 20c2.4 0 4-1.6 5.3-3.9" />
                                </svg>
                            </div>
                            <span className="mb-1 text-sm font-semibold text-[#4A4A4A]">Doctor</span>
                            <span className="text-[10px] text-gray-400">Medical staff</span>
                        </button>
                    </div>
                </div>

                <button className="w-full rounded-md bg-[#147B72] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f5c56]">
                    Next
                </button>

                <div className="mt-6 text-center text-xs text-gray-500">
                    Already have an account?{" "}
                    <Link href="/signup" className="font-semibold text-[#147B72] underline">
                        Sign up
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-xs text-gray-400 text-center max-w-md leading-relaxed">
                By signing up, you agree to our <a href="#" className="text-[#147B72]">Terms of service</a> and <a href="#" className="text-[#147B72]">Privacy policy</a>
            </div>
        </div>
    );
}
