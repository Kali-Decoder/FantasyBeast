"use client";
import React, { useState } from "react";
import RangeMarketCard from "./RangeMarketCard";

const rangeMarkets = [
  {
    url: "https://x.com/Starknet/status/1234567890",
    question: "What will be the STARK price range on July 30th?",
    minValue: "40",
    maxValue: "65",
    tvl: "10,200",
    metric: "views",
  },
  {
    url: "https://x.com/Starknet/status/1234567890",
    question: "zkSync TVL range by end of Q3?",
    minValue: "100",
    maxValue: "180",
    tvl: "8,950",
    metric: "likes",
  },
  {
    url: "https://x.com/Starknet/status/1234567890",
    question: "ETH price prediction range by Sept 15th?",
    minValue: "200",
    maxValue: "6000",
    tvl: "17,640",
    metric: "retweets",
  },
  {
    url: "https://x.com/Starknet/status/1234567890",
    question: "TVL in Starknet DeFi ecosystem by Oct 1st?",
    minValue: "50M",
    maxValue: "150M",
    tvl: "21,870",
    metric: "views",
  },
];

const SocialMarket = () => {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <h2 className="text-5xl font-techno font-extrabold mb-16 text-center text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] tracking-widest">
        🎰 Range Based Markets on Starknet
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {rangeMarkets.map((market, i) => {
          return <RangeMarketCard key={i} market={market} />;
        })}
      </div>
    </section>
  );
};

export default SocialMarket;
