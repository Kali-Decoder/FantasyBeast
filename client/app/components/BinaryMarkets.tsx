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
  endTime: number;
  endTimeTimestamp: number; // Add raw timestamp for filtering
  endTimeFormatted: string; // Add formatted date string
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
    let str = "";
    for (let i = 0; i < cleanHex.length; i += 2) {
      const hexChar = cleanHex.substr(i, 2);
      const charCode = parseInt(hexChar, 16);
      if (charCode !== 0) {
        str += String.fromCharCode(charCode);
      }
    }
    return str;
  } catch {
    return hex;
  }
};

// Utility function to convert hex to number
const hexToNumber = (hex: string): number => {
  if (!hex) return 0;
  return parseInt(hex, 16);
};

// Utility function to format timestamp
const formatTimestamp = (
  timestamp: number
): { formatted: string; raw: number } => {
  if (!timestamp || timestamp === 0) {
    return { formatted: "Not set", raw: 0 };
  }

  const ms = timestamp * 1000;
  const formatted = new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return { formatted, raw: ms };
};

// Transform blockchain data to component format
const transformMarketData = (blockchainMarkets: any[]): TransformedMarket[] => {
  return blockchainMarkets.map((market) => {
    const { market_id, market_info } = market;

    const yesAmount = hexToNumber(market_info.yes_amount);
    const noAmount = hexToNumber(market_info.no_amount);
    const totalAmount = yesAmount + noAmount;

    // Calculate percentages
    const yesPercentage =
      totalAmount > 0 ? Math.round((yesAmount / totalAmount) * 100) : 0;
    const noPercentage =
      totalAmount > 0 ? Math.round((noAmount / totalAmount) * 100) : 0;

    const endTime = hexToNumber(market_info.end_time);
    console.log("End time:", endTime,market_info.end_time);
    const { formatted: endTimeFormatted, raw: endTimeTimestamp } =
      formatTimestamp(endTime);

    return {
      question:
        hexToString(BigInt(market_info.question).toString(16)) ||
        `Market ${market_id}`,
      tvl: totalAmount.toLocaleString(),
      yesPercentage,
      noPercentage,
      url: "#", // You can modify this based on your needs
      marketId: market_id,
      description:
        hexToString(BigInt(market_info.description).toString(16)) ||
        "No description available",
      creator: market_info.creator,
      totalBets: hexToNumber(market_info.total_bets),
      startTime: hexToNumber(market_info.start_time),
      endTime: endTime,
      endTimeTimestamp: endTimeTimestamp,
      endTimeFormatted: endTimeFormatted,
      maxBettors: hexToNumber(market_info.max_bettors),
      status: market_info.status,
      finalOutcome: market_info.final_outcome,
    };
  });
};

const BinaryMarkets: React.FC<BinaryMarketsProps> = ({
  getAllMarkets,
  getMarketsCount,
}) => {
  const [markets, setMarkets] = useState<TransformedMarket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [marketsCount, setMarketsCount] = useState<number>(0);
  const [filter, setFilter] = useState<FilterType>("all");

  // Filter markets based on end time
  const filterMarkets = useCallback(
    (
      markets: TransformedMarket[],
      filterType: FilterType
    ): TransformedMarket[] => {
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const threeDaysInMs = 3 * oneDayInMs; // 3 days in milliseconds

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

      // Fetch markets count
      const count = await getMarketsCount();
      if (count !== null) {
        setMarketsCount(count);
      }

      // Fetch all markets
      const marketData = await getAllMarkets();

      if (marketData && Array.isArray(marketData)) {
        const transformedMarkets = transformMarketData(marketData);
        setMarkets(transformedMarkets);
      } else {
        setMarkets([]);
        setError("No markets data available");
      }
    } catch (err) {
      console.error("Error fetching markets:", err);
      setError("Failed to fetch markets data");
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
          <div className="text-red-400 text-xl">{error}</div>
          <button
            onClick={refreshMarkets}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            
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
            {
              key: "all" as FilterType,
              label: "All Markets",
              count: marketCounts.all,
            },
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
            <RefreshCw />
            
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
          {filteredMarkets.map((market, i) => (
            <BinaryMarketCard key={market.marketId || i} market={market} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BinaryMarkets;
