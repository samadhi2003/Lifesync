import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 scroll-smooth">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-rose-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 text-white"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">LifeSync</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <Link href="#how-it-works" className="hover:text-rose-600 transition-colors">
              How it Works
            </Link>
            <Link href="#impact" className="hover:text-rose-600 transition-colors">
              Our Impact
            </Link>
            <Link href="#about" className="hover:text-rose-600 transition-colors">
              About Us
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-32 md:pb-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-600">
                    Revolutionizing Organ Matching
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                    Connect for Life. <br />
                    <span className="text-rose-600">Match with Hope.</span>
                  </h1>
                  <p className="max-w-[600px] text-lg text-zinc-600 md:text-xl leading-relaxed">
                    LifeSync uses advanced algorithms to find compatible kidney donors and recipients, reducing wait times and saving lives through smarter matching.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Link
                    href="/register?type=recipient"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-rose-600 px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                  >
                    Find a Donor
                  </Link>
                  <Link
                    href="/register?type=donor"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    Become a Donor
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-zinc-200" />
                    ))}
                  </div>
                  <p>Trusted by 2,000+ registered members</p>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
                <div className="relative aspect-square overflow-hidden rounded-3xl bg-zinc-100 shadow-xl">
                  {/* Placeholder for Hero Image - In a real app, use next/image here */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-100 to-indigo-50 text-rose-300">
                    <svg className="h-32 w-32 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-rose-200/50 blur-3xl"></div>
                  <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Why Us */}
        <section id="how-it-works" className="bg-zinc-50 py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                Streamlined Matching Process
              </h2>
              <p className="max-w-[700px] text-zinc-600 md:text-lg">
                We've simplified the complex process of finding a match, making it faster, safer, and more transparent for everyone involved.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Create Profile",
                  desc: "Register securely as a donor or recipient with your medical details.",
                  icon: (
                    <svg className=" h-6 w-6 text-rose-600" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  ),
                },
                {
                  title: "Smart Matching",
                  desc: "Our algorithm finds the best biological and immunological matches.",
                  icon: (
                    <svg className=" h-6 w-6 text-rose-600" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m12 14 7-7" /><path d="M12 14v9" /><path d="M12 14 5 7" /><path d="m5 7 7-7" /><path d="m19 7-7-7" /></svg>
                  ),
                },
                {
                  title: "Connect & Consult",
                  desc: "Securely connect with matches and coordinate with medical professionals.",
                  icon: (
                    <svg className=" h-6 w-6 text-rose-600" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  ),
                },
              ].map((item, index) => (
                <div key={index} className="relative flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">{item.title}</h3>
                  <p className="text-center text-zinc-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 px-6 py-24 text-center shadow-2xl sm:px-16">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Give the Gift of Life?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-300">
                Join thousands of others in the LifeSync community. Whether you're looking for a match or willing to donate, your journey starts here.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Join LifeSync Today
                </Link>
                <Link href="#learn-more" className="text-sm font-semibold leading-6 text-white">
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-20" style={{ background: 'radial-gradient(circle, rgba(225, 29, 72, 0.4) 0%, rgba(9, 9, 11, 0) 70%)' }}></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100 bg-white py-12">
        <div className="container mx-auto grid gap-8 px-4 md:px-6 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-rose-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-white"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
              </div>
              <span className="text-lg font-bold text-zinc-900">LifeSync</span>
            </div>
            <p className="text-sm text-zinc-500">
              Connecting donors and recipients for a better tomorrow.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">Platform</h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li><Link href="#" className="hover:text-rose-600">How it Works</Link></li>
              <li><Link href="#" className="hover:text-rose-600">Find a Donor</Link></li>
              <li><Link href="#" className="hover:text-rose-600">Become a Donor</Link></li>
              <li><Link href="#" className="hover:text-rose-600">Success Stories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">Resources</h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li><Link href="#" className="hover:text-rose-600">Blog</Link></li>
              <li><Link href="#" className="hover:text-rose-600">Support Center</Link></li>
              <li><Link href="#" className="hover:text-rose-600">Legal & Privacy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">Contact</h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li><Link href="#" className="hover:text-rose-600">support@lifesync.org</Link></li>
              <li><Link href="#" className="hover:text-rose-600">+1 (555) 123-4567</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-12 border-t border-zinc-100 px-4 pt-8 text-center text-sm text-zinc-500 md:px-6">
          &copy; 2024 LifeSync. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
