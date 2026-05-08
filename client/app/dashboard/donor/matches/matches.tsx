"use client";

import { useEffect, useMemo, useState } from "react";
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
                        <div key={patient.id} className="group relative bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 p-7 shadow-2xl shadow-teal-900/[0.04] hover:shadow-teal-900/[0.1] transition-all duration-500 hover:-translate-y-2 flex flex-col">
                            {/* Header Section */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-white flex items-center justify-center text-[#008080] shadow-sm border border-teal-50 group-hover:scale-110 transition-transform duration-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-extrabold text-gray-900 text-lg leading-tight group-hover:text-[#008080] transition-colors">{patient.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <p className="text-gray-400 text-xs font-semibold">{patient.location}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-sm ${patient.urgency === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' :
                                    patient.urgency === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                        'bg-teal-50 text-teal-600 border-teal-100'
                                    }`}>
                                    {patient.urgency}
                                </div>
                            </div>

                            {/* Mid Section: Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Blood Type</span>
                                    <p className="text-[#008080] text-xl font-black">{patient.bloodGroup}</p>
                                </div>
                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Match Level</span>
                                    <p className={`text-xl font-black ${patient.matchPercentage >= 80 ? 'text-teal-600' : 'text-orange-600'}`}>
                                        {matchLabel(patient.matchPercentage)}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Section */}
                            <div className="mb-10">
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Compatibility</p>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-2xl font-black text-gray-900">{patient.matchPercentage}</span>
                                        <span className="text-xs font-bold text-[#008080]">%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100/80 rounded-full h-2.5 p-0.5 shadow-inner">
                                    <div
                                        className={`h-full rounded-full shadow-lg transition-all duration-1000 ease-out relative overflow-hidden ${patient.matchPercentage >= 80 ? 'bg-gradient-to-r from-[#26A69A] to-[#4DB6AC]' : 'bg-gradient-to-r from-[#FFB74D] to-[#FFA726]'
                                            }`}
                                        style={{ width: `${patient.matchPercentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Action */}
                            <div className="mt-auto flex gap-3">
                                <button className="flex-1 bg-[#008080] hover:bg-[#006967] text-white font-black py-4 rounded-[1.25rem] transition-all duration-300 text-sm shadow-xl shadow-teal-900/10 hover:shadow-teal-900/30 active:scale-[0.98] border-b-4 border-teal-900/20">
                                    Connect
                                </button>
                                <button className="flex-1 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 font-bold py-4 rounded-[1.25rem] transition-all duration-300 text-xs active:scale-[0.98] border border-gray-100">
                                    View profile
                                </button>
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
