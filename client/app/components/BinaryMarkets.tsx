"use client";
import React from "react";
import { XEmbed } from "react-social-media-embed"; 

const markets = [
  {
    question: "Will Starknet mainnet upgrade before September?",
    tvl: "13,420",
    yesPercentage: 64,
    noPercentage: 36,
    url: "https://x.com/vaibhavgeek/status/1910290774614523928", // example
  },
  {
    question: "Will price double in the next 30 days?",
    tvl: "9,860",
    yesPercentage: 28,
    noPercentage: 72,
    url: "https://x.com/vaibhavgeek/status/1910290774614523928",
  },
  {
    question: "Will zkSync reach 1M users before Q4?",
    tvl: "5,240",
    yesPercentage: 51,
    noPercentage: 49,
    url: "https://x.com/vaibhavgeek/status/1910290774614523928",
  },
  {
    question: "Will ETH surpass $4k before year end?",
    tvl: "22,800",
    yesPercentage: 74,
    noPercentage: 26,
    url: "https://x.com/vaibhavgeek/status/1910290774614523928",
  },
];

const BinaryMarkets = () => {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <h2 className="text-5xl font-techno font-extrabold mb-16 text-center text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] tracking-widest">
        🎮 Binary Markets on Starknet
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {markets.map((market, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl p-6 shadow-xl hover:scale-105 transition-transform font-techno text-white flex flex-col justify-between"
          >
            <div className="mb-4">
              <div className="text-white/80 text-sm mb-4">
                <XEmbed
                  style={{ borderRadius: "0px" }}
                  url={market.url}
                  width="100%"
                />
              </div>

              <h3 className="text-xl font-bold mb-2">{market.question}</h3>
              <div className="bg-black mt-4 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                <span className="text-sm mr-1">🔐</span>
                <span className="font-bold">Amount Locked : {market.tvl} STRK</span>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-4">
              <button className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[2px] flex items-center justify-between px-6">
                Yes{" "}
                <span className="text-sm font-normal">
                  ({market.yesPercentage}%)
                </span>
              </button>
              <button className="flex-1 bg-red-500 hover:bg-red-400 text-black font-bold py-2 px-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[2px] flex items-center justify-between px-6">
                No{" "}
                <span className="text-sm font-normal">
                  ({market.noPercentage}%)
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BinaryMarkets;
