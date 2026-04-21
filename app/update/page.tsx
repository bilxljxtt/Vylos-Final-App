"use client";

import { useState, useRef } from "react";
import { Wallet, MapPin, ShieldAlert, Sparkles, Cpu, CheckCircle2, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { formatMoney } from "@/lib/store";

interface BudgetRow {
  category: string;
  pct: number;
  amount: number;
}

interface AIOutput {
  headline: string;
  summary: string;
  table: BudgetRow[];
  recommendations: string[];
  goalsAllocated?: { id: string; title: string; amount: number }[];
}

const MONTHLY_INCOME = 28625; // derived from total budget limit as proxy

// Remote generation logic moved to /api/ai/analyze

const QUICK_COMMANDS = [
  { icon: Wallet, title: "Income Change", prompt: 'I just got a raise to R850,000/year and want to adjust my budget to reflect that.' },
  { icon: MapPin, title: "Relocation",    prompt: 'I moved to Cape Town. My rent is now R15,000 and transport costs have gone up.' },
  { icon: ShieldAlert, title: "Debt Consolidation", prompt: 'I want to focus purely on paying off my credit card debt of R45,000 as fast as possible.' },
];

export default function AiBudgetAdvisor() {
  const { state, depositToGoal } = useAppStore();
  const { toast } = useToast();

  const [prompt, setPrompt]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [output, setOutput]     = useState<AIOutput | null>(null);
  const outputRef               = useRef<HTMLDivElement>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return toast("Describe your financial situation first", "error");
    setLoading(true);
    setOutput(null);
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "budget", prompt, data: { budgets: state.budgets, goals: state.goals } }),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setOutput(result);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err: any) {
      toast(err.message || "Advisor currently unavailable", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (output?.goalsAllocated) {
      output.goalsAllocated.forEach((g) => depositToGoal(g.id, g.amount));
    }
    toast("Budget blueprint applied! Check your Budget and Goals pages.", "success");
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-start pt-12 px-8 max-w-4xl mx-auto pb-20">

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-text-main flex items-center justify-center shadow-sm mb-6">
          <Cpu className="w-8 h-8 text-bg" />
        </div>
        <h1 className="text-5xl font-black text-text-main tracking-tight mb-3">AI Advisor</h1>
        <p className="text-text-muted font-medium max-w-lg leading-relaxed">
          Describe your financial situation and our AI will reconstruct your entire budget blueprint.
        </p>
      </div>

      {/* Input Area */}
      <div className="w-full bg-card rounded-[3rem] p-8 shadow-sm border border-border-main flex flex-col relative mb-8 transition-colors">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleGenerate();
            }
          }}
          placeholder="e.g. I just got a raise and want to optimize my budget. I'm also trying to pay off credit card debt..."
          rows={6}
          className="w-full resize-none bg-transparent outline-none text-text-main placeholder-text-muted font-medium text-base leading-relaxed"
        />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            AI Model v2.0 · {prompt.length} chars
          </div>
          <div className="flex items-center gap-2">
            {prompt.length > 0 && (
              <button onClick={() => setPrompt("")} className="text-xs text-text-muted hover:text-text-main font-medium transition-colors">
                Clear
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 disabled:opacity-50 transition-colors rounded-full text-white font-bold shadow-md text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Protocol
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div className="w-full space-y-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-2xl shimmer" />
          ))}
        </div>
      )}

      {/* AI Output */}
      {output && !loading && (
        <div ref={outputRef} className="w-full space-y-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Headline card */}
          <div className="bg-card border border-border-main rounded-3xl p-7 text-text-main shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Protocol Generated</span>
            </div>
            <h2 className="text-2xl font-black mb-2">{output.headline}</h2>
            <p className="text-text-muted text-sm leading-relaxed">{output.summary}</p>
          </div>

          {/* Budget table */}
          <div className="bg-card rounded-3xl shadow-sm border border-border-main overflow-hidden">
            <div className="px-6 py-4 border-b border-border-main">
              <h3 className="font-bold text-text-main">Suggested Allocation</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-border-subtle text-xs font-bold uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="text-left px-6 py-3">Category</th>
                  <th className="text-center px-6 py-3">% of Income</th>
                  <th className="text-right px-6 py-3">Monthly Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {output.table.map((row) => (
                  <tr key={row.category} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-text-main">{row.category}</td>
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-border-main rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(row.pct, 100)}%` }} />
                        </div>
                        <span className="font-bold text-primary text-xs">{row.pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-text-main">{formatMoney(row.amount, state.userProfile.country)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          <div className="bg-card rounded-3xl shadow-sm border border-border-main p-6">
            <h3 className="font-bold text-text-main mb-4">Key Recommendations</h3>
            <ul className="space-y-3">
              {output.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-text-muted leading-relaxed">{rec}</p>
                </li>
              ))}
            </ul>
          </div>

          {output.goalsAllocated && output.goalsAllocated.length > 0 && (
            <div className="bg-border-subtle rounded-3xl shadow-sm border border-border-main p-6">
              <h3 className="font-bold text-text-main mb-4">Goal Deposits</h3>
              {output.goalsAllocated.map((g) => (
                <div key={g.id} className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-muted">Assign to <strong className="text-text-main">{g.title}</strong></p>
                  <p className="font-black text-primary">+{formatMoney(g.amount, state.userProfile.country)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Apply button */}
          <button
            onClick={handleApply}
            className="w-full py-4 bg-primary hover:opacity-90 text-white font-black rounded-2xl shadow-sm text-base transition-all"
          >
            Apply This Budget Blueprint →
          </button>
        </div>
      )}

      {/* Quick Commands */}
      <div className="w-full">
        <h3 className="text-xs font-black tracking-widest text-text-muted uppercase mb-5">Quick Commands</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {QUICK_COMMANDS.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.title}
                onClick={() => setPrompt(cmd.prompt)}
                className="bg-card rounded-2xl p-5 shadow-sm border border-border-main text-left hover:border-primary hover:shadow-md transition-all group relative"
              >
                <ArrowRight className="absolute top-5 right-5 w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                <div className="w-10 h-10 rounded-xl bg-border-subtle flex items-center justify-center border border-border-subtle mb-3">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-text-main mb-1.5">{cmd.title}</h3>
                <p className="text-xs text-text-muted font-medium leading-relaxed line-clamp-2">{cmd.prompt.substring(0, 80)}...</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
