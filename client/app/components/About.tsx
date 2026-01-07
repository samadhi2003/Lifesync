import Link from "next/link";
import Image from "next/image";

export default function About() {
    return (
        <section id="about" className="py-24 gradient-teal-soft relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200 blob opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-300 blob opacity-20"></div>

            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
                <div className="relative group">
                    <div className="rounded-3xl overflow-hidden elevation-4 bg-slate-200 aspect-[4/3] relative group-hover:scale-[1.02] transition-transform duration-500">
                        <Image
                            src="/aboutusimg.png"
                            alt="About LifeSync Medical Team"
                            fill
                            className="object-cover"
                        />
                        {/* Glassmorphic Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    {/* Floating Verified Badge */}
                    <div className="absolute -bottom-6 -right-6 glass-strong p-6 rounded-2xl elevation-3 max-w-xs hover-lift">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </div>
                            <span className="text-sm font-bold text-slate-800">
                                Verified System
                            </span>
                        </div>
                        <p className="text-xs text-slate-600">
                            Endorsed by leading nephrologists worldwide.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <span className="text-teal-600 font-bold uppercase tracking-wider text-sm">
                            About Us
                        </span>
                        <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-6">
                            Bridging the Gap for Kidney Transplants
                        </h2>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-lg font-medium">
                        LifeSync is a secure and intelligent platform designed to connect kidney patients, donors, and doctors in one ethical and trusted space.
                    </p>

                    <p className="text-slate-600 leading-relaxed">
                        Using advanced web technology and AI-powered matching, we help users find compatible donors safely without the risks of social media or manual searching.
                    </p>

                    <p className="text-slate-700 font-semibold leading-relaxed">
                        Our mission is simple: make kidney donor matching faster, safer, and smarter.
                    </p>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-3 pt-4">
                        <div className="glass-teal px-4 py-2 rounded-full text-sm font-semibold text-teal-700">
                            ✓ HIPAA Compliant
                        </div>
                        <div className="glass-teal px-4 py-2 rounded-full text-sm font-semibold text-teal-700">
                            ✓ 24/7 Support
                        </div>
                        <div className="glass-teal px-4 py-2 rounded-full text-sm font-semibold text-teal-700">
                            ✓ AI-Powered
                        </div>
                    </div>

                    <Link
                        href="#"
                        className="inline-flex items-center gap-2 font-semibold text-teal-600 hover:text-teal-700 group pt-4"
                    >
                        Learn More About Our Mission
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
            </div>
        </section>
    );
}
