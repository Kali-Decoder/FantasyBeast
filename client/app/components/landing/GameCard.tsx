"use client";
import { useEffect, useState } from "react";

// Card data with image URLs
const cards = [
  { title: "@odin_free", rating: 3.4, image: "https://pbs.twimg.com/profile_images/1879901116806164480/olCdoL1D_400x400.jpg" },
  { title: "@starkience", rating: 3.4, image: "https://pbs.twimg.com/profile_images/1879907075649597440/mbicFQO0_400x400.jpg" },
  { title: "@akashneelesh", rating: 3.4, image: "https://pbs.twimg.com/profile_images/1881206114395787264/II0n4t6x_400x400.jpg" },
  { title: "@Yoyo_343_", rating: 3.4, image: "https://pbs.twimg.com/profile_images/1901901517655097344/2S91toQ0_400x400.jpg" },
  { title: "@reet_batra", rating: 3.4, image: "https://pbs.twimg.com/profile_images/1881112914524000256/txUkIUzJ_400x400.jpg" },
];

interface GameCardProps {
  title: string;
  rating: number;
  image: string;
  position: string;
}

const GameCard = ({ title, rating, image, position }: GameCardProps) => {
  const baseClasses =
    "rounded-3xl border border-white/20 text-white font-semibold relative overflow-hidden shadow-xl transition-all duration-500 ease-in-out";

  let transform = "";
  let size = "w-72 h-80";
  let z = "z-10";

  switch (position) {
    case "left":
      transform = "-translate-x-36 rotate-[-5deg] scale-95";
      break;
    case "right":
      transform = "translate-x-36 rotate-[5deg] scale-95";
      break;
    case "back-left":
      transform = "-translate-x-64 rotate-[-10deg] scale-90";
      z = "z-0";
      break;
    case "back-right":
      transform = "translate-x-64 rotate-[10deg] scale-90";
      z = "z-0";
      break;
    case "center":
    default:
      size = "w-80 h-96 scale-110";
      z = "z-30";
      break;
  }

  return (
    <div className={`${baseClasses} ${transform} ${size} ${z}`}>
      {/* Background image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-bold font-techno">{title}</h3>
          <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center">
            <span className="text-sm mr-1">🏆</span>
         
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FigmaCardsStack() {
  const [activeIndex, setActiveIndex] = useState(2); // Start from center (Kirby)

  const getPosition = (index: number) => {
    const diff = (index - activeIndex + cards.length) % cards.length;
    switch (diff) {
      case 0:
        return "center";
      case 1:
        return "right";
      case 2:
        return "back-right";
      case cards.length - 1:
        return "left";
      case cards.length - 2:
        return "back-left";
      default:
        return "hidden";
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full mt-24 h-[400px] flex justify-center items-center">
      <div className="relative flex items-center justify-center w-full h-full">
        {cards.map((card, index) => {
          const position = getPosition(index);
          return (
            <div
              key={index}
              className="absolute transition-all duration-500 ease-in-out"
            >
              <GameCard {...card} position={position} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
