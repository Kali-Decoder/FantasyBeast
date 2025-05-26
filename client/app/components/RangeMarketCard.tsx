/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React from "react";
import { XEmbed } from "react-social-media-embed";

interface Market {
  url: string;
  question: string;
  minValue: string;
  maxValue: string;
  tvl: string;
  metric: string;
  poolId?: number;
  totalBets?: number;
  maxBettors?: number;
  endTime?: string;
  creator?: string;
  status?: string;
}

interface RangeMarketCardProps {
  market: Market;
  setShowRangeModal?: (show: boolean) => void;
  setSelectSingleRangeMarket?: (market: any) => void;
}

const RangeMarketCard: React.FC<RangeMarketCardProps> = ({ 
  market, 
  setShowRangeModal, 
  setSelectSingleRangeMarket 
}) => {

  const handlePredictClick = () => {
    if (setShowRangeModal) setShowRangeModal(true);
    if (setSelectSingleRangeMarket) setSelectSingleRangeMarket(market);
  };

  return (

    <div className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-3xl p-6 shadow-xl hover:scale-105 transition-transform font-techno text-black flex flex-col justify-between h-full min-h-[420px] max-w-md w-full mx-auto">
      
      {/* Embedded content */}
      <div className="rounded-md overflow-hidden mb-4 h-[180px] sm:h-[200px] md:h-[220px]">
        <XEmbed
          style={{ borderRadius: "0px", height: "100%" }}
          url={market.url || "https://x.com/vaibhavgeek/status/1910290774614523928"}
          width="100%"
        />
      </div>

      {/* Question */}
      <h3 className="text-xl font-bold mb-4">{market.question}</h3>

      {/* Range values */}
      <div className="flex justify-between gap-2 text-sm font-semibold text-white mb-2">
        <div className="bg-black backdrop-blur-sm rounded-full px-3 py-1">
          Max: {market.maxValue}
        </div>
        <div className="bg-black backdrop-blur-sm rounded-full px-3 py-1">
          Min: {market.minValue}
        </div>
      </div>

      {/* Metric and TVL */}
      <div className="flex justify-between gap-2 text-sm font-semibold text-white mb-4">
        <div className="bg-black backdrop-blur-sm rounded-full px-3 py-1">
          Metric: {market.metric}
        </div>
        <div className="bg-black backdrop-blur-sm rounded-full px-3 py-1">
          TVL: {market.tvl} STRK
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handlePredictClick} 
        className="mt-auto w-full text-white bg-black py-3 rounded-xl hover:bg-white hover:text-black transition-all font-bold tracking-wide active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black"
      >
        Predict Now
      </button>
    </div>
  );
};

export default RangeMarketCard;
