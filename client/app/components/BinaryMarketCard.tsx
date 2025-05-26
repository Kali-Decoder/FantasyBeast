/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { XEmbed } from "react-social-media-embed";
import { formatSTRK, fromSmallestUnit } from "../utils";




const BinaryMarketCard: React.FC<any> = ({
  market,
  setShowBinaryModal,
  setSelectSingleBinaryMarket,
}) => {
  // Handle betting action

  const tweetLinks = [
    "https://x.com/Starknet/status/1926201730921828506",
    "https://x.com/akashneelesh/status/1925808560400638201",
    "https://x.com/reet_batra/status/1926201645043511351",
    "https://x.com/StarknetAfrica/status/1925816893094474001",
    "https://x.com/0xNurstar/status/1926279962434089189",
    "https://x.com/starkience/status/1926267201708802196",
    "https://x.com/GabinMarignier/status/1925487740621123942",
    "https://x.com/Starknet_OG/status/1925170624009318426",
    "https://x.com/sneha_1907/status/1927095017094435236",
    "https://x.com/sneha_1907/status/1926650200124240188",
    "https://x.com/itsNikku876/status/1927096068828770370",
    "https://x.com/itsNikku876/status/1926537189380202552"
  ];
  
  function getRandomTweetUrl() {
    const randomIndex = Math.floor(Math.random() * tweetLinks.length);
    return tweetLinks[randomIndex];
  }
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
    return getRandomTweetUrl();
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
            <span className="font-bold">Amount Locked : {formatSTRK(market.tvl)} STRK</span>
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