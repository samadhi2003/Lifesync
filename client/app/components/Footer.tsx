import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer id="contact" className="relative bg-slate-900 text-white pt-24 pb-8 overflow-hidden">
            {/* Top Wave Separator (Matches the bottom of the Audience section bg-gradient-teal-soft #ccfbf1) */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-0">
                <svg className="relative block w-full h-[60px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ccfbf1" />
                </svg>
            </div>



            <div className="container mx-auto px-6 relative z-10 mt-12 md:mt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
                    
                    {/* Col 1: Brand & Contact Info */}
                    <div className="space-y-6">
                        <div className="md:hidden mb-6">
                            <span className="font-extrabold text-2xl tracking-tight text-white font-heading">
                                LifeSync
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-white mb-6 font-heading">LifeSync Medical & Healthcare</h3>
                        
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                </div>
                                <span className="text-sm text-slate-400">LifeSync International Clinical Network</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                </div>
                                <a href="tel:+18005555433" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">+1 (800) 555-LIFE</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                </div>
                                <a href="mailto:support@lifesync.org" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">support@lifesync.org</a>
                            </li>
                        </ul>
                    </div>

                    {/* Col 2: Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-6 font-heading">{t("footer.quickLinks")}</h3>
                        <ul className="space-y-3">
                            {["About Us", "How It Works", "For Patients", "For Donors", "For Doctors"].map((link, index) => (
                                <li key={index}>
                                    <Link href="#" className="text-sm text-slate-400 hover:text-teal-400 transition-colors inline-block hover:translate-x-1 duration-200">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 3: Legal / Resources */}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-6 font-heading">{t("footer.legal")}</h3>
                        <ul className="space-y-3">
                            {["FAQ", "Privacy Policy", "Terms of Service", "Contact Support", "Blog"].map((link, index) => (
                                <li key={index}>
                                    <Link href="#" className="text-sm text-slate-400 hover:text-teal-400 transition-colors inline-block hover:translate-x-1 duration-200">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 4: Newsletter */}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-4 font-heading">Be Our Subscribers</h3>
                        <p className="text-sm text-slate-400 mb-6">
                            To get the latest news about health from our experts
                        </p>
                        <form onSubmit={(e) => e.preventDefault()} className="relative">
                            <input
                                type="email"
                                placeholder="example@email.com"
                                className="w-full bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 text-sm rounded-full py-3.5 pl-5 pr-28 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                                required
                            />
                            <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-slate-700 hover:bg-teal-600 text-white text-xs font-semibold px-4 rounded-full transition-colors flex items-center gap-1">
                                Submit
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 mt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">Follow Us</span>
                        <div className="flex gap-2">
                            {[
                                { name: "Twitter", icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
                                { name: "LinkedIn", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
                                { name: "Facebook", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" }
                            ].map((social, index) => (
                                <Link
                                    key={index}
                                    href="#"
                                    className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-teal-600 hover:border-teal-500 transition-all duration-300"
                                    aria-label={social.name}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.icon} />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 text-center md:text-right flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <div className="flex gap-4 justify-center md:justify-end">
                            <Link href="#" className="hover:text-teal-400 transition-colors">
                                {t("footer.privacy")}
                            </Link>
                            <span className="opacity-30">|</span>
                            <Link href="#" className="hover:text-teal-400 transition-colors">
                                {t("footer.terms")}
                            </Link>
                            <span className="opacity-30">|</span>
                            <Link href="#" className="hover:text-teal-400 transition-colors">
                                {t("footer.cookie")}
                            </Link>
                        </div>
                        <p className="mt-2 md:mt-0 md:ml-4">Copyright © {currentYear} LifeSync. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
