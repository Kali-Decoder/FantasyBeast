/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useRangeBased } from "../contexts/RangeBasedMarketProvider";
import { useRangeContract } from "../hooks/useRangeContract";
import { useAccount, useConnect } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";

export default function CreateMarketModal({ onClose }: any) {
  const { account, isConnected, address } = useAccount();
  const { connectors } = useConnect();
  const [username, setUsername] = useState<string | undefined>();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!address) return;
    const controller = connectors.find(
      (c: any) => c instanceof ControllerConnector
    );
    if (controller) {
      controller
        ?.username()
        ?.then((n: React.SetStateAction<string | undefined>) => setUsername(n));
      setConnected(true);
    }
  }, [address, connectors]);

  const { status, error } = useRangeBased();
  const { createPool } = useRangeContract(connected, account);

  const [formData, setFormData] = useState({
    question: "",
    startTime: "",
    endTime: "",
    maxBettors: "",
    amount: "",
  });

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    // Validate form data
    if (!formData.question.trim()) {
      alert("Please enter a market question");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      alert("Please select start and end times");
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert("End time must be after start time");
      return;
    }

    if (!formData.maxBettors || parseInt(formData.maxBettors) < 1) {
      alert("Please enter a valid number of max participants");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid initial stake amount");
      return;
    }

    try {
      const startTimestamp = Math.floor(
        new Date(formData.startTime).getTime() / 1000
      );
      const endTimestamp = Math.floor(
        new Date(formData.endTime).getTime() / 1000
      );

     const data= await createPool(
        formData.question,
        startTimestamp,
        endTimestamp,
        parseInt(formData.maxBettors),
        parseFloat(formData.amount)
      );

      console.log({data})

      

      // Reset form and close modal on success
      setFormData({
        question: "",
        startTime: "",
        endTime: "",
        maxBettors: "",
        amount: "",
      });
      onClose();
    } catch (err) {
      console.error("Failed to create market:", err);
    }
  };

  const handleClose = () => {
    setFormData({
      question: "",
      startTime: "",
      endTime: "",
      maxBettors: "",
      amount: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#0d111c] rounded-2xl shadow-lg p-6 w-full max-w-xl text-white space-y-6">
        {/* Title */}
        <h2 className="text-2xl font-semibold">Create Prediction Market</h2>

        {/* Market Question */}
        <div>
          <label className="text-sm mb-1 block">Prediction Question</label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            rows={2}
            maxLength={200}
            placeholder="What will be the price of ETH on December 31st, 2024?"
            className="w-full rounded-lg px-4 py-2 bg-[#1a2130] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
          <div className="text-xs text-gray-400 text-right mt-1">
            {formData.question.length}/200
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm mb-1 block">Starts At</label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-[#1a2130] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">Ends At</label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-[#1a2130] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Max Bettors and Initial Stake */}
        <div className="grid grid-cols-2 md:grid-cols-3 text-white  gap-4 items-end">
          <div>
            <label className="text-sm mb-1 block text-white">
              Max Participants
            </label>
            <input
              type="number"
              name="maxBettors"
              value={formData.maxBettors}
              onChange={handleInputChange}
              placeholder="100"
              min="1"
              className="w-full px-4 py-2 rounded-lg bg-[#1a2130] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">Initial Stake</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="10.0"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg bg-[#1a2130] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-center">
            <span className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-bold">
              STRK
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Connection Warning */}
        {!isConnected && (
          <div className="bg-yellow-900/50 border border-yellow-500/50 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              Please connect your wallet to create a market
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleClose}
            className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            disabled={status === "loading"}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={status === "loading" || !isConnected}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-green-400 hover:opacity-90 transition font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>Create Market 🚀</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
