"use client";
import React, { useState } from "react";
import { XEmbed } from "react-social-media-embed";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [prediction, setPrediction] = useState("");

  const handlePredictClick = (market) => {
    setSelectedMarket(market);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    console.log("Prediction submitted:", prediction, selectedMarket);
    setIsModalOpen(false);
    setPrediction("");
    setSelectedMarket(null);
  };

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <h2 className="text-5xl font-techno font-extrabold mb-16 text-center text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] tracking-widest">
        🎰 Range Based Markets on Starknet
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {rangeMarkets.map((market, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-3xl p-6 shadow-xl hover:scale-105 transition-transform font-techno text-black flex flex-col justify-between h-[550px]" // Fixed height
          >
            <div className="mb-4 h-[200px] overflow-hidden rounded-lg">
              <XEmbed
                style={{ borderRadius: "0px", height: "100%" }}
                url={market.url}
                width="100%"
              />
            </div>

            <h3 className="text-xl font-bold mb-2">{market.question}</h3>

            <div className="flex justify-between text-sm font-semibold text-white mt-2">
              <div className="bg-black mt-4 backdrop-blur-sm rounded-full px-3 py-1">
                Max: {market.maxValue}
              </div>
              <div className="bg-black mt-4 backdrop-blur-sm rounded-full px-3 py-1">
                Min: {market.minValue}
              </div>
            </div>

            <div className="flex justify-between text-sm font-semibold text-white mt-2">
              <div className="bg-black mt-4 backdrop-blur-sm rounded-full px-3 py-1">
                Metric: {market.metric}
              </div>
              <div className="bg-black mt-4 backdrop-blur-sm rounded-full px-3 py-1">
                TVL: {market.tvl} STRK
              </div>
            </div>

            {selectedMarket?.url === market.url && isModalOpen && (
              <div className="mt-6 bg-black text-white rounded-xl p-4 border border-white shadow-lg">
                <h3 className="text-lg font-bold mb-3">
                  {selectedMarket.question}
                </h3>
                <input
                  type="text"
                  value={prediction}
                  onChange={(e) => setPrediction(e.target.value)}
                  placeholder="Enter your prediction..."
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-400 mb-3"
                />
                <button
                  onClick={handleSubmit}
                  className="w-full bg-yellow-400 text-black py-2 rounded font-bold hover:bg-yellow-300 transition"
                >
                  Submit Prediction
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedMarket(null);
                  }}
                  className="w-full mt-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
            <button
              onClick={() => handlePredictClick(market)}
              className="mt-6 w-full text-white bg-black py-3 rounded-xl hover:bg-white hover:text-black transition-all font-bold tracking-wide active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black"
            >
              Predict Now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SocialMarket;
