"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

type RecentPatient = {
    id: string;
    name: string;
    initials: string;
    urgency: string;
    note: string;
};

const INITIAL_COUNTS = { pendingApprovals: 0, newMatches: 0 };

function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "?";
}

export default function DoctorHome() {
    const [doctorName, setDoctorName] = useState<string>("");
    const [counts, setCounts] = useState(INITIAL_COUNTS);
    const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeProfile: (() => void) | undefined;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (snap) => {
                if (snap.exists()) {
                    setDoctorName(snap.data().fullName || "");
                }
            });

            (async () => {
                try {
                    // Pending approvals: patients this doctor saved with status "Searching".
                    const patientsRef = collection(db, "patients");
                    const doctorPatientsSnap = await getDocs(
                        query(patientsRef, where("doctorId", "==", user.uid)),
                    );
                    const doctorPatients = doctorPatientsSnap.docs.map((d) => ({
                        id: d.id,
                        ...(d.data() as Record<string, unknown>),
                    }));

                    const pendingApprovals = doctorPatients.filter(
                        (p) => (p.status || "").toString().toLowerCase() === "searching",
                    ).length;

                    // New donor matches: count of verified donors in the pool the doctor can draw on.
                    const donorsSnap = await getDocs(
                        query(collection(db, "users"), where("role", "==", "donor")),
                    );
                    const newMatches = donorsSnap.size;

                    setCounts({ pendingApprovals, newMatches });

                    const recent: RecentPatient[] = doctorPatients
                        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
                        .slice(0, 3)
                        .map((p: unknown) => ({
                            id: p.id,
                            name: p.name || "Unnamed Patient",
                            initials: initials(p.name || "?"),
                            urgency: p.urgency || "Moderate",
                            note: p.hlaUrl
                                ? "HLA report on file"
                                : p.onDialysis
                                ? "On dialysis — awaiting donor match"
                                : "Match search in progress",
                        }));
                    setRecentPatients(recent);
                } catch (err) {
                    console.error("Failed to load doctor dashboard stats:", err);
                } finally {
                    setLoading(false);
                }
            })();
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);

    const todayLabel = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const greetingName = doctorName
        ? doctorName.startsWith("Dr") || doctorName.startsWith("dr")
            ? doctorName
            : `Dr. ${doctorName}`
        : "Doctor";

    return (
        <div className="font-sans">
            {/* Welcome Banner */}
            <div className="mb-8 bg-[#008080] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-teal-900/10">
                {/* Decorative Circles */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-20%] left-[60%] w-64 h-64 bg-teal-400/20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">
                        Welcome back, {greetingName}
                    </h1>
                    <p className="text-teal-50/90 text-lg max-w-2xl leading-relaxed mb-8">
                        {loading
                            ? "Loading your clinical overview..."
                            : `You have ${counts.pendingApprovals} patient ${
                                  counts.pendingApprovals === 1 ? "approval" : "approvals"
                              } pending and ${counts.newMatches} registered ${
                                  counts.newMatches === 1 ? "donor" : "donors"
                              } in the network. Clinical Intelligence systems are operating at peak efficiency.`}
                    </p>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-wider">System Live</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                            <span className="text-xs font-bold uppercase tracking-wider">{todayLabel}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Find Donors */}
                <Link href="/dashboard/doctor/find-donors" className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1C1E] mb-3">Find Donors</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Access the global registry to search for compatible hematological donors using AI-driven matching protocols.
                    </p>
                    <span className="text-[#008080] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                        Get Started
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </span>
                </Link>

                {/* My Patients */}
                <Link href="/dashboard/doctor/patients" className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-[#008080] mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1C1E] mb-3">My Patients</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Monitor your assigned patient roster, view treatment progress, and update clinical logs in real-time.
                    </p>
                    <span className="text-[#008080] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                        View List
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </span>
                </Link>

                {/* My Profile */}
                <Link href="/dashboard/doctor/profile" className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1C1E] mb-3">My Profile</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Manage your professional credentials, departmental settings, and notification preferences.
                    </p>
                    <span className="text-[#008080] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                        Update Info
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </span>
                </Link>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Patient Activity */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-[#1A1C1E]">Recent Patient Activity</h2>
                        <Link href="/dashboard/doctor/patients" className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest hover:text-[#008080] transition-colors">See All</Link>
                    </div>

                    {recentPatients.length === 0 ? (
                        <div className="p-6 rounded-3xl bg-slate-50 text-center text-slate-400 text-sm font-medium">
                            {loading ? "Loading recent activity..." : "No patients yet. Add a patient from the Find Donors page."}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentPatients.map((patient) => {
                                const urgency = patient.urgency.toLowerCase();
                                const pillClass =
                                    urgency === "critical"
                                        ? "bg-red-100 text-red-600 border-red-200"
                                        : urgency === "high"
                                        ? "bg-orange-100 text-orange-600 border-orange-200"
                                        : "bg-green-100 text-green-600 border-green-200";
                                const avatarClass =
                                    urgency === "critical"
                                        ? "bg-red-100 text-red-600"
                                        : urgency === "high"
                                        ? "bg-orange-100 text-orange-600"
                                        : "bg-blue-100 text-blue-600";
                                return (
                                    <div key={patient.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl ${avatarClass} flex items-center justify-center font-bold`}>{patient.initials}</div>
                                            <div>
                                                <h4 className="font-bold text-[#1A1C1E]">{patient.name}</h4>
                                                <p className="text-xs text-slate-500">{patient.note}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${pillClass}`}>{patient.urgency}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* At a Glance */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col">
                    <h2 className="text-2xl font-bold text-[#1A1C1E] mb-8">At a Glance</h2>

                    <div className="space-y-6 flex-1">
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                <span>Pending Approvals</span>
                                <span>{counts.pendingApprovals}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#008080] rounded-full transition-all"
                                    style={{ width: `${Math.min(100, counts.pendingApprovals * 20)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                <span>Donor Pool</span>
                                <span>{counts.newMatches}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-400 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, counts.newMatches * 5)}%` }}
                                ></div>
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
