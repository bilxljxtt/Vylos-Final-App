import { createClient } from "@/utils/supabase/server";

export interface AdvisorContext {
  income: number;
  expenses: number;
  netCashFlow: number;
  savingsRate: number;
  topSpending: { category: string; amount: number }[];
  budgetPerformance: { category: string; limit: number; spent: number; percent: number; over: boolean }[];
  goalProgress: { 
    id: string;
    title: string; 
    progress: number; 
    target: number; 
    current: number; 
    remaining: number;
    deadline: string;
    recommendedMonthly: number;
  }[];
  monthName: string;
  currency: string;
}

export class AdvisorEngine {
  static async getContext(userId: string): Promise<AdvisorContext> {
    const supabase = await createClient();
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM

    const [txsRes, budgetsRes, goalsRes, profileRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).filter('date', 'gte', `${currentMonthStr}-01`),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('user_profiles').select('currency').eq('id', userId).single()
    ]);

    const txs = txsRes.data || [];
    const budgets = budgetsRes.data || [];
    const goals = goalsRes.data || [];
    const currency = profileRes.data?.currency || "R";

    // 1. Basic Totals
    let income = 0;
    let expenses = 0;
    const catTotals: Record<string, number> = {};

    txs.forEach(t => {
      const amt = Number(t.amount);
      if (amt > 0) {
        income += amt;
      } else {
        const absAmt = Math.abs(amt);
        expenses += absAmt;
        catTotals[t.category] = (catTotals[t.category] || 0) + absAmt;
      }
    });

    // 2. Budget Performance
    const budgetPerf = budgets.map(b => {
      const spent = catTotals[b.category] || 0;
      const limit = Number(b.limit);
      return {
        category: b.category,
        limit,
        spent,
        percent: limit > 0 ? Math.round((spent / limit) * 100) : 0,
        over: spent > limit
      };
    });

    // 3. Goal Progress & Recommendations
    const goalPerf = goals.map(g => {
      const target = Number(g.target_amount);
      const current = Number(g.current_amount);
      const remaining = Math.max(0, target - current);
      const deadline = g.deadline; // ISO date string
      
      // Calculate months remaining
      const targetDate = new Date(deadline);
      const today = new Date();
      const monthDiff = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());
      const monthsLeft = Math.max(1, monthDiff);
      
      return {
        id: g.id,
        title: g.title,
        current,
        target,
        remaining,
        deadline,
        progress: Math.round((current / target) * 100),
        recommendedMonthly: remaining / monthsLeft
      };
    });

    // 4. Sorting & Metrics
    const topSpending = Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    const netCashFlow = income - expenses;
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

    return {
      income,
      expenses,
      netCashFlow,
      savingsRate,
      topSpending,
      budgetPerformance: budgetPerf,
      goalProgress: goalPerf,
      monthName: now.toLocaleString('default', { month: 'long' }),
      currency
    };
  }

  static generateFallbackResponse(intent: string, context: AdvisorContext): string {
    if (intent === "spending_analysis") {
      const top = context.topSpending[0];
      if (!top) return "You haven't recorded any spending this month yet. Start tracking to see where your money goes!";
      return `This month you've spent ${context.currency}${context.expenses.toLocaleString()}. Your biggest expense is ${top.category} at ${context.currency}${top.amount.toLocaleString()}.`;
    }

    if (intent === "budget_help") {
      const over = context.budgetPerformance.find(b => b.over);
      if (over) return `You have overspent in ${over.category} by ${context.currency}${(over.spent - over.limit).toLocaleString()}. Try to cut back in this area for the rest of ${context.monthName}.`;
      return "You are currently staying within all your budget limits. Great job!";
    }

    if (intent === "goal_progress") {
      const goal = context.goalProgress[0];
      if (!goal) return "You haven't set any goals yet. Setting a target is the first step to financial freedom!";
      return `Your goal '${goal.title}' is ${goal.progress}% complete. You have ${context.currency}${goal.current.toLocaleString()} saved toward your ${context.currency}${goal.target.toLocaleString()} target.`;
    }

    return "Here’s a simple way to look at it: review your recent transactions, compare them to your budget, and focus on one improvement for this week.";
  }
}
