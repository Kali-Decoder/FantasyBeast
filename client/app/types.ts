/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";

export type Status = "idle" | "loading" | "success" | "error";

export interface RangeBasedProviderProps {
  children: ReactNode;
}

export interface RangeBasedContextValue {
  // Transaction functions
  createPool: (
    question: string,
    start_time: number,
    end_time: number,
    max_bettors: number,
    amount: number
  ) => Promise<any>;
  
  placeBet: (
    pool_id: number,
    predicted_value: number,
    bet_amount: number
  ) => Promise<any>;
  
  setResult: (
    pool_id: number,
    result: number
  ) => Promise<any>;
  
  claimReward: (
    pool_id: number
  ) => Promise<any>;
  
  // Read functions
  getPoolDetail: (
    pool_id: number
  ) => Promise<any | undefined>;
  
  getPrediction: (
    pool_id: number,
    prediction_id: number
  ) => Promise<any | undefined>;
  
  getContractBalance: (
    tokenAddress: string
  ) => Promise<bigint | undefined>;
  
  // State
  status: Status;
  error: string | null;
  isConnected: boolean | undefined;
}