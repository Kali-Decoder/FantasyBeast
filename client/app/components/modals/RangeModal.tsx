/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useRangeContract } from "@/app/hooks/useRangeContract";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import Link from "next/link";
import { useState, useEffect } from "react";

type RangeMarket = {
  poolId: number;
  minValue: string;
  maxValue: string;
  question: string;
  metric: string;
  url: string;
};

type RangeModalProps = {
  onClose: () => void;
  selectSingleRangeMarket: RangeMarket;
};

const RangeModal: React.FC<RangeModalProps> = ({
  onClose,
  selectSingleRangeMarket,
}) => {
  const min = parseFloat(selectSingleRangeMarket?.minValue) || 0;
  const max = parseFloat(selectSingleRangeMarket?.maxValue) || 100;

  const [value, setValue] = useState((min + max) / 2);
  const [amount, setAmount] = useState(0);

  const { account, address } = useAccount();
  const { connectors } = useConnect();

  const [username, setUsername] = useState<string | undefined>();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!address) return;
    const controller = connectors.find(
      (c): c is ControllerConnector => c instanceof ControllerConnector
    );
    if (controller) {
      controller.username()?.then((n) => setUsername(n));
      setConnected(true);
    }
  }, [address, connectors]);

  console.log({selectSingleRangeMarket})

  const { placeBet } = useRangeContract(connected, account);

  useEffect(() => {
    setValue((min + max) / 2);
  }, [min, max]);

  const handleSubmit = async () => {
    console.log("Selected value:", value, amount,selectSingleRangeMarket?.poolId);
    await placeBet(selectSingleRangeMarket?.poolId, value, amount); // Example: 3 can be replaced with market ID
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black font-techno bg-opacity-50 flex items-center justify-center">
      <div className="bg-black p-6 rounded-lg shadow-lg max-w-md w-full">
        <p className="text-white mb-2 text-xl">
          {selectSingleRangeMarket?.question}
        </p>

        <div className="flex flex-col gap-3 mt-4">
          <div className="flex justify-between text-white text-xs font-mono px-1">
            <span>Min: {min}</span>
            <span>Max: {max}</span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={min}
            max={max}
            step="1"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full"
          />

          {/* Number input for amount */}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2 rounded-md border border-gray-600 text-black"
          />

          {/* Selected values */}
          <div className="text-sm text-white">
            Predicted Value: <span className="text-blue-400">{value}</span>
          </div>
          <div className="text-sm text-white">
            Amount Bet: <span className="text-blue-400">{amount} STRK</span>
          </div>
          <div className="text-sm text-white">
            Betting Key Metric:{" "}
            <span className="text-blue-400 uppercase">
              {selectSingleRangeMarket?.metric}
            </span>
          </div>
          <div className="text-sm text-white">
            Creator:{" "}
            <span className="text-blue-400 uppercase">
              <Link
                href={selectSingleRangeMarket?.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Click →
              </Link>
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-red-500 hover:bg-red-400 text-black font-bold py-2 px-4 rounded-xl border-2 border-white shadow-[3px_3px_0px_rgba(1,1,1,1)] active:translate-y-[2px] flex items-center justify-center"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[2px] flex items-center justify-center"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RangeModal;
