import { postWithHeaders } from "./config";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function getRandomNumber() {
  return Math.floor(Math.random() * 1000000);
}

export function convertToStarknetAddress(address: bigint) {
  return "0x" + address.toString(16).padStart(64, "0");
}

export function convertAddressToStarknetAddress(address: string) {
  return "0x" + address.slice(2).padStart(64, "0");
}

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function decimalToText(decimal: bigint): string {
  const hex = decimal.toString(16);
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

// Utility function to format token amount
export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  symbol: string
): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;

  // Convert fractional part to string and pad with leading zeros
  let fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  // Remove trailing zeros
  fractionalStr = fractionalStr.replace(/0+$/, "");

  // If no fractional part, return just the integer
  if (!fractionalStr) {
    return `${integerPart} ${symbol}`;
  }

  return `${integerPart}.${fractionalStr} ${symbol}`;
}

export const getLeaderboard = () => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("leaderboard");
  return data ? JSON.parse(data) : [];
};

export const setLeaderboard = (data: any[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("leaderboard", JSON.stringify(data));
};

export const addOrUpdatePlayer = ({
  address,
  gameType,
  status,
  earnedPoints,
}: {
  address: string;
  gameType: string;
  status: "Win" | "Loss";
  earnedPoints: number;
}) => {
  const existing = getLeaderboard();

  const updated = [...existing];
  const index = updated.findIndex((player) => player.address === address);

  if (index !== -1) {
    // Update existing player
    updated[index] = {
      ...updated[index],
      gameType,
      status,
      earnedPoints,
      totalXP: updated[index].totalXP + earnedPoints,
    };
  } else {
    // Add new player
    updated.push({
      address,
      gameType,
      status,
      earnedPoints,
      totalXP: earnedPoints,
    });
  }

  setLeaderboard(updated);
};

export function parseContractData(data: any[]) {
  return data.map((entry) => ({
    pool_id: parseInt(entry.pool_id, 16),
    creator: entry.creator,
    question: hexToUtf8(entry.question),
    start_time: parseInt(entry.start_time, 16),
    end_time: parseInt(entry.end_time, 16),
    max_bettors: parseInt(entry.max_bettors, 16),
    total_bets: parseInt(entry.total_bets, 16),
    total_amount: parseInt(entry.total_amount, 16),
    actual_result: parseInt(entry.actual_result, 16),
    status: entry.status,
  }));
}

// Helper to convert hex string to UTF-8
function hexToUtf8(hex: string) {
  if (!hex || hex === "0x") return "";
  const hexStr = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = hexStr?.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));
  return new TextDecoder().decode(new Uint8Array(bytes!));
}

export function parseHexToNumber(hex: string) {
  if (!hex || hex === "0x") return 0;
  return parseInt(hex, 16);
}

export const placeBetBackend = async (
  address: any,
  trxHash: any,
  event: any
) => {
  try {
    const url = "/transactions"; // or full path like "https://api.example.com/transactions"

    const data = {
      trxHash: trxHash,
      event: event, // or "binary-based", "create"
      userAddress: address,
    };

    const headers = {
      "x-user-address": address!,
    };

    const response = await postWithHeaders(url, data, headers);
    console.log("Transaction response:", response.data);
  } catch (err) {
    console.error("Error placing bet:", err);
    throw new Error("Failed to place bet. Please try again later.");
  }
};

export const createMarketBackend = async (
  creator: any,
  trxHash: any,
  marketType: any,
  question: any,
  postURL: any,
  endtime: any,
  pool_id: any
) => {
  try {
    const url = "/pools";

    const data = {
      creator,
      trxHash,
      marketType,
      question,
      url:postURL,
      endTime:endtime,
      poolId: pool_id,
    };

    const headers = {
      "x-user-address": creator!,
    };

    const response = await postWithHeaders(url, data, headers);
    console.log("Transaction response:", response.data);
  } catch (err) {
    console.error("Error placing bet:", err);
    throw new Error("Failed to place bet. Please try again later.");
  }
};
