"use client";

import React, { useRef, useEffect } from "react";
import { ChevronLeft, Sparkles, Send, RefreshCw, Trash2, ArrowRight } from "lucide-react";
import { Message } from "@/components/views/AIAdvisorView";
import { MobilePageHeader } from "../../ui/MobilePageHeader";

interface AdvisorMobileProps {
  aiMessages: Message[];
  aiInput: string;
  setAiInput: (val: string) => void;
  sendAI: () => void;
  aiLoading: boolean;
  showToast: (msg: string, type: any) => void;
  userProfile?: any;
  setPage: (page: string) => void;
  setAiMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  dailyUsed?: number;
  monthlyUsed?: number;
}

export const AdvisorMobile: React.FC<AdvisorMobileProps> = ({
  aiMessages,
  aiInput,
  setAiInput,
  sendAI,
  aiLoading,
  showToast,
  setPage,
  setAiMessages
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, aiLoading]);

  const handleSuggestionClick = (prompt: string) => {
    setAiInput(prompt);
  };

  const handleClear = () => {
    if (confirm("Reset conversation history?")) {
      setAiMessages([
        { 
          role: "assistant", 
          content: "Hi! I'm Vylos AI, your personal financial advisor. Ask me anything about your savings, budgets, expenses, or financial health.", 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
      showToast("Conversation cleared", "info");
    }
  };

  const suggestions = [
    "How much have I saved?",
    "What are my top expenses?",
    "Analyze my budget",
    "How can I save more money?",
    "What is my financial health score?"
  ];

  return (
    <div className="w-full h-[calc(100vh-6rem)] flex flex-col max-w-md mx-auto px-1 animate-in fade-in duration-500 relative">
      {/* Header */}
      <MobilePageHeader
        title={
          <div className="flex items-center gap-1.5 justify-center">
            <Sparkles size={16} className="text-purple-500" />
            <span>AI Advisor</span>
          </div>
        }
        onBack={() => setPage("dashboard")}
        rightAction={
          <button 
            onClick={handleClear}
            className="p-2 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-lg transition-colors hover:text-red-500"
            aria-label="Clear chat"
          >
            <Trash2 size={14} />
          </button>
        }
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 no-scrollbar">
        {aiMessages.map((msg, i) => {
          const isAI = msg.role === "assistant";
          
          return (
            <div 
              key={i} 
              className={`flex flex-col max-w-[85%] ${isAI ? "self-start items-start" : "self-end items-end"}`}
            >
              <div 
                className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm border border-white/20
                  ${isAI 
                    ? "bg-white/70 dark:bg-slate-900/60 text-slate-950 dark:text-slate-50 rounded-tl-sm" 
                    : "bg-blue-600 text-white rounded-tr-sm"
                  }
                `}
              >
                {/* Simple Markdown support for bolding and line breaks */}
                <div className="whitespace-pre-line space-y-1">
                  {msg.content.split("\n").map((line: string, lineIdx: number) => {
                    // Check if bullet point
                    const isBullet = line.trim().startsWith("-") || line.trim().startsWith("*");
                    
                    // Simple replacement for markdown bolding: **text**
                    const parts = line.split("**");
                    const formattedLine = parts.map((part: string, partIdx: number) => 
                      partIdx % 2 === 1 ? <strong key={partIdx} className="font-extrabold">{part}</strong> : part
                    );

                    // Check for markdown buttons/links in response e.g., [Open Goals]
                    // If it contains a bracketed text like [Open Goals], render it as a button
                    const buttonMatch = line.match(/\[([^\]]+)\]/);
                    if (buttonMatch) {
                      const buttonText = buttonMatch[1];
                      let targetPage = "dashboard";
                      if (buttonText.toLowerCase().includes("goal")) targetPage = "goals";
                      else if (buttonText.toLowerCase().includes("budget")) targetPage = "budget";
                      else if (buttonText.toLowerCase().includes("trans") || buttonText.toLowerCase().includes("activ")) targetPage = "transactions";
                      else if (buttonText.toLowerCase().includes("cal")) targetPage = "calendar";
                      else if (buttonText.toLowerCase().includes("remind")) targetPage = "reminders";

                      return (
                        <div key={lineIdx} className="pt-2">
                          <button
                            onClick={() => setPage(targetPage)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-blue-500 hover:bg-blue-600 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white rounded-xl shadow-md border border-white/20 transition-all"
                          >
                            <span>{buttonText}</span>
                            <ArrowRight size={10} strokeWidth={3} />
                          </button>
                        </div>
                      );
                    }

                    if (isBullet) {
                      return (
                        <div key={lineIdx} className="pl-3 relative">
                          <span className="absolute left-0 top-0 text-blue-500">•</span>
                          <span>{formattedLine}</span>
                        </div>
                      );
                    }

                    return <p key={lineIdx}>{formattedLine}</p>;
                  })}
                </div>
              </div>
              <span className="text-[9px] font-bold mobile-muted mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}
        {aiLoading && (
          <div className="self-start flex flex-col max-w-[85%] items-start">
            <div className="p-4 bg-white/70 dark:bg-slate-900/50 rounded-2xl rounded-tl-sm border border-white/20 shadow-sm flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin text-purple-500" />
              <span className="text-xs mobile-muted font-bold">Vylos is analyzing...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion Chips */}
      {aiMessages.length <= 1 && !aiLoading && (
        <div className="shrink-0 py-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(s)}
                className="shrink-0 px-4 py-2 bg-white/60 dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-full text-[10px] font-black uppercase tracking-widest mobile-muted hover:border-blue-500 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Pinned Box */}
      <div className="shrink-0 pt-2 pb-4 bg-slate-900/0">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (aiInput.trim() && !aiLoading) {
              sendAI();
            }
          }}
          className="relative flex items-center w-full"
        >
          <input 
            type="text" 
            placeholder="Ask Vylos anything..." 
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            disabled={aiLoading}
            className="w-full pl-5 pr-14 py-3.5 vylos-glass-input rounded-2xl text-[12px] font-black focus:outline-none focus:border-blue-500 shadow-sm transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!aiInput.trim() || aiLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400/20 text-white rounded-xl flex items-center justify-center transition-all disabled:text-slate-400"
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
