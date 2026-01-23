"use client";

import { useState } from "react";

export default function FindDonors() {
    const [isSearching, setIsSearching] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);

    const handleSearch = () => {
        setIsSearching(true);
        // Simulate API call
        setTimeout(() => {
            setMatches([
                { id: 1, name: "Samadhi", bloodGroup: "O+", matchPercentage: 92 },
                { id: 2, name: "Samadhi", bloodGroup: "O+", matchPercentage: 92 },
                { id: 3, name: "Samadhi", bloodGroup: "O+", matchPercentage: 92 },
                { id: 4, name: "Samadhi", bloodGroup: "O+", matchPercentage: 92 },
            ]);
            setIsSearching(false);
        }, 1500);
    };

    return (
        <div className="font-sans relative min-h-screen">
            <div className="mb-10 relative z-10">
                <h1 className="text-[#006967] text-4xl font-black tracking-tight mb-2">Find Donors</h1>
                <p className="text-gray-500 font-medium text-lg">Search for compatible kidney donors for your patients</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                {/* Search Form */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/50 p-8 shadow-2xl shadow-slate-900/[0.03]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#008080]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Patient Information</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Patient Name</label>
                            <input
                                type="text"
                                placeholder="Enter patient name"
                                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select blood group</label>
                            <select className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all appearance-none">
                                <option>Select your blood group</option>
                                <option>O+</option>
                                <option>A+</option>
                                <option>B+</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select urgency level</label>
                            <select className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:bg-white transition-all appearance-none">
                                <option>Select urgency level</option>
                                <option>Critical</option>
                                <option>High</option>
                                <option>Moderate</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">On Dialysis</label>
                            <div className="flex gap-4">
                                <button className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">Yes</button>
                                <button className="flex-1 py-3 bg-white text-gray-400 font-bold rounded-xl border border-gray-100">No</button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">HLA Report uploaded</label>
                            <div className="border-2 border-dashed border-gray-100 rounded-[1.5rem] p-10 flex flex-col items-center justify-center gap-4 text-gray-400 bg-gray-50/30 hover:bg-gray-50/80 transition-all cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <div className="text-center">
                                    <p className="font-bold text-gray-500">Click to upload or drag and drop</p>
                                    <p className="text-xs">PDF only</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="w-full py-5 bg-[#008080] hover:bg-[#006967] text-white font-black rounded-[1.25rem] shadow-xl shadow-teal-900/10 hover:shadow-teal-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {isSearching ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                            Search Donors
                        </button>
                    </div>
                </div>

                {/* Search Result */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white/50 p-8 shadow-2xl shadow-slate-900/[0.03]">
                    <div className="flex flex-col h-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Donor match result</h2>
                        {matches.length > 0 && <p className="text-gray-500 text-xs mb-8 font-medium">Found {matches.length} compatible donors</p>}

                        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                            {matches.length === 0 && !isSearching ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gray-50/50 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-gray-900 text-lg">No Search Yet</h3>
                                        <p className="text-sm">Enter patient information to find compatible donors</p>
                                    </div>
                                </div>
                            ) : matches.length > 0 ? (
                                matches.map((donor, idx) => (
                                    <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#008080]">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-gray-900">{donor.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Blood Group: {donor.bloodGroup}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Match</span>
                                                <span className="text-lg font-black text-teal-500">{donor.matchPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-400 rounded-full transition-all duration-1000"
                                                    style={{ width: `${donor.matchPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <button className="w-full py-3 bg-white text-[#008080] font-bold text-xs uppercase tracking-widest rounded-xl border border-teal-100 hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                            </svg>
                                            Save donor
                                        </button>
                                    </div>
                                ))
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1.25rem center;
                    background-size: 1.25rem;
                }
            `}</style>
        </div>
    );
}
