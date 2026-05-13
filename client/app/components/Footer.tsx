import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer id="contact" className="relative bg-slate-900 text-white overflow-hidden">
            {/* Glassmorphic Pattern Overlay */}
            <div className="absolute inset-0 pattern-grid opacity-5"></div>

            <div className="container mx-auto px-6 py-16 relative z-10">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4 group">
                            <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-110">
                                <Image src="/logo.png" alt="LifeSync Logo" fill className="object-contain" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight font-heading">
                                LifeSync
                            </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed mb-6 max-w-md">
                            {t("footer.slogan")}
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4">
                            {[
                                { name: "Twitter", icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
                                { name: "LinkedIn", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
                                { name: "Facebook", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" }
                            ].map((social, index) => (
                                <Link
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 rounded-full glass-teal flex items-center justify-center hover:bg-teal-600 transition-all duration-300 hover:scale-110 group"
                                    aria-label={social.name}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-teal-300 group-hover:text-white transition-colors"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.icon} />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 font-heading">{t("footer.quickLinks")}</h3>
                        <ul className="space-y-3">
                            {["About Us", "How It Works", "For Patients", "For Donors", "For Doctors"].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href="#"
                                        className="text-slate-400 hover:text-teal-400 transition-colors duration-200 inline-flex items-center gap-2 group"
                                    >
                                        <span className="w-0 h-0.5 bg-teal-400 group-hover:w-4 transition-all duration-300"></span>
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 font-heading">{t("footer.legal")}</h3>
                        <ul className="space-y-3">
                            {["FAQ", "Privacy Policy", "Terms of Service", "Contact Support", "Blog"].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href="#"
                                        className="text-slate-400 hover:text-teal-400 transition-colors duration-200 inline-flex items-center gap-2 group"
                                    >
                                        <span className="w-0 h-0.5 bg-teal-400 group-hover:w-4 transition-all duration-300"></span>
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="glass-teal p-8 rounded-3xl mb-12">
                    <div className="md:flex items-center justify-between gap-8">
                        <div className="mb-4 md:mb-0">
                            <h3 className="font-bold text-xl mb-2 text-white font-heading">Stay Updated</h3>
                            <p className="text-teal-100">Get the latest news and updates about kidney transplants</p>
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all min-w-[250px]"
                            />
                            <button className="px-6 py-3 rounded-2xl bg-white text-teal-700 font-semibold hover:bg-teal-50 transition-all duration-300 hover:scale-105 elevation-2 whitespace-nowrap">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800">
                    <div className="md:flex items-center justify-between text-sm text-slate-400">
                        <p>© {currentYear} LifeSync. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link href="#" className="hover:text-teal-400 transition-colors">
                                {t("footer.privacy")}
                            </Link>
                            <Link href="#" className="hover:text-teal-400 transition-colors">
                                {t("footer.terms")}
                            </Link>
                            <Link href="#" className="hover:text-teal-400 transition-colors">
                                {t("footer.cookie")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
