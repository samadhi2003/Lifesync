export default function Features() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-teal-700 mb-16">Why LifeSync?</h2>
                <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    {/* Feature 1 */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 mb-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">
                            AI-Powered Matching
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Advanced algorithms to predict the best biological matches, ensuring
                            higher success rates.
                        </p>
                    </div>
                    {/* Feature 2 */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 mb-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">
                            Ethical & Transparent
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Full transparency throughout the process, adhering to the highest
                            ethical medical standards.
                        </p>
                    </div>
                    {/* Feature 3 */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 mb-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">
                            Direct Connection
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Secure messaging and coordination platform to connect patients,
                            donors and doctors.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
