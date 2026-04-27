"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Hero() {
    const [stats, setStats] = useState<{ patients: number | null; donors: number | null; doctors: number | null }>({
        patients: null,
        donors: null,
        doctors: null,
    });

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const usersRef = collection(db, "users");
                const [patientSnap, donorSnap, doctorSnap] = await Promise.all([
                    getCountFromServer(query(usersRef, where("role", "==", "patient"))),
                    getCountFromServer(query(usersRef, where("role", "==", "donor"))),
                    getCountFromServer(query(usersRef, where("role", "==", "doctor"))),
                ]);
                if (!cancelled) {
                    setStats({
                        patients: patientSnap.data().count,
                        donors: donorSnap.data().count,
                        doctors: doctorSnap.data().count,
                    });
                }
            } catch (err) {
                console.error("Failed to load landing stats", err);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const format = (n: number | null) => (n === null ? "—" : n.toString());

    return (
        <>
            <section className="relative pt-20 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 gradient-mesh"></div>

                {/* Floating Blobs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-teal-300 blob animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200 blob animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

                <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-teal text-teal-700 text-sm font-semibold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            AI-Powered Matching Platform
                        </div>

                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.1]">
                            <span className="text-teal-700">Connect</span>{" "}
                            <span className="text-gray-400">Patients</span> with <br />
                            Lifesaving <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">Donors</span>
                        </h1>

                        <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                            An ethical, transparent platform powered by AI-matching to connect
                            kidney patients with compatible donors.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link
                                href="/login/sign-in"
                                className="group flex items-center gap-2 gradient-teal text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-teal-300/50 hover:scale-105 elevation-2"
                            >
                                Join as a Patient
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>

                            <Link
                                href="/login/sign-in"
                                className="group flex items-center gap-2 glass-strong border-2 border-teal-200 text-teal-800 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:border-teal-300 hover:shadow-lg hover:scale-105"
                            >
                                Join as a Donor
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>

                            <Link
                                href="/login/sign-in"
                                className="group flex items-center gap-2 glass-strong border-2 border-teal-200 text-teal-800 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:border-teal-300 hover:shadow-lg hover:scale-105"
                            >
                                Join as a Doctor
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-4 pt-8">
                            <div className="glass p-4 rounded-3xl text-center hover-lift flex flex-col items-center">
                                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div className="text-2xl font-bold text-teal-700">{format(stats.patients)}</div>
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">Patients</div>
                            </div>
                            <div className="glass p-4 rounded-3xl text-center hover-lift flex flex-col items-center">
                                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-2xl font-bold text-teal-700">{format(stats.donors)}</div>
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">Donors</div>
                            </div>
                            <div className="glass p-4 rounded-3xl text-center hover-lift flex flex-col items-center">
                                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="text-2xl font-bold text-teal-700">{format(stats.doctors)}</div>
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">Doctors</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex justify-center lg:justify-end">
                        {/* Hero Image with Float Animation */}
                        <div className="relative w-full max-w-lg aspect-[4/3] lg:aspect-auto lg:h-[600px] animate-float">
                            <Image
                                src="/hero.png"
                                alt="LifeSync Doctors and Patients"
                                fill
                                className="object-contain object-bottom drop-shadow-2xl"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Divider / Info Strip with Glassmorphism */}
            <div className="relative w-full gradient-teal py-20 overflow-hidden">
                <div className="absolute inset-0 pattern-dots opacity-20"></div>

                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-center gap-8 md:gap-16 items-center relative z-10">
                    <div className="p-6 rounded-2xl hover-scale transition-all duration-300">

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-white mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                        <div className="text-white font-bold mt-3 text-center">Patients</div>
                    </div>

                    <div className="text-white text-3xl font-light opacity-90">+</div>
                    <div className="p-6 rounded-2xl hover-scale transition-all duration-300">

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-white mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        <div className="text-white font-bold mt-3 text-center">Donors</div>
                    </div>

                    <div className="text-white text-3xl font-light opacity-90">=</div>

                    <div className="p-6 rounded-2xl hover-scale transition-all duration-300">

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-white mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            />
                        </svg>
                        <div className="text-white font-bold mt-3 text-center">Lives Saved</div>
                    </div>
                </div>
            </div>
        </>
    );
}
