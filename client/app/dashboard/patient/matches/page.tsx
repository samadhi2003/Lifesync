"use client";

import { useState } from "react";
import Link from "next/link";

export default function MatchesPage() {
    const [filter, setFilter] = useState("All");

    // Mock Data for Donors
    const donors = [
        { id: 1, name: "Samadhi", bloodGroup: "O+", match: 92, status: "ACCEPTED" },
        { id: 3, name: "Amal", bloodGroup: "A+", match: 78, status: "REQUESTED" },
        { id: 5, name: "Nimal", bloodGroup: "O-", match: 68, status: "REQUESTED" },
        { id: 6, name: "Sunil", bloodGroup: "B+", match: 85, status: "ACCEPTED" },
    ];

    const getProgressColor = (match: number) => {
        if (match >= 80) return "bg-[#00BFA5]"; // Teal Green
        if (match >= 50) return "bg-[#FFB300]"; // Amber/Yellow
        return "bg-[#EF5350]"; // Red
    };

    const getStatusStyles = (status: string) => {
        const s = status.toUpperCase();
        switch (s) {
            case "ACCEPTED": return "bg-blue-100 text-blue-600 border-blue-200";
            case "REQUESTED": return "bg-purple-100 text-purple-600 border-purple-200";
            default: return "bg-gray-100 text-gray-500";
        }
    };

    const filteredDonors = donors.filter(donor => {
        if (filter === "All") return true;
        return donor.status.toUpperCase() === filter.toUpperCase();
    });

    return (
        <div className="font-sans min-h-screen relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="fixed top-20 left-20 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob"></div>
            <div className="fixed top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob animation-delay-2000"></div>
            <div className="fixed -bottom-8 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob animation-delay-4000"></div>

            {/* Header */}
            <div className="mb-8 pl-2 mt-8">
                <h1 className="text-[#004D40] text-3xl font-bold mb-1">My Matches</h1>
                <p className="text-slate-500">Track and manage your donor connections</p>
            </div>

            {/* Status Filter Bar - Glassmorphism */}
            <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between mb-8 shadow-lg ring-1 ring-white/20">
                <div className="font-bold text-[#00695C] text-lg pl-2">Filter by Status</div>
                <div className="flex gap-2 flex-wrap justify-center">
                    {["All", "Accepted", "Requested"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${filter === f
                                ? "bg-[#00796B] text-white shadow-lg scale-105"
                                : "bg-white/50 text-gray-700 hover:bg-white/80 hover:shadow-md"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <p className="text-slate-500 text-sm mb-6 font-medium pl-2">Showing {filteredDonors.length} of {donors.length} donors</p>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {filteredDonors.map((donor) => (
                    <div key={donor.id} className="group bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/30 hover:shadow-2xl hover:bg-white/60 transition-all duration-300 relative overflow-hidden ring-1 ring-white/20 hover:-translate-y-1">

                        {/* Glowing gradient effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-white flex items-center justify-center text-[#00796B] shadow-inner border border-white/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-xl tracking-tight">{donor.name}</h3>
                                    <div className="bg-white/50 border border-white/30 text-gray-600 text-[11px] font-bold px-3 py-1 rounded-full inline-block mt-1 uppercase tracking-wide">
                                        Blood: {donor.bloodGroup}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusStyles(donor.status)}`}>
                                {donor.status}
                            </span>
                        </div>

                        {/* Match Progress */}
                        <div className="mb-8 relative z-10">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Compatibility</span>
                                <span className={`text-2xl font-black ${donor.match >= 80 ? 'text-[#00796B]' : 'text-gray-700'}`}>
                                    {donor.match}%
                                </span>
                            </div>
                            <div className="w-full bg-black/5 rounded-full h-3 backdrop-blur-sm overflow-hidden border border-white/10">
                                <div
                                    className={`h-3 rounded-full ${getProgressColor(donor.match)} shadow-sm relative overflow-hidden`}
                                    style={{ width: `${donor.match}%` }}
                                >
                                    {/* Shimmer effect on progress bar */}
                                    <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons based on status */}
                        <div className="flex gap-3 relative z-10">
                            {donor.status.toUpperCase() === 'ACCEPTED' ? (
                                <Link href={`/dashboard/patient/matches/${donor.id}`} className="flex-1">
                                    <button className="w-full bg-white/50 hover:bg-white text-gray-700 border border-white/60 hover:border-white text-sm font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-95">
                                        View profile
                                    </button>
                                </Link>
                            ) : (
                                <button className="w-full bg-[#00796B]/20 text-[#00796B] border border-[#00796B]/30 text-sm font-bold py-3.5 rounded-xl cursor-default" disabled>
                                    Requested
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
