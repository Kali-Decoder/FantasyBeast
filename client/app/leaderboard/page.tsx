"use client";
import { useEffect } from "react";
import { useState } from "react";
import { useRangeBased } from "../contexts/RangeBasedMarketProvider";
import { useAccount } from "@starknet-react/core";
export default function LeaderboardTable() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const { getLeaderboard } = useRangeBased();
  const { address } = useAccount();
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard();
        setLeaderboardData(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
      }
    }
    fetchLeaderboard();
  }, [getLeaderboard]);
  const getMsg = (leaderboardPosition) => {
    const appUrl = "https://fantasy-beast.vercel.app/";
    const tweetText = encodeURIComponent(
      `🔥 🔥 I'm currently holding the ${leaderboardPosition} position on the Fantasy Beast leaderboard — the ultimate on-chain prediction game on Starknet!
Think you can beat me predicting your favorite creators? 💥👇 Play Now 
${appUrl}
@StarknetFndn @Starknet @HackQuest_ @akashneelesh`
    );

    return `https://twitter.com/intent/tweet?text=${tweetText}`;
  };
  //hello
  return (
    <section className="py-12 px-6 w-full max-w-4xl mx-auto font-techno">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">
        🏆Leaderboard
      </h2>

      <div className="overflow-hidden">
        <div className="h-[70vh] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <table className="min-w-full text-sm text-left text-white">
            <thead className="bg-white/10 text-white uppercase text-xs sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">Earned Points</th>
                <th className="px-6 py-3">Share Victory</th>
              </tr>
            </thead>
            <tbody className="bg-transparent">
              {leaderboardData.map((user, index) => (
                <tr
                  key={user?.walletAddress}
                  className={`border-b border-white/20 ${
                    index % 2 === 0 ? "bg-white/10" : "bg-white/5"
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-yellow-400">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-400">
                      {user?.walletAddress.slice(0, 6)}...
                      {user?.walletAddress.slice(-4)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user?.xpPoints}</td>
                  <td className="px-6 py-4">
                    {user?.walletAddress == address ? (
                      <a
                        href={getMsg(index + 1)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400"
                      >
                        Share on Twitter
                      </a>
                    ) : (
                      "----"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
