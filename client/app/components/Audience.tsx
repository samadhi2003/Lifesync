import Image from "next/image";

export default function Audience() {
    const audiences = [
        {
            title: "Patient",
            subtitle: "Seeking a donor",
            image: "/patient.png",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="currentColor" fill="rgba(255,255,255,0.2)" />
                    <circle cx="12" cy="12" r="9" strokeOpacity="0.1" />
                </svg>
            ),
            description: "Find compatible donors safely and privately"
        },
        {
            title: "Donors",
            subtitle: "Offering to help",
            image: "/donor.png",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" fill="rgba(255,255,255,0.2)" />
                </svg>
            ),
            description: "Help save lives with ethical and secure communication"
        },
        {
            title: "Doctors",
            subtitle: "Medical staff",
            image: "/doctor.png",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" stroke="currentColor" fill="rgba(255,255,255,0.2)" />
                </svg>
            ),
            description: "Review medical details and guide accurate transplant matching"
        }
    ];

    return (
        <section className="py-24 bg-gradient-teal-soft relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-teal-200 blob opacity-20"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-300 blob opacity-20"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-teal-600 font-bold uppercase tracking-wider text-sm">Who We Serve</span>
                    <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">How We Serve</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Together, we make the kidney matching journey easier and safer for everyone involved
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {audiences.map((audience, index) => (
                        <div key={index} className="group">
                            <div className="bg-white rounded-[2rem] overflow-hidden elevation-3 hover-lift transition-all duration-500 relative border border-white">
                                {/* Image Container */}
                                <div className="relative w-full aspect-[3/4] overflow-hidden">
                                    <Image
                                        src={audience.image}
                                        alt={audience.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {/* Glassmorphic Overlay on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 via-teal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    {/* Tag on Image */}
                                    <div className="absolute top-4 left-4 glass-teal px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-teal-700">
                                        Community
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 text-center bg-white relative">
                                    {/* Floating Icon Badge */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-3xl bg-white/70 backdrop-blur-md flex items-center justify-center text-teal-600 border border-white shadow-lg">

                                        <div className="absolute inset-0 bg-white/10 rounded-3xl blur-md"></div>                                        {audience.icon}
                                    </div>

                                    <div className="pt-8">
                                        <h3 className="text-teal-800 font-bold text-2xl mb-1">
                                            {audience.title}
                                        </h3>

                                        <p className="text-teal-600 text-xs font-bold uppercase tracking-widest mb-4 opacity-70">
                                            {audience.subtitle}
                                        </p>

                                        <p className="text-slate-600 text-sm leading-relaxed px-4">
                                            {audience.description}
                                        </p>
                                    </div>


                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
