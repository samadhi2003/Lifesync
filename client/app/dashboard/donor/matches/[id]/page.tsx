"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { computeMatch, isBloodCompatible, matchLabel } from "@/lib/matching";
import { HlaScoreResult, HlaTyping } from "@/lib/hla";
import { RequestStatus, acceptRequest, getRequestForPair, ignoreRequest, requestId } from "@/lib/requests";
import HlaCompareTable from "@/app/components/HlaCompareTable";
import ChatPanel from "@/app/components/ChatPanel";

type PatientProfile = {
    id: string;
    name: string;
    age: number | null;
    bloodGroup: string;
    location: string;
    urgency: string;
    match: number;
    provisional: boolean;
    hlaResult: HlaScoreResult;
    patientHla: HlaTyping | null;
    donorHla: HlaTyping | null;
    bio: string;
    medicalInfo: {
        bloodTypeCompatible: boolean;
        hlaReportUrl?: string;
    };
    contact?: string;
    requestStatus: RequestStatus | "not_requested";
};

function calculateAge(dob?: string | null): number | null {
    if (!dob) return null;
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return null;
    const diffMs = Date.now() - birth.getTime();
    const age = new Date(diffMs).getUTCFullYear() - 1970;
    return age > 0 && age < 150 ? age : null;
}

function urgencyTone(urgency: string): string {
    if (urgency === "Critical") return "bg-red-50 text-red-600 border-red-100";
    if (urgency === "High") return "bg-orange-50 text-orange-600 border-orange-100";
    return "bg-teal-50 text-teal-600 border-teal-100";
}

export default function PatientProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const [patient, setPatient] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [me, setMe] = useState<{ uid: string; fullName?: string } | null>(null);
    const [acting, setActing] = useState(false);

    const handleAccept = async () => {
        if (!me || !patient) return;
        setActing(true);
        try {
            await acceptRequest(requestId(patient.id, me.uid));
            setPatient((prev) => (prev ? { ...prev, requestStatus: "accepted" } : prev));
        } catch (err) {
            console.error("Failed to accept request:", err);
            alert("Failed to accept request.");
        } finally {
            setActing(false);
        }
    };

    const handleIgnore = async () => {
        if (!me || !patient) return;
        setActing(true);
        try {
            await ignoreRequest(requestId(patient.id, me.uid));
            setPatient((prev) => (prev ? { ...prev, requestStatus: "ignored" } : prev));
        } catch (err) {
            console.error("Failed to ignore request:", err);
            alert("Failed to ignore request.");
        } finally {
            setActing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                const donorDoc = user ? await getDoc(doc(db, "users", user.uid)) : null;
                const donor = donorDoc?.exists() ? { uid: user!.uid, ...donorDoc.data() } : null;
                if (user && donor) {
                    setMe({ uid: user.uid, fullName: (donor as Record<string, unknown>).fullName });
                } else {
                    setMe(null);
                }

                const patientDoc = await getDoc(doc(db, "users", params.id));
                if (!patientDoc.exists()) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                const data = patientDoc.data() as Record<string, unknown>;
                const detail = computeMatch({ id: params.id, ...data }, donor as Record<string, unknown>);

                let requestStatus: RequestStatus | "not_requested" = "not_requested";
                if (user) {
                    try {
                        const req = await getRequestForPair(params.id, user.uid);
                        if (req) requestStatus = req.status;
                    } catch (reqErr) {
                        console.warn("Failed to load request status:", reqErr);
                    }
                }

                setPatient({
                    id: params.id,
                    name: data.fullName || "Unnamed Patient",
                    age: calculateAge(data.dob),
                    bloodGroup: data.bloodGroup || "—",
                    location: data.address || "Location not provided",
                    urgency: data.urgency || "Moderate",
                    match: detail.score,
                    provisional: detail.provisional,
                    hlaResult: detail.hla,
                    patientHla: data.hla || null,
                    donorHla: (donor as Record<string, unknown>)?.hla || null,
                    bio: data.bio || "This patient has not provided a personal bio yet.",
                    medicalInfo: {
                        bloodTypeCompatible: isBloodCompatible(
                            data.bloodGroup,
                            (donor as Record<string, unknown>)?.bloodGroup,
                        ),
                        hlaReportUrl: data.hlaReportURL,
                    },
                    contact: data.contact,
                    requestStatus,
                });
            } catch (err) {
                console.error("Failed to load patient profile:", err);
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
                    <p className="text-gray-600 font-medium">Loading patient profile...</p>
                </div>
            </div>
        );
    }

    if (notFound || !patient) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
                <h2 className="text-2xl font-bold text-slate-700">Patient not found</h2>
                <p className="text-slate-500">This patient profile is no longer available.</p>
                <Link href="/dashboard/donor/matches" className="text-[#00796B] font-semibold underline">Back to accepted patients</Link>
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
                <Link href="/dashboard/donor/matches" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#00796B] transition-colors font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Accepted Patients
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
                            <h1 className="text-2xl font-bold text-slate-800 mb-1">{patient.name}</h1>
                            <p className="text-slate-500 font-medium mb-4">{patient.location}</p>

                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border ${urgencyTone(patient.urgency)}`}>
                                {patient.urgency} urgency
                            </div>
                            {(() => {
                                const map: Record<string, { label: string; classes: string }> = {
                                    accepted: { label: "Connected", classes: "bg-teal-50 text-teal-700 border-teal-100" },
                                    pending: { label: "Pending request", classes: "bg-amber-50 text-amber-700 border-amber-100" },
                                    ignored: { label: "Declined", classes: "bg-slate-100 text-slate-500 border-slate-200" },
                                    not_requested: { label: "No request", classes: "bg-slate-100 text-slate-500 border-slate-200" },
                                };
                                const pill = map[patient.requestStatus] ?? map.not_requested;
                                return (
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border ${pill.classes}`}>
                                        {pill.label}
                                    </div>
                                );
                            })()}

                            <div className="w-full grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/50 p-4 rounded-2xl border border-white/60">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Age</p>
                                    <p className="text-lg font-bold text-slate-700">{patient.age ?? "—"}</p>
                                </div>
                                <div className="bg-white/50 p-4 rounded-2xl border border-white/60">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Blood</p>
                                    <p className="text-lg font-bold text-slate-700">{patient.bloodGroup}</p>
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-3">
                                {patient.requestStatus === "accepted" ? (
                                    patient.contact ? (
                                        <a href={`tel:${patient.contact}`} className="w-full bg-[#00796B] hover:bg-[#00695C] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-900/10 active:scale-95 text-center">
                                            {patient.contact}
                                        </a>
                                    ) : (
                                        <button disabled className="w-full bg-[#00796B]/40 text-white font-bold py-3.5 rounded-xl cursor-not-allowed">
                                            No contact on file
                                        </button>
                                    )
                                ) : patient.requestStatus === "pending" ? (
                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={handleAccept}
                                            disabled={acting}
                                            className="flex-1 bg-[#00796B] hover:bg-[#00695C] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-900/10 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {acting ? "…" : "Accept"}
                                        </button>
                                        <button
                                            onClick={handleIgnore}
                                            disabled={acting}
                                            className="flex-1 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            Ignore
                                        </button>
                                    </div>
                                ) : patient.requestStatus === "ignored" ? (
                                    <button disabled className="w-full bg-slate-100 text-slate-500 font-bold py-3.5 rounded-xl cursor-not-allowed border border-slate-200">
                                        Declined
                                    </button>
                                ) : (
                                    <button disabled className="w-full bg-slate-100 text-slate-500 font-bold py-3.5 rounded-xl cursor-not-allowed border border-slate-200">
                                        No request from this patient
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                    {patient.requestStatus === "accepted" && me && (
                        <ChatPanel
                            chatId={requestId(patient.id, me.uid)}
                            currentUid={me.uid}
                            currentName={me.fullName}
                            partnerUid={patient.id}
                            partnerName={patient.name}
                            partnerRole="patient"
                        />
                    )}

                    {/* Match Score Card */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Compatibility Analysis</h2>
                            <span className="text-3xl font-black text-[#00796B]">{patient.match}%</span>
                        </div>

                        <div className="w-full bg-slate-200/50 rounded-full h-4 mb-8 overflow-hidden">
                            <div
                                className={`h-4 rounded-full ${getProgressColor(patient.match)} shadow-md relative`}
                                style={{ width: `${patient.match}%` }}
                            >
                                <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${patient.medicalInfo.bloodTypeCompatible ? 'bg-teal-100 text-teal-600' : 'bg-red-100 text-red-500'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700">Blood Compatibility</h3>
                                    <p className="text-sm text-slate-500">{patient.medicalInfo.bloodTypeCompatible ? "ABO compatible" : "ABO mismatch"}</p>
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
                                    <p className="text-sm text-slate-500">{matchLabel(patient.match)} compatibility</p>
                                </div>
                            </div>
                            {patient.medicalInfo.hlaReportUrl && (
                                <div className="md:col-span-2">
                                    <a
                                        href={patient.medicalInfo.hlaReportUrl}
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

                    {/* HLA breakdown */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl">
                        <HlaCompareTable patient={patient.patientHla} donor={patient.donorHla} result={patient.hlaResult} />
                        {patient.provisional && (
                            <p className="mt-4 text-xs text-amber-700 font-semibold">
                                {patient.hlaResult.bothSidesHaveData
                                    ? ""
                                    : patient.hlaResult.hasData
                                        ? "Awaiting HLA typing on the other side — score is preliminary."
                                        : "No HLA typing on either profile yet — score is based on ABO compatibility only."}
                            </p>
                        )}
                    </div>

                    {/* Bio Section */}
                    <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-lg">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Patient Bio</h2>
                        <p className="text-slate-600 leading-relaxed">
                            {patient.bio}
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
