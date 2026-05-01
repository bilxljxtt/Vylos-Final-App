"use client";

export function TransactionModal({ txForm, setTxForm, setShowAddTx, handleAddTransaction, autocat }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
      <div className="bg-card border border-border-main rounded-[3rem] p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500 ring-1 ring-border-strong/10">
        <h3 className="text-3xl font-black mb-8 tracking-tight text-text-main">Add Transaction</h3>
        <div className="space-y-6">
           <div className="flex bg-border-main/50 p-1.5 rounded-2xl border border-border-main">
              {["expense","income"].map(t=>(
                <button 
                  key={t} 
                  onClick={() => setTxForm((f: any) => ({ ...f, type: t }))} 
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${txForm.type === t ? 'bg-bg text-text-main shadow-lg border border-border-main' : 'text-text-muted hover:text-text-main'}`}
                >
                  {t}
                </button>
              ))}
           </div>
           <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Description</label>
              <input 
                className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl px-6 py-4 text-sm font-bold text-text-main outline-none transition-all placeholder:text-text-muted/30" 
                value={txForm.desc} 
                onChange={e => {
                  setTxForm((f: any) => ({ ...f, desc: e.target.value, cat: autocat(e.target.value) }));
                }} 
              />
           </div>
           <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Amount (R)</label>
              <input 
                className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl px-6 py-4 text-xl font-black text-text-main outline-none transition-all" 
                type="number" 
                value={txForm.amount} 
                onChange={e => setTxForm((f: any) => ({ ...f, amount: e.target.value }))} 
              />
           </div>
           <div className="flex gap-4 pt-4">
             <button className="flex-1 py-5 text-sm font-black text-text-muted hover:text-text-main transition-colors" onClick={() => setShowAddTx(false)}>Cancel</button>
             <button className="flex-1 py-5 bg-primary hover:bg-emerald-400 text-white text-sm font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95" onClick={handleAddTransaction}>Save</button>
           </div>
        </div>
      </div>
    </div>
  );
}

export function GoalModal({ goalForm, setGoalForm, setShowAddGoal, handleAddGoal }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
      <div className="bg-card border border-border-main rounded-[3rem] p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500 ring-1 ring-border-strong/10">
        <h3 className="text-3xl font-black mb-8 tracking-tight text-text-main">New Savings Goal</h3>
        <div className="space-y-6">
           <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Goal Title</label>
              <input 
                className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl px-6 py-4 text-sm font-bold text-text-main outline-none transition-all" 
                value={goalForm.name} 
                onChange={e => setGoalForm((f: any) => ({ ...f, name: e.target.value }))} 
              />
           </div>
           <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1 opacity-50">Target Amount (R)</label>
              <input 
                className="w-full bg-border-main/50 border border-border-main focus:border-primary/50 focus:bg-bg rounded-2xl px-6 py-4 text-xl font-black text-text-main outline-none transition-all" 
                type="number" 
                value={goalForm.target} 
                onChange={e => setGoalForm((f: any) => ({ ...f, target: e.target.value }))} 
              />
           </div>
           <div className="flex gap-4 pt-4">
             <button className="flex-1 py-5 text-sm font-black text-text-muted hover:text-text-main transition-colors" onClick={() => setShowAddGoal(false)}>Cancel</button>
             <button className="flex-1 py-5 bg-primary hover:bg-emerald-400 text-white text-sm font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95" onClick={handleAddGoal}>Create Goal</button>
           </div>
        </div>
      </div>
    </div>
  );
}
