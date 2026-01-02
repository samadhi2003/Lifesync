import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-800 font-sans">
      {/* Navigation */}
      <nav className="w-full bg-white py-4 px-6 md:px-12 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="bg-teal-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">LifeSync</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="#" className="hover:text-teal-600 transition">About Us</Link>
          <Link href="#" className="hover:text-teal-600 transition">How It Works</Link>
          <Link href="#" className="hover:text-teal-600 transition">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-teal-600 hover:text-teal-700">Log in</Link>
          <Link href="/register" className="bg-teal-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-700 transition shadow-lg shadow-teal-200">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-teal-50/50 to-white">
        <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 z-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.2]">
              Connect <span className="text-teal-600">Patients</span> with <br />
              Lifesaving <span className="text-teal-600">Donors</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              LifeSync leverages advanced AI algorithms to connect kidney patients with compatible donors, ensuring faster and safer matches.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/register?type=recipient" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-md font-semibold transition shadow-md">
                Find a Donor
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/register?type=donor" className="flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-300 text-slate-700 px-6 py-3 rounded-md font-semibold transition shadow-sm hover:shadow-md">
                Become a Donor
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="relative z-10">
            {/* Image Placeholder */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-teal-100 aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-transparent"></div>
              {/* Abstract Shapes/Mockup of Doctor/Patient */}
              <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-slate-900/5 rounded-tl-full"></div>
              <div className="absolute flex items-center justify-center inset-0 text-teal-800/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {/* Decorative blob */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-200/40 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* Divider / Info Strip */}
      <div className="w-full bg-gradient-to-r from-teal-500 to-teal-600 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-dots"></div>
        <div className="container mx-auto px-6 flex justify-center gap-12 items-center relative z-10">
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="text-white text-2xl font-light opacity-80">+</div>
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Why LifeSync Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-teal-700 mb-16">Why LifeSync?</h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">AI-Powered Matching</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Advanced algorithms to predict the best biological matches, ensuring higher success rates.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Ethical & Transparent</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Full transparency throughout the process, adhering to the highest ethical medical standards.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Direct Connection</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Secure messaging and coordination platform to connect patients, donors and doctors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl bg-slate-200 aspect-[4/3] relative">
              {/* Placeholder for About Image */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-300">
                <span className="text-slate-500 font-medium">Medical Team Image</span>
              </div>
            </div>
            {/* Overlapping card */}
            <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-xl shadow-lg max-w-xs hidden lg:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-bold text-slate-800">Verified System</span>
              </div>
              <p className="text-xs text-slate-500">Endorsed by leading nephrologists.</p>
            </div>
          </div>
          <div>
            <span className="text-teal-600 font-bold mb-2 block uppercase tracking-wider text-sm">About Us</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Bridging the Gap for Kidney Transplants</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              This platform creates a safe space where hope meets science.
              We are dedicated to reducing the wait time for kidney transplants by efficiently connecting
              willing donors with patients in need.
            </p>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Our team comprises medical professionals and tech experts working together to save lives.
              Join us in making healthcare more accessible.
            </p>
            <Link href="#" className="font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
              Learn More <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-teal-50/50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-teal-700 text-center mb-16">How It Works</h2>
          <div className="relative hidden md:block max-w-5xl mx-auto mb-16">
            {/* Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-teal-200 -translate-y-1/2 z-0"></div>
            <div className="relative z-10 flex justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shadow-lg border-4 border-white">
                  {step}
                </div>
              ))}
            </div>
          </div>
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Sign Up</h3>
              <p className="text-sm text-slate-500">Register as a patient or a donor.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Verify Info</h3>
              <p className="text-sm text-slate-500">Submit medical history for verification.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Get Matched</h3>
              <p className="text-sm text-slate-500">AI finds the best compatible match.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Connect</h3>
              <p className="text-sm text-slate-500">Message and coordinate with doctors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Serve (Audience Cards) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-teal-700 mb-2">How we serve</h2>
            <p className="text-slate-500">Dedicated portals for every stakeholder.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Patient Card */}
            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden group hover:shadow-lg transition">
              <div className="h-48 bg-teal-50 w-full relative">
                {/* Image Placeholder */}
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400">Patient Image</div>
              </div>
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 text-teal-600 font-bold mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  Patient
                </div>
                <p className="text-sm text-slate-500">Find hope and connect with potential donors quickly and safely.</p>
              </div>
            </div>
            {/* Donor Card */}
            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden group hover:shadow-lg transition relative -top-4 md:-top-8">
              <div className="h-48 bg-rose-50 w-full relative">
                {/* Image Placeholder */}
                <div className="absolute inset-0 bg-rose-100 flex items-center justify-center text-rose-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                </div>
              </div>
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 text-teal-600 font-bold mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                  Donors
                </div>
                <p className="text-sm text-slate-500">Give the gift of life. Register to become a donor easily.</p>
              </div>
            </div>
            {/* Doctors Card */}
            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden group hover:shadow-lg transition">
              <div className="h-48 bg-teal-50 w-full relative">
                {/* Image Placeholder */}
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400">Doctors Image</div>
              </div>
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 text-teal-600 font-bold mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Doctors
                </div>
                <p className="text-sm text-slate-500">Monitor patients and manage transplant cases effectively.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-900 text-teal-100 py-12">
        <div className="container mx-auto px-6 grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-teal-800 p-1.5 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="font-bold text-xl text-white">LifeSync</span>
            </div>
            <p className="text-sm text-teal-200/80">
              A comprehensive platform dedicated to kidney matching and transplantation services.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Links</h4>
            <ul className="space-y-2 text-sm text-teal-200/80">
              <li><Link href="#" className="hover:text-white">Home</Link></li>
              <li><Link href="#" className="hover:text-white">About Us</Link></li>
              <li><Link href="#" className="hover:text-white">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-teal-200/80">
              <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
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
    </div>
  );
}
