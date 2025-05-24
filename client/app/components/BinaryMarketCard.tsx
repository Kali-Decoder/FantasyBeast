import React from "react";
import { XEmbed } from "react-social-media-embed";

const BinaryMarketCard = ({ market }) => {
  return (
    <>
      <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl p-6 shadow-xl hover:scale-105 transition-transform font-techno text-white flex flex-col justify-between">
        <div className="mb-4">
          <div className="text-white/80 h-[300px] rounded-md overflow-y-auto text-xs mb-4">
            <XEmbed
              style={{ borderRadius: "0px", height: "100%" }}
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
    </>
  );
};

export default BinaryMarketCard;
