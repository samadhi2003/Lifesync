"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { computeMatchPercentage, isBloodCompatible, matchLabel } from "@/lib/matching";

type DonorProfile = {
    id: string;
    name: string;
    age: number | null;
    bloodGroup: string;
    location: string;
    match: number;
    status: "ACCEPTED" | "REQUESTED";
    bio: string;
    medicalInfo: {
        bloodTypeCompatible: boolean;
        hlaReportUrl?: string;
    };
    contact?: string;
};

function calculateAge(dob?: string | null): number | null {
    if (!dob) return null;
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return null;
    const diffMs = Date.now() - birth.getTime();
    const age = new Date(diffMs).getUTCFullYear() - 1970;
    return age > 0 && age < 150 ? age : null;
}

export default function DonorProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const [donor, setDonor] = useState<DonorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                const patientDoc = user ? await getDoc(doc(db, "users", user.uid)) : null;
                const patient = patientDoc?.exists() ? { uid: user!.uid, ...patientDoc.data() } : null;

                const donorDoc = await getDoc(doc(db, "users", params.id));
                if (!donorDoc.exists()) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                const data = donorDoc.data() as any;
                const match = computeMatchPercentage(patient, { id: params.id, ...data });

                setDonor({
                    id: params.id,
                    name: data.fullName || "Unnamed Donor",
                    age: calculateAge(data.dob),
                    bloodGroup: data.bloodGroup || "—",
                    location: data.address || "Location not provided",
                    match,
                    status: match >= 80 ? "ACCEPTED" : "REQUESTED",
                    bio: data.bio || "This donor has not provided a personal bio yet.",
                    medicalInfo: {
                        bloodTypeCompatible: isBloodCompatible(
                            (patient as any)?.bloodGroup,
                            data.bloodGroup,
                        ),
                        hlaReportUrl: data.hlaReportURL,
                    },
                    contact: data.contact,
                });
            } catch (err) {
                console.error("Failed to load donor profile:", err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [params.id]);

    const getProgressColor = (match: number) => {
        if (match >= 80) return "bg-[#00BFA5]";
        if (match >= 50) return "bg-[#FFB300]";
        return "bg-[#EF5350]";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00796B] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading donor profile...</p>
                </div>
            </div>
        );
    }

    if (notFound || !donor) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
                <h2 className="text-2xl font-bold text-slate-700">Donor not found</h2>
                <p className="text-slate-500">This donor profile is no longer available.</p>
                <Link href="/dashboard/patient/matches" className="text-[#00796B] font-semibold underline">Back to matches</Link>
            </div>
        );
    }

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
                                    <p className="text-lg font-bold text-slate-700">{donor.age ?? "—"}</p>
                                </div>
                                <div className="bg-white/50 p-4 rounded-2xl border border-white/60">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Blood</p>
                                    <p className="text-lg font-bold text-slate-700">{donor.bloodGroup}</p>
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-3">
                                {donor.contact ? (
                                    <a href={`tel:${donor.contact}`} className="w-full bg-[#00796B] hover:bg-[#00695C] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-900/10 active:scale-95 text-center">
                                        {donor.contact}
                                    </a>
                                ) : (
                                    <button disabled className="w-full bg-[#00796B]/40 text-white font-bold py-3.5 rounded-xl cursor-not-allowed">
                                        No contact on file
                                    </button>
                                )}
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
                                <div className={`p-2 rounded-lg ${donor.medicalInfo.bloodTypeCompatible ? 'bg-teal-100 text-teal-600' : 'bg-red-100 text-red-500'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700">Blood Compatibility</h3>
                                    <p className="text-sm text-slate-500">{donor.medicalInfo.bloodTypeCompatible ? "ABO compatible" : "ABO mismatch"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700">Match Tier</h3>
                                    <p className="text-sm text-slate-500">{matchLabel(donor.match)} compatibility</p>
                                </div>
                            </div>
                            {donor.medicalInfo.hlaReportUrl && (
                                <div className="md:col-span-2">
                                    <a
                                        href={donor.medicalInfo.hlaReportUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-bold hover:bg-teal-100 transition-colors"
                                    >
                                        View HLA Report
                                    </a>
                                </div>
                            )}
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
