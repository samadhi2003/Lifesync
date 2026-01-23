"use client";

import { useState } from "react";

export default function DoctorHome() {
    return (
        <div className="font-sans relative min-h-[calc(100vh-100px)]">
            {/* Background Decorative Blobs for Glass Effect */}
            <div className="fixed top-20 right-0 w-96 h-96 bg-[#008080]/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-100/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            {/* Welcome Banner */}
            <div className="mb-10 bg-gradient-to-r from-[#86C1F3] via-[#A7D3C4] to-[#36817B] backdrop-blur-md rounded-2xl p-8 md:p-14 text-white shadow-2xl relative overflow-hidden border border-white/20">

                {/* Glass/Blur Effect Overlays */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-teal-400/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-6 mb-1">
                            <div className="text-white">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                    />
                                </svg>
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                                Welcome back, Samadhi Uluwaduge
                            </h1>
                        </div>

                        <p className="text-white/90 ml-[64px] text-lg font-medium">
                            We found 6 potential matches for your patients
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashboard Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[#008080] mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Find Donors</h3>
                    <p className="text-gray-500 text-sm mb-6">Search for compatible kidney donors for your patients.</p>
                    <button className="text-[#008080] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                        Get Started
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">My Patients</h3>
                    <p className="text-gray-500 text-sm mb-6">Manage your patient roster and their matching progress.</p>
                    <button className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                        View List
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">My Profile</h3>
                    <p className="text-gray-500 text-sm mb-6">Update your professional details and certifications.</p>
                    <button className="text-orange-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                        Update Info
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
