"use client";

import { useState, useEffect } from "react";
import { Shield, Pencil, Trash2, Plus, PiggyBank } from "lucide-react";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { formatMoney } from "@/lib/store";
import { BrainCircuit, Loader2, Target, CalendarClock, Activity } from "lucide-react";
import { computeGoalFeasibility } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

export default function Goals() {
  const { state, addGoal, updateGoal, deleteGoal, depositToGoal, withdrawFromGoal } = useAppStore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [createOpen, setCreateOpen]   = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [depositId, setDepositId]     = useState<string | null>(null);
  const [withdrawId, setWithdrawId]   = useState<string | null>(null);
  const [deleteId, setDeleteId]       = useState<string | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState({ title: "", targetAmount: "" });

  // Edit form
  const [editForm, setEditForm] = useState({ title: "", targetAmount: "" });

  // Deposit/Withdraw form
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleCreate() {
    if (!createForm.title.trim()) return toast("Enter a goal name", "error");
    const amt = parseFloat(createForm.targetAmount);
    if (isNaN(amt) || amt <= 0) return toast("Enter a valid target amount", "error");
    setIsLoading(true);
    try {
      await addGoal({ title: createForm.title.trim(), currentAmount: 0, targetAmount: amt });
      toast(`Goal "${createForm.title}" created!`, "success");
      setCreateOpen(false);
      setCreateForm({ title: "", targetAmount: "" });
    } catch (err: any) {
      toast(err.message || "Failed to create goal", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function openEdit(id: string) {
    const g = state.goals.find((g) => g.id === id);
    if (!g) return;
    setEditForm({ title: g.title, targetAmount: String(g.targetAmount) });
    setEditId(id);
  }

  async function handleEdit() {
    if (!editId) return;
    if (!editForm.title.trim()) return toast("Enter a goal name", "error");
    const amt = parseFloat(editForm.targetAmount);
    if (isNaN(amt) || amt <= 0) return toast("Enter a valid target", "error");
    
    setIsLoading(true);
    try {
      await updateGoal(editId, { title: editForm.title.trim(), targetAmount: amt });
      toast("Goal updated", "success");
      setEditId(null);
    } catch (err: any) {
      toast(err.message || "Failed to update goal", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeposit() {
    if (!depositId) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return toast("Enter a valid amount", "error");
    
    setIsLoading(true);
    try {
      await depositToGoal(depositId, amt);
      toast(`${formatMoney(amt, state.userProfile.country)} deposited`, "success");
      setDepositId(null);
      setDepositAmount("");
    } catch (err: any) {
      toast(err.message || "Failed to deposit", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleWithdraw() {
    if (!withdrawId) return;
    const g = state.goals.find((g) => g.id === withdrawId);
    if (!g) return;
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) return toast("Enter a valid amount", "error");
    if (amt > g.currentAmount) return toast("Cannot withdraw more than current balance", "error");
    
    setIsLoading(true);
    try {
      await withdrawFromGoal(withdrawId, amt);
      toast(`${formatMoney(amt, state.userProfile.country)} withdrawn`, "success");
      setWithdrawId(null);
      setWithdrawAmount("");
    } catch (err: any) {
      toast(err.message || "Failed to withdraw", "error");
    } finally {
      setIsLoading(false);
    }
  }

  const totalSaved = state.goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.targetAmount, 0);
  const overallPct = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

  if (!isMounted) return null;

  return (
    <div className="min-h-full flex flex-col items-center justify-start pt-12 px-8 max-w-4xl mx-auto pb-20">

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-12 w-full">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200/50 mb-6">
          <PiggyBank className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-black text-text-main tracking-tight mb-3">{t("goals")}</h1>
        <p className="text-text-muted font-medium max-w-lg leading-relaxed">
          {t("overview")}
        </p>

        {/* Overall progress card */}
        {state.goals.length > 0 && (
          <div className="mt-8 w-full max-w-md bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Total Progress</p>
                <p className="text-3xl font-black">{formatMoney(totalSaved, state.userProfile.country)}</p>
                <p className="text-indigo-200 text-sm mt-1">of {formatMoney(totalTarget, state.userProfile.country)}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black">{Math.floor(overallPct)}%</p>
                <p className="text-indigo-200 text-sm">funded</p>
              </div>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Goal Cards */}
      <div className="w-full space-y-4">
        {state.goals.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-border-subtle flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <p className="text-text-muted font-medium">No savings goals yet.</p>
            <p className="text-text-muted text-sm mt-1 opacity-70">Create your first goal to start tracking progress.</p>
          </div>
        )}

        {state.goals.map((g) => {
          const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
          const remaining = g.targetAmount - g.currentAmount;
          return (
            <div
              key={g.id}
              className="bg-card rounded-3xl p-7 shadow-sm border border-border-main flex items-center gap-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-border-subtle flex items-center justify-center border border-border-subtle flex-shrink-0">
                <Shield className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-text-main">{g.title}</h3>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-base font-bold text-primary">{formatMoney(g.currentAmount, state.userProfile.country)}</span>
                      <span className="text-sm text-text-muted">of {formatMoney(g.targetAmount, state.userProfile.country)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setWithdrawId(g.id)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-500 text-xs font-bold rounded-full hover:bg-red-500/20 transition-colors"
                      >
                        - Withdraw
                      </button>
                      <button
                        onClick={() => setDepositId(g.id)}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-full hover:opacity-90 transition-opacity"
                      >
                        + Deposit
                      </button>
                      <button onClick={() => openEdit(g.id)} className="p-2 text-text-muted hover:text-text-main hover:bg-border-subtle rounded-full transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(g.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Deterministic Feasibility Insight */}
                {(() => {
                  const feasibility = computeGoalFeasibility(state, g);
                  const statusColors = {
                    Realistic: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                    Moderate: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                    Difficult: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                    Unrealistic: "bg-red-500/10 text-red-600 border-red-500/20",
                  };

                  return (
                    <div className={`mb-4 p-4 rounded-2xl border ${statusColors[feasibility.status]}`}>
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                           <Activity className="w-3 h-3" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Reality Check: {feasibility.status}</p>
                         </div>
                         <p className="text-xs font-bold">{feasibility.monthsRemaining === Infinity ? "∞" : feasibility.monthsRemaining} Months to Goal</p>
                      </div>
                      
                      <p className="text-[11px] font-bold leading-relaxed mb-3">&quot;{feasibility.message}&quot;</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-current/10">
                         <div className="flex items-center gap-1.5">
                           <CalendarClock className="w-3 h-3 opacity-60" />
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Required Deposit</p>
                         </div>
                         <p className="text-xs font-black">{formatMoney(feasibility.requiredMonthlyDeposit, state.userProfile.country)}/mo</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Progress */}
                <div className="flex items-end gap-3">
                  <div className="flex-1 bg-border-subtle h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-emerald-500" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-text-main flex-shrink-0">{Math.floor(pct)}%</span>
                </div>

                {pct < 100 && (
                  <p className="text-xs text-text-muted font-medium mt-2">
                    {formatMoney(remaining, state.userProfile.country)} remaining to reach your target
                  </p>
                )}
                {pct >= 100 && (
                  <p className="text-xs text-emerald-500 font-bold mt-2">🎉 Goal achieved!</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Create New Goal Button */}
        <button
          onClick={() => setCreateOpen(true)}
          className="w-full h-28 rounded-3xl border-2 border-dashed border-border-main hover:border-primary/50 bg-transparent hover:bg-border-subtle transition-all flex flex-col items-center justify-center text-text-muted hover:text-primary gap-2"
        >
          <div className="w-9 h-9 rounded-xl bg-border-subtle flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-sm">Create New Savings Goal</span>
        </button>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────── */}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Savings Goal">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Goal Name</label>
            <input type="text" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. Emergency Fund, New Car"
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium bg-bg text-text-main focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Target Amount (R)</label>
            <input type="number" value={createForm.targetAmount} onChange={(e) => setCreateForm({ ...createForm, targetAmount: e.target.value })}
              placeholder="0.00" min="1"
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium bg-bg text-text-main focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={handleCreate} disabled={isLoading} className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-full text-sm transition-opacity">
            {isLoading ? "Saving..." : "Create Goal"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!editId} onClose={() => setEditId(null)} title="Edit Goal">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Goal Name</label>
            <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium bg-bg text-text-main focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Target Amount (R)</label>
            <input type="number" value={editForm.targetAmount} onChange={(e) => setEditForm({ ...editForm, targetAmount: e.target.value })}
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium bg-bg text-text-main focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={handleEdit} disabled={isLoading} className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-full text-sm transition-opacity">
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!depositId} onClose={() => { setDepositId(null); setDepositAmount(""); }} title="Add Funds">
        <div className="space-y-4">
          <p className="text-sm text-text-muted font-medium">
            How much would you like to add to <strong className="text-text-main">{state.goals.find((g) => g.id === depositId)?.title}</strong>?
          </p>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Amount (R)</label>
            <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00" min="1"
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium bg-bg text-text-main focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={handleDeposit} disabled={isLoading} className="w-full py-3 bg-emerald-500 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-full text-sm transition-opacity">
            {isLoading ? "Processing..." : "Deposit Funds"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!withdrawId} onClose={() => { setWithdrawId(null); setWithdrawAmount(""); }} title="Withdraw Funds">
        <div className="space-y-4">
          <p className="text-sm text-text-muted font-medium">
            How much would you like to withdraw from <strong className="text-text-main">{state.goals.find((g) => g.id === withdrawId)?.title}</strong>?
          </p>
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">Amount (R)</label>
            <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00" min="1"
              className="w-full h-11 rounded-xl border border-border-main px-4 text-sm font-medium bg-bg text-text-main focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={handleWithdraw} className="w-full py-3 bg-red-500 hover:opacity-90 text-white font-bold rounded-full text-sm transition-opacity">
            Confirm Withdrawal
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) { deleteGoal(deleteId); toast("Goal removed", "info"); }
        }}
        title="Delete Goal"
        message="This will permanently remove the goal and its progress."
      />
    </div>
  );
}

