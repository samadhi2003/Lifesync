import Image from "next/image";

export default function Audience() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-teal-700 mb-2">How we serve</h2>
                    <p className="text-slate-500">
                        Together, we make the kidney matching journey easier and safer
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Patient Card */}
                    <div className="bg-white rounded-none shadow-[0_2px_15px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className="relative w-full aspect-[3/4]">
                            <Image
                                src="/patient.png"
                                alt="Patient"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-8 text-center bg-slate-50/50">
                            <div className="inline-flex items-center gap-2 text-teal-700 font-bold text-xl mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                                Patient
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed px-4">
                                Find compatible donors safely and privately
                            </p>
                        </div>
                    </div>

                    {/* Donor Card */}
                    <div className="bg-white rounded-none shadow-[0_2px_15px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className="relative w-full aspect-[3/4]">
                            <Image
                                src="/donor.png"
                                alt="Donors"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-8 text-center bg-slate-50/50">
                            <div className="inline-flex items-center gap-2 text-teal-700 font-bold text-xl mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                Donors
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed px-4">
                                Help save lives with ethical and secure communication
                            </p>
                        </div>
                    </div>

                    {/* Doctors Card */}
                    <div className="bg-white rounded-none shadow-[0_2px_15px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className="relative w-full aspect-[3/4]">
                            <Image
                                src="/doctor.png"
                                alt="Doctors"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-8 text-center bg-slate-50/50">
                            <div className="inline-flex items-center gap-2 text-teal-700 font-bold text-xl mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                    />
                                </svg>
                                Doctors
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Review medical details and guide accurate <br />transplant matching
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}
