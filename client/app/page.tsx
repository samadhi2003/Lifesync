import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks";
import Audience from "./components/Audience";
import Footer from "./components/Footer";

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
