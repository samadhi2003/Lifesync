"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { computeMatchPercentage, matchLabel } from "@/lib/matching";
import { isVerified } from "@/lib/verification";
import VerificationGate from "@/app/components/VerificationGate";
import VerifiedBadge from "@/app/components/VerifiedBadge";

type DonorWithMatch = {
    id: string;
    fullName?: string;
    bloodGroup?: string;
    address?: string;
    urgency?: string;
    match: number;
    status: "ACCEPTED" | "REQUESTED";
};

export default function MatchesPage() {
    const [filter, setFilter] = useState("All");
    const [donors, setDonors] = useState<DonorWithMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const me = userDoc.exists() ? { uid: user.uid, ...userDoc.data() } : { uid: user.uid };
                setCurrentUser(me);

                const donorsSnapshot = await getDocs(collection(db, "users"));
                const fetched = donorsSnapshot.docs
                    .map((d) => ({ id: d.id, ...(d.data() as any) }))
                    .filter((u: any) => u.role === "donor" && isVerified(u))
                    .map((d: any) => {
                        const match = computeMatchPercentage(me, d);
                        return {
                            ...d,
                            match,
                            // Until a real "requests" collection is wired up, use match score
                            // as the proxy: high-confidence matches are treated as accepted and
                            // opened for profile viewing; weaker matches stay in the requested state.
                            status: match >= 80 ? "ACCEPTED" : "REQUESTED",
                        } as DonorWithMatch;
                    })
                    .sort((a: DonorWithMatch, b: DonorWithMatch) => b.match - a.match);

                setDonors(fetched);
            } catch (err) {
                console.error("Failed to load matches:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const filteredDonors = useMemo(
        () =>
            donors.filter((donor) => {
                if (filter === "All") return true;
                return donor.status === filter.toUpperCase();
            }),
        [donors, filter],
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00796B] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading matches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans min-h-screen relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="fixed top-20 left-20 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob"></div>
            <div className="fixed top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob animation-delay-2000"></div>
            <div className="fixed -bottom-8 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-blob animation-delay-4000"></div>

            {/* Header */}
            <div className="mb-8 pl-2 mt-8">
                <h1 className="text-[#004D40] text-3xl font-bold mb-1">My Matches</h1>
                <p className="text-slate-500">Track and manage your donor connections</p>
            </div>

            <VerificationGate user={currentUser} profileHref="/dashboard/patient/profile" audience="patient" />

            {isVerified(currentUser) && (
            <>
            {/* Status Filter Bar - Glassmorphism */}
            <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between mb-8 shadow-lg ring-1 ring-white/20">
                <div className="font-bold text-[#00695C] text-lg pl-2">Filter by Status</div>
                <div className="flex gap-2 flex-wrap justify-center">
                    {["All", "Accepted", "Requested"].map((f) => (
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

            <p className="text-slate-500 text-sm mb-6 font-medium pl-2">Showing {filteredDonors.length} of {donors.length} verified donors</p>

            {filteredDonors.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-xl border border-white/40 rounded-2xl p-16 text-center shadow-lg">
                    <h2 className="text-xl font-black text-slate-500 mb-2">No donors yet</h2>
                    <p className="text-slate-400">As donors register on LifeSync your matches will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {filteredDonors.map((donor) => (
                        <div key={donor.id} className="group bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/30 hover:shadow-2xl hover:bg-white/60 transition-all duration-300 relative overflow-hidden ring-1 ring-white/20 hover:-translate-y-1">

                            {/* Glowing gradient effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-white flex items-center justify-center text-[#00796B] shadow-inner border border-white/50 group-hover:scale-110 transition-transform duration-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-gray-900 text-xl tracking-tight">{donor.fullName || "Donor"}</h3>
                                            <VerifiedBadge user={donor as any} />
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <p className="text-gray-400 text-xs font-semibold">{donor.address || "Location unknown"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mid Section: Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Blood Type</span>
                                    <p className="text-[#00796B] text-xl font-black">{donor.bloodGroup || "N/A"}</p>
                                </div>
                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Match Level</span>
                                    <p className={`text-xl font-black ${donor.match >= 80 ? 'text-teal-600' : 'text-orange-600'}`}>
                                        {matchLabel(donor.match)}
                                    </p>
                                </div>
                            </div>

                            {/* Match Progress */}
                            <div className="mb-10 relative z-10">
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Compatibility</p>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-2xl font-black text-gray-900">{donor.match}</span>
                                        <span className="text-xs font-bold text-[#00796B]">%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100/80 rounded-full h-2.5 p-0.5 shadow-inner">
                                    <div
                                        className={`h-full rounded-full shadow-lg transition-all duration-1000 ease-out relative overflow-hidden ${donor.match >= 80 ? 'bg-gradient-to-r from-[#26A69A] to-[#4DB6AC]' : 'bg-gradient-to-r from-[#FFB74D] to-[#FFA726]'
                                            }`}
                                        style={{ width: `${donor.match}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons based on status */}
                            <div className="flex gap-3 relative z-10">
                                {donor.status === 'ACCEPTED' ? (
                                    <Link href={`/dashboard/patient/matches/${donor.id}`} className="flex-1">
                                        <button className="w-full bg-[#00796B] hover:bg-[#00695C] text-white text-sm font-black py-4 rounded-[1.25rem] transition-all duration-300 shadow-xl shadow-teal-900/10 hover:shadow-teal-900/30 active:scale-95 border-b-4 border-teal-900/20">
                                            View Profile
                                        </button>
                                    </Link>
                                ) : (
                                    <button className="w-full bg-[#00796B]/10 text-[#00796B]/60 border border-[#00796B]/20 text-sm font-black py-4 rounded-[1.25rem] cursor-default flex items-center justify-center gap-2" disabled>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Requested
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </>
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
