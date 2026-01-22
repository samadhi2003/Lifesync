"use client";

import { useState } from "react";


export default function PatientDashboard() {
    const [filter, setFilter] = useState("All");

    // Mock Data for Donors
    const donors = [
        { id: 1, name: "Samadhi", bloodGroup: "O+", match: 92, status: "PENDING", location: "Colombo, LK", urgency: "Critical" },
        { id: 2, name: "Samadhi", bloodGroup: "O+", match: 87, status: "ACCEPTED", location: "Kandy, LK", urgency: "High" },
        { id: 3, name: "Samadhi", bloodGroup: "O+", match: 80, status: "ACCEPTED", location: "Galle, LK", urgency: "High" },
        { id: 4, name: "Samadhi", bloodGroup: "A+", match: 78, status: "PENDING", location: "Jaffna, LK", urgency: "Moderate" },
        { id: 5, name: "Samadhi", bloodGroup: "O+", match: 72, status: "PENDING", location: "Matara, LK", urgency: "Moderate" },
        { id: 6, name: "Samadhi", bloodGroup: "O-", match: 68, status: "PENDING", location: "Negombo, LK", urgency: "Moderate" },
        { id: 7, name: "Samadhi", bloodGroup: "O+", match: 92, status: "PENDING", location: "Colombo, LK", urgency: "Critical" },
        { id: 8, name: "Samadhi", bloodGroup: "O+", match: 87, status: "ACCEPTED", location: "Kandy, LK", urgency: "High" },
        { id: 9, name: "Samadhi", bloodGroup: "O+", match: 80, status: "PENDING", location: "Galle, LK", urgency: "High" },
        { id: 10, name: "Samadhi", bloodGroup: "A+", match: 45, status: "PENDING", location: "Jaffna, LK", urgency: "Moderate" },
        { id: 11, name: "Samadhi", bloodGroup: "O+", match: 30, status: "PENDING", location: "Matara, LK", urgency: "Moderate" },
    ];

    const getProgressColor = (match: number) => {
        if (match >= 80) return "bg-[#00BFA5]"; // Teal Green
        if (match >= 50) return "bg-[#FFB300]"; // Amber/Yellow
        return "bg-[#EF5350]"; // Red
    };



    const filteredDonors = donors.filter(donor => {
        if (filter === "All") return true;
        if (filter === "High") return donor.match >= 80;
        if (filter === "Medium") return donor.match >= 50 && donor.match < 80;
        if (filter === "Low") return donor.match < 50;
        return true;
    });

    return (
        <div className="font-sans min-h-screen relative overflow-hidden">
            {/* Decorative Background Elements - Essential for Glassmorphism */}
            <div className="fixed top-20 left-20 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob"></div>
            <div className="fixed top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob animation-delay-2000"></div>
            <div className="fixed -bottom-8 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob animation-delay-4000"></div>

            {/* Welcome Banner */}
            <div className="mb-10 bg-gradient-to-r from-[#48D597] to-[#2E807D] backdrop-blur-md rounded-2xl p-8 md:p-14 text-white shadow-2xl relative overflow-hidden border border-white/20">
                {/* Glass/Blur Effect Overlays */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-6 mb-1">
                            <div className="text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Welcome back, Samadhi Uluwaduge</h1>
                        </div>
                        <p className="text-white/90 ml-[64px] text-sm font-medium">We found 6 potential matches for you</p>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="mb-8 pl-2">
                <h1 className="text-[#004D40] text-3xl font-bold mb-1">All Matches</h1>
                <p className="text-slate-500">Browse all potential kidney donors</p>
            </div>

            {/* Filter Bar - Glassmorphism */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between mb-8 shadow-lg ring-1 ring-white/20">
                <div className="font-bold text-[#00695C] text-lg pl-2">Filter by Match Level</div>
                <div className="flex gap-2">
                    {["All", "High", "Medium", "Low"].map((f) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDonors.map((donor) => (
                    <div key={donor.id} className="group bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/30 hover:shadow-2xl hover:bg-white/60 transition-all duration-300 relative overflow-hidden ring-1 ring-white/20 hover:-translate-y-1">

                        {/* Glowing gradient effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-white flex items-center justify-center text-[#00796B] shadow-inner border border-white/50 group-hover:scale-110 transition-transform duration-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-xl tracking-tight">{donor.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-gray-400 text-xs font-semibold">{donor.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mid Section: Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Blood Type</span>
                                <p className="text-[#00796B] text-xl font-black">{donor.bloodGroup}</p>
                            </div>
                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Match Level</span>
                                <p className={`text-xl font-black ${donor.match >= 80 ? 'text-teal-600' : 'text-orange-600'}`}>
                                    {donor.match >= 80 ? 'Elite' : 'Strong'}
                                </p>
                            </div>
                        </div>

                        {/* Match Progress */}
                        <div className="mb-10 relative z-10">
                            <div className="flex justify-between items-end mb-3">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Compatibility</p>
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-2xl font-black text-gray-900">{donor.match}</span>
                                    <span className="text-xs font-bold text-[#00796B]">%</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100/80 rounded-full h-2.5 p-0.5 shadow-inner">
                                <div
                                    className={`h-full rounded-full shadow-lg transition-all duration-1000 ease-out relative overflow-hidden ${donor.match >= 80 ? 'bg-gradient-to-r from-[#26A69A] to-[#4DB6AC]' : 'bg-gradient-to-r from-[#FFB74D] to-[#FFA726]'
                                        }`}
                                    style={{ width: `${donor.match}%` }}
                                >
                                    {/* Shimmer effect on progress bar */}
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 relative z-10">
                            <button className="w-full bg-[#00796B] hover:bg-[#00695C] text-white text-sm font-black py-4 rounded-[1.25rem] transition-all duration-300 shadow-xl shadow-teal-900/10 hover:shadow-teal-900/30 active:scale-95 border-b-4 border-teal-900/20">
                                Request
                            </button>
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
