/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-page-custom-font */
// pages/index.js
"use client"
import Hero from "./components/landing/Hero";
import BinaryMarkets from "./components/BinaryMarkets";
// import Features from "./components/landing/Features";
import Cta from "./components/landing/Cta";
import Partners from "./components/landing/Partners";
import SocialMarket from "./components/SocialMarket";
import Features from "./components/landing/Features";
import { useRangeContract } from "./hooks/useRangeContract";
import { useEffect, useState } from "react";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import { range_based_contract } from "./constants";
import { useBinaryMarketContract } from "./hooks/useBinaryContract";
// import '@fontsource/press-start-2p'; 
export default function Home() {
   const { account, address } = useAccount();
  const { connectors } = useConnect();
  const [username, setUsername] = useState<string | undefined>();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!address) return;
    const controller = connectors.find(
      (c: any) => c instanceof ControllerConnector
    );
    if (controller) {
      controller?.username()?.then((n) => setUsername(n));
      setConnected(true);
    }
  }, [address, connectors]);


  const { getAllPool } = useRangeContract(connected, account);
  const { getAllMarkets,getMarketsCount } = useBinaryMarketContract(connected, account);
  
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
        <SocialMarket getAllPool={getAllPool} range_based_contract={range_based_contract}/>
        <BinaryMarkets getAllMarkets={getAllMarkets} getMarketsCount={getMarketsCount} />


        {/* Features Section */}
        <Features />

        <Partners/>

        {/* CTA Section */}
        <Cta />
      </main>
    </div>
  );
}
