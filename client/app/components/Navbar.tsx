"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                    About Us
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-teal group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                    href="#how-it-works"
                    className="relative hover:text-teal-600 transition-colors duration-200 group"
                >
                    How It Works
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-teal group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                    href="#contact"
                    className="relative hover:text-teal-600 transition-colors duration-200 group"
                >
                    Contact
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-teal group-hover:w-full transition-all duration-300"></span>
                </Link>
            </div>

            <div className="flex items-center gap-4">

                <Link
                    href="/register"
                    className="gradient-teal text-white px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-teal-200 hover:scale-105 elevation-2"
                >
                    Get Started
                </Link>
            </div>
        </nav>
    );
}
