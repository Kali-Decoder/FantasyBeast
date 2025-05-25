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
} from "react";
import { cairo, CallData } from "starknet";
import { useAccount, useConnect } from "@starknet-react/core";
import { toast } from "react-hot-toast";
import { postWithHeaders, getWithHeaders, api } from "../config";
import {
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
  provider,
  RANGE_BASED_MARKET,
  range_based_contract,
} from "../constants";
import {
  RangeBasedContextValue,
  RangeBasedProviderProps,
  Status,
} from "../types";
import ControllerConnector from "@cartridge/connector/controller";

// Create the context with an undefined initial value
const RangeBasedContext = createContext<RangeBasedContextValue | undefined>(
  undefined
);

// Custom hook to use the context
export function useRangeBased() {
  const context = useContext(RangeBasedContext);
  if (context === undefined) {
    throw new Error("useRangeBased must be used within a RangeBasedProvider");
  }
  return context;
}

// Provider component
export function RangeBasedProvider({ children }: RangeBasedProviderProps) {
  // State
  const { account, isConnected, address } = useAccount();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const { connect, connectors } = useConnect();
  const [username, setUsername] = useState<string | undefined>();
  const [connected, setConnected] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);

  useEffect(() => {
    if (!address) return;
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

  // Create pool function - includes approving the token transfer
  const createPool = useCallback(
    async (
      question: string,
      start_time: number,
      end_time: number,
      max_bettors: number,
      amount: number
    ) => {
      if (!connected || !account) {
        throw new Error("Account not connected");
      }

      console.log({ question, start_time, end_time, max_bettors, amount });

      const id = toast.loading("Creating pool...");
      try {
        setStatus("loading");
        setError(null);

        const _amount = BigInt(amount);
        const multiCall = await account.execute([
          {
            contractAddress: STRK_TOKEN_ADDRESS,
            entrypoint: "approve",
            calldata: CallData.compile({
              spender: RANGE_BASED_MARKET,
              amount: cairo.uint256(_amount),
            }),
          },
          {
            contractAddress: RANGE_BASED_MARKET,
            entrypoint: "create_pool",
            calldata: CallData.compile({
              question,
              start_time,
              end_time,
              max_bettors,
              initial_stake: amount,
            }),
          },
        ]);

        const res = await provider.waitForTransaction(
          multiCall?.transaction_hash || ""
        );

        setStatus("success");
        toast.success("Pool created successfully!", { id });
        return res;
      } catch (error) {
        console.error("Error creating pool:", error);
        toast.error("Error creating pool", { id });
        handleError(error);
        throw error;
      }
    },
    [account, connected, handleError]
  );

  const placeBet = useCallback(
    async (pool_id: number, predicted_value: number, bet_amount: number) => {
      if (!connected || !account) {
        throw new Error("Account not connected");
      }

      const id = toast.loading("Placing bet...");
      try {
        setStatus("loading");
        setError(null);

        const _amount = BigInt(bet_amount);
        const multiCall = await account.execute([
          {
            contractAddress: STRK_TOKEN_ADDRESS,
            entrypoint: "approve",
            calldata: CallData.compile({
              spender: RANGE_BASED_MARKET,
              amount: cairo.uint256(_amount),
            }),
          },
          {
            contractAddress: RANGE_BASED_MARKET,
            entrypoint: "place_bet",
            calldata: CallData.compile({
              pool_id,
              predicted_value,
              bet_amount,
            }),
          },
        ]);

        const res = await provider.waitForTransaction(
          multiCall?.transaction_hash || ""
        );

        setStatus("success");
        toast.success("Bet placed successfully!", { id });
        return res;
      } catch (error) {
        console.error("Error placing bet:", error);
        toast.error("Error placing bet", { id });
        handleError(error);
        throw error;
      }
    },
    [account, connected, handleError]
  );

  const setResult = useCallback(
    async (pool_id: number, result: number) => {
      if (!connected || !account) {
        throw new Error("Account not connected");
      }

      const id = toast.loading("Setting result...");
      try {
        setStatus("loading");
        setError(null);

        const multiCall = await account.execute([
          {
            contractAddress: RANGE_BASED_MARKET,
            entrypoint: "set_result",
            calldata: CallData.compile({
              pool_id,
              result,
            }),
          },
        ]);

        const res = await provider.waitForTransaction(
          multiCall?.transaction_hash || ""
        );

        setStatus("success");
        toast.success("Result set successfully!", { id });
        return res;
      } catch (error) {
        console.error("Error setting result:", error);
        toast.error("Error setting result", { id });
        handleError(error);
        throw error;
      }
    },
    [account, connected, handleError]
  );

  const claimReward = useCallback(
    async (pool_id: number) => {
      if (!connected || !account) {
        throw new Error("Account not connected");
      }

      const id = toast.loading("Claiming reward...");
      try {
        setStatus("loading");
        setError(null);

        const multiCall = await account.execute([
          {
            contractAddress: RANGE_BASED_MARKET,
            entrypoint: "claim_reward",
            calldata: CallData.compile({
              pool_id,
            }),
          },
        ]);

        const res = await provider.waitForTransaction(
          multiCall?.transaction_hash || ""
        );

        setStatus("success");
        toast.success("Reward claimed successfully!", { id });
        return res;
      } catch (error) {
        console.error("Error claiming reward:", error);
        toast.error("Error claiming reward", { id });
        handleError(error);
        throw error;
      }
    },
    [account, connected, handleError]
  );

  const getTransactionsHistory = async () => {
    try {
      //  if(!address) {
      //   throw new Error("No address connected");
      // }

      let data = await getWithHeaders(`/transactions`, {
        "x-user-address": "0xcfa038455b54714821f291814071161c9870B891",
      });
      console.log("Transactions history:", data.data);
      setTransactions(data.data.length ? data.data : []);
    } catch (error) {
      console.log("Error fetching transactions history:", error);
    }
  };

  const getPoints = async () => {
    try {
      // if (!address) {
      //   throw new Error("No address connected");
      // }

      let data = await getWithHeaders(`/users`, {
        "x-user-address": "0xcfa038455b54714821f291814071161c9870B891",
      });
      setUserPoints(data?.data?.xpPoints || 0);
    } catch (error) {
      console.error("Error fetching points:", error);
      return 0; // Return 0 or handle error as needed
    }
  };
  const getPoolDetail = useCallback(
    async (pool_id: number): Promise<any | undefined> => {
      try {
        if (!range_based_contract) {
          throw new Error("Contract not available");
        }

        setStatus("loading");
        setError(null);

        const response = await range_based_contract.get_pool(
          CallData.compile({
            pool_id: pool_id,
          })
        );

        setStatus("success");

        return response as any;
      } catch (err) {
        handleError(err);
        return undefined;
      }
    },
    [handleError]
  );

  const getPrediction = useCallback(
    async (
      pool_id: number,
      prediction_id: number
    ): Promise<any | undefined> => {
      try {
        if (!range_based_contract) {
          throw new Error("Contract not available");
        }

        setStatus("loading");
        setError(null);

        const response = await range_based_contract.get_prediction(
          CallData.compile({
            pool_id: pool_id,
            prediction_id: prediction_id,
          })
        );

        setStatus("success");

        return response as any;
      } catch (err) {
        handleError(err);
        return undefined;
      }
    },
    [handleError]
  );

  // Get contract balance
  const getContractBalance = useCallback(
    async (tokenAddress: string): Promise<bigint | undefined> => {
      try {
        if (!range_based_contract) {
          throw new Error("Contract not available");
        }

        setStatus("loading");
        setError(null);

        const response = await range_based_contract.get_contract_balance(
          CallData.compile({
            token: tokenAddress,
          })
        );

        setStatus("success");
        return BigInt(response.toString());
      } catch (err) {
        handleError(err);
        return undefined;
      }
    },
    [handleError]
  );

  useEffect(() => {
    // Fetch contract balance on mount
    getTransactionsHistory();
    getPoints();
  }, [getTransactionsHistory]);

  // Create value object for the context that matches RangeBasedContextValue
  const value = useMemo(
    (): RangeBasedContextValue => ({
      // Functions
      createPool,
      placeBet,
      setResult,
      claimReward,
      getPoolDetail,
      getPrediction,
      getContractBalance,

      // State
      status,
      error,
      isConnected,
      transactions,
      userPoints,
    }),
    [
      createPool,
      placeBet,
      setResult,
      claimReward,
      getPoolDetail,
      getPrediction,
      getContractBalance,
      status,
      error,
      isConnected,
      transactions,
      userPoints,
    ]
  );

  // Return the provider
  return (
    <RangeBasedContext.Provider value={value}>
      {children}
    </RangeBasedContext.Provider>
  );
}
