/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useBinaryMarketContract } from "@/app/hooks/useBinaryContract";
import ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import { useEffect, useState } from "react";

const BinaryModal = ({ onClose, selectSingleBinaryMarket }) => {
  const [betAmount, setBetAmount] = useState("");
    const { account, address } = useAccount();
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



  const { placeBet } = useBinaryMarketContract(connected, account);


  const handleSubmit = async () => {
    if (!betAmount || isNaN(Number(betAmount))) {
      alert("Please enter a valid amount to bet.");
      return;
    }

    // You can call a function or API here to handle the bet submission
    console.log("Submitting bet of:", betAmount);
    console.log({selectSingleBinaryMarket})
    // Example:
  //  await  placeBet();

    onClose(); // optionally close modal on submit
  };

  return (
    <div className="fixed inset-0 z-50 bg-black font-techno bg-opacity-50 flex items-center justify-center">
      <div className="bg-black p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-sm font-bold mb-4 uppercase text-white">
          You have selected:{" "}
          <span className="text-blue-400">
            {selectSingleBinaryMarket?.betStatus} -{" "}
            {selectSingleBinaryMarket?.betStatus === "yes"
              ? selectSingleBinaryMarket?.market.yesPercentage
              : selectSingleBinaryMarket?.market.noPercentage}
            %
          </span>
        </h2>

        <p className="text-white mb-4">
          {selectSingleBinaryMarket?.market.question ||
            "More info or interaction for binary prediction."}
        </p>

        <input
          type="number"
          placeholder="Enter amount to bet"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="w-full p-2 mb-4 rounded-md border border-gray-600 text-black"
        />

        <div className="flex gap-2 mt-2">
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

export default BinaryModal;
