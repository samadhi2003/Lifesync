"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RegisterStep1() {
    const params = useParams();
    const roleRaw = params.role as string;
    const role = roleRaw ? roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1) : "User";

    return (
        <div className="min-h-screen bg-[#E6F7F8] flex flex-col items-center py-12 px-4 font-sans">

            {/* Header Section */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 rounded-full bg-[#A0E0E0] flex items-center justify-center text-[#006967] mb-4">
                    {roleRaw === 'patient' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    )}
                    {/* Using the user icon for Donor as per screenshot */}
                    {(roleRaw === 'donor' || roleRaw === 'doctor') && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    )}
                    {!['patient', 'donor', 'doctor'].includes(roleRaw) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-[#006967] mb-1">{role} Registration</h1>
                <p className="text-gray-400 text-sm">Step 1 of 3</p>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-3 mb-10 w-full max-w-lg justify-center">
                <div className="w-1/3 h-1.5 bg-[#4AA3FF] rounded-full"></div>
                <div className="w-1/3 h-1.5 bg-gray-300 rounded-full"></div>
                <div className="w-1/3 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] w-full max-w-[600px] p-8 md:p-12">
                <h2 className="text-lg font-bold text-gray-900 mb-8">Basic Information</h2>

                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-gray-500 text-xs font-semibold ml-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full Name"
                            className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-500 text-xs font-semibold ml-1">NIC</label>
                        <input
                            type="text"
                            placeholder="Enter your NIC number"
                            className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-500 text-xs font-semibold ml-1">Gender</label>
                        <div className="relative">
                            <select className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white appearance-none transition-all cursor-pointer text-sm">
                                <option value="" disabled selected>Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-500 text-xs font-semibold ml-1">Date of Birth</label>
                        <input
                            type="text"
                            placeholder="dd/mm/yy"
                            onFocus={(e) => e.target.type = 'date'}
                            onBlur={(e) => e.target.type = 'text'}
                            className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-500 text-xs font-semibold ml-1">Adreess</label>
                        <input
                            type="text"
                            placeholder="Enter your Adreess"
                            className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-500 text-xs font-semibold ml-1">Contact Number</label>
                        <input
                            type="tel"
                            placeholder="Enter your Contact number"
                            className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-500 text-xs font-semibold ml-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your Email"
                            className="w-full bg-[#F5F5F5] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div className="pt-6">
                        <button
                            type="button"
                            className="w-full bg-[#0E7A75] text-white font-bold py-4 rounded-lg hover:bg-[#0B635F] transition-colors shadow-lg"
                        >
                            Next
                        </button>
                    </div>

                    <div className="text-center text-xs text-gray-500 mt-4">
                        Already have an account? <Link href="/login/sign-in" className="text-[#0E7A75] font-bold hover:underline">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
