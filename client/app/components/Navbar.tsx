import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="w-full bg-white py-4 px-6 md:px-12 flex justify-between items-center shadow-sm sticky top-0 z-50">
            <div className="flex items-center gap-2">
                {/* Logo Icon */}
                <div className="relative h-10 w-10">
                    <Image src="/logo.png" alt="LifeSync Logo" fill className="object-contain" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800">
                    LifeSync
                </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                <Link href="#" className="hover:text-teal-600 transition">
                    About Us
                </Link>
                <Link href="#" className="hover:text-teal-600 transition">
                    How It Works
                </Link>
                <Link href="#" className="hover:text-teal-600 transition">
                    Contact
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <Link
                    href="/login"
                    className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                >
                    Log in
                </Link>
                <Link
                    href="/register"
                    className="bg-teal-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-teal-700 transition shadow-lg shadow-teal-200"
                >
                    Get Started
                </Link>
            </div>
        </nav>
    );
}
