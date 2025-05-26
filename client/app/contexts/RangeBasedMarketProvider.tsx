/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { CallData } from "starknet";
import { useAccount, useConnect } from "@starknet-react/core";
import { postWithHeaders, getWithHeaders, api } from "../config";
import { range_based_contract } from "../constants";
import {
  RangeBasedContextValue,
  RangeBasedProviderProps,
  Status,
} from "../types";
import ControllerConnector from "@cartridge/connector/controller";

// Create the context with an undefined initial value
const RangeBasedContext = createContext<any | undefined>(undefined);

// Custom hook to use the context
export function useRangeBased() {
  const context = useContext(RangeBasedContext);
  if (context === undefined) {
    throw new Error("useRangeBased must be used within a RangeBasedProvider");
  }
  return context;
}

export function RangeBasedProvider({ children }: RangeBasedProviderProps) {
  // State
  const { account, isConnected, address } = useAccount();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const { connectors } = useConnect();
  const [username, setUsername] = useState<string | undefined>();
  const [connected, setConnected] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Ref to track if initial data has been fetched
  const initialDataFetched = useRef(false);

  // Set up connection status when address changes
  useEffect(() => {
    if (!address) {
      setConnected(false);
      setUsername(undefined);
      // Reset data when disconnected
      setTransactions([]);
      setUserPoints(0);
      setError(null);
      initialDataFetched.current = false;
      return;
    }

    const controller = connectors.find((c) => c instanceof ControllerConnector);
    if (controller) {
      controller.username()?.then((n) => setUsername(n));
      setConnected(true);
    }
  }, [address, connectors]);

  // Helper to handle errors in a consistent way
  const handleError = useCallback((error: unknown) => {
    console.error("RangeBased contract error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    setError(errorMessage);
    setStatus("error");
    return errorMessage;
  }, []);

  // Validate address before making API calls
  const validateAddress = useCallback(() => {
    if (!address) {
      console.warn("No wallet address available");
      return false;
    }
    if (!isConnected) {
      console.warn("Wallet not connected");
      return false;
    }
    return true;
  }, [address, isConnected]);

  // Memoize the functions to prevent unnecessary re-renders
  const getTransactionsHistory = useCallback(async () => {
    if (!validateAddress()) {
      return [];
    }

    try {
      setStatus("loading");
      const data = await getWithHeaders(`/transactions`, {
        "x-user-address": address!,
      });
      
      console.log("Transactions history:", data.data);
      const transactionsData = data.data?.length ? data.data : [];
      setTransactions(transactionsData);
      setStatus("success");
      return transactionsData;
    } catch (error: any) {
      console.error("Error fetching transactions history:", error);
      
      // Handle specific HTTP errors
      if (error.response?.status === 401) {
        handleError("Authentication failed. Please reconnect your wallet.");
      } else if (error.response?.status === 403) {
        handleError("Access denied. Check your permissions.");
      } else if (error.response?.status === 404) {
        handleError("Transactions endpoint not found.");
      } else {
        handleError(error);
      }
      return [];
    }
  }, [address, isConnected, validateAddress, handleError]);

  const getLeaderboard = useCallback(async () => {
    if (!validateAddress()) {
      return [];
    }

    try {
      const data = await getWithHeaders(`/leaderboard`, {
        "x-user-address": address!,
      });
      return data?.data || [];
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      
      // Handle specific HTTP errors
      if (error.response?.status === 401) {
        console.error("Authentication failed for leaderboard");
      }
      return [];
    }
  }, [address, isConnected, validateAddress]);

  const getPoints = useCallback(async () => {
    if (!validateAddress()) {
      return 0;
    }

    try {
      const data = await getWithHeaders(`/users`, {
        "x-user-address": address!,
      });
      
      const points = data?.data?.xpPoints || 0;
      setUserPoints(points);
      return points;
    } catch (error: any) {
      console.error("Error fetching points:", error);
      
      // Handle specific HTTP errors
      if (error.response?.status === 401) {
        handleError("Authentication failed. Please reconnect your wallet.");
      } else {
        handleError(error);
      }
      return 0;
    }
  }, [address, isConnected, validateAddress, handleError]);

  // Function to manually refresh data
  const refreshData = useCallback(async () => {
    if (!validateAddress()) {
      console.log("Cannot refresh data: wallet not connected or address missing");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([getTransactionsHistory(), getPoints()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [getTransactionsHistory, getPoints, validateAddress, handleError]);

  // Fetch initial data when address becomes available and wallet is connected
  useEffect(() => {
    if (address && isConnected && !initialDataFetched.current) {
      console.log("Fetching initial data for address:", address);
      initialDataFetched.current = true;
      refreshData();
    }
  }, [address, isConnected, refreshData]);

  // Reset initial fetch flag when address changes
  useEffect(() => {
    initialDataFetched.current = false;
  }, [address]);

  // Function to retry failed requests
  const retryLastOperation = useCallback(async () => {
    setError(null);
    await refreshData();
  }, [refreshData]);

  // Create value object for the context that matches RangeBasedContextValue
  const value = useMemo(
    (): any => ({
      // Functions
      getLeaderboard,
      getTransactionsHistory,
      getPoints,
      refreshData,
      retryLastOperation,

      // State
      status,
      error,
      isConnected: connected,
      transactions,
      userPoints,
      username,
      address,
      isLoading,

      // Utility
      validateAddress,
    }),
    [
      getLeaderboard,
      getTransactionsHistory,
      getPoints,
      refreshData,
      retryLastOperation,
      status,
      error,
      connected,
      transactions,
      userPoints,
      username,
      address,
      isLoading,
      validateAddress,
    ]
  );

  // Return the provider
  return (
    <RangeBasedContext.Provider value={value}>
      {children}
    </RangeBasedContext.Provider>
  );
}