/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import RangeMarketCard from "./RangeMarketCard";
import { RefreshCw } from "lucide-react";

interface Pool {
  pool_id: string;
  question: string;
  total_amount: string;
  total_bets: string;
  max_bettors: string;
  end_time: number | bigint;
  creator: string;
  status: string;
}

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
  endTimeTimestamp?: number; // Add raw timestamp for filtering
  creator?: string;
  status?: string;
}

interface SocialMarketProps {
  getAllPool?: () => Promise<Pool[]>;
  range_based_contract?: any;
}

type FilterType = "all" | "active" | "ended" | "ending-soon";

const SocialMarket: React.FC<SocialMarketProps> = ({
  getAllPool,
  range_based_contract,
}) => {
  const [rangeMarkets, setRangeMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filter, setFilter] = useState<FilterType>("active");

  // Utility functions with better error handling
  const hexToDecimal = useCallback((hexString: string): number => {
    if (!hexString || hexString === "0x0") return 0;
    try {
      return parseInt(hexString, 16);
    } catch {
      return 0;
    }
  }, []);

  const hexToString = useCallback((hexString: string): string => {
    console.log({ hexString });
    if (!hexString || hexString === "0x0") return "";
    try {
      const hex = String(hexString)?.startsWith("0x")
        ? hexString.slice(2)
        : hexString;
      let str = "";
      for (let i = 0; i < hex.length; i += 2) {
        const charCode = parseInt(hex.substr(i, 2), 16);
        if (charCode !== 0) {
          str += String.fromCharCode(charCode);
        }
      }
      console.log({ str });
      return str;
    } catch (err) {
      console.error("Error converting hex to string:", err);
      return "";
    }
  }, []);

  const formatTimestamp = useCallback(
    (timestamp: bigint | number): { formatted: string; raw: number } => {
      if (!timestamp || BigInt(timestamp) === BigInt(0)) {
        return { formatted: "Not set", raw: 0 };
      }

      const ms = Number(timestamp) * 1000;
      const formatted = new Date(ms).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      return { formatted, raw: ms };
    },
    []
  );

  // Enhanced contract data parsing with validation
  const parseContractData = useCallback(
    (contractPools: Pool[]): Market[] => {
      return contractPools
        .filter((pool) => pool && pool.pool_id) // Filter out invalid pools
        .map((pool, index) => {
          console.log({ pool });
          const poolId = hexToDecimal(pool.pool_id);
          const question = hexToString(BigInt(pool.question).toString(16));
          const totalAmount = hexToDecimal(pool.total_amount);
          const totalBets = hexToDecimal(pool.total_bets);
          const maxBettors = hexToDecimal(pool.max_bettors);
          const { formatted: endTime, raw: endTimeTimestamp } = formatTimestamp(
            pool.end_time
          );

          console.log({ endTime, pool: pool.status });

          return {
            url: `https://x.com/Starknet/status/1234567890`,
            question: question,
            minValue: "1",
            maxValue: "100",
            tvl: totalAmount.toLocaleString(),
            metric: "STRK",
            poolId: poolId,
            totalBets: totalBets,
            maxBettors: maxBettors,
            endTime: endTime,
            endTimeTimestamp: endTimeTimestamp,
            creator: pool.creator,
            status: pool.status,
          };
        });
    },
    [hexToDecimal, hexToString, formatTimestamp]
  );

  // Filter markets based on end time
  const filterMarkets = useCallback(
    (markets: Market[], filterType: FilterType): Market[] => {
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
    return filterMarkets(rangeMarkets, filter);
  }, [rangeMarkets, filter, filterMarkets]);

  // Get market counts for each filter
  const marketCounts = useMemo(() => {
    const now = Date.now();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    return {
      all: rangeMarkets.length,
      active: rangeMarkets.filter(
        (m) => m.endTimeTimestamp && m.endTimeTimestamp > now
      ).length,
      ended: rangeMarkets.filter(
        (m) => m.endTimeTimestamp && m.endTimeTimestamp <= now
      ).length,
      endingSoon: rangeMarkets.filter(
        (m) =>
          m.endTimeTimestamp &&
          m.endTimeTimestamp > now &&
          m.endTimeTimestamp <= now + threeDaysInMs
      ).length,
    };
  }, [rangeMarkets]);

  // Fetch pools with enhanced error handling and retry logic
  const fetchRangeMarkets = useCallback(async () => {
    if (!getAllPool) {
      console.warn("getAllPool function not provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contractData = await getAllPool();

      if (
        contractData &&
        Array.isArray(contractData) &&
        contractData.length > 0
      ) {
        const parsedMarkets = parseContractData(contractData);
        setRangeMarkets(parsedMarkets);
        setRetryCount(0); // Reset retry count on success
      } else {
        console.warn("No pool data received from contract");
        setRangeMarkets([]);
      }
    } catch (err) {
      console.error("Failed to fetch range markets:", err);
      setError(
        `Failed to load range markets${
          retryCount > 0 ? ` (Attempt ${retryCount + 1})` : ""
        }`
      );
      setRangeMarkets([]);
    } finally {
      setLoading(false);
    }
  }, [getAllPool, parseContractData, retryCount]);

  // Retry function with exponential backoff
  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    fetchRangeMarkets();
  }, [fetchRangeMarkets]);

  useEffect(() => {
    fetchRangeMarkets();
  }, [fetchRangeMarkets]);

  // Memoized fallback markets
  const fallbackMarkets = useMemo<Market[]>(
    () => [
      {
        url: "https://x.com/Starknet/status/1234567890",
        question: "What will be the STARK price range on July 30th?",
        minValue: "40",
        maxValue: "65",
        tvl: "10,200",
        metric: "STRK",
        endTimeTimestamp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        endTime: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      },
      {
        url: "https://x.com/Starknet/status/1234567890",
        question: "zkSync TVL range by end of Q3?",
        minValue: "100",
        maxValue: "180",
        tvl: "8,950",
        metric: "STRK",
        endTimeTimestamp: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
        endTime: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      },
      {
        url: "https://x.com/Starknet/status/1234567890",
        question: "ETH price prediction range by Sept 15th?",
        minValue: "200",
        maxValue: "6000",
        tvl: "17,640",
        metric: "STRK",
        endTimeTimestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago (ended)
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        ),
      },
    ],
    []
  );

  const displayMarkets = useMemo(
    () => (filteredMarkets.length > 0 ? filteredMarkets : []),
    [filteredMarkets]
  );

  // Loading component
  if (loading) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-techno font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-lg tracking-widest mb-4">
            🎰 Range Based Markets
          </h2>
          <p className="text-xl text-gray-300 font-medium">
            Powered by Starknet
          </p>
        </div>

        <div className="flex flex-col justify-center items-center min-h-[400px] space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-orange-500 border-b-transparent rounded-full animate-spin animate-reverse"></div>
          </div>
          <div className="text-white text-xl font-medium animate-pulse">
            Loading range markets...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="text-center mb-10">
        <h2 className="text-5xl font-techno font-extrabold text-white drop-shadow-lg tracking-widest mb-4">
          🎰 Range Based Markets
        </h2>
        <p className="text-xl text-gray-300 font-medium mb-6">
          Powered by Starknet
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            // { key: 'all' as FilterType, label: 'All Markets', count: marketCounts.all },
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
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center space-x-8 text-sm">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-full">
            <span className="text-white font-semibold">
              {displayMarkets.length} Markets Shown
            </span>
          </div>
          <button
            onClick={fetchRangeMarkets}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            <RefreshCw />
          </button>
        </div>
      </div>

      {/* Error Handling with Better UI */}
      {error && (
        <div className="max-w-md mx-auto mb-12">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-center shadow-lg">
            <div className="text-white text-lg font-semibold mb-4">
              ⚠️ {error}
            </div>
            <button
              onClick={handleRetry}
              disabled={loading}
              className="px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-all font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Retrying..." : "Retry Loading"}
            </button>
          </div>
        </div>
      )}

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {displayMarkets.slice(0, 6).map((market, i) => (
          <RangeMarketCard
            key={market.poolId || `filtered-${i}`}
            market={market}
          />
        ))}
      </div>

      {/* Empty State */}
      {displayMarkets.length === 0 && !loading && !error && (
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
                : "Connect your wallet to view and participate in range-based prediction markets."}
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
                onClick={fetchRangeMarkets}
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                Refresh Markets
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SocialMarket;
