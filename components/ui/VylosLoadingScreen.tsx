"use client";

import React from "react";
import { VylosLogo } from "./VylosLogo";

// Abstract Banknote Vector Icon (rendered inline)
const BanknoteIcon = () => (
  <svg viewBox="0 0 120 60" className="w-full h-full fill-none stroke-white/35" strokeWidth="2">
    <rect x="4" y="4" width="112" height="52" rx="6" />
    <circle cx="60" cy="30" r="12" className="stroke-white/20 fill-white/5" />
    <rect x="10" y="10" width="100" height="40" rx="3" className="stroke-white/15" />
    <line x1="20" y1="20" x2="35" y2="20" className="stroke-white/20" />
    <line x1="20" y1="40" x2="35" y2="40" className="stroke-white/20" />
    <line x1="85" y1="20" x2="100" y2="20" className="stroke-white/20" />
    <line x1="85" y1="40" x2="100" y2="40" className="stroke-white/20" />
  </svg>
);

// Abstract Coin Vector Icon
const CoinIcon = () => (
  <svg viewBox="0 0 50 50" className="w-full h-full fill-white/5 stroke-white/35" strokeWidth="2">
    <circle cx="25" cy="25" r="21" />
    <circle cx="25" cy="25" r="15" strokeDasharray="3,3" className="stroke-white/20" />
    <line x1="25" y1="13" x2="25" y2="37" className="stroke-white/25" />
    <line x1="13" y1="25" x2="37" y2="25" className="stroke-white/25" />
  </svg>
);

const particles = [
  { type: "note", left: "12%", delay: "0s", dur: "14s", anim: "animate-money-left", size: "w-28 h-14 md:w-36 md:h-18", opacity: "[--max-opacity:0.16]", blur: "blur-[1.5px]" },
  { type: "coin", left: "28%", delay: "2.5s", dur: "10s", anim: "animate-money-straight", size: "w-8 h-8 md:w-12 md:h-12", opacity: "[--max-opacity:0.18]", blur: "blur-none" },
  { type: "note", left: "82%", delay: "1.2s", dur: "17s", anim: "animate-money-right", size: "w-32 h-16 md:w-40 md:h-20", opacity: "[--max-opacity:0.11]", blur: "blur-[2px]" },
  { type: "note", left: "68%", delay: "4.8s", dur: "20s", anim: "animate-money-left", size: "w-24 h-12 md:w-28 md:h-14", opacity: "[--max-opacity:0.14]", blur: "blur-[0.5px]" },
  { type: "coin", left: "48%", delay: "0.8s", dur: "12s", anim: "animate-money-straight", size: "w-10 h-10 md:w-14 md:h-14", opacity: "[--max-opacity:0.20]", blur: "blur-[1px]" },
  { type: "note", left: "4%", delay: "6.2s", dur: "15s", anim: "animate-money-right", size: "hidden sm:block w-36 h-18", opacity: "[--max-opacity:0.08]", blur: "blur-[3px]" },
  { type: "coin", left: "92%", delay: "5.5s", dur: "11s", anim: "animate-money-straight", size: "hidden sm:block w-8 h-8", opacity: "[--max-opacity:0.13]", blur: "blur-none" },
  { type: "note", left: "75%", delay: "8.5s", dur: "16s", anim: "animate-money-left", size: "hidden sm:block w-28 h-14", opacity: "[--max-opacity:0.10]", blur: "blur-[1px]" },
  { type: "coin", left: "18%", delay: "7.8s", dur: "13s", anim: "animate-money-right", size: "hidden sm:block w-14 h-14", opacity: "[--max-opacity:0.15]", blur: "blur-[2.5px]" },
  { type: "note", left: "38%", delay: "9.2s", dur: "18s", anim: "animate-money-straight", size: "hidden sm:block w-24 h-12", opacity: "[--max-opacity:0.12]", blur: "blur-none" },
];

interface VylosLoadingScreenProps {
  variant?: "fullscreen" | "inline" | "overlay";
  text?: string;
}

export const VylosLoadingScreen: React.FC<VylosLoadingScreenProps> = ({
  variant = "fullscreen",
  text,
}) => {
  if (variant === "fullscreen") {
    return (
      <div className="vylos-bg-loading fixed inset-0 flex flex-col items-center justify-center z-[9999] overflow-hidden select-none">
        {/* Background Graphic Charts */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Left: Bar Chart Shape */}
          <div className="absolute left-[8%] top-[40%] flex items-end gap-3 opacity-[0.07] blur-[2px] select-none scale-75 md:scale-100">
            <div className="w-8 h-24 bg-white rounded-t-xl" />
            <div className="w-8 h-40 bg-white rounded-t-xl" />
            <div className="w-8 h-32 bg-white rounded-t-xl" />
          </div>
          {/* Right: Pie Chart Shape */}
          <div className="absolute right-[8%] top-[38%] opacity-[0.06] blur-[2px] select-none scale-75 md:scale-100">
            <svg width="220" height="220" viewBox="0 0 100 100" className="fill-white">
              <path d="M50 50 L50 0 A 50 50 0 0 1 100 50 Z" />
              <path d="M47 50 L3 50 A 47 47 0 0 1 47 3 Z" className="opacity-70" />
              <path d="M50 53 L3 53 A 47 47 0 0 0 97 80 Z" className="opacity-40" />
            </svg>
          </div>
        </div>

        {/* Falling Money Particles */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {particles.map((p, i) => (
            <div
              key={i}
              className={`absolute top-0 ${p.anim} ${p.size} ${p.opacity} ${p.blur}`}
              style={{
                left: p.left,
                animationDelay: p.delay,
                // @ts-ignore
                "--dur": p.dur,
              }}
            >
              {p.type === "note" ? <BanknoteIcon /> : <CoinIcon />}
            </div>
          ))}
        </div>

        {/* Logo Glow Backplate */}
        <div className="absolute top-[48%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-80 h-80 bg-blue-500/25 blur-[120px] rounded-full pointer-events-none z-0" />

        {/* Center Branding & Loading Status */}
        <div className="relative z-20 flex flex-col items-center text-center px-4">
          <div className="animate-soft-pulse mb-10 flex items-center justify-center drop-shadow-2xl">
            <VylosLogo size="large" />
          </div>
          <p className="text-white/80 font-medium text-[13px] md:text-sm tracking-wide">
            {text || "Loading your money insights..."}
          </p>
          <div className="flex gap-2 mt-4 items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:-0.07s]" />
            <span className="w-2 h-2 rounded-full bg-white/20 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center z-[999] rounded-[2.5rem] p-6 text-center select-none">
        <div className="vylos-glass rounded-3xl p-8 max-w-xs border border-white/10 flex flex-col items-center justify-center shadow-2xl">
          <div className="animate-soft-pulse mb-6 flex items-center justify-center">
            <VylosLogo iconOnly size="medium" />
          </div>
          <p className="text-white font-bold text-xs tracking-wide">
            {text || "Processing..."}
          </p>
          <div className="flex gap-1.5 mt-3 items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  // inline loading state
  return (
    <div className="w-full py-8 flex flex-col items-center justify-center text-center select-none">
      <div className="animate-soft-pulse mb-4 flex items-center justify-center">
        <VylosLogo iconOnly size="medium" />
      </div>
      <p className="text-slate-900 dark:text-white/60 font-bold text-xs tracking-wide">
        {text || "Syncing data..."}
      </p>
      <div className="flex gap-1.5 mt-3 items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-bounce" />
      </div>
    </div>
  );
};
