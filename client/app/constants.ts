import { Contract, RpcProvider } from "starknet";
import { Binary_Market_Abi, Range_Market_Abi } from "./abi";
export const ETH_TOKEN_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_TOKEN_ADDRESS =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
export const RANGE_BASED_MARKET="0x712fd40927f728066c7df74251b6e73604efb878aa30a9b2ba2df639e5ca4d6"
export const BINARY_BASED_MARKET="0x1aba545c908c9b1acd30b94fb847c43795c07ea1054d2e5b765c02925ea6d9e"
export const voyagerScanBaseUrl = "https://sepolia.voyager.online";

export const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_8",
});

export const range_based_contract = new Contract(
  Range_Market_Abi,
  RANGE_BASED_MARKET,
  provider
).typedv2(Range_Market_Abi);

export const binary_based_contract = new Contract(
  Binary_Market_Abi,
  BINARY_BASED_MARKET,
  provider
).typedv2(Binary_Market_Abi);