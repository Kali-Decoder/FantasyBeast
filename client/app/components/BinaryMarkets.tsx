/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import BinaryMarketCard from "./BinaryMarketCard";
import { RefreshCw } from "lucide-react";

// Type definitions for blockchain data


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
  maxBettors: number;
  status: any;
  finalOutcome: any;
}

// Component props interface
interface BinaryMarketsProps {
  getAllMarkets: () => Promise<any[] | null>;
  getMarketsCount: () => Promise<number | null>;
}

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

// Transform blockchain data to component format
const transformMarketData = (
  blockchainMarkets: any[]
): TransformedMarket[] => {
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

    return {
      question: hexToString(BigInt(market_info.question).toString(16)) || `Market ${market_id}`,
      tvl: totalAmount.toLocaleString(),
      yesPercentage,
      noPercentage,
      url: "#", // You can modify this based on your needs
      marketId: market_id,
      description: hexToString(BigInt(market_info.description).toString(16)) || "No description available",
      creator: market_info.creator,
      totalBets: hexToNumber(market_info.total_bets),
      startTime: hexToNumber(market_info.start_time),
      endTime: hexToNumber(market_info.end_time),
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

  useEffect(() => {
    const fetchMarkets = async (): Promise<void> => {
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
    };

    fetchMarkets();
  }, [getAllMarkets, getMarketsCount]);

  // Refresh function that can be called externally
  const refreshMarkets = async (): Promise<void> => {
    if (getAllMarkets && getMarketsCount) {
      const fetchMarkets = async (): Promise<void> => {
        try {
          setLoading(true);
          const [count, marketData] = await Promise.all([
            getMarketsCount(),
            getAllMarkets(),
          ]);

          if (count !== null) {
            setMarketsCount(count);
          }

          if (marketData && Array.isArray(marketData)) {
            const transformedMarkets = transformMarketData(marketData);
            setMarkets(transformedMarkets);
          }
        } catch (err) {
          console.error("Error refreshing markets:", err);
          setError("Failed to refresh markets data");
        } finally {
          setLoading(false);
        }
      };
      await fetchMarkets();
    }
  };

 if (loading) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-techno font-extrabold  drop-shadow-lg tracking-widest mb-4">
              🎮 Binary Based Markets
          </h2>
          <p className="text-xl text-gray-300 font-medium">Powered by Starknet</p>
        </div>
        
        <div className="flex flex-col justify-center items-center min-h-[400px] space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-500 border-b-transparent rounded-full animate-spin animate-reverse"></div>
          </div>
          <div className="text-white text-xl font-medium animate-pulse">
            Loading range markets...
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
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw/>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between flex-col gap-4 items-center mb-16">
        <h2 className="text-5xl font-techno font-extrabold text-center text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] tracking-widest">
          🎮 Binary Markets on Starknet
        </h2>
        <p className="text-xl text-gray-300 font-medium">Powered by Starknet</p>
        <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-full">
            <span className="text-white font-semibold">
              {marketsCount} Active Markets
            </span>
          </div>
          <button
            onClick={refreshMarkets}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            <RefreshCw/>
          </button>
        </div>
      </div>

      {markets.length === 0 ? (
        <div className="text-center text-white text-xl">
          No markets available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {markets.map((market, i) => {
            return (
              <BinaryMarketCard key={market.marketId || i} market={market} />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BinaryMarkets;
