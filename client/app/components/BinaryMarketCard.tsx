/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { XEmbed } from "react-social-media-embed";

// Type definitions
interface MarketData {
  question: string;
  tvl: string;
  yesPercentage: number;
  noPercentage: number;
  url?: string;
  marketId?: string;
  description?: string;
  creator?: string;
  totalBets?: number;
  startTime?: number;
  endTime?: number;
  maxBettors?: number;
  status?: any;
  finalOutcome?: any;
}

interface BinaryMarketCardProps {
  market: MarketData;
  setShowBinaryModal?: (show: boolean) => void;
  setSelectSingleBinaryMarket?: (selection: {
    market: MarketData;
    betStatus: "yes" | "no";
  }) => void;
}

const BinaryMarketCard: React.FC<BinaryMarketCardProps> = ({
  market,
  setShowBinaryModal,
  setSelectSingleBinaryMarket,
}) => {
  // Handle betting action
  const handleBet = (betStatus: "yes" | "no") => {
    if (setShowBinaryModal && setSelectSingleBinaryMarket) {
      setShowBinaryModal(true);
      setSelectSingleBinaryMarket({
        market: market,
        betStatus: betStatus,
      });
    }
  };

  // Generate a default URL if none provided or if it's just "#"
  const getEmbedUrl = () => {
    if (market.url && market.url !== "#" && market.url.includes("x.com")) {
      return market.url;
    }
    // Return a default tweet or create a placeholder
    return "https://x.com/vaibhavgeek/status/1910290774614523928";
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl p-6 shadow-xl hover:scale-105 transition-transform font-techno text-white flex flex-col justify-between">
        <div className="mb-4">
          <div className="text-white/80 h-[400px] rounded-md overflow-y-auto text-xs mb-4">
            <XEmbed
              style={{ borderRadius: "0px", height: "100%" }}
              url={getEmbedUrl()}
              width="100%"
            />
          </div>

          <h3 className="text-xl font-bold mb-2">{market.question}</h3>
          
          {/* Show description if available */}
          {market.description && market.description !== market.question && (
            <p className="text-sm text-white/80 mb-2">{market.description}</p>
          )}
          
          {/* Additional market info */}
          <div className="flex flex-wrap gap-2 mb-2 text-xs">
            {market.totalBets !== undefined && (
              <span className="bg-white/20 px-2 py-1 rounded">
               Number of Bets: {market.totalBets}
              </span>
            )}
            {market.maxBettors !== undefined && (
              <span className="bg-white/20 px-2 py-1 rounded">
                Max : {market.maxBettors}
              </span>
            )}
            {/* {market.marketId && (
              <span className="bg-white/20 px-2 py-1 rounded">
                ID: {market.marketId}
              </span>
            )} */}
          </div>

          <div className="bg-black mt-4 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
            <span className="text-sm mr-1">🔐</span>
            <span className="font-bold">Amount Locked : {market.tvl} STRK</span>
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-4">
          <button
            onClick={() => handleBet("yes")}
            className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[2px] flex items-center justify-between px-6"
            disabled={!setShowBinaryModal || !setSelectSingleBinaryMarket}
          >
            Yes{" "}
            <span className="text-sm font-normal">
              ({market.yesPercentage}%) ⬆
            </span>
          </button>
          <button
            onClick={() => handleBet("no")}
            className="flex-1 bg-red-500 hover:bg-red-400 text-black font-bold py-2 px-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[2px] flex items-center justify-between px-6"
            disabled={!setShowBinaryModal || !setSelectSingleBinaryMarket}
          >
            No{" "}
            <span className="text-sm font-normal">
              ({market.noPercentage}%) ⬆
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default BinaryMarketCard;