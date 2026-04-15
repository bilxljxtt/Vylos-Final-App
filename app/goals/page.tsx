"use client";

import { useState } from "react";
import { Shield, Pencil, Trash2, Plus, PiggyBank } from "lucide-react";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAppStore } from "@/lib/AppContext";
import { useToast } from "@/components/Toast";
import { formatZAR } from "@/lib/store";

export default function Goals() {
  const { state, addGoal, updateGoal, deleteGoal, depositToGoal } = useAppStore();
  const { toast } = useToast();

  const [createOpen, setCreateOpen]   = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [depositId, setDepositId]     = useState<string | null>(null);
  const [deleteId, setDeleteId]       = useState<string | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState({ title: "", targetAmount: "" });

  // Edit form
  const [editForm, setEditForm] = useState({ title: "", targetAmount: "" });

  // Deposit form
  const [depositAmount, setDepositAmount] = useState("");

  function handleCreate() {
    if (!createForm.title.trim()) return toast("Enter a goal name", "error");
    const amt = parseFloat(createForm.targetAmount);
    if (isNaN(amt) || amt <= 0) return toast("Enter a valid target amount", "error");
    addGoal({ title: createForm.title.trim(), currentAmount: 0, targetAmount: amt });
    toast(`Goal "${createForm.title}" created!`, "success");
    setCreateOpen(false);
    setCreateForm({ title: "", targetAmount: "" });
  }

  function openEdit(id: string) {
    const g = state.goals.find((g) => g.id === id);
    if (!g) return;
    setEditForm({ title: g.title, targetAmount: String(g.targetAmount) });
    setEditId(id);
  }

  function handleEdit() {
    if (!editId) return;
    if (!editForm.title.trim()) return toast("Enter a goal name", "error");
    const amt = parseFloat(editForm.targetAmount);
    if (isNaN(amt) || amt <= 0) return toast("Enter a valid target", "error");
    updateGoal(editId, { title: editForm.title.trim(), targetAmount: amt });
    toast("Goal updated", "success");
    setEditId(null);
  }

  function handleDeposit() {
    if (!depositId) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return toast("Enter a valid amount", "error");
    depositToGoal(depositId, amt);
    toast(`${formatZAR(amt)} deposited`, "success");
    setDepositId(null);
    setDepositAmount("");
  }

  const totalSaved = state.goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.targetAmount, 0);
  const overallPct = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

  return (
    <div className="min-h-full flex flex-col items-center justify-start pt-12 px-8 max-w-4xl mx-auto pb-20">

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-12 w-full">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200/50 mb-6">
          <PiggyBank className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-black text-text-main tracking-tight mb-3">Savings &amp; Goals</h1>
        <p className="text-text-muted font-medium max-w-lg leading-relaxed">
          Track your progress towards financial freedom. Build and manage your savings buckets.
        </p>

        {/* Overall progress card */}
        {state.goals.length > 0 && (
          <div className="mt-8 w-full max-w-md bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Total Progress</p>
                <p className="text-3xl font-black">{formatZAR(totalSaved)}</p>
                <p className="text-indigo-200 text-sm mt-1">of {formatZAR(totalTarget)}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black">{overallPct.toFixed(0)}%</p>
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
                      <span className="text-base font-bold text-primary">{formatZAR(g.currentAmount)}</span>
                      <span className="text-sm text-text-muted">of {formatZAR(g.targetAmount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

                {/* Progress */}
                <div className="flex items-end gap-3">
                  <div className="flex-1 bg-border-subtle h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-emerald-500" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-text-main flex-shrink-0">{pct.toFixed(0)}%</span>
                </div>

                {pct < 100 && (
                  <p className="text-xs text-text-muted font-medium mt-2">
                    {formatZAR(remaining)} remaining to reach your target
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
          <button onClick={handleCreate} className="w-full py-3 bg-primary hover:opacity-90 text-white font-bold rounded-full text-sm transition-opacity">
            Create Goal
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
          <button onClick={handleEdit} className="w-full py-3 bg-primary hover:opacity-90 text-white font-bold rounded-full text-sm transition-opacity">
            Save Changes
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
          <button onClick={handleDeposit} className="w-full py-3 bg-emerald-500 hover:opacity-90 text-white font-bold rounded-full text-sm transition-opacity">
            Deposit Funds
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

// Missing import fix
function Target({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  );
}
