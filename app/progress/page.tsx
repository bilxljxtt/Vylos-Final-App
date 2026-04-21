"use client";

import { useState, useMemo, useEffect } from "react";
import { Share2, TrendingUp, TrendingDown, Target, Shield, MessageSquare, Info, BrainCircuit } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { computeHealthScoreMetrics } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

interface Post {
  id: string;
  author: string;
  text: string;
  time: string;
}

const INITIAL_RANKINGS = [
  { rank: 1,  initial: "A", name: "Arav Sookoo",       role: "Analyst",  efficiency: 97.5, trend: "up"   as const, isYou: false },
  { rank: 2,  initial: "T", name: "Test Verify User",   role: "Novice",   efficiency: 100,  trend: "up"   as const, isYou: false },
  { rank: 3,  initial: "J", name: "Jane Doe",           role: "Novice",   efficiency: 100,  trend: "up"   as const, isYou: false },
  { rank: 4,  initial: "S", name: "Suresh P",           role: "Broker",   efficiency: 100,  trend: "up"   as const, isYou: false },
  { rank: 5,  initial: "A", name: "Alice Smith",        role: "Novice",   efficiency: 100,  trend: "up"   as const, isYou: false },
  { rank: 11, initial: "P", name: "Prem",               role: "Analyst",  efficiency: 91.5, trend: "up"   as const, isYou: false },
  { rank: 12, initial: "D", name: "Diya",               role: "Analyst",  efficiency: 0,    trend: "down" as const, isYou: false },
  { rank: 13, initial: "B", name: "Bilal",              role: "Analyst",  efficiency: 60.8, trend: "down" as const, isYou: true },
];

const INITIAL_POSTS: Post[] = [
  { id: "p1", author: "Arav Sookoo",  text: "Automate your savings on payday. Pay yourself first — no willpower required.", time: "2h ago" },
  { id: "p2", author: "Suresh P",     text: "Index funds beat 90% of managed funds over 20 years. Stop overthinking it.", time: "5h ago" },
];

export default function ProgressBoard() {
  const { state } = useAppStore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [broadcastText, setBroadcastText] = useState("");
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [rankings] = useState(INITIAL_RANKINGS);

  const [isMounted, setIsMounted] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDirective, setAiDirective] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    loadAIDirective();
  }, []);

  const metrics = useMemo(() => computeHealthScoreMetrics(state), [state]);
  const score = metrics.score;
  const myRow = rankings.find((r) => r.isYou)!;

  async function loadAIDirective() {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode: "progress", 
          data: { rank: myRow.rank, score, efficiency: myRow.efficiency } 
        }),
      });
      const data = await response.json();
      if (data.directive) {
        setAiDirective(data.directive);
      }
    } catch (err) {
      console.error("AI Directive Error:", err);
    } finally {
      setAiLoading(false);
    }
  }

  // Compute XP from goals + budget adherence
  const goalsHit   = state.goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  const xpPerGoal  = 300;
  const xp         = Math.min(goalsHit * xpPerGoal, 1500);
  const xpToNext   = 1500 - xp;
  const xpPct      = (xp / 1500) * 100;

  function handleBroadcast() {
    if (!broadcastText.trim()) return toast("Type something to broadcast", "error");
    const newPost: Post = {
      id: Math.random().toString(36).slice(2),
      author: state.userProfile.name,
      text: broadcastText.trim(),
      time: "Just now",
    };
    setPosts((prev) => [newPost, ...prev]);
    setBroadcastText("");
    toast("Intel broadcasted to the network!", "success");
  }

  function handleShare() {
    const shareText = `📊 My Vylos Financial Rank #${myRow.rank} — Health Score: ${score}/100`;
    navigator.clipboard?.writeText(shareText).then(() => {
      toast("Rank copied to clipboard!", "success");
    }).catch(() => {
      toast("Rank: " + shareText, "info");
    });
  }

  if (!isMounted) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">

      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black text-text-main tracking-tight">{t("progress")}</h1>
          <p className="text-text-muted font-medium mt-2 max-w-xl">
            {t("overview")}
          </p>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border-main rounded-full text-sm font-bold text-text-main shadow-sm hover:bg-border-subtle transition-colors"
        >
          <Share2 className="w-4 h-4" /> Share Rank
        </button>
      </header>

      {/* GAMIFICATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Status Card */}
        <div className="col-span-1 lg:col-span-5 relative bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-[3rem] p-10 shadow-xl text-white overflow-hidden flex flex-col justify-between min-h-[400px]">
          <Target className="absolute -top-10 -right-10 w-64 h-64 text-white opacity-5" />

          <div className="relative z-10 flex items-start justify-between mb-8">
            <div>
              <p className="text-indigo-300 font-bold tracking-widest text-xs uppercase mb-2">Operative Status</p>
              <h2 className="text-5xl font-black tracking-tight mb-2">{myRow.role}</h2>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold">
                Global Rank <span className="text-amber-400">#{myRow.rank}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border border-indigo-400/50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-300" />
            </div>
          </div>

          {/* Health score inline */}
          <div className="relative z-10 bg-white/10 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Health Score</span>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  metrics.label === "Poor" ? "bg-red-500 text-white" :
                  metrics.label === "Fair" ? "bg-amber-500 text-white" :
                  metrics.label === "Good" ? "bg-yellow-400 text-black" :
                  "bg-emerald-500 text-white"
                }`}>
                  {metrics.label}
                </span>
                <span className="text-white font-black text-2xl">{score}</span>
              </div>
            </div>
            
            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden mb-4">
              <div className={`h-full rounded-full transition-all duration-700 ${
                  metrics.label === "Poor" ? "bg-red-500" :
                  metrics.label === "Fair" ? "bg-amber-500" :
                  metrics.label === "Good" ? "bg-yellow-400" :
                  "bg-emerald-500"
                }`} style={{ width: `${score}%` }} />
            </div>

            <p className="text-[11px] text-indigo-300 font-medium italic leading-relaxed mb-4">
              Your Financial Health Score is based on your income, expenses, savings rate, and debt levels.
            </p>

            {/* Breakdown Sub-grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-black/10 rounded-xl p-3 border border-white/5 mb-6">
              <div>
                <p className="text-indigo-300/70 font-semibold mb-0.5">Cash Flow</p>
                <p className={`font-bold ${metrics.cashFlowState === "Positive" ? "text-emerald-400" : metrics.cashFlowState === "Tight" ? "text-yellow-400" : "text-red-400"}`}>{metrics.cashFlowState}</p>
              </div>
              <div>
                <p className="text-indigo-300/70 font-semibold mb-0.5">Debt Level</p>
                <p className={`font-bold ${metrics.debtLevel === "Low" ? "text-emerald-400" : metrics.debtLevel === "Moderate" ? "text-yellow-400" : "text-red-400"}`}>{metrics.debtLevel}</p>
              </div>
              <div>
                <p className="text-indigo-300/70 font-semibold mb-0.5">Savings Rate</p>
                <p className={`font-bold ${metrics.savingsRate === "High" ? "text-emerald-400" : metrics.savingsRate === "Moderate" ? "text-yellow-400" : "text-red-400"}`}>{metrics.savingsRate}</p>
              </div>
              <div>
                <p className="text-indigo-300/70 font-semibold mb-0.5">Net Worth</p>
                <p className={`font-bold ${metrics.netWorthState === "High" || metrics.netWorthState === "Healthy" ? "text-emerald-400" : metrics.netWorthState === "Low" ? "text-yellow-400" : "text-red-400"}`}>{metrics.netWorthState}</p>
              </div>
            </div>

            {/* AI Operative Intel */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-20">
                  <BrainCircuit className="w-8 h-8 text-amber-400" />
               </div>
               <p className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-2 font-mono">AI Operative Intel</p>
               {aiLoading ? (
                 <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
               ) : (
                 <p className="text-xs font-bold text-white leading-relaxed italic">
                   &quot;{aiDirective || "Analyzing your trajectory... stand by."}&quot;
                 </p>
               )}
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wider">
              <span>XP Progress</span>
              <span className="text-white">{xp} / 1500 XP</span>
            </div>
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${xpPct}%` }} />
            </div>
            <p className="text-xs font-medium text-indigo-300 mb-8">
              {xpToNext > 0 ? `${xpToNext} XP until promotion to Broker` : "Ready for promotion!"}
            </p>

            <div className="flex items-center gap-6 pt-6 border-t border-indigo-700/50">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Goals Hit</p>
                  <p className="font-bold text-lg">{goalsHit}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Score</p>
                  <p className="font-bold text-lg">{score}/100</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rankings Table */}
        <div className="col-span-1 lg:col-span-7 bg-card rounded-[3rem] p-8 flex flex-col shadow-sm border border-border-main min-h-[400px]">
          <h3 className="text-xl font-bold text-text-main tracking-tight mb-6 ml-2">Operative Rankings</h3>

          <div className="flex-1 w-full bg-border-subtle rounded-[2rem] border border-border-main overflow-hidden flex flex-col">
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-border-main text-xs font-bold text-text-muted uppercase tracking-wider">
              <div className="col-span-2">Rank</div>
              <div className="col-span-6">Operative</div>
              <div className="col-span-3 text-right">
                Efficiency <Info className="inline w-3 h-3 text-text-muted ml-0.5" />
              </div>
              <div className="col-span-1 text-right">↑↓</div>
            </div>

            <div className="flex-1 overflow-y-auto pb-2">
              {rankings.map((user) => (
                <div
                  key={user.rank}
                  className={`grid grid-cols-12 gap-4 px-6 py-3.5 items-center transition-colors ${
                    user.isYou
                      ? "bg-primary text-white"
                      : "hover:bg-card/50 text-text-main"
                  }`}
                >
                  <div className="col-span-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${user.isYou ? "bg-white text-primary" : "bg-primary/20 text-primary"}`}>
                      {user.rank}
                    </div>
                  </div>
                  <div className="col-span-6 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                      ${user.isYou ? "bg-white/20 text-white" : "bg-border-main text-text-main"}`}>
                      {user.initial}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${user.isYou ? "text-white" : "text-text-main"}`}>
                        {user.isYou ? (state.userProfile.name || "Alex Morgan") : user.name}
                        {user.isYou && (
                          <span className="ml-2 text-[10px] bg-white text-primary px-1.5 py-0.5 rounded-full font-black uppercase">You</span>
                        )}
                      </p>
                      <p className={`text-xs font-medium ${user.isYou ? "text-white/80" : "text-text-muted"}`}>{user.role}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className={`font-bold text-sm ${user.isYou ? "text-white" : user.efficiency >= 80 ? "text-emerald-500" : "text-amber-500"}`}>
                      {user.efficiency}%
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {user.trend === "up"
                      ? <TrendingUp className={`w-4 h-4 ${user.isYou ? "text-emerald-300" : "text-emerald-500"}`} />
                      : <TrendingDown className={`w-4 h-4 ${user.isYou ? "text-red-300" : "text-red-500"}`} />
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FIELD INTEL */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-5 h-5 text-text-main" />
          <h3 className="text-xl font-bold text-text-main">Field Intel</h3>
          <span className="bg-primary text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">Community</span>
          <span className="ml-auto text-sm text-text-muted font-medium">Strategies &amp; tips from the network</span>
        </div>

        {/* Broadcast */}
        <div className="flex gap-4 mb-6">
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center font-bold text-white flex-shrink-0 text-sm">
            {state.userProfile.name[0]}
          </div>
          <div className="flex-1 bg-card border border-border-main rounded-3xl p-4 relative shadow-sm">
            <textarea
              rows={3}
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleBroadcast();
                }
              }}
              placeholder="Share a financial strategy with the network..."
              className="w-full resize-none outline-none bg-transparent placeholder-text-muted text-text-main text-sm font-medium"
            />
            <button
              onClick={handleBroadcast}
              className="absolute bottom-4 right-4 bg-primary hover:opacity-90 transition-opacity rounded-full px-5 py-2 text-white text-sm font-bold shadow-sm"
            >
              Broadcast
            </button>
          </div>
        </div>

        {/* Post feed */}
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-card rounded-2xl p-5 border border-border-main shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-border-subtle flex items-center justify-center font-bold text-primary text-xs flex-shrink-0">
                  {post.author[0]}
                </div>
                <div>
                  <p className="font-bold text-text-main text-sm">{post.author}</p>
                  <p className="text-xs text-text-muted">{post.time}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-text-main leading-relaxed">{post.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
