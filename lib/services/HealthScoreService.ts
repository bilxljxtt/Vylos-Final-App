import { createClient } from "@supabase/supabase-js";

// Lazy initialization for Supabase Admin to prevent build-time errors when env vars are missing
let _supabaseAdmin: any = null;

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
       console.warn("Supabase Admin credentials missing. Service logic may fail.");
    }
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
  }
  return _supabaseAdmin;
}

export interface HealthScoreBreakdown {
  income_stability: number;
  expense_control: number;
  savings_progress: number;
  budget_usage: number;
  bills_risk: number;
  monthly_income: number;
  monthly_expenses: number;
  expense_to_income_ratio: number;
  top_overspending_category: string;
}

export class HealthScoreService {
  /**
   * Recalculates the health score for a single user.
   */
  static async recalculateUserHealthScore(userId: string) {
    console.log(`Recalculating health score for user: ${userId}`);

    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();

      const [
        { data: profile },
        { data: recentTransactions },
        { data: budgets },
        { data: goals },
        { data: reminders },
        { data: subscriptions }
      ] = await Promise.all([
        getSupabaseAdmin().from('user_profiles').select('monthly_income').eq('id', userId).single(),
        // Fetch only last 3 months of transactions to reduce payload
        getSupabaseAdmin().from('transactions').select('transaction_date, date, amount, category').eq('user_id', userId).gte('transaction_date', threeMonthsAgo),
        getSupabaseAdmin().from('budgets').select('category, limit').eq('user_id', userId),
        getSupabaseAdmin().from('goals').select('current_amount, target_amount').eq('user_id', userId),
        getSupabaseAdmin().from('reminders').select('status, due_date').eq('user_id', userId),
        getSupabaseAdmin().from('subscriptions').select('id').eq('user_id', userId)
      ]);

      if (!profile) {
        throw new Error("User profile not found");
      }

      // 2. Perform Calculations
      const monthlyIncome = profile.monthly_income || 0;

      const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const transactions = recentTransactions || [];

      // Monthly Expenses
      const monthlyExpenses = transactions
        .filter((t: any) => {
          const date = t.transaction_date || t.date;
          return date && date.startsWith(currentMonthPrefix) && t.amount < 0;
        })
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

      const expenseToIncomeRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : (monthlyExpenses > 0 ? 2 : 0);

      // --- 1. Income Stability (20 pts) ---
      // For now, based on whether monthlyIncome is set and if there are salary-like transactions
      let income_stability = monthlyIncome > 0 ? 15 : 0;
      const hasIncomeTxs = (transactions || []).some((t: any) => t.amount > 0 && ["Salary", "Business Income"].includes(t.category));
      if (hasIncomeTxs) income_stability += 5;

      // --- 2. Expense Control (25 pts) ---
      // Scoring based on ratio: < 0.3 = 25, < 0.5 = 20, < 0.7 = 15, < 0.9 = 10, else 5
      let expense_control = 0;
      if (expenseToIncomeRatio < 0.3) expense_control = 25;
      else if (expenseToIncomeRatio < 0.5) expense_control = 20;
      else if (expenseToIncomeRatio < 0.7) expense_control = 15;
      else if (expenseToIncomeRatio < 0.9) expense_control = 10;
      else expense_control = 5;

      if (monthlyIncome === 0 && monthlyExpenses === 0) expense_control = 0; // No data case

      // --- 3. Savings Progress (20 pts) ---
      // Based on goal progress
      let savings_progress = 0;
      if (goals && goals.length > 0) {
        const avgProgress = goals.reduce((sum: number, g: any) => sum + (g.current_amount / (g.target_amount || 1)), 0) / goals.length;
        savings_progress = Math.round(Math.min(1, avgProgress) * 20);
      }

      // --- 4. Budget Usage (20 pts) ---
      // Based on how many budgets are within limits
      let budget_usage = 0;
      if (budgets && budgets.length > 0) {
        const withinLimit = budgets.filter((b: any) => {
          const catSpend = (transactions || [])
            .filter((t: any) => {
              const date = t.transaction_date || t.date;
              return date && date.startsWith(currentMonthPrefix) && t.category === b.category && t.amount < 0;
            })
            .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
          return catSpend <= (b.limit || 0);
        }).length;
        budget_usage = Math.round((withinLimit / budgets.length) * 20);
      }

      // --- 5. Bills Risk (15 pts) ---
      // Deduct points for overdue reminders or high upcoming bills
      let bills_risk = 15;
      const overdueCount = (reminders || []).filter((r: any) => r.status === 'overdue' || (r.status === 'pending' && new Date(r.due_date) < now)).length;
      bills_risk -= Math.min(15, overdueCount * 5);

      // --- Final Score ---
      let score = income_stability + expense_control + savings_progress + budget_usage + bills_risk;
      score = Math.max(0, Math.min(100, score));

      // New user handling
      const hasAnyData = (transactions?.length || 0) > 0 || (budgets?.length || 0) > 0 || (goals?.length || 0) > 0;
      
      let status = "Not enough data";
      if (!hasAnyData || (transactions?.length || 0) < 3) {
        score = 0;
        status = "Not enough data";
      } else if (score >= 85) status = "Excellent";
      else if (score >= 70) status = "Good";
      else if (score >= 40) status = "Fair";
      else status = "Poor";

      // Top Overspending Category
      const overspendingCat = budgets && budgets.length > 0 ? budgets.find((b: any) => {
        const catSpend = (transactions || [])
          .filter((t: any) => {
            const date = t.transaction_date || t.date;
            return date && date.startsWith(currentMonthPrefix) && t.category === b.category && t.amount < 0;
          })
          .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
        return catSpend > (b.limit || 0);
      })?.category || "None" : "None";

      const breakdown: HealthScoreBreakdown = {
        income_stability,
        expense_control,
        savings_progress,
        budget_usage,
        bills_risk,
        monthly_income: monthlyIncome,
        monthly_expenses: monthlyExpenses,
        expense_to_income_ratio: parseFloat(expenseToIncomeRatio.toFixed(2)),
        top_overspending_category: overspendingCat
      };

      // 3. Save to Supabase
      const { data: savedScore, error: saveError } = await getSupabaseAdmin()
        .from('user_health_scores')
        .insert([{
          user_id: userId,
          score,
          status,
          breakdown,
          calculated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (saveError) throw saveError;

      return { score, status, breakdown, savedScore };

    } catch (error) {
      console.error(`Error calculating health score for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Recalculates scores for all users.
   */
  static async recalculateAllUserHealthScores() {
    console.log("Recalculating all user health scores...");
    
    const { data: users, error: fetchError } = await getSupabaseAdmin()
      .from('user_profiles')
      .select('id');

    if (fetchError) throw fetchError;

    const results = [];
    const concurrency = 5;
    const userList = users || [];

    for (let i = 0; i < userList.length; i += concurrency) {
      const chunk = userList.slice(i, i + concurrency);
      const chunkPromises = chunk.map(async (user: any) => {
        try {
          const result = await this.recalculateUserHealthScore(user.id);
          return { userId: user.id, success: true, score: result.score };
        } catch (err) {
          console.error(`Failed to recalculate score for user ${user.id}:`, err);
          return { userId: user.id, success: false, error: err };
        }
      });
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    return results;
  }
}
