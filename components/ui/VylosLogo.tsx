"use client";

import React from "react";

export const VylosLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div 
      className={`flex items-center justify-center relative ${className}`}
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "24px",
        background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
        boxShadow: "0 15px 35px -10px rgba(29, 78, 216, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        overflow: "hidden"
      }}
    >
      {/* Glass Overlay Effect */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
      
      {/* The "V" Icon - Icon only version, perfectly centered */}
      <svg 
        width="48" 
        height="48" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 select-none"
      >
        <defs>
          <linearGradient id="vylos-icon-white-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 1)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.8)" />
          </linearGradient>
          <filter id="icon-depth" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feOffset dx="0" dy="1" result="offsetBlur" />
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
          </filter>
        </defs>
        
        {/* Recreating the V mark in white/glass style for the blue badge */}
        {/* Left Pill */}
        <rect 
          x="18" 
          y="28" 
          width="24" 
          height="62" 
          rx="12" 
          transform="rotate(-28 18 28)" 
          fill="url(#vylos-icon-white-grad)" 
          style={{ opacity: 0.95 }}
        />
        
        {/* Right Pill (Overlapping) */}
        <rect 
          x="58" 
          y="30" 
          width="24" 
          height="62" 
          rx="12" 
          transform="rotate(28 58 30)" 
          fill="url(#vylos-icon-white-grad)" 
          filter="url(#icon-depth)"
          style={{ opacity: 0.9 }}
        />
      </svg>
    </div>
  );
};
