"use client";

import { useState } from "react";

export default function Patients() {
    const [searchTerm, setSearchTerm] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = () => {
        if (searchTerm.trim()) {
            setHasSearched(true);
        }
    };

    return (
        <div className="font-sans relative min-h-screen">
            <div className="mb-10 relative z-10">
                <h1 className="text-[#006967] text-2xl font-black tracking-tight mb-2">Patient Search</h1>
                <p className="text-gray-500 font-medium text-lg">Search for patient information and view matching history</p>
            </div>

            {/* Search Bar Container */}
            <div className="mb-12 relative z-10">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[1.5rem] border border-white/50 p-4 shadow-xl shadow-teal-900/[0.04] border flex items-center gap-4">
                    <div className="flex-1 px-4">
                        <input
                            type="text"
                            placeholder="Enter patient name"
                            className="w-full bg-transparent outline-none text-gray-700 font-medium text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-[#008080] hover:bg-[#006967] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-900/10 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search
                    </button>
                </div>
            </div>

            <div className="relative z-10">
                {!hasSearched ? (
                    <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-20 shadow-2xl flex flex-col items-center justify-center text-center gap-6">
                        <div className="w-24 h-24 bg-gray-50 flex items-center justify-center rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-400">Search for a Patient</h2>
                            <p className="text-gray-400 mt-2 font-medium">Enter a patient ID to view their information and matching history</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Patient Profile Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Avatar & Basic Info */}
                            <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-10 shadow-xl min-h-[400px]">
                                <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center text-[#008080] mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                                        <p className="text-2xl font-black text-gray-900">Samadhi Uluwaduge</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Age</label>
                                            <p className="text-xl font-bold text-gray-900">22</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Blood Group</label>
                                            <p className="text-xl font-bold text-gray-900">O+</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Condition</label>
                                        <p className="text-xl font-bold text-gray-900">Chronic Kidney Disease (Stage 4)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info Cards Column */}
                            <div className="space-y-8">
                                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-8 shadow-xl flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Patient History</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50 font-medium">
                                            <span className="text-gray-500">Last Dialysis:</span>
                                            <span className="text-gray-900">October 12, 2023</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50 font-medium">
                                            <span className="text-gray-500">Waitlist Time:</span>
                                            <span className="text-gray-900">8 Months</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-8 shadow-xl flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Medical Contacts</h3>
                                    <p className="text-gray-500 text-sm font-medium">Primary Physician: Dr. Silva</p>
                                </div>
                            </div>
                        </div>

                        {/* Suggested Donors */}
                        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-10 shadow-xl">
                            <h3 className="text-2xl font-black text-gray-900 mb-8">Suggested Donors</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="bg-white/50 border border-gray-100 p-6 rounded-3xl group hover:shadow-lg transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[#008080]">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-gray-900">Samadhi</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Blood Group: O+</p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${item % 2 === 0 ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}`}>
                                                {item % 2 === 0 ? 'Pending' : 'Available'}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Match</span>
                                                <span className="text-lg font-black text-teal-500">92%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 shadow-inner overflow-hidden">
                                                <div className="h-full bg-teal-400 w-[92%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
