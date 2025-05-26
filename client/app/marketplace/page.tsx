/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import BinaryMarketCard from "../components/BinaryMarketCard";
import RangeMarketCard from "../components/RangeMarketCard";
import BinaryModal from "../components/modals/BinaryModal";
import RangeModal from "../components/modals/RangeModal";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import { useRangeContract } from "../hooks/useRangeContract";
import { useBinaryMarketContract } from "../hooks/useBinaryContract";

export default function MarketPage() {
  // State variables
  const [activeTab, setActiveTab] = useState("all");
  const [markets, setMarkets] = useState<any[]>([]);
  const [showBinaryModal, setShowBinaryModal] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [selectSingleRangeMarket, setSelectSingleRangeMarket] =
    useState<any | null>(null);
  const [selectSingleBinaryMarket, setSelectSingleBinaryMarket] = useState<{
    market: any | null;
    betValue: any;
  }>({
    market: null,
    betValue: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("active"); // Changed default to "active"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Wallet connection
  const { account, address } = useAccount();
  const { connectors } = useConnect();
  const [username, setUsername] = useState<string | undefined>();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!address) return;
    const controller = connectors.find(
      (c: any) => c instanceof ControllerConnector
    );
    if (controller) {
      controller?.username()?.then((n: string) => setUsername(n));
      setConnected(true);
    }
  }, [address, connectors]);

  // Contract hooks
  const { getAllPool } = useRangeContract(connected, account);
  const { getAllMarkets, getMarketsCount } = useBinaryMarketContract(
    connected,
    account
  );

  // Utility functions
  const hexToDecimal = useCallback(
    (hexString: string | number | bigint): number => {
      if (hexString === null || hexString === undefined) return 0;
      if (typeof hexString === "number") return hexString;
      if (typeof hexString === "bigint") return Number(hexString);
      if (!hexString || hexString === "0x0") return 0;
      try {
        return parseInt(String(hexString), 16);
      } catch {
        return 0;
      }
    },
    []
  );

  const hexToString = useCallback(
    (hexString: string | number | bigint): string => {
      if (!hexString || hexString === "0x0") return "";
      try {
        let hex: string;
        if (typeof hexString === "bigint" || typeof hexString === "number") {
          hex = BigInt(hexString).toString(16);
        } else {
          hex = String(hexString).startsWith("0x")
            ? hexString.slice(2)
            : hexString;
        }

        let str = "";
        for (let i = 0; i < hex.length; i += 2) {
          const charCode = parseInt(hex.substr(i, 2), 16);
          if (charCode !== 0 && charCode >= 32 && charCode <= 126) {
            str += String.fromCharCode(charCode);
          }
        }
        return str;
      } catch (err) {
        console.error("Error converting hex to string:", err);
        return "";
      }
    },
    []
  );

  const formatTimestamp = useCallback(
    (
      timestamp: bigint | number | string
    ): { formatted: string; raw: number } => {
      if (!timestamp || BigInt(timestamp) === BigInt(0)) {
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
    },
    []
  );

  // Check if market is active (not ended)
  const isMarketActive = useCallback((endTimeTimestamp: number): boolean => {
    if (!endTimeTimestamp || endTimeTimestamp === 0) return false;
    const now = Date.now();
    return endTimeTimestamp > now;
  }, []);

  // Parse range markets
  const parseRangeMarkets = useCallback(
    (pools: any[]): any[] => {
      return pools
        .filter((pool) => pool && pool.pool_id)
        .map((pool) => {
          const poolId = hexToDecimal(pool.pool_id);
          const question = hexToString(BigInt(pool.question).toString(16));
          const totalAmount = hexToDecimal(pool.total_amount);
          const totalBets = hexToDecimal(pool.total_bets);
          const maxBettors = hexToDecimal(pool.max_bettors);
          const { formatted: endTime, raw: endTimeTimestamp } = formatTimestamp(
            pool.end_time
          );

          return {
            id: `range-${poolId}`,
            poolId: poolId.toString(),
            type: "range" as const,
            question: question || `Range Market ${poolId}`,
            tvl: totalAmount.toLocaleString(),
            endTime,
            endTimeTimestamp,
            creator: pool.creator,
            status: pool.status,
            url: `#range-${poolId}`,
            minValue: "1",
            maxValue: "100",
            metric: "STRK",
            totalBets,
            maxBettors,
            isActive: isMarketActive(endTimeTimestamp),
          };
        })
        // Filter out ended markets at the parsing level
        .filter((market) => market.isActive);
    },
    [hexToDecimal, hexToString, formatTimestamp, isMarketActive]
  );

  // Parse binary markets
  const parseBinaryMarkets = useCallback(
    (binaryMarkets: any[]): any[] => {
      return binaryMarkets
        .map((market) => {
          if (!market || !market.market_info) return null;

          const { market_id, market_info } = market;
          const yesAmount = hexToDecimal(market_info.yes_amount);
          const noAmount = hexToDecimal(market_info.no_amount);
          const totalAmount = yesAmount + noAmount;

          let yesPercentage = 0;
          let noPercentage = 0;
          if (totalAmount > 0) {
            yesPercentage = Math.round((yesAmount / totalAmount) * 100);
            noPercentage = 100 - yesPercentage;
          }

          const { formatted: endTime, raw: endTimeTimestamp } = formatTimestamp(
            market_info.end_time
          );

          let question = "";
          if (market_info.question) {
            if (typeof market_info.question === "string") {
              question = hexToString(market_info.question);
            } else {
              question = hexToString(market_info.question);
            }
          }
          if (!question) {
            question = `Binary Market ${market_id}`;
          }

          return {
            id: `binary-${market_id}`,
            poolId: market_id.toString(),
            type: "binary" as const,
            question,
            tvl: totalAmount.toLocaleString(),
            endTime,
            endTimeTimestamp,
            creator: market_info.creator || "Unknown",
            status: market_info.status,
            url: `#binary-${market_id}`,
            yesPercentage,
            noPercentage,
            totalBets: hexToDecimal(market_info.total_bets),
            maxBettors: hexToDecimal(market_info.max_bettors),
            isActive: isMarketActive(endTimeTimestamp),
          };
        })
        .filter((market): market is any => market !== null)
        // Filter out ended markets at the parsing level
        .filter((market) => market.isActive);
    },
    [hexToDecimal, hexToString, formatTimestamp, isMarketActive]
  );

  // Fetch all markets
  const fetchAllMarkets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allMarkets: any[] = [];

      // Fetch range markets
      if (getAllPool) {
        try {
          const rangePools = await getAllPool();
          if (rangePools && Array.isArray(rangePools)) {
            const rangeMarkets = parseRangeMarkets(rangePools);
            allMarkets.push(...rangeMarkets);
          }
        } catch (err) {
          console.error("Error fetching range markets:", err);
        }
      }

      // Fetch binary markets
      if (getAllMarkets) {
        try {
          const binaryData = await getAllMarkets();
          if (binaryData && Array.isArray(binaryData)) {
            const binaryMarkets = parseBinaryMarkets(binaryData);
            allMarkets.push(...binaryMarkets);
          }
        } catch (err) {
          console.error("Error fetching binary markets:", err);
        }
      }

      setMarkets(allMarkets);
      setRetryCount(0);

      if (allMarkets.length === 0) {
        setError("No active markets available");
      }
    } catch (err) {
      console.error("Failed to fetch markets:", err);
      setError(
        `Failed to load markets${
          retryCount > 0 ? ` (Attempt ${retryCount + 1})` : ""
        }`
      );
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  }, [
    getAllPool,
    getAllMarkets,
    parseRangeMarkets,
    parseBinaryMarkets,
    retryCount,
  ]);

  // Filter and search markets
  const filteredMarkets = useMemo(() => {
    let filtered = markets;

    // Apply type filter first
    if (activeTab !== "all") {
      filtered = filtered.filter((market) => market.type === activeTab);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((market) =>
        market.question.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filters
    const now = Date.now();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    switch (filter) {
      case "active":
        // Already filtered at parsing level, but double-check
        return filtered.filter(
          (market) => market.endTimeTimestamp && market.endTimeTimestamp > now
        );
      case "ending-soon":
        return filtered.filter(
          (market) =>
            market.endTimeTimestamp &&
            market.endTimeTimestamp > now &&
            market.endTimeTimestamp <= now + threeDaysInMs
        );
      case "all":
        return filtered;
      default:
        // Default to active markets only
        return filtered.filter(
          (market) => market.endTimeTimestamp && market.endTimeTimestamp > now
        );
    }
  }, [markets, filter, searchTerm, activeTab]);

  // Get market counts (all counts are for active markets only)
  const marketCounts = useMemo(() => {
    const now = Date.now();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    return {
      all: markets.length, // All active markets
      binary: markets.filter((m) => m.type === "binary").length,
      range: markets.filter((m) => m.type === "range").length,
      active: markets.length, // Same as all since we only show active
      endingSoon: markets.filter(
        (m) =>
          m.endTimeTimestamp &&
          m.endTimeTimestamp > now &&
          m.endTimeTimestamp <= now + threeDaysInMs
      ).length,
    };
  }, [markets]);

  // Retry function
  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    fetchAllMarkets();
  }, [fetchAllMarkets]);

  // Get button classes
  const getButtonClasses = (tab: string) =>
    `flex-1 font-techno py-2 px-4 whitespace-nowrap rounded-xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[2px] flex items-center justify-between px-6 ${
      activeTab === tab ? "bg-blue-500 text-white" : "bg-white text-black"
    }`;

  // Get filter button classes
  const getFilterButtonClasses = (filterType: string) =>
    `font-techno py-2 px-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] ${
      filter === filterType ? "bg-yellow-400 text-black" : "bg-white text-black"
    }`;

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
  };

  // Effects
  useEffect(() => {
    fetchAllMarkets();
  }, [connected, fetchAllMarkets]);

  return (
    <>
      <div className="p-10 mt-4">
        <h1 className="text-3xl font-bold my-2 font-techno uppercase">
          Make onchain <span className="text-yellow-400">Predictions</span>
        </h1>
        <div className="flex gap-4 mt-4 items-center">
          <div>
            <input
              type="text"
              placeholder="Search markets..."
              className="border font-techno shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[2px] border-gray-300 bg-black text-white rounded-lg px-4 py-2 w-full"
              onChange={handleSearch}
              value={searchTerm}
            />
          </div>
          
          {/* Status Filter Buttons */}
          <div className="flex gap-2">
            <button
              className={getFilterButtonClasses("active")}
              onClick={() => setFilter("active")}
            >
              Active ({marketCounts.active})
            </button>
            <button
              className={getFilterButtonClasses("ending-soon")}
              onClick={() => setFilter("ending-soon")}
            >
              Ending Soon ({marketCounts.endingSoon})
            </button>
          </div>
        </div>

        {/* Market Type Tabs */}
        <nav className="flex justify-between gap-4 mt-4">
          <button
            className={getButtonClasses("all")}
            onClick={() => setActiveTab("all")}
          >
            All Active ({marketCounts.all})
          </button>
          <button
            className={getButtonClasses("binary")}
            onClick={() => setActiveTab("binary")}
          >
            Binary Predictions ({marketCounts.binary})
          </button>
          <button
            className={getButtonClasses("range")}
            onClick={() => setActiveTab("range")}
          >
            Range Predictions ({marketCounts.range})
          </button>
        </nav>

        {loading && (
          <div className="text-center py-8">
            <div className="font-techno text-lg">Loading active markets...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="font-techno text-red-500 mb-4">{error}</div>
            <button
              onClick={handleRetry}
              className="bg-blue-500 text-white px-4 py-2 rounded font-techno hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {!loading && filteredMarkets.length === 0 && (
            <div className="col-span-full font-techno text-center text-gray-500">
              {searchTerm 
                ? "No active markets found matching your search." 
                : "No active markets available at the moment."
              }
            </div>
          )}
          {!loading &&
            filteredMarkets.length > 0 &&
            filteredMarkets.map((market) => {
              return market.type === "binary" ? (
                <BinaryMarketCard
                  key={market.id || market.poolId}
                  market={market as any}
                  setShowBinaryModal={setShowBinaryModal}
                  setSelectSingleBinaryMarket={setSelectSingleBinaryMarket}
                />
              ) : (
                <RangeMarketCard
                  key={market.id || market.poolId}
                  market={market as any}
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
      {showRangeModal && selectSingleRangeMarket && (
        <RangeModal
          onClose={() => setShowRangeModal(false)}
          selectSingleRangeMarket={selectSingleRangeMarket}
        />
      )}
    </>
  );
}