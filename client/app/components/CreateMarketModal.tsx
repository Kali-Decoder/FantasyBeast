/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useRangeBased } from "../contexts/RangeBasedMarketProvider";
import { useRangeContract } from "../hooks/useRangeContract";
import { useAccount, useConnect } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { useBinaryMarketContract } from "../hooks/useBinaryContract";

export enum Outcome {
  Yes = 0,
  No = 1,
}

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
      controller?.username()?.then((n) => setUsername(n));
      setConnected(true);
    }
  }, [address, connectors]);

  const { status, error } = useRangeBased();
  const { createPool } = useRangeContract(connected, account);
  const { createMarket } = useBinaryMarketContract(connected, account);

  const [marketType, setMarketType] = useState<"range" | "binary">("range");

  const [formData, setFormData] = useState({
    question: "",
    description: "",
    startTime: "",
    endTime: "",
    resolutionTime: "",
    maxBettors: "",
    amount: "",
    url:"",
    initialPrediction: Outcome.Yes,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "initialPrediction" ? parseInt(value) : value,
    }));
  };

  const handleMarketTypeChange = (type: "range" | "binary") => {
    setMarketType(type);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {


    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

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
      const resolutionTimestamp = formData.resolutionTime
        ? Math.floor(new Date(formData.resolutionTime).getTime() / 1000)
        : endTimestamp;

      if (marketType === "range") {
    
        const data = await createPool(
          formData.url,
          formData.question,
          startTimestamp,
          endTimestamp,
          parseInt(formData.maxBettors),
          parseFloat(formData.amount),
          marketType
        );

        console.log({ data });
      } else {
        const data = await createMarket(
          formData.question,
          formData.question,
          startTimestamp,
          endTimestamp,
          resolutionTimestamp,
          parseInt(formData.maxBettors),
          parseFloat(formData.amount),
          formData.initialPrediction,
          formData.url,
          marketType
        );

        console.log({ data });
      }

      setFormData({
        question: "",
        description: "",
        startTime: "",
        endTime: "",
        resolutionTime: "",
        maxBettors: "",
        amount: "",
        url:'',
        initialPrediction: Outcome.Yes,
      });

      onClose();
    } catch (err) {
      console.error("Failed to create market:", err);
    }
  };

  const handleClose = () => {
    setFormData({
      question: "",
      description: "",
      startTime: "",
      endTime: "",
      resolutionTime: "",
      maxBettors: "",
      amount: "",
      url:"",
      initialPrediction: Outcome.Yes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black font-techno bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-black border border-white rounded-2xl shadow-lg p-6 w-full max-w-xl text-white space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          Create Prediction Market
        </h2>

        {/* Market Type Selection */}
        <div className="flex gap-6 items-center justify-center text-sm font-medium">
          <p
            className={`flex items-center gap-2 cursor-pointer ${
              marketType === "range" ? "text-green-500" : "text-white"
            }`}
            onClick={() => handleMarketTypeChange("range")}
          >
            <span className="relative">
              <input
                type="radio"
                name="marketType"
                value="range"
                checked={marketType === "range"}
                onChange={() => handleMarketTypeChange("range")}
                className="peer hidden"
              />
              <span className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-green-500 peer-checked:bg-green-500 inline-block"></span>
            </span>
            Range
          </p>

          <p
            className={`flex items-center gap-2 cursor-pointer ${
              marketType === "binary" ? "text-green-500" : "text-white"
            }`}
            onClick={() => handleMarketTypeChange("binary")}
          >
            <span className="relative">
              <input
                type="radio"
                name="marketType"
                value="binary"
                checked={marketType === "binary"}
                onChange={() => handleMarketTypeChange("binary")}
                className="peer hidden"
              />
              <span className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-green-500 peer-checked:bg-green-500 inline-block"></span>
            </span>
            Binary
          </p>
        </div>

        {/* Question */}
        <div>
          <p className="text-sm mb-1 block">Prediction Question</p>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            rows={2}
            maxLength={200}
            placeholder="What will be the price of ETH on December 31st, 2024?"
            className="w-full rounded-lg px-4 py-2 bg-gray-950 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
          <div className="text-xs text-gray-400 text-right mt-1">
            {formData.question.length}/200
          </div>
        </div>

        <div>
          <p className="text-sm mb-1 block">Post Url</p>
          <input
            name="url"
            type="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="https://x.com/itsNikku876/status/1923368642164523427"
            className="w-full rounded-lg px-4 py-2 bg-gray-950 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
      
        </div>

        {/* Binary Specific Fields */}
        {marketType === "binary" && (
          <>
               <div>
          <p className="text-sm mb-1 block">Post Url</p>
          <input
            name="url"
            type="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="https://x.com/itsNikku876/status/1923368642164523427"
            className="w-full rounded-lg px-4 py-2 bg-gray-950 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
      
        </div>

            <div>
              <p className="text-sm mb-1 block">Resolution Time</p>
              <input
                type="datetime-local"
                name="resolutionTime"
                value={formData.resolutionTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-950 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="text-sm mb-1 block">Initial Prediction</p>
              <select
                name="initialPrediction"
                value={formData.initialPrediction}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-950 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={Outcome.Yes}>Yes</option>
                <option value={Outcome.No}>No</option>
              </select>
            </div>
          </>
        )}

        {/* Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm mb-1 block">Starts At</p>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-950 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <p className="text-sm mb-1 block">Ends At</p>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-950 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Stake & Participants */}
        <div className="grid grid-cols-2 md:grid-cols-3 text-white gap-4 items-end">
          <div>
            <p className="text-sm mb-1 block text-white">Max Participants</p>
            <input
              type="number"
              name="maxBettors"
              value={formData.maxBettors}
              onChange={handleInputChange}
              placeholder="100"
              min="1"
              className="w-full px-4 py-2 rounded-lg bg-gray-950 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <p className="text-sm mb-1 block">Initial Stake</p>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="10.0"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg bg-gray-950 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-center">
            <span className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-bold">
              STRK
            </span>
          </div>
        </div>

        {/* Error & Connection Info */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!isConnected && (
          <div className="bg-yellow-900/50 border border-yellow-500/50 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              Please connect your wallet to create a market
            </p>
          </div>
        )}

        {/* Actions */}
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
