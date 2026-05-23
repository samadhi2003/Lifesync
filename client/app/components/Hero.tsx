"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Hero() {
    const { t, language } = useLanguage();
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
            <section className="relative pt-24 pb-28 lg:pt-32 lg:pb-36 overflow-hidden bg-slate-50/50">
                {/* Modern Mesh and Grid background */}
                <div className="absolute inset-0 gradient-mesh opacity-70 z-0"></div>
                <div className="absolute inset-0 pattern-grid opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0"></div>

                {/* Floating ambient glowing blobs */}
                <div className="absolute top-10 left-[-10%] w-[350px] h-[350px] bg-teal-300/20 rounded-full blur-[100px] animate-pulse-slow z-0"></div>
                <div className="absolute bottom-10 right-[-10%] w-[450px] h-[450px] bg-teal-400/15 rounded-full blur-[120px] animate-pulse-slow z-0" style={{ animationDelay: '2s' }}></div>

                {/* Full Hero Background Image (Right side doctor kidneys, fading to left) */}
                <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 z-10 pointer-events-none select-none">
                    <div className="relative w-full h-full">
                        <Image
                            src="/hero-doctor.png"
                            alt="LifeSync Doctor and Kidney Matching Background"
                            fill
                            className="object-cover opacity-[0.25] lg:opacity-95 transition-opacity duration-500"
                            style={{ objectPosition: 'center 15%' }}
                            priority
                        />
                        {/* Gradient mask to blend the image into the background from left to right */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent lg:from-slate-50 lg:via-slate-50/20 lg:to-transparent z-20"></div>
                        {/* Bottom mask to blend the image into the stepper timeline */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-20"></div>
                    </div>
                </div>

                <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-20">

                    {/* Left Column (Content & Actions) - Span 7 */}
                    <div className="lg:col-span-7 space-y-8 animate-fade-in-up">
                        {/* Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-800 text-sm font-semibold shadow-sm backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            <span className="tracking-wide text-xs uppercase text-teal-700 font-bold">{t("hero.badge")}</span>
                        </div>

                        {/* Heading */}
                        <h1 className={`text-4xl sm:text-5xl xl:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] ${language === 'si' || language === 'ta' ? 'leading-tight' : ''}`}>
                            {language === 'en' ? (
                                <>
                                    <span className="text-teal-700 font-black">Connect</span>{" "}
                                    <span className="text-slate-500 font-light">Patients</span> with <br />
                                    Lifesaving <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent font-black relative">
                                        Donors
                                        <span className="absolute bottom-1 left-0 w-full h-[4px] bg-teal-200/40 -z-10 rounded"></span>
                                    </span>
                                </>
                            ) : (
                                <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">{t("hero.title")}</span>
                            )}
                        </h1>

                        <p className="text-lg text-slate-600 max-w-xl leading-relaxed font-medium">
                            {t("hero.subtitle")}
                        </p>

                        {/* Interactive Role Buttons as modern selector cards */}
                        <div className="grid sm:grid-cols-3 gap-4 pt-2">
                            {/* Patient Link */}
                            <Link
                                href="/login/sign-in"
                                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-md hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-200 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-teal-100 font-bold tracking-wider uppercase mb-1">Seek Match</p>
                                    <h3 className="font-bold text-base leading-tight">{t("hero.patientBtn")}</h3>
                                </div>
                            </Link>

                            {/* Donor Link */}
                            <Link
                                href="/login/sign-in"
                                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-teal-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-teal-50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-teal-600 font-bold tracking-wider uppercase mb-1">Give Life</p>
                                    <h3 className="font-bold text-base text-slate-800 leading-tight">{t("hero.donorBtn")}</h3>
                                </div>
                            </Link>

                            {/* Doctor Link */}
                            <Link
                                href="/login/sign-in"
                                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-teal-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-teal-50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-teal-600 font-bold tracking-wider uppercase mb-1">Verify matches</p>
                                    <h3 className="font-bold text-base text-slate-800 leading-tight">{t("hero.doctorBtn")}</h3>
                                </div>
                            </Link>
                        </div>

                    </div>

                    {/* Right Column (Placeholder to maintain balanced grid layout) - Span 5 */}
                    <div className="lg:col-span-5 hidden lg:block h-[450px] pointer-events-none"></div>
                </div>
            </section>

            {/* Bottom green section containing stats */}
            <div className="relative w-full gradient-teal py-12 md:py-16 overflow-hidden">
                <div className="absolute inset-0 pattern-dots opacity-20"></div>

                <div className="container mx-auto px-6 max-w-5xl relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 text-center">

                        {/* Patients Stat */}
                        <div className="flex flex-col items-center text-white px-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            {stats.patients === null ? (
                                <div className="h-10 w-20 bg-white/10 rounded animate-pulse my-1"></div>
                            ) : (
                                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">{format(stats.patients)}</div>
                            )}
                            <div className="text-xs sm:text-sm uppercase tracking-widest font-extrabold text-teal-100 mt-2">{t("audience.patientTitle")}</div>
                        </div>

                        {/* Donors Stat */}
                        <div className="flex flex-col items-center text-white px-4 relative">
                            {/* Visual vertical dividers for desktop */}
                            <div className="hidden md:block absolute -left-2 top-4 bottom-4 w-[1px] bg-white/20"></div>

                            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            {stats.donors === null ? (
                                <div className="h-10 w-20 bg-white/10 rounded animate-pulse my-1"></div>
                            ) : (
                                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">{format(stats.donors)}</div>
                            )}
                            <div className="text-xs sm:text-sm uppercase tracking-widest font-extrabold text-teal-100 mt-2">{t("audience.donorTitle")}</div>
                        </div>

                        {/* Doctors Stat */}
                        <div className="flex flex-col items-center text-white px-4 relative">
                            {/* Visual vertical dividers for desktop */}
                            <div className="hidden md:block absolute -left-2 top-4 bottom-4 w-[1px] bg-white/20"></div>

                            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            {stats.doctors === null ? (
                                <div className="h-10 w-20 bg-white/10 rounded animate-pulse my-1"></div>
                            ) : (
                                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">{format(stats.doctors)}</div>
                            )}
                            <div className="text-xs sm:text-sm uppercase tracking-widest font-extrabold text-teal-100 mt-2">{t("audience.doctorTitle")}</div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
