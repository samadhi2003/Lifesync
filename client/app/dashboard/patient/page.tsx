"use client";

import { useState } from "react";
import Image from "next/image";

export default function PatientDashboard() {
    const donors = [
        { id: 1, name: "Samadhi", bloodGroup: "O+", match: 92 },
        { id: 2, name: "Samadhi", bloodGroup: "O+", match: 87 },
        { id: 3, name: "Samadhi", bloodGroup: "O+", match: 80 },
        { id: 4, name: "Samadhi", bloodGroup: "A+", match: 78 },
        { id: 5, name: "Samadhi", bloodGroup: "O+", match: 72 },
        { id: 6, name: "Samadhi", bloodGroup: "O-", match: 68 },
    ];

    const [selectedId, setSelectedId] = useState<number | null>(null);

    const getProgressColor = (match: number) => {
        if (match >= 80) return "bg-[#25CBA1]"; // Green
        if (match >= 50) return "bg-[#F4C542]"; // Yellow/Orangeish
        return "bg-[#F65757]"; // Red
    };

    return (
        <div className="space-y-12 font-sans">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#44D6A8] to-[#007F81] rounded-xl p-10 md:p-14 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h1 className="text-3xl md:text-3xl font-bold">Welcome back,Samadhi Uluwaduge</h1>
                    </div>
                    <p className="text-white/80 text-sm md:text-base ml-12">We found 6 potential matches for you</p>
                </div>
            </div>

            {/* Top Matching Donors Section */}
            <div>
                <div className="mb-6">
                    <h2 className="text-[#006967] text-xl font-bold">Top Matching Donors</h2>
                    <p className="text-gray-400 text-xs mt-1">Donors with the highest compatibility percentage</p>
                </div>

                {/* Donors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donors.map((donor) => (
                        <div
                            key={donor.id}
                            onClick={() => setSelectedId(donor.id)}
                            className={`rounded-xl p-6 shadow-sm border transition-all cursor-pointer ${selectedId === donor.id
                                ? "bg-[#D5F2EA] border-[#25CBA1]"
                                : "bg-[#F2F4F4] border-transparent hover:border-teal-100"
                                }`}
                        >
                            <div className="flex items-start gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full bg-[#CBE9EA] flex items-center justify-center text-[#006967]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{donor.name}</h3>
                                    <p className="text-gray-400 text-xs">Blood Group: {donor.bloodGroup}</p>
                                </div>
                            </div>

                            {/* Match Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-semibold text-gray-400">Match</span>
                                    <span className={`text-xs font-bold ${donor.match >= 80 ? 'text-[#008080]' : (donor.match >= 50 ? 'text-[#008080]' : 'text-[#008080]')}`}>
                                        {donor.match}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-1.5 rounded-full ${getProgressColor(donor.match)}`}
                                        style={{ width: `${donor.match}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4">
                                <button className="flex-1 bg-[#1A8380] hover:bg-[#156a68] text-white text-xs font-bold py-3 rounded-lg transition-colors">
                                    Request
                                </button>
                                <button className="flex-1 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-bold py-3 rounded-lg transition-colors">
                                    View profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
