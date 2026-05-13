import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Features() {
    const { t } = useLanguage();
    
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 pattern-grid opacity-30"></div>

            <div className="container mx-auto px-6 text-center relative z-10">
                <div className="mb-16 animate-fade-in-up">
                    <span className="text-teal-600 font-bold uppercase tracking-wider text-sm">Features</span>
                    <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">{t("features.title")}</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        {t("features.subtitle")}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Feature 1 */}
                    <div className="group gradient-border hover-lift p-8 rounded-3xl bg-white transition-all duration-300">
                        <div className="w-20 h-20 gradient-teal rounded-3xl flex items-center justify-center text-white mb-8 mx-auto group-hover:scale-110 transition-transform duration-500 elevation-3 relative">
                            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-md group-hover:blur-lg transition-all"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" fill="rgba(255,255,255,0.3)" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800 text-xl mb-3">
                            {t("features.smartMatch")}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {t("features.smartMatchDesc")}
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="group gradient-border hover-lift p-8 rounded-3xl bg-white transition-all duration-300">
                        <div className="w-20 h-20 gradient-teal rounded-3xl flex items-center justify-center text-white mb-8 mx-auto group-hover:scale-110 transition-transform duration-500 elevation-3 relative">
                            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-md group-hover:blur-lg transition-all"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" fill="rgba(255,255,255,0.3)" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800 text-xl mb-3">
                            {t("features.secureDoc")}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {t("features.secureDocDesc")}
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="group gradient-border hover-lift p-8 rounded-3xl bg-white transition-all duration-300">
                        <div className="w-20 h-20 gradient-teal rounded-3xl flex items-center justify-center text-white mb-8 mx-auto group-hover:scale-110 transition-transform duration-500 elevation-3 relative">
                            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-md group-hover:blur-lg transition-all"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" fill="rgba(255,255,255,0.3)" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-800 text-xl mb-3">
                            {t("features.realTime")}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {t("features.realTimeDesc")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
