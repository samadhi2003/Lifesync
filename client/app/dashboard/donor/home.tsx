"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { isVerified } from "@/lib/verification";
import { acceptRequest, ConnectionRequest, ignoreRequest, subscribeRequestsForDonor } from "@/lib/requests";
import VerificationGate from "@/app/components/VerificationGate";

export default function DonorHome() {
    const [selectedFilter, setSelectedFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setCurrentUser({ uid: user.uid, ...userDoc.data() });
                }
                setLoading(false);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!currentUser?.uid) return;
        const unsub = subscribeRequestsForDonor(currentUser.uid, "pending", setRequests);
        return () => unsub();
    }, [currentUser?.uid]);

    const handleAccept = async (id: string) => {
        setWorking(`accept:${id}`);
        try {
            await acceptRequest(id);
        } catch (err) {
            console.error("Accept failed:", err);
            alert("Failed to accept request.");
        } finally {
            setWorking(null);
        }
    };

    const handleIgnore = async (id: string) => {
        setWorking(`ignore:${id}`);
        try {
            await ignoreRequest(id);
        } catch (err) {
            console.error("Ignore failed:", err);
            alert("Failed to dismiss request.");
        } finally {
            setWorking(null);
        }
    };

    const filteredRequests = useMemo(
        () =>
            requests.filter((r) => {
                const score = r.score ?? 0;
                if (selectedFilter === "All") return true;
                if (selectedFilter === "High") return score >= 80;
                if (selectedFilter === "Medium") return score >= 60 && score < 80;
                if (selectedFilter === "Low") return score < 60;
                return true;
            }),
        [requests, selectedFilter],
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#008080] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

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
                                Welcome back, {currentUser?.fullName || "Donor"}
                            </h1>
                        </div>

                        <p className="text-white/90 ml-[64px] text-lg font-medium">
                            You have {requests.length} patient request{requests.length === 1 ? "" : "s"} waiting for your response
                        </p>
                    </div>
                </div>
            </div>

            <VerificationGate user={currentUser} profileHref="/dashboard/donor/profile" audience="donor" />

            {isVerified(currentUser) && (
            <>
            {/* Filter Section Header */}
            <div className="mb-8 relative z-10">
                <h2 className="text-[#006967] text-3xl font-black tracking-tight mb-2">Patient Requests</h2>
                <p className="text-gray-500 font-medium text-lg">Pending requests from patients waiting for your response</p>
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
                                onClick={() => setSelectedFilter(filter as Record<string, unknown>)}
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
                    Showing <span className="text-[#008080]">{filteredRequests.length}</span> of {requests.length} pending requests
                </div>
            </div>

            {/* Requests Grid */}
            {filteredRequests.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-16 text-center shadow-xl">
                    <h2 className="text-xl font-black text-slate-500 mb-2">No pending requests</h2>
                    <p className="text-slate-400">When verified patients send you a connection request, they will appear here.</p>
                </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {filteredRequests.map((request) => {
                    const score = request.score ?? 0;
                    const urgency = request.patientUrgency || "Moderate";
                    const isAccepting = working === `accept:${request.id}`;
                    const isIgnoring = working === `ignore:${request.id}`;
                    return (
                    <div key={request.id} className="group relative bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/60 p-8 shadow-[0_8px_32px_0_rgba(0,128,128,0.08)] hover:shadow-[0_20px_64px_0_rgba(0,128,128,0.15)] transition-all duration-700 hover:-translate-y-3 flex flex-col overflow-hidden">
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
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-gray-900 text-xl tracking-tight group-hover:text-[#008080] transition-colors duration-300">{request.patientName || "Patient"}</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1.5 opacity-60">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{request.patientLocation || "Location not provided"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.1em] uppercase border shadow-sm backdrop-blur-md relative z-20 ${urgency === 'Critical' ? 'bg-red-50/80 text-red-600 border-red-100' :
                                urgency === 'High' ? 'bg-orange-50/80 text-orange-600 border-orange-100' :
                                    'bg-teal-50/80 text-teal-600 border-teal-100'
                                }`}>
                                {urgency}
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                            <div className="bg-white/40 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/60 hover:bg-white/60 transition-colors duration-500 shadow-sm">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-2">Blood Type</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                                    <p className="text-gray-900 text-2xl font-black">{request.patientBloodGroup || "—"}</p>
                                </div>
                            </div>
                            <div className="bg-white/40 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/60 hover:bg-white/60 transition-colors duration-500 shadow-sm">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] block mb-2">Match Level</span>
                                <p className={`text-2xl font-black ${score >= 80 ? 'text-teal-600' : 'text-orange-600'}`}>
                                    {score >= 80 ? 'Elite' : score >= 60 ? 'Strong' : 'Moderate'}
                                </p>
                            </div>
                        </div>

                        {/* Compatibility Meter */}
                        <div className="mb-10 relative z-10">
                            <div className="flex justify-between items-end mb-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Compatibility Score</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-gray-900 tracking-tighter">{score}</span>
                                    <span className="text-sm font-black text-[#008080] opacity-50">%</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200/30 rounded-full h-3 p-1 backdrop-blur-sm shadow-inner overflow-hidden">
                                <div
                                    className={`h-full rounded-full shadow-[0_0_12px_rgba(0,128,128,0.2)] transition-all duration-1000 ease-out relative ${
                                        score >= 80 
                                        ? 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600' 
                                        : 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600'
                                    }`}
                                    style={{ width: `${score}%` }}
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="mt-auto relative z-10 flex gap-3 pt-2">
                            <button
                                disabled={isAccepting || isIgnoring}
                                onClick={() => handleAccept(request.id)}
                                className="group/btn relative flex-[2] h-16 flex items-center justify-center rounded-[1.5rem] bg-[#008080] text-white font-black text-xs tracking-widest uppercase overflow-hidden transition-all duration-500 hover:shadow-[0_12px_32px_-8px_rgba(0,128,128,0.5)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] disabled:opacity-60"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-400/0 via-white/10 to-teal-400/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                <span className="relative z-10 flex items-center gap-2">
                                    {isAccepting ? "Accepting…" : "Accept Request"}
                                    {!isAccepting && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </span>
                            </button>
                            <button
                                disabled={isAccepting || isIgnoring}
                                onClick={() => handleIgnore(request.id)}
                                className="flex-1 h-16 flex items-center justify-center rounded-[1.5rem] bg-white/50 text-gray-400 hover:text-gray-600 font-black text-[10px] tracking-widest uppercase border border-white/80 transition-all duration-300 hover:bg-white/80 active:scale-[0.98] disabled:opacity-60"
                            >
                                {isIgnoring ? "…" : "Ignore"}
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>
            )}
            </>
            )}
            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
