/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import BinaryMarketCard from "./BinaryMarketCard";
import { RefreshCw } from "lucide-react";

// Type definitions for transformed data
interface TransformedMarket {
  question: string;
  tvl: string;
  yesPercentage: number;
  noPercentage: number;
  url: string;
  marketId: string;
  description: string;
  creator: string;
  totalBets: number;
  startTime: number;
  endTime: string;
  endTimeTimestamp: number;
  endTimeFormatted: string;
  maxBettors: number;
  status: any;
  finalOutcome: any;
}

// Component props interface
interface BinaryMarketsProps {
  getAllMarkets: () => Promise<any[] | null>;
  getMarketsCount: () => Promise<number | null>;
}

type FilterType = "all" | "active" | "ended" | "ending-soon";

// Utility function to convert hex string to readable text
const hexToString = (hex: string): string => {
  if (!hex || hex === "0x0") return "";
  try {
    const cleanHex = hex.replace("0x", "");
    // Ensure even length
    const evenHex = cleanHex.length % 2 === 0 ? cleanHex : "0" + cleanHex;
    let str = "";
    for (let i = 0; i < evenHex.length; i += 2) {
      const hexChar = evenHex.substr(i, 2);
      const charCode = parseInt(hexChar, 16);
      if (charCode !== 0 && charCode >= 32 && charCode <= 126) {
        str += String.fromCharCode(charCode);
      }
    }
    return str;
  } catch (error) {
    console.warn("Error converting hex to string:", error);
    return hex;
  }
};

// Utility function to convert hex to number with error handling
const hexToNumber = (hex: string | number | bigint): number => {
  if (hex === null || hex === undefined) return 0;
  if (typeof hex === "number") return hex;
  if (typeof hex === "bigint") return Number(hex);
  if (typeof hex === "string") {
    if (!hex || hex === "0x0") return 0;
    try {
      return parseInt(hex, 16);
    } catch (error) {
      console.warn("Error converting hex to number:", error);
      return 0;
    }
  }
  return 0;
};

// Utility function to format timestamp with better error handling
const formatTimestamp = (
  timestamp: bigint | number | string
): { formatted: string; raw: number } => {
  if (!timestamp || timestamp === 0 || timestamp === "0x0") {
    return { formatted: "Not set", raw: 0 };
  }

  try {
    let ms: number;
    if (typeof timestamp === "bigint") {
      ms = Number(timestamp) * 1000;
    } else if (typeof timestamp === "string") {
      ms = parseInt(timestamp, 16) * 1000;
    } else {
      ms = Number(timestamp) * 1000;
    }

    if (isNaN(ms) || ms <= 0) {
      return { formatted: "Invalid date", raw: 0 };
    }

    const formatted = new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return { formatted, raw: ms };
  } catch (error) {
    console.warn("Error formatting timestamp:", error);
    return { formatted: "Invalid date", raw: 0 };
  }
};

// Transform blockchain data to component format with better error handling
const transformMarketData = (blockchainMarkets: any[]): TransformedMarket[] => {
  if (!Array.isArray(blockchainMarkets)) {
    console.warn("blockchainMarkets is not an array:", blockchainMarkets);
    return [];
  }

  return blockchainMarkets
    .map((market, index) => {
      try {
        if (!market || typeof market !== "object") {
          console.warn(`Invalid market data at index ${index}:`, market);
          return null;
        }

        const { market_id, market_info } = market;

        if (!market_info || typeof market_info !== "object") {
          console.warn(`Invalid market_info at index ${index}:`, market_info);
          return null;
        }

        const yesAmount = hexToNumber(market_info.yes_amount);
        const noAmount = hexToNumber(market_info.no_amount);
        const totalAmount = yesAmount + noAmount;

        // Calculate percentages with safety checks
        let yesPercentage = 0;
        let noPercentage = 0;
        if (totalAmount > 0) {
          yesPercentage = Math.round((yesAmount / totalAmount) * 100);
          noPercentage = Math.round((noAmount / totalAmount) * 100);
          
          // Ensure percentages add up to 100
          if (yesPercentage + noPercentage !== 100) {
            noPercentage = 100 - yesPercentage;
          }
        }

        const { formatted: endTime, raw: endTimeTimestamp } = formatTimestamp(
          market_info.end_time
        );

        // Better question extraction
        let question = "";
        if (market_info.question) {
          if (typeof market_info.question === "string") {
            question = hexToString(market_info.question);
          } else if (typeof market_info.question === "bigint" || typeof market_info.question === "number") {
            question = hexToString(BigInt(market_info.question).toString(16));
          }
        }
        if (!question) {
          question = `Market ${market_id || index}`;
        }

        // Better description extraction
        let description = "";
        if (market_info.description) {
          if (typeof market_info.description === "string") {
            description = hexToString(market_info.description);
          } else if (typeof market_info.description === "bigint" || typeof market_info.description === "number") {
            description = hexToString(BigInt(market_info.description).toString(16));
          }
        }
        if (!description) {
          description = "No description available";
        }

        return {
          question,
          tvl: totalAmount.toLocaleString(),
          yesPercentage,
          noPercentage,
          url: "#",
          marketId: String(market_id || index),
          description,
          creator: market_info.creator || "Unknown",
          totalBets: hexToNumber(market_info.total_bets),
          startTime: hexToNumber(market_info.start_time),
          endTime: endTime,
          endTimeTimestamp: endTimeTimestamp,
          endTimeFormatted: endTime,
          maxBettors: hexToNumber(market_info.max_bettors),
          status: market_info.status,
          finalOutcome: market_info.final_outcome,
        };
      } catch (error) {
        console.error(`Error transforming market at index ${index}:`, error);
        return null;
      }
    })
    .filter((market): market is TransformedMarket => market !== null);
};

const BinaryMarkets: React.FC<BinaryMarketsProps> = ({
  getAllMarkets,
  getMarketsCount,
}) => {
  const [markets, setMarkets] = useState<TransformedMarket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [marketsCount, setMarketsCount] = useState<number>(0);
  const [filter, setFilter] = useState<FilterType>("active");

  // Filter markets based on end time
  const filterMarkets = useCallback(
    (
      markets: TransformedMarket[],
      filterType: FilterType
    ): TransformedMarket[] => {
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const threeDaysInMs = 3 * oneDayInMs;

      switch (filterType) {
        case "active":
          return markets.filter(
            (market) => market.endTimeTimestamp && market.endTimeTimestamp > now
          );

        case "ended":
          return markets.filter(
            (market) =>
              market.endTimeTimestamp && market.endTimeTimestamp <= now
          );

        case "ending-soon":
          return markets.filter(
            (market) =>
              market.endTimeTimestamp &&
              market.endTimeTimestamp > now &&
              market.endTimeTimestamp <= now + threeDaysInMs
          );

        case "all":
        default:
          return markets;
      }
    },
    []
  );

  // Get filtered markets
  const filteredMarkets = useMemo(() => {
    return filterMarkets(markets, filter);
  }, [markets, filter, filterMarkets]);

  // Get market counts for each filter
  const marketCounts = useMemo(() => {
    const now = Date.now();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    return {
      all: markets.length,
      active: markets.filter(
        (m) => m.endTimeTimestamp && m.endTimeTimestamp > now
      ).length,
      ended: markets.filter(
        (m) => m.endTimeTimestamp && m.endTimeTimestamp <= now
      ).length,
      endingSoon: markets.filter(
        (m) =>
          m.endTimeTimestamp &&
          m.endTimeTimestamp > now &&
          m.endTimeTimestamp <= now + threeDaysInMs
      ).length,
    };
  }, [markets]);

  const fetchMarkets = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch markets count with error handling
      try {
        const count = await getMarketsCount();
        if (typeof count === "number" && count >= 0) {
          setMarketsCount(count);
        }
      } catch (countError) {
        console.warn("Error fetching markets count:", countError);
      }

      // Fetch all markets
      const marketData = await getAllMarkets();

      if (marketData && Array.isArray(marketData)) {
        const transformedMarkets = transformMarketData(marketData);
        setMarkets(transformedMarkets);
        
        if (transformedMarkets.length === 0 && marketData.length > 0) {
          setError("Markets data could not be processed");
        }
      } else if (marketData === null) {
        setMarkets([]);
        setError("No markets data available");
      } else {
        setMarkets([]);
        setError("Invalid markets data format");
      }
    } catch (err) {
      console.error("Error fetching markets:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch markets data");
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  }, [getAllMarkets, getMarketsCount]);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Refresh function that can be called externally
  const refreshMarkets = async (): Promise<void> => {
    await fetchMarkets();
  };

  if (loading) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-techno font-extrabold drop-shadow-lg tracking-widest mb-4">
            🎮 Binary Based Markets
          </h2>
          <p className="text-xl text-gray-300 font-medium">
            Powered by Starknet
          </p>
        </div>

        <div className="flex flex-col justify-center items-center min-h-[400px] space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-500 border-b-transparent rounded-full animate-spin animate-reverse"></div>
          </div>
          <div className="text-white text-xl font-medium animate-pulse">
            Loading binary markets...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-5xl font-techno font-extrabold mb-16 text-center text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] tracking-widest">
          🎮 Binary Markets on Starknet
        </h2>
        <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
          <div className="text-red-400 text-xl text-center max-w-md">{error}</div>
          <button
            onClick={refreshMarkets}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw  />
            
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-5xl font-techno font-extrabold text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] tracking-widest mb-4">
          🎮 Binary Markets on Starknet
        </h2>
        <p className="text-xl text-gray-300 font-medium mb-6">
          Powered by Starknet
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            // {
            //   key: "all" as FilterType,
            //   label: "All Markets",
            //   count: marketCounts.all,
            // },
            {
              key: "active" as FilterType,
              label: "Active",
              count: marketCounts.active,
            },
            {
              key: "ending-soon" as FilterType,
              label: "Ending Soon",
              count: marketCounts.endingSoon,
            },
            {
              key: "ended" as FilterType,
              label: "Ended",
              count: marketCounts.ended,
            },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full font-semibold transition-all transform hover:-translate-y-0.5 ${
                filter === key
                  ? "bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center items-center gap-4">
          <div className="bg-gradient-to-r from-orange-600 to-yellow-600 px-4 py-2 rounded-full">
            <span className="text-white font-semibold">
              {filteredMarkets.length} Markets Shown
            </span>
          </div>
          <button
            onClick={refreshMarkets}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw  />
       
          </button>
        </div>
      </div>

      {/* Markets Grid */}
      {filteredMarkets.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">
              {filter === "ended"
                ? "⏰"
                : filter === "ending-soon"
                ? "⚡"
                : "🎯"}
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {filter === "ended"
                ? "No Ended Markets"
                : filter === "ending-soon"
                ? "No Markets Ending Soon"
                : filter === "active"
                ? "No Active Markets"
                : "No Markets Available"}
            </h3>
            <p className="text-gray-400 text-lg mb-8">
              {filter === "ended"
                ? "All markets are still active."
                : filter === "ending-soon"
                ? "No markets are ending in the next 3 days."
                : filter === "active"
                ? "No markets are currently active."
                : "No markets available at the moment."}
            </p>
            <div className="space-x-4">
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold rounded-xl hover:from-blue-500 hover:to-purple-600 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  View All Markets
                </button>
              )}
              <button
                onClick={refreshMarkets}
                className="px-8 py-3 bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-bold rounded-xl hover:from-purple-500 hover:to-indigo-600 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                Refresh Markets
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredMarkets.slice(0,6).map((market, i) => (
            <BinaryMarketCard key={market.marketId || i} market={market} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BinaryMarkets;