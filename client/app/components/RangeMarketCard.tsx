import React from "react";
import { XEmbed } from "react-social-media-embed";

const RangeMarketCard = ({ market }) => {
  return (
    <>
      <div
        className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-3xl p-6 shadow-xl hover:scale-105 transition-transform font-techno text-black flex flex-col justify-between h-[550px]" // Fixed height
      >
        <div className="text-white/80 h-[300px] rounded-md overflow-y-auto text-xs mb-4">
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

        <button className="mt-6 w-full text-white bg-black py-3 rounded-xl hover:bg-white hover:text-black transition-all font-bold tracking-wide active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black">
          Predict Now
        </button>
      </div>
    </>
  );
};

export default RangeMarketCard;
