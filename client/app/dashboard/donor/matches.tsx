"use client";

import { useState } from "react";
import Link from "next/link";

interface AcceptedPatient {
    id: number;
    name: string;
    bloodGroup: string;
    matchPercentage: number;
    location: string;
}

const acceptedPatients: AcceptedPatient[] = [
    { id: 1, name: "Samadhi Uluwaduge", bloodGroup: "O+", matchPercentage: 92, location: "Colombo, LK" },
    { id: 2, name: "Samadhi Uluwaduge", bloodGroup: "O+", matchPercentage: 87, location: "Kandy, LK" },
    { id: 3, name: "Samadhi Uluwaduge", bloodGroup: "O+", matchPercentage: 80, location: "Galle, LK" },
];

export default function DonorMatches() {
    return (
        <div className="font-sans relative min-h-screen">
            {/* Background Decorative Blobs */}
            <div className="fixed top-20 right-0 w-96 h-96 bg-[#008080]/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

            {/* Header Section */}
            <div className="mb-10 relative z-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="text-[#008080] bg-teal-50 p-2 rounded-lg border border-teal-100 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-[#004D40] text-4xl font-black tracking-tight mb-1">Accepted patients</h1>
                        <p className="text-gray-500 font-medium">Review and respond to patients who matched with you</p>
                    </div>
                </div>
            </div>

            {/* Total Summary Card */}
            <div className="mb-12 bg-[#008080] rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-white/20 hover:scale-[1.01] transition-transform duration-500">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Total Accepted patients</h2>
                        <p className="text-teal-50/80 font-medium text-lg">Currently in process</p>
                    </div>
                    <div className="text-6xl md:text-8xl font-black text-white/90 drop-shadow-lg">
                        {acceptedPatients.length}
                    </div>
                </div>
            </div>

            {/* Patient Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 relative z-10">
                {acceptedPatients.map((patient) => (
                    <div key={patient.id} className="group bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-7 shadow-2xl shadow-teal-900/[0.04] hover:shadow-teal-900/[0.1] transition-all duration-500 hover:-translate-y-2 flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-white flex items-center justify-center text-[#008080] shadow-sm border border-teal-50 group-hover:scale-110 transition-transform duration-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-gray-900 text-lg leading-tight group-hover:text-[#008080] transition-colors">{patient.name}</h3>
                                <p className="text-gray-400 text-xs font-semibold mt-1 uppercase tracking-wide">Blood Group: {patient.bloodGroup}</p>
                            </div>
                        </div>

                        {/* Match Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-2.5">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Match</span>
                                <span className="text-xl font-black text-[#008080]">{patient.matchPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100/80 rounded-full h-2.5 p-0.5 shadow-inner">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#26A69A] to-[#4DB6AC] shadow-lg relative overflow-hidden transition-all duration-1000 ease-out"
                                    style={{ width: `${patient.matchPercentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto flex gap-3">
                            <button className="flex-1 bg-[#008080] hover:bg-[#006967] text-white font-black py-4 rounded-2xl transition-all duration-300 text-sm shadow-xl shadow-teal-900/10 active:scale-95 border-b-4 border-teal-900/20">
                                Connect
                            </button>
                            <button className="flex-1 bg-white hover:bg-gray-50 text-[#008080] font-black py-4 rounded-2xl transition-all duration-300 text-sm border border-[#008080]/20 shadow-sm active:scale-95">
                                View profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
