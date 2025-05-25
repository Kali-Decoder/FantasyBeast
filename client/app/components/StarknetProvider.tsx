/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {

  argent,
  braavos,
  Connector,
  useInjectedConnectors,
  StarknetConfig,
  voyager,
  jsonRpcProvider,
} from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import { constants } from "starknet";

import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { WebWalletConnector } from "starknetkit/webwallet";
import { BINARY_BASED_MARKET, RANGE_BASED_MARKET } from "../constants";


const policies = {
  contracts: {
    [RANGE_BASED_MARKET]: {
      name: "Fantasy Beast",
      description: "Allows interaction with the Fantasy Beast Prediction",
      methods: [
        { name: "Create Pool", entrypoint: "create_pool", session: true },
        { name: "Set Result", entrypoint: "set_result", session: true },
        { name: "Place Bet", entrypoint: "place_bet", session: true },
        { name: "Claim Reward", entrypoint: "claim_reward", session: true },
      ],
    },
      [BINARY_BASED_MARKET]: {
      name: "Fantasy Beast Binary",
      description: "Allows interaction with the Fantasy Beast Prediction",
      methods: [
        { name: "Create Pool", entrypoint: "create_market", session: true },
        { name: "Set Result", entrypoint: "resolve_market", session: true },
        { name: "Place Bet", entrypoint: "place_bet", session: true },
        { name: "Claim Reward", entrypoint: "claim_reward", session: true },
      ],
    },
  },
};

const SEPOLIA_RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const MAINNET_RPC_URL = "https://api.cartridge.gg/x/starknet/mainnet";
const CURRENT_CHAIN_ID =  "SN_SEPOLIA";

const customProvider = jsonRpcProvider({
  rpc: (chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: MAINNET_RPC_URL };
      case sepolia:
      default:
        return { nodeUrl: SEPOLIA_RPC_URL };
    }
  },
});

export const StarknetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const chains = [mainnet, sepolia];
  const { connectors: injected } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: "always",
  });

  const [controllerConnector, setControllerConnector] =
    useState<Connector | null>(null);

  useEffect(() => {
    const init = async () => {
      const { default: ControllerConnector } = await import(
        "@cartridge/connector/controller"
      );

      const controller = new ControllerConnector({
        chains: [{ rpcUrl: SEPOLIA_RPC_URL }, { rpcUrl: MAINNET_RPC_URL }],
        defaultChainId:
          CURRENT_CHAIN_ID === "SN_SEPOLIA"
            ? constants.StarknetChainId.SN_SEPOLIA
            : constants.StarknetChainId.SN_MAIN,
        policies,
      });

      setControllerConnector(controller);
    };

    init();
  }, []);

  const allConnectors: Connector[] = [
    ...injected,
    new WebWalletConnector({
      url: "https://web.argent.xyz",
    }) as unknown as Connector,
    ArgentMobileConnector.init({
      options: {
        dappName: "Lottery Starknet",
        url: "https://lottery-dapp-starknet.vercel.app/",
      },
    }) as unknown as Connector,
    ...(controllerConnector ? [controllerConnector] : []),
  ];

  return (
    <StarknetConfig
      autoConnect={true}
      chains={chains}
      provider={customProvider}
      connectors={allConnectors}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
};
