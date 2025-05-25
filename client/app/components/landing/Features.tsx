import React from "react";

const Features = () => {
  return (
    <section className="py-20 px-6 w-full mx-auto font-['Press_Start_2P,_sans-serif'] text-white">
      <h2 className="text-3xl md:text-4xl font-bold mb-16 font-techno text-center text-white">
        Why Bet on Fantasy Beast?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {[
          {
            color: "bg-gray-800",
            title: "Regular Users",
            desc: "Deposit funds, place bets, create markets, and withdraw winnings with ease.",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            ),
          },
          {
            color: "bg-gray-700",
            title: "Market Creators",
            desc: "Set up custom betting markets by defining events and resolution logic.",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            ),
          },
          {
            color: "bg-gray-600",
            title: "AI Resolver (zkTLS)",
            desc: "Autonomously fetches and verifies social media data to resolve markets.",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ),
          },
          {
            color: "bg-gray-500",
            title: "Administrators",
            desc: "Oversee governance, resolve disputes, and track platform stats (optional).",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7h18M3 12h18M3 17h18"
              />
            ),
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className={`text-center p-6 border-4 border-black bg-gradient-to-br from-blue-900 to-violet-800 shadow-[6px_6px_0_rgba(0,0,0,1)] transition-transform hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(0,0,0,1)]`}
          >
            <div
              className={`w-16 h-16 ${feature.color} border-2 border-black rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {feature.icon}
              </svg>
            </div>
            <h3 className="text-lg mb-4 text-red-300 font-mono">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed font-mono">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
