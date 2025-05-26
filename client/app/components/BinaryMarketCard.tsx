/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { XEmbed } from "react-social-media-embed";




const BinaryMarketCard: React.FC<any> = ({
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
      <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl p-6 shadow-xl hover:scale-105 transition-transform font-techno text-black flex flex-col justify-between h-full min-h-[420px] max-w-md w-full mx-auto">
        <div className="mb-4">
          <div className="rounded-md overflow-hidden mb-4 h-[180px] sm:h-[200px] md:h-[220px]">
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

          <div className="bg-black mt-4 text-white backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
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