/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import BinaryMarketCard from "../components/BinaryMarketCard";
import RangeMarketCard from "../components/RangeMarketCard";
import BinaryModal from "../components/modals/BinaryModal";
import RangeModal from "../components/modals/RangeModal";
const mergedMarkets = [
  {
    poolId: "1",
    question: "Will price double in the next 30 days?",
    tvl: "9,860",
    yesPercentage: 28,
    noPercentage: 72,
    url: "https://x.com/vaibhavgeek/status/1910290774614523928",
    type: "binary",
  },
  {
    poolId: "2",
    url: "https://x.com/Starknet/status/1234567890",
    question: "zkSync TVL range by end of Q3?",
    minValue: "100",
    maxValue: "180",
    tvl: "8,950",
    metric: "likes",
    type: "range",
  },
  {
    poolId: "3",
    url: "https://x.com/Starknet/status/1234567890",
    question: "TVL in Starknet DeFi ecosystem by Oct 1st?",
    minValue: "50M",
    maxValue: "150M",
    tvl: "21,870",
    metric: "views",
    type: "range",
  },
  {
    poolId: "4",
    question: "Will zkSync reach 1M users before Q4?",
    tvl: "5,240",
    yesPercentage: 51,
    noPercentage: 49,
    url: "https://x.com/vaibhavgeek/status/1910290774614523928",
    type: "binary",
  },
  {
    poolId: "5",
    url: "https://x.com/Starknet/status/1234567890",
    question: "What will be the STARK price range on July 30th?",
    minValue: "40",
    maxValue: "65",
    tvl: "10,200",
    metric: "views",
    type: "range",
  },
  {
    poolId: "6",
    question: "Will ETH surpass $4k before year end?",
    tvl: "22,800",
    yesPercentage: 74,
    noPercentage: 26,
    url: "https://x.com/vaibhavgeek/status/1910290774614523928",
    type: "binary",
  },
  {
    poolId: "7",
    url: "https://x.com/Starknet/status/1234567890",
    question: "ETH price prediction range by Sept 15th?",
    minValue: "200",
    maxValue: "6000",
    tvl: "17,640",
    metric: "retweets",
    type: "range",
  },
  {
    poolId: "8",
    question: "Will Starknet mainnet upgrade before September?",
    tvl: "13,420",
    yesPercentage: 64,
    noPercentage: 36,
    url: "https://x.com/vaibhavgeek/status/1910290774614523928",
    type: "binary",
  },
];

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [markets, setMarkets] = useState(mergedMarkets);
  const [showBinaryModal, setShowBinaryModal] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [selectSingleRangeMarket, setSelectSingleRangeMarket] = useState(null);
  const [selectSingleBinaryMarket, setSelectSingleBinaryMarket] = useState({
    market: null,
    betValue: null,
  });
  const filterMarketByType = async () => {
    if (activeTab === "all") {
      return mergedMarkets;
    }
    const newMarkets = mergedMarkets.filter(
      (market) => market.type === activeTab
    );
    setMarkets(newMarkets);
  };

  useEffect(() => {
    filterMarketByType();
  }, [activeTab]);
  const getButtonClasses = (tab: string) =>
    `flex-1 font-techno py-2 px-4 whitespace-nowrap rounded-xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[2px] flex items-center justify-between px-6 ${
      activeTab === tab ? "bg-blue-500 text-white" : "bg-white text-black"
    }`;
  return (
    <>
      <div className="p-10 mt-4">
        <h1 className="text-3xl font-bold my-2 font-techno uppercase">
          Make onchain <span className="text-yellow-400">Predictions</span>
        </h1>
        <nav className="flex gap-4 mt-4 items-baseline">
          <div>
            <input
              type="text"
              placeholder="Search markets..."
              className="border font-techno shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[2px] border-gray-300 bg-black rounded-lg px-4 py-2 w-full"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredMarkets = mergedMarkets.filter((market) =>
                  market.question.toLowerCase().includes(searchTerm)
                );
                setMarkets(filteredMarkets);
              }}
            />
          </div>
          <div className="flex justify-between gap-4 mt-4">
            <button
              className={getButtonClasses("all")}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            <button
              className={getButtonClasses("binary")}
              onClick={() => setActiveTab("binary")}
            >
              Binary Predictions
            </button>
            <button
              className={getButtonClasses("range")}
              onClick={() => setActiveTab("range")}
            >
              Range Predictions
            </button>
          </div>
        </nav>
        <div className="grid grid-cols-3 gap-8 mt-10">
          {markets.length === 0 && (
            <>
              <div className="col-span-3 font-techno text-center text-gray-500">
                No markets found. Try changing your search or filter.
              </div>
            </>
          )}
          {markets.length > 0 &&
            markets.map((market, _idx) => {
              return market.type === "binary" ? (
                <BinaryMarketCard
                  key={market.poolId}
                  market={market}
                  setShowBinaryModal={setShowBinaryModal}
                  setSelectSingleBinaryMarket={setSelectSingleBinaryMarket}
                />
              ) : (
                <RangeMarketCard
                  key={market.poolId}
                  market={market}
                  setShowRangeModal={setShowRangeModal}
                  setSelectSingleRangeMarket={setSelectSingleRangeMarket}
                />
              );
            })}
        </div>
      </div>
      {showBinaryModal && (
        <BinaryModal
          onClose={() => setShowBinaryModal(false)}
          selectSingleBinaryMarket={selectSingleBinaryMarket}
        />
      )}
      {showRangeModal && (
        <RangeModal
          onClose={() => setShowRangeModal(false)}
          selectSingleRangeMarket={selectSingleRangeMarket!}
        />
      )}
    </>
  );
}




