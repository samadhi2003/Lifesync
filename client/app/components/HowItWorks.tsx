import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function HowItWorks() {
    const { t } = useLanguage();

    const steps = [
        {
            number: "01",
            title: t("howItWorks.step1Title"),
            description: t("howItWorks.step1Desc"),
            icon: (
                <div className="relative">
                    <div className="absolute inset-0 bg-teal-200/50 blur-xl rounded-full scale-150 animate-pulse-slow"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" fill="rgba(20,184,166,0.1)" />
                    </svg>
                </div>
            )
        },
        {
            number: "02",
            title: t("howItWorks.step2Title"),
            description: t("howItWorks.step2Desc"),
            icon: (
                <div className="relative">
                    <div className="absolute inset-0 bg-teal-200/50 blur-xl rounded-full scale-150 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" fill="rgba(20,184,166,0.1)" />
                    </svg>
                </div>
            )
        },
        {
            number: "03",
            title: t("howItWorks.step3Title"),
            description: t("howItWorks.step3Desc"),
            icon: (
                <div className="relative">
                    <div className="absolute inset-0 bg-teal-200/50 blur-xl rounded-full scale-150 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" fill="rgba(20,184,166,0.1)" />
                    </svg>
                </div>
            )
        },
        {
            number: "04",
            title: t("howItWorks.step4Title"),
            description: t("howItWorks.step4Desc"),
            icon: (
                <div className="relative">
                    <div className="absolute inset-0 bg-teal-200/50 blur-xl rounded-full scale-150 animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="currentColor" fill="rgba(20,184,166,0.2)" />
                    </svg>
                </div>
            )
        }
    ];

    return (
        <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 gradient-mesh opacity-50"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-teal-600 font-bold uppercase tracking-wider text-sm">Process</span>
                    <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">{t("howItWorks.title")}</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        {t("howItWorks.subtitle")}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            {/* Connecting Line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-teal-400 to-teal-200 opacity-30"></div>
                            )}

                            {/* Card */}
                            <div className="glass-strong p-8 rounded-3xl hover-lift transition-all duration-300 h-full flex flex-col items-center text-center">
                                {/* Number Badge */}
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-white text-teal-400 font-bold text-xl mb-8 elevation-3 group-hover:scale-110 transition-transform duration-500 relative">
                                    <div className="absolute -inset-1 bg-teal-400/30 blur rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="relative z-10">{step.number}</span>
                                </div>



                                {/* Content */}
                                <h3 className="font-bold text-slate-800 text-xl mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
