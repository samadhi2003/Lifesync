"use client";

import { useState } from "react";

interface PatientRequest {
    id: number;
    name: string;
    bloodGroup: string;
    matchPercentage: number;
    urgency: "Critical" | "High" | "Moderate";
    location: string;
    image?: string;
}

const patientRequests: PatientRequest[] = [
    { id: 1, name: "Samadhi Uluwaduge", bloodGroup: "O+", matchPercentage: 92, urgency: "Critical", location: "Colombo, LK" },
    { id: 2, name: "Prabath Perera", bloodGroup: "O+", matchPercentage: 87, urgency: "High", location: "Kandy, LK" },
    { id: 3, name: "Nimal Silva", bloodGroup: "O+", matchPercentage: 80, urgency: "High", location: "Galle, LK" },
    { id: 4, name: "Kasun Jayawardena", bloodGroup: "A+", matchPercentage: 78, urgency: "Moderate", location: "Jaffna, LK" },
    { id: 5, name: "Indika Rathnayake", bloodGroup: "O+", matchPercentage: 72, urgency: "Moderate", location: "Matara, LK" },
    { id: 6, name: "Anura Bandara", bloodGroup: "O-", matchPercentage: 68, urgency: "Moderate", location: "Negombo, LK" },
    { id: 7, name: "Dasun Shanaka", bloodGroup: "B+", matchPercentage: 55, urgency: "Moderate", location: "Kuruwita, LK" },
    { id: 8, name: "Wanindu Hasaranga", bloodGroup: "AB+", matchPercentage: 48, urgency: "Moderate", location: "Galle, LK" },
    { id: 9, name: "Charith Asalanka", bloodGroup: "O+", matchPercentage: 42, urgency: "Moderate", location: "Elpitiya, LK" },
];

export default function DonorHome() {
    const [selectedFilter, setSelectedFilter] = useState<"All" | "High" | "Medium" | "Low">("All");

    const filteredRequests = patientRequests.filter(request => {
        if (selectedFilter === "All") return true;
        if (selectedFilter === "High") return request.matchPercentage >= 80;
        if (selectedFilter === "Medium") return request.matchPercentage >= 60 && request.matchPercentage < 80;
        if (selectedFilter === "Low") return request.matchPercentage < 60;
        return true;
    });

    return (
        <div className="font-sans relative min-h-screen">
            {/* Background Decorative Blobs for Glass Effect */}
            <div className="fixed top-20 right-0 w-96 h-96 bg-[#008080]/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-100/30 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            {/* Welcome Banner */}
            <div className="mb-10 bg-gradient-to-r from-[#F3C086] via-[#A7D3C4] to-[#36817B] backdrop-blur-md rounded-2xl p-8 md:p-14 text-white shadow-2xl relative overflow-hidden border border-white/20">

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
                            You have {patientRequests.length} patient requests waiting for your response
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Section Header */}
            <div className="mb-8 relative z-10">
                <h2 className="text-[#006967] text-3xl font-black tracking-tight mb-2">All Matches</h2>
                <p className="text-gray-500 font-medium text-lg">Browse all potential kidney donors</p>
            </div>

            {/* Filter Bar */}
            <div className="mb-10 relative z-10">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/50 p-4 shadow-xl shadow-teal-900/[0.04] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 ml-4">
                        <span className="text-[#008080] font-bold text-lg">Filter by Match Level</span>
                    </div>

                    <div className="flex items-center bg-gray-50/50 rounded-2xl p-1.5 border border-gray-100 gap-1">
                        {["All", "High", "Medium", "Low"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter as any)}
                                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${selectedFilter === filter
                                    ? "bg-[#008080] text-white shadow-lg shadow-teal-900/20 scale-105"
                                    : "text-gray-500 hover:text-[#008080] hover:bg-white"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-6 ml-2 font-bold text-gray-400 text-sm">
                    Showing <span className="text-[#008080]">{filteredRequests.length}</span> of {patientRequests.length} donors
                </div>
            </div>

            {/* Requests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {filteredRequests.map((request) => (
                    <div key={request.id} className="group relative bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-7 shadow-2xl shadow-teal-900/[0.04] hover:shadow-teal-900/[0.1] transition-all duration-500 hover:-translate-y-2 flex flex-col">
                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-white flex items-center justify-center text-[#008080] shadow-sm border border-teal-50 group-hover:scale-110 transition-transform duration-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight group-hover:text-[#008080] transition-colors">{request.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-gray-400 text-xs font-semibold">{request.location}</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-sm ${request.urgency === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' :
                                request.urgency === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    'bg-teal-50 text-teal-600 border-teal-100'
                                }`}>
                                {request.urgency}
                            </div>
                        </div>

                        {/* Mid Section: Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Blood Type</span>
                                <p className="text-[#008080] text-xl font-black">{request.bloodGroup}</p>
                            </div>
                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Match Level</span>
                                <p className={`text-xl font-black ${request.matchPercentage >= 80 ? 'text-teal-600' : 'text-orange-600'}`}>
                                    {request.matchPercentage >= 80 ? 'Elite' : 'Strong'}
                                </p>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div className="mb-10">
                            <div className="flex justify-between items-end mb-3">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Compatibility</p>
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-2xl font-black text-gray-900">{request.matchPercentage}</span>
                                    <span className="text-xs font-bold text-[#008080]">%</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100/80 rounded-full h-2.5 p-0.5 shadow-inner">
                                <div
                                    className={`h-full rounded-full shadow-lg transition-all duration-1000 ease-out relative overflow-hidden ${request.matchPercentage >= 80 ? 'bg-gradient-to-r from-[#26A69A] to-[#4DB6AC]' : 'bg-gradient-to-r from-[#FFB74D] to-[#FFA726]'
                                        }`}
                                    style={{ width: `${request.matchPercentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="mt-auto flex gap-3">
                            <button className="flex-[2] bg-[#008080] hover:bg-[#006967] text-white font-black py-4 rounded-[1.25rem] transition-all duration-300 text-sm shadow-xl shadow-teal-900/10 hover:shadow-teal-900/30 active:scale-[0.98] border-b-4 border-teal-900/20">
                                Accept Patient
                            </button>
                            <button className="flex-1 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 font-bold py-4 rounded-[1.25rem] transition-all duration-300 text-xs active:scale-[0.98] border border-gray-100">
                                Dismiss
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
