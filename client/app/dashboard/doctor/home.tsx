"use client";

import { useState } from "react";
import Image from "next/image";

export default function DoctorHome() {
    return (
        <div className="font-sans">
            {/* Welcome Banner */}
            <div className="mb-8 bg-[#008080] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-teal-900/10">
                {/* Decorative Circles */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-20%] left-[60%] w-64 h-64 bg-teal-400/20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">
                        Welcome back, Dr. Samadhi
                    </h1>
                    <p className="text-teal-50/90 text-lg max-w-2xl leading-relaxed mb-8">
                        You have 4 patient approvals pending today and 2 new donor matches identified. Clinical Intelligence systems are operating at peak efficiency.
                    </p>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-wider">System Live</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                            <span className="text-xs font-bold uppercase tracking-wider">April 22, 2026</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Find Donors */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1C1E] mb-3">Find Donors</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Access the global registry to search for compatible hematological donors using AI-driven matching protocols.
                    </p>
                    <button className="text-[#008080] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                        Get Started
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                </div>

                {/* My Patients */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-[#008080] mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1C1E] mb-3">My Patients</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Monitor your assigned patient roster, view treatment progress, and update clinical logs in real-time.
                    </p>
                    <button className="text-[#008080] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                        View List
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                </div>

                {/* My Profile */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1C1E] mb-3">My Profile</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Manage your professional credentials, departmental settings, and notification preferences.
                    </p>
                    <button className="text-[#008080] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                        Update Info
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Patient Activity */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-[#1A1C1E]">Recent Patient Activity</h2>
                        <button className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest hover:text-[#008080] transition-colors">See All</button>
                    </div>

                    <div className="space-y-4">
                        {/* Patient item 1 */}
                        <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">JD</div>
                                <div>
                                    <h4 className="font-bold text-[#1A1C1E]">John Doe</h4>
                                    <p className="text-xs text-slate-500">Match found: HLA-A Compatible</p>
                                </div>
                            </div>
                            <span className="bg-green-100 text-green-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-green-200">Stable</span>
                        </div>

                        {/* Patient item 2 */}
                        <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">AS</div>
                                <div>
                                    <h4 className="font-bold text-[#1A1C1E]">Alice Smith</h4>
                                    <p className="text-xs text-slate-500">Awaiting Lab Results (CBC)</p>
                                </div>
                            </div>
                            <span className="bg-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-orange-200">Urgent</span>
                        </div>
                    </div>
                </div>

                {/* Clinic Capacity */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col">
                    <h2 className="text-2xl font-bold text-[#1A1C1E] mb-8">Clinic Capacity</h2>

                    <div className="space-y-6 flex-1">
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                <span>Oncology Wing</span>
                                <span>85%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#008080] rounded-full w-[85%]"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                <span>Hematology Lab</span>
                                <span>42%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-400 rounded-full w-[42%]"></div>
                            </div>
                        </div>

                        <div className="mt-8 relative h-40 w-full rounded-3xl overflow-hidden border border-gray-100">
                             <Image src="/hero.png" alt="Clinic" fill className="object-cover" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
