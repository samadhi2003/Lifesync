"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AdminGuard, { AdminProfile } from "./AdminGuard";

const NAV_ITEMS = [
    {
        name: "Overview",
        href: "/admin",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ),
    },
    {
        name: "Users",
        href: "/admin/users",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        name: "Patients",
        href: "/admin/patients",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
    },
    {
        name: "Donors",
        href: "/admin/donors",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    },
    {
        name: "Doctors",
        href: "/admin/doctors",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [profile, setProfile] = useState<AdminProfile | null>(null);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login/sign-in");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const initials = (profile?.fullName || "AD")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "AD";

    return (
        <AdminGuard onReady={setProfile}>
            <div className="flex min-h-screen bg-[#F8F9FD]">
                {/* Sidebar */}
                <aside className="w-72 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 z-50">
                    {/* Logo Section */}
                    <div className="p-8 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 flex items-center justify-center bg-[#008080] rounded-lg">
                                <span className="text-white font-bold text-xl">L</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl text-[#1A1C1E] tracking-tight">LifeSync</span>
                                <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-[0.25em]">Admin Console</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 mt-6">
                        <div className="space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
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
                    </nav>

                    {/* Bottom User Section */}
                    <div className="p-6 border-t border-gray-50">
                        <div className="flex items-center gap-3 mb-6 p-2">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center text-[#008080] font-bold">
                                {profile?.photoURL ? (
                                    <img src={profile.photoURL} alt="Admin" className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-[#1A1C1E] truncate">{profile?.fullName || "Administrator"}</span>
                                <span className="text-[11px] text-[#94A3B8] font-medium truncate">{profile?.email || ""}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#64748B] hover:text-red-500 text-sm font-semibold transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 ml-72 flex flex-col min-h-screen">
                    <header className="h-20 flex justify-between items-center px-10 bg-transparent">
                        <div>
                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.25em]">LifeSync Admin</p>
                            <h2 className="text-xl font-bold text-[#1A1C1E] tracking-tight">Operations Console</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-[#94A3B8] font-medium">Signed in as</p>
                            <p className="text-sm font-bold text-[#1A1C1E]">{profile?.fullName || ""}</p>
                        </div>
                    </header>

                    <main className="px-10 pb-10 flex-1">{children}</main>
                </div>
            </div>
        </AdminGuard>
    );
}
