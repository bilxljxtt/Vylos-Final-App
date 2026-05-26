import { AdvisorContext } from "./AdvisorEngine";

export class LogicAdvisor {
  static getFallbackResponse(query: string, context: AdvisorContext): string {
    const q = query.toLowerCase();
    
    // Check for "budget" or "spending"
    if (q.includes("budget") || q.includes("spend")) {
      const overBudget = context.budgetPerformance.filter(b => b.over);
      const underBudget = context.budgetPerformance.filter(b => !b.over);
      
      let response = `Your total spending this month is ${context.currency}${context.expenses.toLocaleString()}. `;
      
      if (overBudget.length > 0) {
        response += `You are over budget in ${overBudget.map(b => b.category).join(", ")}. `;
      } else if (underBudget.length > 0) {
        response += "You are staying within all your budget limits. Great job! ";
      } else {
        response += "You don't have any budgets set up yet. ";
      }
      
      response += "[Review Budget|budget]";
      return response;
    }

    // Check for specific goals by name or general "goal" / "save"
    let matchingGoal = context.goalProgress.find(g => q.includes(g.title.toLowerCase()));
    if (matchingGoal || q.includes("goal") || q.includes("save")) {
      const goal = matchingGoal || context.goalProgress[0];
      if (!goal) {
        return "You haven't set any savings goals yet. Setting a target is the first step! [Open Goals|goals]";
      }
      return `For your goal '${goal.title}', you have saved ${context.currency}${goal.current.toLocaleString()} out of ${context.currency}${goal.target.toLocaleString()} (${goal.progress}%). To stay on track for your deadline, try to save ${context.currency}${Math.round(goal.recommendedMonthly).toLocaleString()} per month. [Open Goals|goals]`;
    }

    // Check for "cash flow" or "income"
    if (q.includes("cash flow") || q.includes("income") || q.includes("earn")) {
      return `This month, your income is ${context.currency}${context.income.toLocaleString()} and expenses are ${context.currency}${context.expenses.toLocaleString()}. Your net cash flow is ${context.currency}${context.netCashFlow.toLocaleString()}. [View Transactions|transactions]`;
    }

    // Check for "bills" or "reminders"
    if (q.includes("bill") || q.includes("reminder") || q.includes("due")) {
       return "To see your upcoming bills and overdue payments, please check your reminders calendar. [View Reminders|calendar]";
     }

    // Check for PDF/statement download
    if (q.includes("pdf") || q.includes("statement") || q.includes("download") || q.includes("export")) {
      return "I can generate a PDF copy of your financial statement. [Download PDF Statement](download-statement)";
    }

    // Default response
    return `Vylos Logic Engine: I can help you understand your budget, goals, spending, and cash flow based on your real data. Try asking "How is my budget?" or "What is my goal progress?".`;
  }
}
