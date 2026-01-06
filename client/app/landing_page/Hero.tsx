import Link from "next/link";
import Image from "next/image";

export default function Hero() {
    return (
        <>
            <section className="relative pt-0 pb-24 lg:pt-0 lg:pb-32 overflow-hidden bg-gradient-to-b from-teal-50/50 to-white">
                <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-8 z-10">
                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.1]">
                            <span className="text-teal-700">Connect</span> <span className="text-gray-400">Patients</span> with <br />
                            Lifesaving <span className="text-teal-500">Donors</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                            An ethical, transparent platform powered by AI-matching to connect
                            kidney patients with compatible donors.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-4">
                            <Link
                                href="/register?type=recipient"
                                className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-3.5 rounded-md font-semibold transition shadow-md whitespace-nowrap"
                            >
                                Join as a patient
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
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
                                href="/register?type=donor"
                                className="flex items-center gap-2 bg-teal-50 border border-teal-200 hover:border-teal-300 text-teal-800 px-5 py-3.5 rounded-md font-semibold transition shadow-sm hover:shadow-md whitespace-nowrap"
                            >
                                Join as a Donor
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
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
                    <div className="relative z-10 flex justify-center lg:justify-end">
                        {/* Actual Hero Image */}
                        <div className="relative w-full max-w-lg aspect-[4/3] lg:aspect-auto lg:h-[600px]">
                            <Image
                                src="/hero.png"
                                alt="LifeSync Doctors and Patients"
                                fill
                                className="object-contain object-bottom"
                                priority
                            />
                        </div>
                        {/* Decorative blob backing */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-200/30 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </section>

            {/* Divider / Info Strip */}
            <div className="w-full bg-gradient-to-r from-teal-500 to-teal-600 py-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pattern-dots"></div>
                <div className="container mx-auto px-6 flex justify-center gap-12 items-center relative z-10">
                    <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-white"
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
                    </div>
                    <div className="text-white text-2xl font-light opacity-80">+</div>
                    <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-white"
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
                    </div>
                </div>
            </div>
        </>
    );
}
