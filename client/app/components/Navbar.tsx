"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageCode } from "@/lib/i18n/translations";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
    };

    return (
        <nav
            className={`w-full py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 transition-all duration-300 ${scrolled
                ? "glass-strong elevation-3"
                : "bg-white/80 backdrop-blur-sm"
                }`}
        >
            <div className="flex items-center gap-2 group">
                {/* Logo Icon */}
                <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-110">
                    <Image src="/logo.png" alt="LifeSync Logo" fill className="object-contain" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800 font-heading">
                    LifeSync
                </span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                <Link
                    href="#about"
                    className="relative hover:text-teal-600 transition-colors duration-200 group"
                >
                    {t("nav.about")}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-teal group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                    href="#how-it-works"
                    className="relative hover:text-teal-600 transition-colors duration-200 group"
                >
                    {t("nav.howItWorks")}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-teal group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                    href="#contact"
                    className="relative hover:text-teal-600 transition-colors duration-200 group"
                >
                    {t("nav.contact")}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-teal group-hover:w-full transition-all duration-300"></span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {/* Language Selector */}
                <div className="relative group">
                    <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors bg-slate-50 hover:bg-teal-50 px-3 py-2 rounded-xl border border-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <span>{language.toUpperCase()}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 flex flex-col overflow-hidden z-50">
                        <button 
                            onClick={() => toggleLanguage('en')}
                            className={`text-left px-4 py-2.5 text-sm font-medium transition-colors border-l-2 ${language === 'en' ? 'text-teal-700 bg-teal-50/50 border-teal-500' : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50 border-transparent hover:border-teal-300'}`}
                        >
                            English (EN)
                        </button>
                        <button 
                            onClick={() => toggleLanguage('si')}
                            className={`text-left px-4 py-2.5 text-sm font-medium transition-colors border-l-2 ${language === 'si' ? 'text-teal-700 bg-teal-50/50 border-teal-500' : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50 border-transparent hover:border-teal-300'}`}
                        >
                            සිංහල (SI)
                        </button>
                        <button 
                            onClick={() => toggleLanguage('ta')}
                            className={`text-left px-4 py-2.5 text-sm font-medium transition-colors border-l-2 ${language === 'ta' ? 'text-teal-700 bg-teal-50/50 border-teal-500' : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50 border-transparent hover:border-teal-300'}`}
                        >
                            தமிழ் (TA)
                        </button>
                    </div>
                </div>

                <Link
                    href="/register"
                    className="gradient-teal text-white px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-teal-200 hover:scale-105 elevation-2"
                >
                    {t("nav.getStarted")}
                </Link>
            </div>
        </nav>
    );
}
