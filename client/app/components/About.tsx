import Link from "next/link";
import Image from "next/image";

export default function About() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <div className="relative">
                    <div className="rounded-2xl overflow-hidden shadow-xl bg-slate-200 aspect-[4/3] relative">
                        <Image
                            src="/aboutusimg.png"
                            alt="About LifeSync Medical Team"
                            fill
                            className="object-cover"
                        />
                    </div>
                    {/* Overlapping card */}
                    <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-xl shadow-lg max-w-xs hidden lg:block">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm font-bold text-slate-800">
                                Verified System
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Endorsed by leading nephrologists.
                        </p>
                    </div>
                </div>
                <div>
                    <span className="text-teal-600 font-bold mb-2 block uppercase tracking-wider text-sm">
                        About Us
                    </span>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        Bridging the Gap for Kidney Transplants
                    </h2>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        This platform creates a safe space where hope meets science. We are
                        dedicated to reducing the wait time for kidney transplants by
                        efficiently connecting willing donors with patients in need.
                    </p>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Our team comprises medical professionals and tech experts working
                        together to save lives. Join us in making healthcare more accessible.
                    </p>
                    <Link
                        href="#"
                        className="font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                    >
                        Learn More <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
