import Navbar from "./landing_page/Navbar";
import Hero from "./landing_page/Hero";
import Features from "./landing_page/Features";
import About from "./landing_page/About";
import HowItWorks from "./landing_page/HowItWorks";
import Audience from "./landing_page/Audience";
import Footer from "./landing_page/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-800 font-sans">
      <Navbar />
      <Hero />
      <Features />
      <About />
      <HowItWorks />
      <Audience />
      <Footer />
    </div>
  );
}
