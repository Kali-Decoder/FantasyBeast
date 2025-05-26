/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useRef } from "react";
import { Contract, CallData, cairo } from "starknet";

import {
  BINARY_BASED_MARKET,
  provider,
  STRK_TOKEN_ADDRESS,
  binary_based_contract,
} from "../constants";
import { toast } from "react-hot-toast";
import { Binary_Market_Abi } from "../abi"; // You might want to rename this to Binary_Market_Abi
import { createMarketBackend, placeBetBackend, toSmallestUnit } from "../utils";
import { useAccount } from "@starknet-react/core";

// Enum types to match the contract
export enum MarketStatus {
  Active = 0,
  Ended = 1,
  Settled = 2,
}

export enum Outcome {
  Yes = 0,
  No = 1,
}

export interface MarketInfo {
  creator: string;
  question: string;
  description: string;
  start_time: number;
  end_time: number;
  resolution_time: number;
  max_bettors: number;
  total_bets: number;
  yes_amount: bigint;
  no_amount: bigint;
  total_amount: bigint;
  final_outcome: Outcome;
  status: MarketStatus;
}

export interface BetInfo {
  bettor: string;
  prediction: Outcome;
  bet_amount: bigint;
  claimed: boolean;
}

export interface MarketWithId {
  market_id: number;
  market_info: MarketInfo;
}

export const useBinaryMarketContract = (connected: boolean, account: any) => {
  const contractRef = useRef<Contract | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    if (account && !contractRef.current) {
      contractRef.current = new Contract(
        Binary_Market_Abi, // Consider renaming to Binary_Market_Abi
        BINARY_BASED_MARKET,
        account
      );
    }
  }, [account]);

  const createMarket = useCallback(
    async (
      question: string,
      description: string,
      start_time: number,
      end_time: number,
      resolution_time: number,
      max_bettors: number,
      initial_stake: number,
      initial_prediction: Outcome,
      postURL: string,
      marketType: string
    ) => {
      if (!connected || !account) {
        toast.error("Connect your wallet");
        return null;
      }

      if (!initial_stake || initial_stake <= 0) {
        toast.error("Initial stake must be greater than zero");
        return null;
      }

      // Validation checks
      const current_time = Math.floor(Date.now() / 1000);
      if (start_time <= current_time) {
        toast.error("Start time must be in the future");
        return null;
      }
      if (end_time <= start_time) {
        toast.error("End time must be after start time");
        return null;
      }
      if (resolution_time < end_time) {
        toast.error("Resolution time must be after end time");
        return null;
      }

      const id = toast.loading("Creating market...");

      console.log({
        question,
        description,
        start_time,
        end_time,
        resolution_time,
        max_bettors,
        initial_stake,
        initial_prediction,
      });

      try {
        const _amount = (initial_stake);
        const multiCall = await account.execute([
          {
            contractAddress: STRK_TOKEN_ADDRESS,
            entrypoint: "approve",
            calldata: CallData.compile({
              spender: BINARY_BASED_MARKET,
              amount: cairo.uint256(toSmallestUnit(_amount,18)),
            }),
          },
          {
            contractAddress: BINARY_BASED_MARKET,
            entrypoint: "create_market",
            calldata: CallData.compile({
              question,
              description,
              start_time,
              end_time,
              resolution_time,
              max_bettors,
              initial_stake: cairo.uint256(toSmallestUnit(_amount,18)),
              initial_prediction: initial_prediction,
            }),
          },
        ]);

        const txHash = multiCall?.transaction_hash;
        if (!txHash) {
          throw new Error("Transaction hash missing");
        }

        const receipt = await provider.waitForTransaction(txHash);
        console.log("Create market transaction receipt:", receipt);

        // Extract market creation event data
        const marketCreatedEvent = receipt?.events?.find(
          (e: { from_address: string }) =>
            e.from_address === BINARY_BASED_MARKET
        );

        let marketId = null;
        if (marketCreatedEvent?.data) {
          marketId = marketCreatedEvent.data[0]?.toString();
          console.log("Market created with ID:", marketId);
        }

        await createMarketBackend(
          address,
          txHash,
          marketType,
          question,
          postURL,
          new Date(end_time * 1000),
          marketId
        );

        toast.success("Market created successfully! and you get 30 point", { id });
        return { receipt, marketId };
      } catch (err) {
        console.error("Create market failed:", err);
        toast.error("Error creating market", { id });
        return null;
      }
    },
    [connected, account, address]
  );

  const placeBet = useCallback(
    async (market_id: number, prediction: Outcome, bet_amount: number) => {
      if (!connected || !account) {
        toast.error("Connect your wallet");
        return null;
      }

      if (!bet_amount || bet_amount <= 0) {
        toast.error("Bet amount must be greater than zero");
        return null;
      }

      console.log({ market_id, prediction, bet_amount });

      const id = toast.loading("Placing bet...");

      try {
        const _amount = (String(bet_amount));
        const multiCall = await account.execute([
          {
            contractAddress: STRK_TOKEN_ADDRESS,
            entrypoint: "approve",
            calldata: CallData.compile({
              spender: BINARY_BASED_MARKET,
              amount: cairo.uint256(toSmallestUnit(_amount,18)),
            }),
          },
          {
            contractAddress: BINARY_BASED_MARKET,
            entrypoint: "place_bet",
            calldata: CallData.compile({
              market_id,
              prediction,
              bet_amount: cairo.uint256(toSmallestUnit(_amount,18)),
            }),
          },
        ]);

        const txHash = multiCall?.transaction_hash;
        if (!txHash) {
          throw new Error("Transaction hash missing");
        }

        const receipt = await provider.waitForTransaction(txHash);
        console.log("Place bet transaction receipt:", receipt);

        // Extract bet placement event data
        const betPlacedEvent = receipt?.events?.find(
          (e: { from_address: string }) =>
            e.from_address === BINARY_BASED_MARKET
        );

        let betInfo = null;
        if (betPlacedEvent?.data) {
          console.log(betPlacedEvent?.data);
          betInfo = {
            marketId: betPlacedEvent.data[0]?.toString(),
            betId: betPlacedEvent.data[1]?.toString(),
            bettor: betPlacedEvent.data[2]?.toString(),
            prediction: betPlacedEvent.data[3]?.toString(),
            betAmount: betPlacedEvent.data[4]?.toString(),
            yesTotal: betPlacedEvent.data[5]?.toString(),
            noTotal: betPlacedEvent.data[6]?.toString(),
          };
          console.log("Bet placed:", betInfo);
        }

        await placeBetBackend(
          betPlacedEvent.data[2]?.toString(),
          txHash,
          "binary-based"
        );
        console.log("Bet placed backend call successful");

        toast.success("Bet placed successfully!", { id });
        return { receipt, betInfo };
      } catch (err) {
        console.error("Place bet failed:", err);
        toast.error("Error placing bet", { id });
        return null;
      }
    },
    [connected, account]
  );

  const resolveMarket = useCallback(
    async (market_id: number, final_outcome: Outcome) => {
      if (!connected || !account) {
        toast.error("Connect your wallet");
        return null;
      }

      const id = toast.loading("Resolving market...");

      try {
        const multiCall = await account.execute([
          {
            contractAddress: BINARY_BASED_MARKET,
            entrypoint: "resolve_market",
            calldata: CallData.compile({
              market_id,
              final_outcome,
            }),
          },
        ]);

        const txHash = multiCall?.transaction_hash;
        if (!txHash) {
          throw new Error("Transaction hash missing");
        }

        const receipt = await provider.waitForTransaction(txHash);
        console.log("Resolve market transaction receipt:", receipt);

        // Extract market resolution event data
        const marketResolvedEvent = receipt?.events?.find(
          (e: { from_address: string }) =>
            e.from_address === BINARY_BASED_MARKET
        );

        let resolutionInfo = null;
        if (marketResolvedEvent?.data) {
          resolutionInfo = {
            marketId: marketResolvedEvent.data[0]?.toString(),
            finalOutcome: marketResolvedEvent.data[1]?.toString(),
            totalAmount: marketResolvedEvent.data[2]?.toString(),
            winningAmount: marketResolvedEvent.data[3]?.toString(),
          };
          console.log("Market resolved:", resolutionInfo);
        }

        toast.success("Market resolved successfully!", { id });
        return { receipt, resolutionInfo };
      } catch (err) {
        console.error("Resolve market failed:", err);
        toast.error("Error resolving market", { id });
        return null;
      }
    },
    [connected, account]
  );

  const claimReward = useCallback(
    async (market_id: number) => {
      if (!connected || !account) {
        toast.error("Connect your wallet");
        return null;
      }

      const id = toast.loading("Claiming reward...");

      try {
        const multiCall = await account.execute([
          {
            contractAddress: BINARY_BASED_MARKET,
            entrypoint: "claim_reward",
            calldata: CallData.compile({
              market_id,
            }),
          },
        ]);

        const txHash = multiCall?.transaction_hash;
        if (!txHash) {
          throw new Error("Transaction hash missing");
        }

        const receipt = await provider.waitForTransaction(txHash);
        console.log("Claim reward transaction receipt:", receipt);

        // Extract reward claim event data
        const rewardClaimedEvent = receipt?.events?.find(
          (e: { from_address: string }) =>
            e.from_address === BINARY_BASED_MARKET
        );

        let rewardInfo = null;
        if (rewardClaimedEvent?.data) {
          rewardInfo = {
            marketId: rewardClaimedEvent.data[0]?.toString(),
            betId: rewardClaimedEvent.data[1]?.toString(),
            bettor: rewardClaimedEvent.data[2]?.toString(),
            rewardAmount: rewardClaimedEvent.data[3]?.toString(),
          };
          console.log("Reward claimed:", rewardInfo);
        }

        toast.success("Reward claimed successfully!", { id });
        return { receipt, rewardInfo };
      } catch (err) {
        console.error("Claim reward failed:", err);
        toast.error("Error claiming reward", { id });
        return null;
      }
    },
    [connected, account]
  );

  // Read-only functions (don't require account)
  const getMarket = useCallback(
    async (market_id: number): Promise<MarketInfo | null> => {
      try {
        if (!binary_based_contract) {
          console.warn("Contract not available");
          return null;
        }

        const response = await binary_based_contract.get_market(
          CallData.compile({
            market_id: market_id,
          })
        );

        return response as MarketInfo;
      } catch (err) {
        console.error("Get market failed:", err);
        return null;
      }
    },
    []
  );

  const getAllMarkets = useCallback(async (): Promise<
    MarketWithId[] | null
  > => {
    try {
      if (!binary_based_contract) {
        console.warn("Contract not available");
        return null;
      }

      const response = await binary_based_contract.get_all_markets();
      return response as MarketWithId[];
    } catch (err) {
      console.error("Get all markets failed:", err);
      return null;
    }
  }, []);

  const getMarketsCount = useCallback(async (): Promise<number | null> => {
    try {
      if (!binary_based_contract) {
        console.warn("Contract not available");
        return null;
      }

      const response = await binary_based_contract.get_markets_count();
      return Number(response);
    } catch (err) {
      console.error("Get markets count failed:", err);
      return null;
    }
  }, []);

  const getBet = useCallback(
    async (market_id: number, bet_id: number): Promise<BetInfo | null> => {
      try {
        if (!binary_based_contract) {
          console.warn("Contract not available");
          return null;
        }

        const response = await binary_based_contract.get_bet(
          CallData.compile({
            market_id: market_id,
            bet_id: bet_id,
          })
        );

        return response as BetInfo;
      } catch (err) {
        console.error("Get bet failed:", err);
        return null;
      }
    },
    []
  );

  const getMarketOdds = useCallback(
    async (
      market_id: number
    ): Promise<{ yes_odds: bigint; no_odds: bigint } | null> => {
      try {
        if (!binary_based_contract) {
          console.warn("Contract not available");
          return null;
        }

        const response = await binary_based_contract.get_market_odds(
          CallData.compile({
            market_id: market_id,
          })
        );

        return {
          yes_odds: BigInt(response[0].toString()),
          no_odds: BigInt(response[1].toString()),
        };
      } catch (err) {
        console.error("Get market odds failed:", err);
        return null;
      }
    },
    []
  );

  const getUserBets = useCallback(
    async (market_id: number, user: string): Promise<number[] | null> => {
      try {
        if (!binary_based_contract) {
          console.warn("Contract not available");
          return null;
        }

        const response = await binary_based_contract.get_user_bets(
          CallData.compile({
            market_id: market_id,
            user: user,
          })
        );

        return response.map((id: any) => Number(id));
      } catch (err) {
        console.error("Get user bets failed:", err);
        return null;
      }
    },
    []
  );

  // Utility functions
  const formatMarketTime = useCallback((timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  }, []);

  const getMarketStatusText = useCallback((status: MarketStatus) => {
    switch (status) {
      case MarketStatus.Active:
        return "Active";
      case MarketStatus.Ended:
        return "Ended";
      case MarketStatus.Settled:
        return "Settled";
      default:
        return "Unknown";
    }
  }, []);

  const getOutcomeText = useCallback((outcome: Outcome) => {
    return outcome === Outcome.Yes ? "Yes" : "No";
  }, []);

  const calculateProbability = useCallback(
    (yesAmount: bigint, noAmount: bigint) => {
      const total = yesAmount + noAmount;
      if (total === BigInt(0)) return { yesProbability: 50, noProbability: 50 };

      const yesProbability = Number((yesAmount * BigInt(100)) / total);
      const noProbability = 100 - yesProbability;

      return { yesProbability, noProbability };
    },
    []
  );

  return {
    // Write functions
    createMarket,
    placeBet,
    resolveMarket,
    claimReward,

    // Read functions
    getMarket,
    getAllMarkets,
    getMarketsCount,
    getBet,
    getMarketOdds,
    getUserBets,

    // Utility functions
    formatMarketTime,
    getMarketStatusText,
    getOutcomeText,
    calculateProbability,

    // Enums and types
    MarketStatus,
    Outcome,
  };
};
