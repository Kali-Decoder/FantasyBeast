/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import WalletBar from "./WalletBar";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import Link from "next/link";
import CreateMarketModal from "./CreateMarketModal";
import { useRangeBased } from "../contexts/RangeBasedMarketProvider";
import { Activity, List } from "lucide-react";

export function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateMarketModalOpen, setIsCreateMarketModalOpen] = useState(false); // Add this state
  const { userPoints } = useRangeBased();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const [username, setUsername] = useState<string | undefined>();
  const [connected, setConnected] = useState(false);

  // Controller connection
  useEffect(() => {
    if (!address) return;
    const controller = connectors.find((c) => c instanceof ControllerConnector);
    if (controller) {
      controller.username()?.then((n) => setUsername(n));
      setConnected(true);
    }
  }, [address, connectors]);

  return (
    <>
      <header className="w-full px-6 py-4 flex justify-between items-center text-white relative z-10 font-sans">
        {/* Left: Logo & Links */}
        <div className="flex items-center space-x-10">
          <div className="flex items-center space-x-2 cursor-pointer hover:text-gray-300 transition-colors">
            <img src="/icons/gamepad.svg" alt="Games" className="w-6 h-6" />
            <span className="font-semibold text-lg">
              <Link href="/">FantasyBeast</Link>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
            <img src="/icons/store.svg" alt="Store" className="w-6 h-6" />
            <span className="font-semibold text-lg">
              <Link href="/leaderboard">Leaderboard</Link>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
            <List />
            <span className="font-semibold text-lg">
              <Link href="/dashboard">Transactions</Link>
            </span>
          </div>
        </div>

        {/* Center Logo */}
        <div className="flex-shrink-0">
          <img src="/icons/center.png" alt="Logo" className="w-12 h-12" />
        </div>

        {/* Right: Icons or Wallet */}
        <div className="flex items-center space-x-6">
          <div
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full transition-colors cursor-pointer"
            onClick={() => setIsCreateMarketModalOpen(true)} // Add click handler
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm">
              📈
            </div>
            <button className="text-white text-base font-semibold">
              Create Market
            </button>
          </div>
          <div className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full transition-colors cursor-pointer">
            <Link
              href="/marketplace"
              className="text-white text-base font-semibold"
            >
              {" "}
              <Activity />
            </Link>
          </div>
          <div className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full transition-colors cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-sm">
              🪙
            </div>
            <span className="text-white text-base font-semibold">
              {userPoints} XP
            </span>
          </div>

          <WalletBar />
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white ml-4"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-90">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <button
              className="absolute top-4 right-6"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <a href="#" className="text-xl text-white hover:text-purple-400">
              FantasyBeast
            </a>
            <a href="#" className="text-xl text-white hover:text-purple-400">
              Leaderboard
            </a>
            <a
              href="/dashboard"
              className="text-xl text-white hover:text-purple-400"
            >
              Transactions
            </a>

            <WalletBar />
          </div>
        </div>
      )}

      {/* Create Market Modal */}
      {isCreateMarketModalOpen && (
        <CreateMarketModal onClose={() => setIsCreateMarketModalOpen(false)} />
      )}
    </>
  );
}
