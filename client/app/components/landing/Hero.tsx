import React from "react";
import FigmaCardsStack from "./GameCard";

const Hero = () => {
  return (
    <section className="w-screen">
      <div className=" text-white flex flex-col  overflow-hidden ">
        {/* Main Content */}
        <main className="relative z-10 px-6 py-8">
          {/* Floating game items */}
          <div className="absolute top-10 left-40">
            <img
              src="/icons/store.svg"
              alt="twitter"
              className="transform rotate-12 w-20"
            />
          </div>
          <div className="absolute top-52 right-64">
            <img
              src="/icons/girl.svg"
              alt="twitter"
              className="transform rotate-12 w-20"
            />
          </div>
          <div className="absolute top-96 left-24">
            <img
              src="/icons/bell.svg"
              alt="twitter"
              className="transform rotate-12 w-20"
            />
          </div>

          {/* Main content */}
          <div className="mt-16 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className=" rounded-full p-2 mr-2">
                <span className="text-black text-md">🌏</span>
              </div>
              <span className="text-yellow-500 text-xl font-bold uppercase">
                A fully on-chain{" "}
              </span>
              <span className="text-gray-400 text-xl ml-2 uppercase">
                — Social Market
              </span>
            </div>

            <h1 className="text-6xl font-bold my-2 font-techno ">
              Fantasy Beast
            </h1>
       
            <FigmaCardsStack />
          </div>
        </main>
      </div>
    </section>
  );
};

export default Hero;
