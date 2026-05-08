"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import NotificationBell from "@/app/components/NotificationBell";

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [profile, setProfile] = useState<{ name: string; photoURL: string; specialization: string }>({
        name: "",
        photoURL: "",
        specialization: ""
    });

    useEffect(() => {
        let unsubscribeDoc: (() => void) | undefined;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                unsubscribeDoc = onSnapshot(doc(db, "users", user.uid), (userDoc) => {
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setProfile({
                            name: data.fullName || user.displayName || "",
                            photoURL: data.photoURL || "",
                            specialization: data.specialization || ""
                        });
                    }
                }, (err) => {
                    console.error("Error listening to layout profile:", err);
                });
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const navItems = [
        { name: "Dashboard", href: "/dashboard/doctor", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ) },
        { name: "Donor Search", href: "/dashboard/doctor/find-donors", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ) },
        { name: "Patient List", href: "/dashboard/doctor/patients", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ) },
        { name: "Verifications", href: "/dashboard/doctor/verifications", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ) },
        { name: "My Profile", href: "/dashboard/doctor/profile", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ) },
    ];

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 z-50">
                {/* Logo Section */}
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex items-center justify-center bg-[#008080] rounded-lg">
                            <span className="text-white font-bold text-xl">L</span>
                        </div>
                        <span className="font-bold text-xl text-[#1A1C1E] tracking-tight">LifeSync Dash</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 mt-6">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                        active
                                            ? "bg-[#E6F2F2] text-[#008080]"
                                            : "text-[#64748B] hover:bg-gray-50 hover:text-[#008080]"
                                    }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* New Consultation Button */}
                    <div className="mt-10 px-2">
                        <button className="w-full bg-[#008080] hover:bg-[#006967] text-white rounded-xl py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-700/10 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            New Consultation
                        </button>
                    </div>
                </nav>

                {/* Bottom User Section */}
                <div className="p-6 border-t border-gray-50">
                    <div className="flex items-center gap-3 mb-6 p-2">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center text-[#008080] font-bold">
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                (profile.name || "?").substring(0, 2).toUpperCase()
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#1A1C1E]">{profile.name || "Doctor"}</span>
                            <span className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wider">{profile.specialization || "Specialization pending"}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Link href="#" className="flex items-center gap-3 px-4 py-2.5 text-[#64748B] hover:text-[#008080] text-sm font-semibold transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Help Center
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#64748B] hover:text-red-500 text-sm font-semibold transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-72 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="h-20 flex justify-between items-center px-10 bg-transparent">
                    {/* Search Bar */}
                    <div className="relative w-96">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search patients, donors, or records..."
                            className="w-full bg-white border-0 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#008080]/20 transition-all shadow-sm shadow-gray-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Top Right Actions */}
                    <div className="flex items-center gap-6">
                        <NotificationBell inboxHref="/dashboard/doctor/notifications" />
                        <button className="p-2 text-gray-400 hover:text-[#008080] transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm bg-teal-50">
                             {profile.photoURL ? (
                                 <img src={profile.photoURL} alt="Doctor" className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-[#008080] text-[10px] font-bold">
                                     {(profile.name || "?").substring(0, 2).toUpperCase()}
                                 </div>
                             )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="px-10 py-4 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
