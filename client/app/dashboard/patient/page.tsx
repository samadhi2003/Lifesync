"use client";

import { useState, useEffect, useMemo } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { computeMatchPercentage, matchLabel, matchLevel } from "@/lib/matching";
import { isVerified } from "@/lib/verification";
import { createRequest, RequestStatus, subscribeRequestsForPatient } from "@/lib/requests";
import VerificationGate from "@/app/components/VerificationGate";
import VerifiedBadge from "@/app/components/VerifiedBadge";

export default function PatientDashboard() {
    const [filter, setFilter] = useState("All");
    const [donors, setDonors] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [requestStatus, setRequestStatus] = useState<Record<string, RequestStatus>>({});
    const [requestingId, setRequestingId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch current user data
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setCurrentUser({ uid: user.uid, ...userDoc.data() });
                } else {
                    // Fallback if Firestore profile doesn't exist yet
                    setCurrentUser({
                        uid: user.uid,
                        fullName: user.displayName || "User",
                        email: user.email,
                        role: "patient"
                    });
                }

                // Fetch verified donors from Firestore. Only verified donors
                // are shown so the matching board can't surface unvetted users.
                const donorsSnapshot = await getDocs(collection(db, "users"));
                const donorsList = donorsSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter((u: unknown) => u.role === "donor" && isVerified(u));

                setDonors(donorsList);
                setLoading(false);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!currentUser?.uid) return;
        const unsub = subscribeRequestsForPatient(currentUser.uid, (items) => {
            const next: Record<string, RequestStatus> = {};
            for (const r of items) next[r.donorUid] = r.status;
            setRequestStatus(next);
        });
        return () => unsub();
    }, [currentUser?.uid]);

    const donorsWithMatch = useMemo(
        () =>
            donors
                .map((donor) => ({
                    ...donor,
                    match: computeMatchPercentage(currentUser, donor),
                }))
                .sort((a, b) => b.match - a.match),
        [donors, currentUser],
    );

    const handleRequest = async (donor: unknown) => {
        if (!currentUser?.uid) return;
        setRequestingId(donor.id);
        try {
            await createRequest({
                patientUid: currentUser.uid,
                donorUid: donor.id,
                patientName: currentUser.fullName,
                donorName: donor.fullName,
                patientBloodGroup: currentUser.bloodGroup,
                patientUrgency: currentUser.urgency,
                patientLocation: currentUser.address,
                score: donor.match,
            });
        } catch (err) {
            console.error("Failed to send request:", err);
            alert("Failed to send request. Please try again.");
        } finally {
            setRequestingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#00796B] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 font-medium">Please log in to view your dashboard</p>
                </div>
            </div>
        );
    }

    const filteredDonors = donorsWithMatch.filter((donor) => {
        if (filter === "All") return true;
        return matchLevel(donor.match) === filter;
    });

    return (
        <div className="font-sans min-h-screen relative overflow-hidden">
            {/* Decorative Background Elements - Essential for Glassmorphism */}
            <div className="fixed top-20 left-20 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob"></div>
            <div className="fixed top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob animation-delay-2000"></div>
            <div className="fixed -bottom-8 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob animation-delay-4000"></div>

            {/* Welcome Banner */}
            <div className="mb-10 bg-gradient-to-r from-[#29D496] via-[#B5DDD2] to-[#297C78] backdrop-blur-md rounded-2xl p-8 md:p-14 text-white shadow-2xl relative overflow-hidden border border-white/20">
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
                            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Welcome back, {currentUser?.fullName || "User"}</h1>
                        </div>
                        <p className="text-white/90 ml-[64px] text-sm font-medium">We found {donors.length} potential matches for you</p>
                    </div>
                </div>
            </div>

            <VerificationGate user={currentUser} profileHref="/dashboard/patient/profile" audience="patient" />

            {isVerified(currentUser) && (
                <>
                    {/* Header */}
                    <div className="mb-8 pl-2">
                        <h1 className="text-[#004D40] text-3xl font-bold mb-1">All Matches</h1>
                        <p className="text-slate-500">Browse verified kidney donors</p>
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

                    <p className="text-slate-500 text-sm mb-6 font-medium pl-2">Showing {filteredDonors.length} of {donorsWithMatch.length} verified donors</p>
                </>
            )}

            {/* Grid */}
            {isVerified(currentUser) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDonors.map((donor) => (
                    <div key={donor.id} className="group relative bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/60 p-8 shadow-[0_8px_32px_0_rgba(0,128,128,0.08)] hover:shadow-[0_20px_64px_0_rgba(0,128,128,0.15)] transition-all duration-700 hover:-translate-y-3 flex flex-col overflow-hidden">
                        {/* Animated Background Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors duration-700"></div>

                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-teal-400/20 rounded-2xl blur-md group-hover:blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 flex items-center justify-center text-[#00796B] shadow-[0_4px_12px_rgba(0,128,128,0.08)] border border-white/80 relative z-10 group-hover:scale-110 transition-transform duration-700 ease-out">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-gray-900 text-xl tracking-tight group-hover:text-[#00796B] transition-colors duration-300">{donor.fullName || "Donor"}</h3>
                                        <VerifiedBadge user={donor} />
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1.5 opacity-60">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{donor.address || "Location unknown"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                            <div className="bg-white/40 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/60 hover:bg-white/60 transition-colors duration-500 shadow-sm">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-2">Blood Type</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                                    <p className="text-gray-900 text-2xl font-black">{donor.bloodGroup || "N/A"}</p>
                                </div>
                            </div>
                            <div className="bg-white/40 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/60 hover:bg-white/60 transition-colors duration-500 shadow-sm">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-2">Match Level</span>
                                <p className={`text-2xl font-black ${donor.match >= 80 ? 'text-teal-600' : 'text-orange-600'}`}>
                                    {matchLabel(donor.match)}
                                </p>
                            </div>
                        </div>

                        {/* Compatibility Meter */}
                        <div className="mb-10 relative z-10">
                            <div className="flex justify-between items-end mb-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Compatibility Score</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-gray-900 tracking-tighter">{donor.match}</span>
                                    <span className="text-sm font-black text-[#00796B] opacity-50">%</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200/30 rounded-full h-3 p-1 backdrop-blur-sm shadow-inner overflow-hidden">
                                <div
                                    className={`h-full rounded-full shadow-[0_0_12px_rgba(0,128,128,0.2)] transition-all duration-1000 ease-out relative ${
                                        donor.match >= 80 
                                        ? 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600' 
                                        : 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600'
                                    }`}
                                    style={{ width: `${donor.match}%` }}
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto relative z-10 flex gap-3 pt-2">
                            {(() => {
                                const status = requestStatus[donor.id];
                                if (status === "accepted") {
                                    return (
                                        <button disabled className="w-full h-16 flex items-center justify-center rounded-[1.5rem] bg-teal-50 text-teal-700 text-xs font-black tracking-widest uppercase border border-teal-100 cursor-default shadow-sm">
                                            Match Accepted
                                        </button>
                                    );
                                }
                                if (status === "pending") {
                                    return (
                                        <button disabled className="w-full h-16 flex items-center justify-center rounded-[1.5rem] bg-teal-900/5 text-teal-900/40 text-xs font-black tracking-widest uppercase border border-teal-900/10 cursor-default">
                                            Request Sent
                                        </button>
                                    );
                                }
                                if (status === "ignored") {
                                    return (
                                        <button disabled className="w-full h-16 flex items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-400 text-xs font-black tracking-widest uppercase border border-slate-100 cursor-default">
                                            Declined
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        disabled={requestingId === donor.id}
                                        onClick={() => handleRequest(donor)}
                                        className="group/btn relative w-full h-16 flex items-center justify-center rounded-[1.5rem] bg-[#00796B] text-white font-black text-xs tracking-widest uppercase overflow-hidden transition-all duration-500 hover:shadow-[0_12px_32px_-8px_rgba(0,128,128,0.5)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] disabled:opacity-60"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/0 via-white/10 to-teal-400/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                        <span className="relative z-10 flex items-center gap-3">
                                            {requestingId === donor.id ? "Sending…" : "Send Request"}
                                            {requestingId !== donor.id && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            )}
                                        </span>
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                ))}
            </div>
            )}

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
