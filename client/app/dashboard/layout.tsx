import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    {/* Logo */}
                    <div className="relative h-10 w-10">
                        <Image src="/logo.png" alt="LifeSync Logo" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-[#006967] leading-tight">LIFESYNC</span>
                        <span className="text-[6px] text-[#008080] opacity-70 uppercase tracking-widest font-medium">Hope Match Save Lives</span>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
                    <Link href="/dashboard/patient" className="text-[#008080] border-b-2 border-[#008080] pb-1">Home</Link>
                    <Link href="#" className="hover:text-[#008080] transition-colors">Matches</Link>
                    <Link href="#" className="hover:text-[#008080] transition-colors">Chatbot</Link>
                    <Link href="#" className="hover:text-[#008080] transition-colors">Profile</Link>
                </div>

                {/* Logout Button */}
                <div>
                    <button className="bg-[#008080] hover:bg-[#006967] text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm">
                        Logout
                    </button>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl p-6 md:p-12">
                {children}
            </main>
        </div>
    );
}
