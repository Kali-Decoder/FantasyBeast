import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Contract, cairo, CallData, byteArray } from "starknet";
import { useAccount } from "@starknet-react/core";
import { toast } from "react-hot-toast";
import {
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
  provider,
  RANGE_BASED_MARKET,
  range_based_contract,
} from "../constants";
import {
  RangeBasedContextValue,
  CoinFlipProviderProps,
  FlipChoice,
  FlipDetails,
  FlipState,
  Status,
} from "../types";

// Create the context with an undefined initial value
const RangeBasedContext = createContext<RangeBasedContextValue | undefined>(
  undefined
);

// Custom hook to use the context
export function useCoinFlip() {
  const context = useContext(RangeBasedContext);
  if (context === undefined) {
    throw new Error("useCoinFlip must be used within a CoinFlipProvider");
  }
  return context;
}

// Provider component
export function CoinFlipProvider({ children }: CoinFlipProviderProps) {
  // State
  const { account, isConnected } = useAccount();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // Helper to handle errors in a consistent way
  const handleError = useCallback((error: unknown) => {
    console.error("CoinFlip contract error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    setError(errorMessage);
    setStatus("error");
    return errorMessage;
  }, []);

  // Flip coin function - includes approving the token transfer
  const createPool = useCallback(
    async (
      question: string,
      start_time: number,
      end_time: number,
      max_bettors: number,
      amount: number
    ) => {
      let id = toast.loading("Submitting your flip...");
      try {
        const _amount = BigInt(amount);
        const multiCall = await account?.execute([
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

        return res;
      } catch (error) {
        console.error("Error flipping coin :", error);
        toast.error("Error flipping coin", {
          id,
        });
        throw error;
      }
    },
    [account]
  );

  const placeBet = useCallback(
    async (pool_id: number, predicted_value: number, bet_amount: number) => {
      let id = toast.loading("Submitting your flip...");
      try {
        const _amount = BigInt(bet_amount);
        const multiCall = await account?.execute([
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

        return res;
      } catch (error) {
        console.error("Error flipping coin :", error);
        toast.error("Error flipping coin", {
          id,
        });
        throw error;
      }
    },
    [account]
  );

  const setResult = useCallback(
    async (pool_id: number, result: number) => {
      let id = toast.loading("Submitting your flip...");
      try {
        const multiCall = await account?.execute([
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
        return res;
      } catch (error) {
        console.error("Error flipping coin :", error);
        toast.error("Error flipping coin", {
          id,
        });
        throw error;
      }
    },
    [account]
  );

  const claimReward = useCallback(
    async (pool_id: number) => {
      let id = toast.loading("Submitting your flip...");
      try {
        const multiCall = await account?.execute([
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
        return res;
      } catch (error) {
        console.error("Error flipping coin :", error);
        toast.error("Error flipping coin", {
          id,
        });
        throw error;
      }
    },
    [account]
  );
  // Get flip details
  const getPoolDetail = useCallback(
    async (pool_id: number): Promise<FlipDetails | undefined> => {
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

        
      } catch (err) {
        handleError(err);
        return undefined;
      }
    },
    [range_based_contract, handleError]
  );

  const getPrediction = useCallback(
    async (pool_id: number,prediction_id:number): Promise<FlipDetails | undefined> => {
      try {
        if (!range_based_contract) {
          throw new Error("Contract not available");
        }

        setStatus("loading");
        setError(null);

        const response = await range_based_contract.get_prediction(
          CallData.compile({
            pool_id: pool_id,
            prediction_id:prediction_id
          })
        );

      
      } catch (err) {
        handleError(err);
        return undefined;
      }
    },
    [range_based_contract, handleError]
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
    [range_based_contract, handleError]
  );

  // Create value object for the context
  const value = useMemo(
    () => ({
      createPool,
      placeBet,
      setResult,
      claimReward,
      getPoolDetail,
      getPrediction
    }),
    [createPool, getPoolDetail, getContractBalance, status, error]
  );

  // Return the provider
  return (
    <RangeBasedContext.Provider value={value}>
      {children}
    </RangeBasedContext.Provider>
  );
}
