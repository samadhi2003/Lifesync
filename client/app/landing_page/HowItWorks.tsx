export default function HowItWorks() {
    return (
        <section className="py-24 bg-teal-100">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold text-teal-700 text-center mb-16">
                    How It Works
                </h2>
                <div className="relative hidden md:block max-w-5xl mx-auto mb-16">
                    {/* Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-teal-200 -translate-y-1/2 z-0"></div>
                    <div className="relative z-10 flex justify-between">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shadow-lg border-4 border-white"
                            >
                                {step}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Sign Up</h3>
                        <p className="text-sm text-slate-500">
                            Register as a patient or a donor.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">
                            Verify Info
                        </h3>
                        <p className="text-sm text-slate-500">
                            Submit medical history for verification.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">
                            Get Matched
                        </h3>
                        <p className="text-sm text-slate-500">
                            AI finds the best compatible match.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Connect</h3>
                        <p className="text-sm text-slate-500">
                            Message and coordinate with doctors.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
