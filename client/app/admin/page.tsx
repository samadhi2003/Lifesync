"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Counts = {
    users: number;
    patients: number;
    donors: number;
    doctors: number;
    admins: number;
    patientRecords: number;
    pendingDonors: number;
    pendingDoctors: number;
};

const EMPTY: Counts = {
    users: 0,
    patients: 0,
    donors: 0,
    doctors: 0,
    admins: 0,
    patientRecords: 0,
    pendingDonors: 0,
    pendingDoctors: 0,
};

type RecentUser = {
    id: string;
    fullName?: string;
    email?: string;
    role?: string;
    createdAt?: string;
};

export default function AdminOverview() {
    const [counts, setCounts] = useState<Counts>(EMPTY);
    const [recent, setRecent] = useState<RecentUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const usersSnap = await getDocs(collection(db, "users"));
                const users = usersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));

                const byRole = (role: string) => users.filter((u) => u.role === role);

                const patientsSnap = await getDocs(collection(db, "patients"));

                const donors = byRole("donor");
                const doctors = byRole("doctor");

                if (cancelled) return;
                setCounts({
                    users: users.length,
                    patients: byRole("patient").length,
                    donors: donors.length,
                    doctors: doctors.length,
                    admins: byRole("admin").length,
                    patientRecords: patientsSnap.size,
                    pendingDonors: donors.filter((d) => !d.verified).length,
                    pendingDoctors: doctors.filter((d) => !d.verified).length,
                });

                const recentUsers = [...users]
                    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
                    .slice(0, 6);
                setRecent(recentUsers);
            } catch (err) {
                console.error("Admin overview load failed:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const statCards = [
        { label: "Total Users", value: counts.users, href: "/admin/users", accent: "bg-[#008080]" },
        { label: "Patients", value: counts.patients, href: "/admin/users?role=patient", accent: "bg-orange-500" },
        { label: "Donors", value: counts.donors, href: "/admin/donors", accent: "bg-blue-500" },
        { label: "Doctors", value: counts.doctors, href: "/admin/doctors", accent: "bg-purple-500" },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-[#008080] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-teal-900/10">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-20%] left-[60%] w-64 h-64 bg-teal-400/20 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-50/80 mb-3">Administrator Console</p>
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">Platform overview</h1>
                    <p className="text-teal-50/90 text-lg max-w-2xl leading-relaxed">
                        {loading
                            ? "Loading live metrics from Firestore…"
                            : `${counts.users} registered users across ${counts.patients} patients, ${counts.donors} donors, and ${counts.doctors} doctors. ${counts.pendingDonors + counts.pendingDoctors} verifications awaiting review.`}
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => (
                    <Link key={card.label} href={card.href} className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group">
                        <div className={`w-12 h-1.5 rounded-full ${card.accent} mb-6`}></div>
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-2">{card.label}</p>
                        <p className="text-4xl font-black text-[#1A1C1E]">{loading ? "—" : card.value}</p>
                    </Link>
                ))}
            </div>

            {/* Verification Queue + Patient Records */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Link href="/admin/donors" className="lg:col-span-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] p-8 text-white shadow-xl hover:shadow-2xl transition-all group">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-100 mb-4">Donor verification</p>
                    <p className="text-5xl font-black mb-2">{loading ? "—" : counts.pendingDonors}</p>
                    <p className="text-blue-100 text-sm font-medium">donors awaiting approval</p>
                </Link>

                <Link href="/admin/doctors" className="lg:col-span-1 bg-gradient-to-br from-purple-500 to-purple-600 rounded-[2rem] p-8 text-white shadow-xl hover:shadow-2xl transition-all group">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-100 mb-4">Doctor verification</p>
                    <p className="text-5xl font-black mb-2">{loading ? "—" : counts.pendingDoctors}</p>
                    <p className="text-purple-100 text-sm font-medium">doctors awaiting approval</p>
                </Link>

                <Link href="/admin/patients" className="lg:col-span-1 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2rem] p-8 text-white shadow-xl hover:shadow-2xl transition-all group">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-100 mb-4">Patient records</p>
                    <p className="text-5xl font-black mb-2">{loading ? "—" : counts.patientRecords}</p>
                    <p className="text-orange-100 text-sm font-medium">entries saved by doctors</p>
                </Link>
            </div>

            {/* Recent Signups */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[#1A1C1E]">Recent sign-ups</h2>
                        <p className="text-sm text-slate-400">The latest accounts created on LifeSync.</p>
                    </div>
                    <Link href="/admin/users" className="text-xs font-bold text-[#008080] uppercase tracking-widest hover:underline">View all users</Link>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#008080]"></div>
                    </div>
                ) : recent.length === 0 ? (
                    <p className="text-slate-400 text-sm font-medium py-8 text-center">No users yet.</p>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {recent.map((user) => (
                            <div key={user.id} className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center font-bold">
                                        {(user.fullName || user.email || "?").substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1A1C1E]">{user.fullName || "Unnamed"}</p>
                                        <p className="text-xs text-slate-400">{user.email}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.role === "admin"
                                    ? "bg-slate-100 text-slate-700 border-slate-200"
                                    : user.role === "doctor"
                                        ? "bg-purple-50 text-purple-600 border-purple-100"
                                        : user.role === "donor"
                                            ? "bg-blue-50 text-blue-600 border-blue-100"
                                            : "bg-orange-50 text-orange-600 border-orange-100"
                                    }`}>
                                    {user.role || "unknown"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
