/* eslint-disable @next/next/no-page-custom-font */
// pages/index.js

import Hero from "./components/landing/Hero";
import BinaryMarkets from "./components/BinaryMarkets";
// import Features from "./components/landing/Features";
import Cta from "./components/landing/Cta";
import Partners from "./components/landing/Partners";
import SocialMarket from "./components/SocialMarket";
import Features from "./components/landing/Features";
// import '@fontsource/press-start-2p'; 
export default function Home() {
  return (
    <div className="min-h-screen  bg-black text-white flex flex-col relative overflow-hidden">
           {/* Background grid */}
               <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900 opacity-80">
                 <div
                   className="w-full h-full"
                   style={{
                     backgroundImage:
                       "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                     backgroundSize: "40px 40px",
                   }}
                 ></div>
               </div>

      {/* Custom radial gradient background overlay */}
      <div className="fixed inset-0  pointer-events-none"></div>

      <main className="relative z-10">
        {/* Hero Section */}
        <Hero />

        {/* Games Section */}
        <SocialMarket/>
        <BinaryMarkets />


        {/* Features Section */}
        <Features />

        <Partners/>

        {/* CTA Section */}
        <Cta />
      </main>
    </div>
  );
}
