/* eslint-disable @next/next/no-css-tags */
/* eslint-disable @next/next/no-page-custom-font */
"use client";
import "./globals.css";
import { useEffect } from "react";
import Head from "next/head";

import "@fontsource/press-start-2p";
import "@fontsource/orbitron"; // Optional weights: /400.css, /700.css
import "@fontsource/silkscreen";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./components/Navbar";
import Script from "next/script";
import { StarknetProvider } from "./components/StarknetProvider";
import { RangeBasedProvider } from "./contexts/RangeBasedMarketProvider";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.title = "Fantasy Beast";
    document.head
      .querySelector("link[rel='icon']")
      ?.setAttribute("href", "/starknet.svg");
  }, []);

  return (
    <html lang="en">
      <Head>
        <title>Fantasy Beast - On Chain Social Predictions</title>
        <meta
          name="description"
          content="Bets on Your Favourite Creators on Starkent"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/css/style.css" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Exo:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="min-h-screen ">
        <Script
          src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"
          strategy="beforeInteractive"
        />
        <Script src="/js/scripts.js" strategy="afterInteractive" />
        <StarknetProvider>
          <RangeBasedProvider>
            <Navbar />
            <main className="w-full">{children}</main>
          </RangeBasedProvider>
        </StarknetProvider>
        <Toaster />
      </body>
    </html>
  );
}
