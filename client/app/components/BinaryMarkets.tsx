"use client";
import React from "react";
import BinaryMarketCard from "./BinaryMarketCard";

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
        {markets.map((market, i) => {
          return <BinaryMarketCard key={i} market={market} />;
        })}
      </div>
    </section>
  );
};

export default BinaryMarkets;
