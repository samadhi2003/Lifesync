import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-teal-900 text-teal-100 py-12">
            <div className="container mx-auto px-6 grid gap-8 md:grid-cols-4">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative h-8 w-8">
                            <Image src="/logo.png" alt="LifeSync Logo" fill className="object-contain" />
                        </div>
                        <span className="font-bold text-xl text-white">LifeSync</span>
                    </div>
                    <p className="text-sm text-teal-200/80">
                        A comprehensive platform dedicated to kidney matching and
                        transplantation services.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Links</h4>
                    <ul className="space-y-2 text-sm text-teal-200/80">
                        <li>
                            <Link href="#" className="hover:text-white">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-white">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-white">
                                How It Works
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-teal-200/80">
                        <li>
                            <Link href="#" className="hover:text-white">
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-white">
                                Terms of Service
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Contact</h4>
                    <ul className="space-y-2 text-sm text-teal-200/80">
                        <li>support@lifesync.org</li>
                        <li>+1 (555) 123-4567</li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-6 pt-8 mt-8 border-t border-teal-800 text-center text-sm text-teal-500">
                &copy; 2024 LifeSync. All rights reserved.
            </div>
        </footer>
    );
}
