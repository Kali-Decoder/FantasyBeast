/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import RangeMarketCard from "./RangeMarketCard";

interface Pool {
  pool_id: string;
  question: string;
  total_amount: string;
  total_bets: string;
  max_bettors: string;
  end_time: string;
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
  creator?: string;
  status?: string;
}

interface SocialMarketProps {
  getAllPool?: () => Promise<Pool[]>;
  range_based_contract?: any;
}

const SocialMarket: React.FC<SocialMarketProps> = ({ 
  getAllPool, 
  range_based_contract 
}) => {
  const [rangeMarkets, setRangeMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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
    console.log({hexString})
    if (!hexString || hexString === "0x0") return "";
    try {
      const hex = String(hexString)?.startsWith("0x") ? hexString.slice(2) : hexString;
      let str = "";
      for (let i = 0; i < hex.length; i += 2) {
        const charCode = parseInt(hex.substr(i, 2), 16);
        if (charCode !== 0) {
          str += String.fromCharCode(charCode);
        }
      }
      console.log({str})
      return str;
    } catch (err) {
      console.error("Error converting hex to string:", err);
      return "";
    }
  }, []);

  const formatTimestamp = useCallback((hexTimestamp: string): string => {
    const timestamp = hexToDecimal(hexTimestamp);
    if (timestamp === 0) return "Not set";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }, [hexToDecimal]);

  // Enhanced contract data parsing with validation
  const parseContractData = useCallback((contractPools: Pool[]): Market[] => {
    return contractPools
      .filter(pool => pool && pool.pool_id) // Filter out invalid pools
      .map((pool, index) => {
        console.log({pool})
        const poolId = hexToDecimal(pool.pool_id);
      const question = hexToString(BigInt(pool.question).toString(16));
        const totalAmount = hexToDecimal(pool.total_amount);
        const totalBets = hexToDecimal(pool.total_bets);
        const maxBettors = hexToDecimal(pool.max_bettors);
        const endTime = formatTimestamp(pool.end_time);
        
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
          creator: pool.creator,
          status: pool.status
        };
      });
  }, [hexToDecimal, hexToString, formatTimestamp]);

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
      
      if (contractData && Array.isArray(contractData) && contractData.length > 0) {
        const parsedMarkets = parseContractData(contractData);
        setRangeMarkets(parsedMarkets);
        setRetryCount(0); // Reset retry count on success
      } else {
        console.warn("No pool data received from contract");
        setRangeMarkets([]);
      }
    } catch (err) {
      console.error("Failed to fetch range markets:", err);
      setError(`Failed to load range markets${retryCount > 0 ? ` (Attempt ${retryCount + 1})` : ""}`);
      setRangeMarkets([]);
    } finally {
      setLoading(false);
    }
  }, [getAllPool, parseContractData, retryCount]);

  // Retry function with exponential backoff
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchRangeMarkets();
  }, [fetchRangeMarkets]);

  useEffect(() => {
    fetchRangeMarkets();
  }, [fetchRangeMarkets]);

  // Memoized fallback markets
  const fallbackMarkets = useMemo<Market[]>(() => [
    {
      url: "https://x.com/Starknet/status/1234567890",
      question: "What will be the STARK price range on July 30th?",
      minValue: "40",
      maxValue: "65",
      tvl: "10,200",
      metric: "STRK",
    },
    {
      url: "https://x.com/Starknet/status/1234567890",
      question: "zkSync TVL range by end of Q3?",
      minValue: "100",
      maxValue: "180",
      tvl: "8,950",
      metric: "STRK",
    },
    {
      url: "https://x.com/Starknet/status/1234567890",
      question: "ETH price prediction range by Sept 15th?",
      minValue: "200",
      maxValue: "6000",
      tvl: "17,640",
      metric: "STRK",
    },
  ], []);

  const displayMarkets = useMemo(() => 
    rangeMarkets.length > 0 ? rangeMarkets : [],
    [rangeMarkets]
  );

  // Loading component
  if (loading) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-techno font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-lg tracking-widest mb-4">
            🎰 Range Based Markets
          </h2>
          <p className="text-xl text-gray-300 font-medium">Powered by Starknet</p>
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
        <h2 className="text-5xl font-techno font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-lg tracking-widest mb-4">
          🎰 Range Based Markets
        </h2>
        <p className="text-xl text-gray-300 font-medium mb-4">Powered by Starknet</p>
        
        {/* Stats Bar */}
        <div className="flex justify-center space-x-8 text-sm">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-full">
            <span className="text-white font-semibold">
              {displayMarkets.length} Active Markets
            </span>
          </div>
       
        </div>
      </div>

      {/* Error Handling with Better UI */}
      {error && (
        <div className="max-w-md mx-auto mb-12">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-center shadow-lg">
            <div className="text-white text-lg font-semibold mb-4">⚠️ {error}</div>
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
        {displayMarkets.map((market, i) => (
          <RangeMarketCard 
            key={market.poolId || `fallback-${i}`} 
            market={market} 
          />
        ))}
      </div>

      {/* Empty State */}
      {rangeMarkets.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Active Markets</h3>
            <p className="text-gray-400 text-lg mb-8">
              Connect your wallet to view and participate in range-based prediction markets.
            </p>
            <button 
              onClick={fetchRangeMarkets}
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              Refresh Markets
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default SocialMarket;