import { AppState, Transaction, Goal, BudgetCategory, formatMoney, getMonthStart } from "./store";
import { getTransactionDateKey, toDateKey, createLocalDate } from "./utils";
import { VylosCalculations, TransactionIndex } from "./vylosCalculations";

// ─── VYLOS INTELLIGENCE ENGINE — SPEC V2 (FORMULA-BASED SYSTEM) ───────────────

export interface Insight {
  severity: 'positive' | 'neutral' | 'warning' | 'critical';
  reason: string;
  action: string;
  buttonLabel: string;
  page: string;
}

export interface EngineOutput {
  healthScore: number;
  healthCategory: string;
  dailySpendingLimit: number;
  monthlyBudget: number;
  burnRateMonths: number;
  burnRateCategory: string;
  goalFeasibilityScore: number;
  goalFeasibilityStatus: string;
  goalRecommendation: string;
  xp: number;
  tier: string;
  weeklyImprovement: number;
  weeklyVerdict: string;
  insightSummary: string;
  recommendation: string;
  insights: Insight[];
}

export class VylosEngine {
  static INFLATION_DEFAULT = 0.055;
  static GROWTH_RATE_DEFAULT = 0.10;
  static VOLATILITY_BUFFER_DEFAULT = 0.05;

  /**
   * SYSTEM 1: HEALTH SCORE ENGINE
   * Unified with backend HealthScoreService point system.
   */
  static computeHealthScore(state: AppState, index?: TransactionIndex) {
    const income = state.userProfile.monthlyIncome || 0;
    const now = new Date();
    const currentMonthPrefix = getMonthStart().slice(0, 7);
    
    // 1. Monthly Expenses
    const monthlyExpenses = this.getCurrentMonthExpenses(state, index);

    const ratio = income > 0 ? monthlyExpenses / income : (monthlyExpenses > 0 ? 2 : 0);

    // --- 1. Income Stability (20 pts) ---
    let Q = income > 0 ? 15 : 0;
    const hasIncomeTxs = state.transactions.some(t => t.amount > 0 && ["Salary", "Business Income"].includes(t.category));
    if (hasIncomeTxs) Q += 5;

    // --- 2. Expense Control (25 pts) ---
    let C = 0;
    if (ratio < 0.3) C = 25;
    else if (ratio < 0.5) C = 20;
    else if (ratio < 0.7) C = 15;
    else if (ratio < 0.9) C = 10;
    else C = 5;
    if (income === 0 && monthlyExpenses === 0) C = 0;

    // --- 3. Savings Progress (20 pts) ---
    let G = 0;
    if (state.goals.length > 0) {
      const avgProgress = state.goals.reduce((sum, g) => sum + (g.currentAmount / (g.targetAmount || 1)), 0) / state.goals.length;
      G = Math.round(Math.min(1, avgProgress) * 20);
    }

    // --- 4. Budget Usage (20 pts) ---
    let D = 0;
    const budgets = Object.entries(state.budgets);
    if (budgets.length > 0) {
      const withinLimit = budgets.filter(([cat, b]) => {
        const catSpend = (index ? (index.monthMap[currentMonthPrefix] || []) : state.transactions)
          .filter(t => {
            const dateKey = getTransactionDateKey(t);
            return dateKey.startsWith(currentMonthPrefix) && t.category === cat && t.amount < 0;
          })
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return catSpend <= (b.limit || 0);
      }).length;
      D = Math.round((withinLimit / budgets.length) * 20);
    }

    // --- 5. Bills Risk (15 pts) ---
    let billsRisk = 15;
    const overdueCount = state.reminders.filter(r => r.status === 'overdue' || (r.status === 'pending' && new Date(r.due_date) < now)).length;
    billsRisk -= Math.min(15, overdueCount * 5);

    const part1 = Math.floor(billsRisk / 3);
    const part2 = Math.floor((billsRisk + 1) / 3);
    const part3 = billsRisk - part1 - part2;

    const healthScore = Math.max(0, Math.min(100, Math.round(Q + C + G + D + billsRisk)));
    
    let category = "Poor";
    const hasAnyData = state.transactions.length > 0 || budgets.length > 0 || state.goals.length > 0;
    
    if (!hasAnyData || state.transactions.length < 3) {
      category = "Not enough data";
      return { score: 0, category, components: { Q: 0, D: 0, C: 0, G: 0 } };
    }
    
    if (healthScore >= 85) category = "Excellent";
    else if (healthScore >= 70) category = "Good";
    else if (healthScore >= 40) category = "Fair";
    else category = "Poor"; 

    return { 
      score: healthScore, 
      category, 
      components: { 
        Q: (Q + part1) / 25, 
        D: (D + part2) / 25, 
        C: C / 25, 
        G: (G + part3) / 25 
      } 
    }; 
  }

  /**
   * SYSTEM 2: BUDGET ENGINE
   * Budget = (Income - Goal Contributions) * CostFactor * (1 + Inflation)
   */
  static computeBudget(state: AppState, index?: TransactionIndex) {
    const totalLimit = Object.values(state.budgets).reduce((sum, b) => sum + (b?.limit || 0), 0);
    const totalSpent = this.getCurrentMonthExpenses(state, index);
    
    // Calculate remaining days in month
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);
    
    const remainingBudget = Math.max(0, totalLimit - totalSpent);
    const dailyLimit = totalLimit > 0 ? (remainingBudget / remainingDays) : 0;

    return { monthlyBudget: totalLimit, dailyLimit };
  }

  /**
   * SYSTEM 3: GOAL FEASIBILITY ENGINE
   * F = ((Free Income * Time) - (Time * VolatilityBuffer)) / Goal Total
   */
  static computeGoalFeasibility(state: AppState, index?: TransactionIndex) {
    if (state.goals.length === 0) return { score: 0, status: "No Goals", requiredMonthlyContribution: 0, recommendation: "Set a financial goal to start tracking." };

    const income = state.userProfile.monthlyIncome || 0;
    const survivalCost = this.estimateSurvivalCost(state);
    const debtPayments = this.getDebtPayments(state, index);
    const existingGoalContribs = this.estimateMonthlyGoalContributions(state);
    
    const freeIncome = income - survivalCost - debtPayments - existingGoalContribs;
    const totalGoalTarget = state.goals.reduce((acc, g) => acc + Math.max(0, g.targetAmount - g.currentAmount), 0);
    
    // Default time 12 months for calculation
    const time = 12; 
    const volatilityBuffer = 0.05 * freeIncome;

    if (totalGoalTarget <= 0) return { score: 1.2, status: "Good", requiredMonthlyContribution: 0, recommendation: "Goals already achieved!" };

    const F = totalGoalTarget > 0 ? ((freeIncome * time) - (time * volatilityBuffer)) / totalGoalTarget : 1.2;
    const requiredMonthlyContribution = totalGoalTarget / time;

    let status = "Not feasible";
    let recommendation = "Reduce non-essential spending or extend your timeline.";
    
    if (F >= 1.2) {
      status = "Good";
      recommendation = "You are on track to meet your goals!";
    } else if (F >= 1.0) {
      status = "Tight";
      recommendation = "Manage expenses closely to stay on target.";
    }

    return { score: F, status, requiredMonthlyContribution, recommendation };
  }

  static computeBurnRate(state: AppState) {
    const totalSavings = state.goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const survivalCost = this.estimateSurvivalCost(state);
    
    if (survivalCost === 0 && totalSavings === 0) {
      return { months: 0, category: "No liquid savings or survival expenses found." };
    }

    const B = survivalCost > 0 ? totalSavings / survivalCost : Infinity;

    let category = "Critical";
    if (B >= 6) category = "Secure";
    else if (B >= 3) category = "Adequate";
    else if (B >= 1) category = "Vulnerable";

    return { months: B === Infinity ? 99 : parseFloat(B.toFixed(1)), category };
  }

  /**
   * SYSTEM 5: OPPORTUNITY COST ENGINE
   * Oc = Spend * (1 + GrowthRate)^Years
   */
  static computeOpportunityCost(spend: number, years: number = 10) {
    const growthRate = this.GROWTH_RATE_DEFAULT;
    const futureValue = spend * Math.pow(1 + growthRate, years);
    return {
      futureValue,
      message: `If invested, this ${spend} could grow to ${futureValue.toFixed(2)} in ${years} years.`
    };
  }

  /**
   * SYSTEM 6: LIFESTYLE CREEP ENGINE
   * Lc = ΔNonEssential / ΔIncome
   */
  static computeLifestyleCreep(state: AppState, index?: TransactionIndex) {
    // Simplified: comparing current month to previous 6-month average (simulated)
    const currentNonEssential = this.getNonEssentialSpending(state, index);
    const income = state.userProfile.monthlyIncome || 1;
    
    // For demonstration, we compare to a baseline of 50% of income
    const baselineNonEssential = income * 0.5;
    const ratio = currentNonEssential / baselineNonEssential;

    let trend = "Controlled";
    let warning = "";
    if (ratio > 1.2) {
      trend = "Negative";
      warning = "Your non-essential spending is growing faster than your income baseline.";
    }

    return { ratio, trend, warning };
  }

  /**
   * SYSTEM 7: XP & TIER ENGINE
   * Daily XP = Health Score * Multiplier
   */
  static computeGamification(state: AppState, healthScore: number) {
    // Calculate account age in days to give a sense of progression
    const createdAt = state.userProfile?.created_at ? new Date(state.userProfile.created_at) : new Date();
    const daysSinceStart = Math.max(1, Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
    
    // XP = Health Score * Days Active * consistency multiplier
    const xp = healthScore * daysSinceStart * 1.5;

    let tier = "Starter";
    if (xp >= 60000) tier = "Elite";
    else if (xp >= 20000) tier = "Achiever";
    else if (xp >= 5000) tier = "Builder";

    return { xp, tier };
  }

  static computeWeeklyJudgement(state: AppState, currentScore: number, index?: TransactionIndex) {
    // Compare current month health with previous month health if available
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    
    const prevMonthTxs = index ? (index.monthMap[prevMonthPrefix] || []) : state.transactions.filter(t => getTransactionDateKey(t).startsWith(prevMonthPrefix));
    
    // If no previous data, assume current as baseline
    const lastMonthScore = prevMonthTxs.length > 0 ? this.computeHealthScore({...state, transactions: prevMonthTxs}).score : currentScore;
    
    const improvement = lastMonthScore > 0 ? ((currentScore - lastMonthScore) / lastMonthScore) * 100 : 0;

    let verdict = "Stay consistent.";
    if (improvement > 5) verdict = "Excellent progress this week!";
    else if (improvement < -5) verdict = "A tough week. Let's get back on track.";

    return { improvement: parseFloat(improvement.toFixed(1)), verdict };
  }

  /**
   * EXPLANATION ENGINE
   */
  static explainHealthScoreChange(prevScore: number, currentScore: number, deltas: any) {
    const { Q, D, C, G } = deltas;
    
    if (currentScore > prevScore) {
      if (G > 0) return "You are making faster progress toward your savings goals.";
      if (C > 0) return "Your consistent spending discipline improved your score.";
      return "Your financial health is trending upward.";
    }

    // Find largest negative change
    const components = [
      { name: 'C', val: C, msg: "You exceeded your daily budget, reducing your consistency score." },
      { name: 'Q', val: Q, msg: "Your available savings buffer decreased." },
      { name: 'D', val: D, msg: "Debt payments are taking up more of your income." },
      { name: 'G', val: G, msg: "You are falling behind on your savings goal." }
    ];

    const negative = components.filter(c => c.val < 0).sort((a, b) => a.val - b.val);
    
    if (negative.length >= 2) {
      return "Your score dropped due to overspending and slower progress toward your goal.";
    } else if (negative.length === 1) {
      return negative[0].msg;
    }

    return "No major changes in your financial behaviour.";
  }

  static generateUserInsights(state: AppState, output: any): Insight[] {
    const income = state.userProfile.monthlyIncome || 0;
    const hasBudgets = Object.keys(state.budgets).length > 0;
    const hasTransactions = state.transactions.length > 0;
    const hasGoals = state.goals.length > 0;

    const insights: Insight[] = [];

    if (income === 0) {
      insights.push({
        severity: 'critical',
        reason: "Your monthly income is not set.",
        action: "Add your income to calculate your daily limit.",
        buttonLabel: "Set Up Income",
        page: "settings"
      });
    }

    if (!hasBudgets) {
      insights.push({
        severity: 'warning',
        reason: "No active budget found.",
        action: "Create a budget to unlock spending guidance.",
        buttonLabel: "Create Budget",
        page: "budget"
      });
    }

    if (!hasTransactions) {
      insights.push({
        severity: 'neutral',
        reason: "No transactions added yet.",
        action: "Add your first transaction to unlock spending insights.",
        buttonLabel: "Add Transaction",
        page: "transactions"
      });
    }

    if (!hasGoals) {
      insights.push({
        severity: 'neutral',
        reason: "No savings goals found.",
        action: "Create a goal to unlock goal tracking.",
        buttonLabel: "Create Goal",
        page: "goals"
      });
    }

    if (output.burnRateMonths < 1 && income > 0 && output.burnRateMonths > 0) {
      insights.push({
        severity: 'critical',
        reason: "Your emergency savings are critically low.",
        action: "Prioritize building an emergency fund.",
        buttonLabel: "View Goals",
        page: "goals"
      });
    }

    if (output.healthScore < 40 && income > 0) {
      insights.push({
        severity: 'warning',
        reason: "Your financial health is at risk.",
        action: "Focus on reducing non-essential spending.",
        buttonLabel: "View Budget",
        page: "budget"
      });
    }

    // Goal Specific Insights
    if (hasGoals) {
      const feasibility = this.computeGoalFeasibility(state);
      const activeGoals = state.goals.filter(g => g.currentAmount < g.targetAmount);
      
      if (feasibility.status === "Not feasible") {
        insights.push({
          severity: 'warning',
          reason: "Some goals may be unrealistic.",
          action: `Based on free income, you're short on goal funding.`,
          buttonLabel: "Adjust Goals",
          page: "goals"
        });
      } else if (activeGoals.length > 0) {
        const required = feasibility.requiredMonthlyContribution;
        insights.push({
          severity: 'positive',
          reason: "You have a clear path to your goals.",
          action: `Save ${formatMoney(required, state.userProfile.currency)} monthly to stay on track.`,
          buttonLabel: "View Goals",
          page: "goals"
        });
      }
    }

    // Reminder Specific Insights
    const upcomingRems = state.reminders.filter(r => r.status === 'pending');
    const overdueRems = upcomingRems.filter(r => new Date(r.due_date) < new Date());
    
    if (overdueRems.length > 0) {
      insights.push({
        severity: 'critical',
        reason: `${overdueRems.length} reminder${overdueRems.length > 1 ? 's are' : ' is'} overdue.`,
        action: "Clear your overdue financial tasks now.",
        buttonLabel: "View Overdue",
        page: "reminders"
      });
    } else {
      const soonRems = upcomingRems.filter(r => {
        const diff = new Date(r.due_date).getTime() - new Date().getTime();
        return diff > 0 && diff < (3 * 24 * 60 * 60 * 1000); // 3 days
      });
      if (soonRems.length > 0) {
        insights.push({
          severity: 'warning',
          reason: `You have ${soonRems.length} bill${soonRems.length > 1 ? 's' : ''} due soon.`,
          action: "Check your upcoming reminders to stay prepared.",
          buttonLabel: "Check Reminders",
          page: "reminders"
        });
      }
    }

    // Limit to 3 insights
    return insights.sort((a, b) => {
      const priority = { critical: 0, warning: 1, neutral: 2, positive: 3 };
      return priority[a.severity] - priority[b.severity];
    }).slice(0, 3);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private static estimateSurvivalCost(state: AppState) {
    const budgets = Object.values(state.budgets);
    if (budgets.length === 0) return 0;
    
    const bills = state.budgets["Bills"]?.limit || 0;
    const food = state.budgets["Groceries"]?.limit || 0;
    const rent = state.budgets["Rent / Housing"]?.limit || 0;
    const transport = state.budgets["Transport"]?.limit || 0;
    const health = state.budgets["Health"]?.limit || 0;
    
    const totalLimit = budgets.reduce((acc, b) => acc + (b.type === 'limit' ? b.limit : 0), 0);
    
    const essentialSum = bills + food + rent + transport + health;
    return essentialSum > 0 ? essentialSum : (totalLimit * 0.7);
  }

  private static getDebtPayments(state: AppState, index?: TransactionIndex) {
    // Derive debt payments from actual transactions in the current month
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const txs = index ? (index.monthMap[currentMonthPrefix] || []) : state.transactions;

    return txs
      .filter(t => {
        const dateKey = getTransactionDateKey(t);
        return dateKey.startsWith(currentMonthPrefix) && t.category === 'Debt Payments' && t.amount < 0;
      })
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }

  private static calculateConsistency(state: AppState) {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = createLocalDate(now.getFullYear(), now.getMonth(), now.getDate() - i);
      return toDateKey(d);
    });

    const budget = this.computeBudget(state);
    const dailyLimit = budget.dailyLimit;

    let daysUnder = 0;
    last7Days.forEach(day => {
      const daySpend = state.transactions
        .filter(t => {
          const actualDate = getTransactionDateKey(t);
          return actualDate === day && t.amount < 0;
        })
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
      if (daySpend <= dailyLimit) daysUnder++;
    });

    return daysUnder / 7;
  }

  private static getCurrentMonthExpenses(state: AppState, index?: TransactionIndex) {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Primary income categories (should not be subtracted from expenses)
    const primaryIncome = ["Salary", "Business Income", "Other Income"];
    
    const txs = index ? (index.monthMap[currentMonthPrefix] || []) : state.transactions;

    return txs
      .filter(t => {
        const actualDate = getTransactionDateKey(t);
        return actualDate.startsWith(currentMonthPrefix) && !VylosCalculations.isBudgetRecord(t.merchant);
      })
      .reduce((acc, t) => {
        const isPrimary = primaryIncome.includes(t.category);
        if (t.amount < 0) {
          return acc + Math.abs(t.amount);
        } else if (t.amount > 0 && !isPrimary) {
          // This allows offsetting expenses with refunds/other positive txs that aren't primary income
          return acc - t.amount;
        }
        return acc;
      }, 0);
  }

  private static calculateRequiredSavingsRate(state: AppState) {
    const totalTarget = state.goals.reduce((acc, g) => acc + g.targetAmount, 0);
    const totalCurrent = state.goals.reduce((acc, g) => acc + g.currentAmount, 0);
    const remaining = totalTarget - totalCurrent;
    const income = state.userProfile.monthlyIncome || 1;
    
    // Assume 12 months to reach goals if no deadlines
    const monthlyRequired = remaining / 12;
    return monthlyRequired / income;
  }

  private static estimateMonthlyGoalContributions(state: AppState) {
    const totalTarget = state.goals.reduce((acc, g) => acc + g.targetAmount, 0);
    const totalCurrent = state.goals.reduce((acc, g) => acc + g.currentAmount, 0);
    return (totalTarget - totalCurrent) / 12; // Simplified
  }

  private static calculateCostFactor(householdSize: number, age: number) {
    let factor = 0.4; // Base: 40% of income after goals
    if (householdSize > 1) factor += (householdSize - 1) * 0.1;
    if (age > 50) factor += 0.1; // Health/lifestyle adjustment
    return Math.min(0.9, factor);
  }

  private static getNonEssentialSpending(state: AppState, index?: TransactionIndex) {
    const essentialCategories = [
      "Rent / Housing", "Bills", "Transport", "Health", "Education", "Groceries", "Insurance", "Utilities", "Debt Payments",
      "Salary", "Business Income", "Refund", "Other Income"
    ];

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const txs = index ? (index.monthMap[currentMonthPrefix] || []) : state.transactions;

    return txs
      .filter(t => !essentialCategories.includes(t.category) && t.amount < 0 && !VylosCalculations.isBudgetRecord(t.merchant))
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }

  /**
   * Main entry point for the engine
   */
  static run(state: AppState, index?: TransactionIndex): EngineOutput {
    const health = this.computeHealthScore(state, index);
    const budget = this.computeBudget(state, index);
    const feasibility = this.computeGoalFeasibility(state, index);
    const burnRate = this.computeBurnRate(state);
    const gamification = this.computeGamification(state, health.score);
    const weekly = this.computeWeeklyJudgement(state, health.score, index);
    
    const insights = this.generateUserInsights(state, {
      burnRateMonths: burnRate.months,
      healthScore: health.score,
      goalFeasibilityScore: feasibility.score,
      dailySpendingLimit: budget.dailyLimit
    });

    return {
      healthScore: health.score,
      healthCategory: health.category,
      dailySpendingLimit: budget.dailyLimit,
      monthlyBudget: budget.monthlyBudget,
      burnRateMonths: burnRate.months,
      burnRateCategory: burnRate.category,
      goalFeasibilityScore: feasibility.score,
      goalFeasibilityStatus: feasibility.status,
      goalRecommendation: feasibility.recommendation,
      xp: gamification.xp,
      tier: gamification.tier,
      weeklyImprovement: weekly.improvement,
      weeklyVerdict: weekly.verdict,
      insightSummary: insights.length > 0 ? insights[0].reason : "Your finances are looking healthy.",
      recommendation: feasibility.recommendation,
      insights
    };
  }

  static getAdvisorTone(budgetAdherence: number, isPetrolShockActive: boolean) {
    if (budgetAdherence > 95 || isPetrolShockActive) return 'Strict/Interventionist';
    if (budgetAdherence < 80) return 'Collaborative';
    return 'Neutral/Encouraging';
  }

  static getInvestmentSuggestion(riskTolerance: number) {
    if (riskTolerance >= 80) return "High Risk Strategy: We strongly suggest broad JSE exposure via index trackers like Satrix 40 or Sygnia Itrix ETFs.";
    if (riskTolerance <= 40) return "Conservative Strategy: Prioritize wealth preservation. High-Yield savings accounts or Fixed Deposits are recommended.";
    return "Balanced Strategy: A mix of stable fixed-income instruments and moderate equity exposure fits your profile perfectly.";
  }

  static formatCurrency(val: number, currency: string = "ZAR") {
    return formatMoney(val, currency);
  }
}
