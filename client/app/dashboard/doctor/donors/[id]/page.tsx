"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { computeMatch, isBloodCompatible, matchLabel } from "@/lib/matching";
import { HlaScoreResult, HlaTyping } from "@/lib/hla";
import HlaCompareTable from "@/app/components/HlaCompareTable";

type DonorView = {
    id: string;
    name: string;
    age: number | null;
    bloodGroup: string;
    location: string;
    match: number;
    provisional: boolean;
    hlaResult: HlaScoreResult;
    patientHla: HlaTyping | null;
    donorHla: HlaTyping | null;
    bio: string;
    hlaReportUrl?: string;
    medicalReportUrl?: string;
    bloodTypeCompatible: boolean;
};

function calculateAge(dob?: string | null): number | null {
    if (!dob) return null;
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return null;
    const age = new Date(Date.now() - birth.getTime()).getUTCFullYear() - 1970;
    return age > 0 && age < 150 ? age : null;
}

export default function DoctorDonorProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const searchParams = useSearchParams();
    const patientId = searchParams.get("patientId");

    const [donor, setDonor] = useState<DonorView | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [patientName, setPatientName] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const donorDoc = await getDoc(doc(db, "users", params.id));
                if (!donorDoc.exists()) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                const data = donorDoc.data() as Record<string, unknown>;

                let patient: Record<string, unknown> | null = null;
                if (patientId) {
                    const patientDoc = await getDoc(doc(db, "patients", patientId));
                    if (patientDoc.exists()) {
                        patient = { id: patientDoc.id, ...patientDoc.data() };
                        setPatientName((patient.name as string) || null);
                    }
                }

                const detail = computeMatch(patient, { id: params.id, ...data });

                setDonor({
                    id: params.id,
                    name: (data.fullName as string) || "Unnamed Donor",
                    age: calculateAge(data.dob as string | null),
                    bloodGroup: (data.bloodGroup as string) || "—",
                    location: (data.address as string) || "Location not provided",
                    match: detail.score,
                    provisional: detail.provisional,
                    hlaResult: detail.hla,
                    patientHla: (patient?.hla as HlaTyping) || null,
                    donorHla: (data.hla as HlaTyping) || null,
                    bio: (data.bio as string) || "This donor has not provided a personal bio yet.",
                    hlaReportUrl: data.hlaReportURL as string | undefined,
                    medicalReportUrl: data.medicalReportURL as string | undefined,
                    bloodTypeCompatible: isBloodCompatible(patient?.bloodGroup, data.bloodGroup),
                });
            } catch (err) {
                console.error("Failed to load donor profile:", err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [params.id, patientId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#008080] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading donor profile…</p>
                </div>
            </div>
        );
    }

    if (notFound || !donor) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
                <h2 className="text-2xl font-bold text-slate-700">Donor not found</h2>
                <p className="text-slate-500">This donor profile is no longer available.</p>
                <Link href="/dashboard/doctor/patients" className="text-[#008080] font-semibold underline">
                    Back to Patients
                </Link>
            </div>
        );
    }

    const matchColor = donor.match >= 80 ? "bg-[#00BFA5]" : donor.match >= 50 ? "bg-[#FFB300]" : "bg-[#EF5350]";

    return (
        <div className="font-sans min-h-screen relative overflow-hidden text-slate-800">
            <div className="fixed top-20 left-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 -z-10 animate-blob" />
            <div className="fixed bottom-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 -z-10 animate-blob animation-delay-2000" />

            {/* Back */}
            <div className="mb-6">
                <Link
                    href="/dashboard/doctor/patients"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-[#008080] transition-colors font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {patientName ? `Back to ${patientName}` : "Back to Patients"}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Profile card */}
                <div className="lg:col-span-1">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-100 to-white flex items-center justify-center text-[#008080] shadow-inner mb-6 ring-4 ring-white/60">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-slate-800 mb-1">{donor.name}</h1>
                            <p className="text-slate-500 font-medium mb-6">{donor.location}</p>

                            <div className="w-full grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/50 p-4 rounded-2xl border border-white/60">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Age</p>
                                    <p className="text-lg font-bold text-slate-700">{donor.age ?? "—"}</p>
                                </div>
                                <div className="bg-white/50 p-4 rounded-2xl border border-white/60">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Blood</p>
                                    <p className="text-lg font-bold text-slate-700">{donor.bloodGroup}</p>
                                </div>
                            </div>

                            <div className="w-full flex flex-col gap-3">
                                {donor.hlaReportUrl && (
                                    <a
                                        href={donor.hlaReportUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold py-3 rounded-xl transition-all text-sm text-center border border-teal-100"
                                    >
                                        View HLA Report
                                    </a>
                                )}
                                {donor.medicalReportUrl && (
                                    <a
                                        href={donor.medicalReportUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl transition-all text-sm text-center border border-slate-100"
                                    >
                                        View Medical Report
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Compatibility */}
                    {patientId && (
                        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Compatibility Analysis</h2>
                                    {patientName && (
                                        <p className="text-sm text-slate-400 mt-0.5">vs. {patientName}</p>
                                    )}
                                </div>
                                <span className="text-3xl font-black text-[#008080]">{donor.match}%</span>
                            </div>

                            <div className="w-full bg-slate-200/50 rounded-full h-4 mb-8 overflow-hidden">
                                <div
                                    className={`h-4 rounded-full ${matchColor} shadow-md`}
                                    style={{ width: `${donor.match}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${donor.bloodTypeCompatible ? "bg-teal-100 text-teal-600" : "bg-red-100 text-red-500"}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            {donor.bloodTypeCompatible ? (
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            ) : (
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            )}
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-700">Blood Compatibility</h3>
                                        <p className="text-sm text-slate-500">{donor.bloodTypeCompatible ? "ABO compatible" : "ABO mismatch"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-700">Match Tier</h3>
                                        <p className="text-sm text-slate-500">{matchLabel(donor.match)} compatibility</p>
                                    </div>
                                </div>
                            </div>

                            {donor.provisional && (
                                <p className="mt-6 text-xs text-amber-700 font-semibold bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100">
                                    {donor.hlaResult.bothSidesHaveData
                                        ? ""
                                        : donor.hlaResult.hasData
                                            ? "Awaiting HLA typing on the other side — score is preliminary."
                                            : "No HLA typing on either profile yet — score is based on ABO compatibility only."}
                                </p>
                            )}
                        </div>
                    )}

                    {/* HLA Comparison */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl">
                        <HlaCompareTable patient={donor.patientHla} donor={donor.donorHla} result={donor.hlaResult} />
                    </div>

                    {/* Bio */}
                    <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-lg">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Donor Bio</h2>
                        <p className="text-slate-600 leading-relaxed">{donor.bio}</p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes blob {
                    0%   { transform: translate(0px, 0px) scale(1); }
                    33%  { transform: translate(30px, -50px) scale(1.1); }
                    66%  { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
            `}</style>
        </div>
    );
}
