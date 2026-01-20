"use client";

import Link from "next/link";
import { use } from "react";

export default function DonorProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);

    // Mock Data - In a real app, fetch based on params.id
    const donor = {
        id: params.id,
        name: "Samadhi Uluwaduge",
        age: 29,
        bloodGroup: "O+",
        location: "Colombo, Sri Lanka",
        match: 92,
        status: "ACCEPTED",
        bio: "I am a healthy individual looking to help someone in need. I lead an active lifestyle and have no history of chronic illnesses.",
        medicalInfo: {
            hlaMatch: "8/10",
            bloodTypeCompatible: true,
            antibodyScreen: "Negative",
            bmi: 22.5
        }
    };

    const getProgressColor = (match: number) => {
        if (match >= 80) return "bg-[#00BFA5]";
        if (match >= 50) return "bg-[#FFB300]";
        return "bg-[#EF5350]";
    };

    return (
        <div className="font-sans min-h-screen relative overflow-hidden text-slate-800">
            {/* Decorative Background Elements */}
            <div className="fixed top-20 left-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 -z-10 animate-blob"></div>
            <div className="fixed bottom-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 -z-10 animate-blob animation-delay-2000"></div>

            {/* Back Button */}
            <div className="mb-6">
                <Link href="/dashboard/patient/matches" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#00796B] transition-colors font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Matches
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-100 to-white flex items-center justify-center text-[#00796B] shadow-inner mb-6 ring-4 ring-white/60">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 mb-1">{donor.name}</h1>
                            <p className="text-slate-500 font-medium mb-4">{donor.location}</p>

                            <div className="bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-teal-100">
                                {donor.status}
                            </div>

                            <div className="w-full grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/50 p-4 rounded-2xl border border-white/60">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Age</p>
                                    <p className="text-lg font-bold text-slate-700">{donor.age}</p>
                                </div>
                                <div className="bg-white/50 p-4 rounded-2xl border border-white/60">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Blood</p>
                                    <p className="text-lg font-bold text-slate-700">{donor.bloodGroup}</p>
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-3">
                                <button className="w-full bg-[#00796B] hover:bg-[#00695C] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-900/10 active:scale-95">
                                    Contact number
                                </button>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Match Score Card */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Compatibility Analysis</h2>
                            <span className="text-3xl font-black text-[#00796B]">{donor.match}%</span>
                        </div>

                        <div className="w-full bg-slate-200/50 rounded-full h-4 mb-8 overflow-hidden">
                            <div
                                className={`h-4 rounded-full ${getProgressColor(donor.match)} shadow-md relative`}
                                style={{ width: `${donor.match}%` }}
                            >
                                <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700">HLA Match</h3>
                                    <p className="text-sm text-slate-500">High compatibility ({donor.medicalInfo.hlaMatch} antigens)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700">Antibody Screen</h3>
                                    <p className="text-sm text-slate-500">Negative (Low rejection risk)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-lg">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Donor Bio</h2>
                        <p className="text-slate-600 leading-relaxed">
                            {donor.bio}
                        </p>
                    </div>
                </div>
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
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
