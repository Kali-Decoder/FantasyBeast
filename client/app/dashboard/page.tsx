"use client";

import { useRangeBased } from "../contexts/RangeBasedMarketProvider";

export default function DashboardPage() {
  const { transactions } = useRangeBased();
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center mt-10 min-h-screen bg-transparent text-white font-techno">
        <h1 className="text-3xl font-bold my-2 font-techno uppercase">
          <span className="text-yellow-400">Dashboard</span>
        </h1>
        <p className="text-lg mb-4">No transactions found.</p>
      </div>
    );
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };
  return (
    <div className="flex flex-col items-center mt-10 min-h-screen bg-transparent text-white font-techno">
      <h1 className="text-3xl font-bold my-2 font-techno uppercase">
        <span className="text-yellow-400">Transactions</span>
      </h1>
      <p className="text-lg mb-4">
        Your Predictions Insights
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700 border">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Txn Hash</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Wallet Address</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr
                key={tx.trxHash}
                className={idx % 2 === 0 ? "bg-black" : "bg-gray-500"}
              >
                <td className="px-4 py-3 truncate max-w-xs text-blue-400">
                  {truncateHash(tx.trxHash)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium 
      ${
        tx.event === "range-based"
          ? "bg-green-100 text-green-700"
          : "bg-blue-100 text-blue-700"
      }`}
                  >
                    {tx.event}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-white">
                  {tx.pointsEarned} XP
                </td>
                <td className="px-4 py-3 truncate max-w-xs text-green-400">
                  {truncateHash(tx.walletAddress)}
                </td>
                <td className="px-4 py-3 text-white">
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
