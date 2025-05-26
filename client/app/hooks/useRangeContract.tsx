/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useRef } from "react";
import { Contract, CallData, cairo } from "starknet";

import {
  RANGE_BASED_MARKET,
  provider,
  STRK_TOKEN_ADDRESS,
  range_based_contract,
} from "../constants";
import { toast } from "react-hot-toast";
import { Range_Market_Abi } from "../abi";
import { createMarketBackend, placeBetBackend } from "../utils";
import { useAccount } from "@starknet-react/core";

export const useRangeContract = (connected: boolean, account: any) => {
  const contractRef = useRef<Contract | null>(null);
  const { address } = useAccount();
  useEffect(() => {
    if (account && !contractRef.current) {
      contractRef.current = new Contract(
        Range_Market_Abi, 
        RANGE_BASED_MARKET,
        account
      );
    }
  }, [account]);

  const createPool = useCallback(
    async (

      postURL: string,
      question: string,
      start_time: number,
      end_time: number,
      max_bettors: number,
      amount: number,      marketType:string
    ) => {
      if (!connected || !account) {
        console.warn("Not connected or account is missing");
        return null;
      }

      if (!amount || amount <= 0) {
        toast.error("Amount must be greater than zero");
        return null;
      }

      const id = toast.loading("Creating pool...");

      console.log({ question, start_time, end_time, max_bettors, amount });

      try {
        const _amount = (amount);
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
              initial_stake: cairo.uint256(_amount),
            }),
          },
        ]);

        const txHash = multiCall?.transaction_hash;
        if (!txHash) {
          throw new Error("Transaction hash missing");
        }

        const receipt = await provider.waitForTransaction(txHash);
        console.log("Create pool transaction receipt:", receipt);

  
        const poolCreatedEvent = receipt?.events?.find(
          (e: { from_address: string }) => e.from_address === RANGE_BASED_MARKET
        );

        let poolId = null;
        if (poolCreatedEvent?.data) {
          poolId = poolCreatedEvent.data[0]?.toString();
          console.log("Pool created with ID:", poolId);
        }

        await createMarketBackend(
          address,
          txHash,
          marketType,
          question,
          postURL,
          new Date(end_time * 1000),
          poolId
        );

        toast.success("Pool created successfully! and you got 30 points", { id });
        return { receipt, poolId };
      } catch (err) {
        console.error("Create pool failed:", err);
        toast.error("Error creating pool", { id });
        return null;
      }
    },
    [connected, account, address]
  );

  const placeBet = useCallback(
    async (pool_id: number, predicted_value: number, bet_amount: number) => {
      if (!connected || !account) {
        toast.error("Connect your wallet");
        return null;
      }

      if (!bet_amount || bet_amount <= 0) {
        toast.error("Bet amount must be greater than zero");
        return null;
      }
      console.log({ pool_id, predicted_value, bet_amount });

      const id = toast.loading("Placing bet...");

      try {
        const _amount = (String(bet_amount));
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
              predicted_value: cairo.uint256(predicted_value),
              bet_amount: cairo.uint256(bet_amount),
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
          (e: { from_address: string }) => e.from_address === RANGE_BASED_MARKET
        );

        let betInfo = null;
        if (betPlacedEvent?.data) {
          console.log(betPlacedEvent?.data);
          betInfo = {
            poolId: betPlacedEvent.data[0]?.toString(),
            predictionId: betPlacedEvent.data[1]?.toString(),
            bettor: betPlacedEvent.data[2]?.toString(),
            predictedValue: betPlacedEvent.data[3]?.toString(),
            betAmount: betPlacedEvent.data[4]?.toString(),
          };
          console.log("Bet placed:", betInfo);
        }
        await placeBetBackend(
          betPlacedEvent.data[2]?.toString(),
          txHash,
          "range-based"
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

  const setResult = useCallback(
    async (pool_id: number, result: number) => {
      if (!connected || !account) {
        console.warn("Not connected or account is missing");
        return null;
      }

      const id = toast.loading("Setting result...");

      try {
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

        const txHash = multiCall?.transaction_hash;
        if (!txHash) {
          throw new Error("Transaction hash missing");
        }

        const receipt = await provider.waitForTransaction(txHash);
        console.log("Set result transaction receipt:", receipt);

        // Extract result set event data
        const resultSetEvent = receipt?.events?.find(
          (e: { from_address: string }) => e.from_address === RANGE_BASED_MARKET
        );

        let resultInfo = null;
        if (resultSetEvent?.data) {
          resultInfo = {
            poolId: resultSetEvent.data[0]?.toString(),
            result: resultSetEvent.data[1]?.toString(),
            setter: resultSetEvent.data[2]?.toString(),
          };
          console.log("Result set:", resultInfo);
        }

        toast.success("Result set successfully!", { id });
        return { receipt, resultInfo };
      } catch (err) {
        console.error("Set result failed:", err);
        toast.error("Error setting result", { id });
        return null;
      }
    },
    [connected, account]
  );

  const claimReward = useCallback(
    async (pool_id: number) => {
      if (!connected || !account) {
        console.warn("Not connected or account is missing");
        return null;
      }

      const id = toast.loading("Claiming reward...");

      try {
        const multiCall = await account.execute([
          {
            contractAddress: RANGE_BASED_MARKET,
            entrypoint: "claim_reward",
            calldata: CallData.compile({
              pool_id,
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
          (e: { from_address: string }) => e.from_address === RANGE_BASED_MARKET
        );

        let rewardInfo = null;
        if (rewardClaimedEvent?.data) {
          rewardInfo = {
            poolId: rewardClaimedEvent.data[0]?.toString(),
            claimer: rewardClaimedEvent.data[1]?.toString(),
            rewardAmount: rewardClaimedEvent.data[2]?.toString(),
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
  const getPoolDetail = useCallback(
    async (pool_id: number): Promise<any | null> => {
      try {
        if (!range_based_contract) {
          console.warn("Contract not available");
          return null;
        }

        const response = await range_based_contract.get_pool(
          CallData.compile({
            pool_id: pool_id,
          })
        );

        return response as any;
      } catch (err) {
        console.error("Get pool detail failed:", err);
        return null;
      }
    },
    []
  );

  const getAllPool = useCallback(async (): Promise<any | null> => {
    try {
      if (!range_based_contract) {
        console.warn("Contract not available");
        return null;
      }

      const response = await range_based_contract.get_all_pools();

      return response as any;
    } catch (err) {
      console.error("Get pool detail failed:", err);
      return null;
    }
  }, []);

  const getPrediction = useCallback(
    async (pool_id: number, prediction_id: number): Promise<any | null> => {
      try {
        if (!range_based_contract) {
          console.warn("Contract not available");
          return null;
        }

        const response = await range_based_contract.get_prediction(
          CallData.compile({
            pool_id: pool_id,
            prediction_id: prediction_id,
          })
        );

        return response as any;
      } catch (err) {
        console.error("Get prediction failed:", err);
        return null;
      }
    },
    []
  );

  const getContractBalance = useCallback(
    async (tokenAddress: string): Promise<bigint | null> => {
      try {
        if (!range_based_contract) {
          console.warn("Contract not available");
          return null;
        }

        const response = await range_based_contract.get_contract_balance(
          CallData.compile({
            token: tokenAddress,
          })
        );

        return BigInt(response.toString());
      } catch (err) {
        console.error("Get contract balance failed:", err);
        return null;
      }
    },
    []
  );

  return {
    createPool,
    placeBet,
    setResult,
    claimReward,
    getPoolDetail,
    getPrediction,
    getContractBalance,
    getAllPool,
  };
};
