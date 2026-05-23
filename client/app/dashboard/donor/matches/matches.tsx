"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { matchLabel } from "@/lib/matching";
import { isVerified } from "@/lib/verification";
import { ConnectionRequest, subscribeRequestsForDonor } from "@/lib/requests";
import VerificationGate from "@/app/components/VerificationGate";

interface AcceptedPatient {
    id: string;
    name: string;
    bloodGroup: string;
    matchPercentage: number;
    urgency: "Critical" | "High" | "Moderate" | string;
    location: string;
}

export default function DonorMatches() {
    const [loading, setLoading] = useState(true);
    const [currentDonor, setCurrentDonor] = useState<any>(null);
    const [accepted, setAccepted] = useState<ConnectionRequest[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const donorDoc = await getDoc(doc(db, "users", user.uid));
                const donor = donorDoc.exists() ? { uid: user.uid, ...donorDoc.data() } : { uid: user.uid };
                setCurrentDonor(donor);
            } catch (err) {
                console.error("Failed to load donor profile:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!currentDonor?.uid) return;
        const unsub = subscribeRequestsForDonor(currentDonor.uid, "accepted", setAccepted);
        return () => unsub();
    }, [currentDonor?.uid]);

    const acceptedPatients: AcceptedPatient[] = useMemo(
        () =>
            accepted.map((r) => ({
                id: r.patientUid,
                name: r.patientName || "Patient",
                bloodGroup: r.patientBloodGroup || "N/A",
                matchPercentage: r.score ?? 0,
                urgency: r.patientUrgency || "Moderate",
                location: r.patientLocation || "Location Not Provided",
            })),
        [accepted],
    );

    const totalAccepted = acceptedPatients.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#008080] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading accepted patients...</p>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-[#004D40] text-3xl font-black tracking-tight mb-1">Accepted patients</h1>
                        <p className="text-gray-500 font-medium">Review and respond to verified patients who matched with you</p>
                    </div>
                </div>
            </div>

            <VerificationGate user={currentDonor} profileHref="/dashboard/donor/profile" audience="donor" />

            {!isVerified(currentDonor) ? null : (<>

            {/* Total Summary Card */}
            <div className="mb-12 bg-[#008080] rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-white/20 hover:scale-[1.01] transition-transform duration-500">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl md:text-2xl font-bold mb-2 tracking-tight">Total Accepted patients</h2>
                        <p className="text-teal-50/80 font-medium text-lg">Currently in process</p>
                    </div>
                    <div className="text-6xl md:text-8xl font-black text-white/90 drop-shadow-lg">
                        {totalAccepted}
                    </div>
                </div>
            </div>

            {totalAccepted === 0 ? (
                <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2rem] p-16 shadow-xl text-center">
                    <h2 className="text-xl font-black text-slate-500 mb-2">No accepted patients yet</h2>
                    <p className="text-slate-400">When patients you match with are accepted, they will appear here.</p>
                </div>
            ) : (
                /* Patient Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 relative z-10">
                    {acceptedPatients.map((patient) => (
                        <div key={patient.id} className="group relative bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/60 p-8 shadow-[0_8px_32px_0_rgba(0,128,128,0.08)] hover:shadow-[0_20px_64px_0_rgba(0,128,128,0.15)] transition-all duration-700 hover:-translate-y-3 flex flex-col overflow-hidden">
                            {/* Animated Background Glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors duration-700"></div>
                            
                            {/* Header Section */}
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-teal-400/20 rounded-2xl blur-md group-hover:blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 flex items-center justify-center text-[#008080] shadow-[0_4px_12px_rgba(0,128,128,0.08)] border border-white/80 relative z-10 group-hover:scale-110 transition-transform duration-700 ease-out">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 text-xl tracking-tight group-hover:text-[#008080] transition-colors duration-300">{patient.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1.5 opacity-60">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{patient.location}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.1em] uppercase border backdrop-blur-md shadow-sm ${
                                    patient.urgency === 'Critical' ? 'bg-red-500/10 text-red-600 border-red-200/50' :
                                    patient.urgency === 'High' ? 'bg-orange-500/10 text-orange-600 border-orange-200/50' :
                                    'bg-teal-500/10 text-teal-600 border-teal-200/50'
                                }`}>
                                    {patient.urgency}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                                <div className="bg-white/40 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/60 hover:bg-white/60 transition-colors duration-500">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-2">Blood Type</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                                        <p className="text-gray-900 text-2xl font-black">{patient.bloodGroup}</p>
                                    </div>
                                </div>
                                <div className="bg-white/40 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/60 hover:bg-white/60 transition-colors duration-500">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-2">Match Level</span>
                                    <p className={`text-2xl font-black ${patient.matchPercentage >= 80 ? 'text-teal-600' : 'text-orange-600'}`}>
                                        {matchLabel(patient.matchPercentage)}
                                    </p>
                                </div>
                            </div>

                            {/* Compatibility Meter */}
                            <div className="mb-10 relative z-10">
                                <div className="flex justify-between items-end mb-4">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Compatibility Score</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-gray-900 tracking-tighter">{patient.matchPercentage}</span>
                                        <span className="text-sm font-black text-[#008080] opacity-50">%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200/30 rounded-full h-3 p-1 backdrop-blur-sm shadow-inner overflow-hidden">
                                    <div
                                        className={`h-full rounded-full shadow-[0_0_12px_rgba(0,128,128,0.2)] transition-all duration-1000 ease-out relative ${
                                            patient.matchPercentage >= 80 
                                            ? 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600' 
                                            : 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600'
                                        }`}
                                        style={{ width: `${patient.matchPercentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-auto relative z-10 pt-2">
                                <Link
                                    href={`/dashboard/donor/matches/${patient.id}`}
                                    className="group/btn relative w-full h-16 flex items-center justify-center rounded-[1.5rem] bg-[#008080] text-white font-black text-sm tracking-widest uppercase overflow-hidden transition-all duration-500 hover:shadow-[0_12px_32px_-8px_rgba(0,128,128,0.5)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400/0 via-white/10 to-teal-400/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                    <span className="relative z-10 flex items-center gap-3">
                                        View Full Profile
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </>)}

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
