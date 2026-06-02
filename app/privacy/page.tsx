"use client";

import React from "react";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="vylos-bg-premium min-h-screen py-16 px-6 font-inter text-white selection:bg-blue-500/30 relative">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <button 
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group font-black uppercase tracking-widest text-[11px] cursor-pointer"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="vylos-glass rounded-[40px] p-8 md:p-12 border border-white/10 shadow-2xl">
          <PrivacyPolicy />
        </div>
      </div>
    </div>
  );
}
