"use client";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks";
import Audience from "./components/Audience";
import Footer from "./components/Footer";
import Script from "next/script";

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
      
      {/* Chatbase Integration (User Provided Snippet Logic) */}
      <Script id="chatbase-loader" strategy="afterInteractive">
        {`
          (function(){
            if(!window.chatbase || window.chatbase("getState") !== "initialized"){
              window.chatbase = (...arguments) => {
                if(!window.chatbase.q){ window.chatbase.q = [] }
                window.chatbase.q.push(arguments)
              };
              window.chatbase = new Proxy(window.chatbase, {
                get(target, prop){
                  if(prop === "q"){ return target.q }
                  return (...args) => target(prop, ...args)
                }
              })
            }
            const onLoad = function(){
              const script = document.createElement("script");
              script.src = "https://www.chatbase.co/embed.min.js";
              script.id = "mNZXr9cs5Uu2qeONxM_LF";
              script.domain = "www.chatbase.co";
              document.body.appendChild(script);
            };
            if(document.readyState === "complete"){
              onLoad()
            } else {
              window.addEventListener("load", onLoad)
            }
          })();
        `}
      </Script>
    </div>
  );
}
