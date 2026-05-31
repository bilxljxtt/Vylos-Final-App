import { AdvisorContext } from "./AdvisorEngine";

export interface LogicAnswer {
  intent: string;
  calculatedAnswer: string;
  supportingData: any;
  shouldUseAI: boolean;
}

export class LogicAdvisor {
  static detectIntent(query: string): string {
    const q = query.toLowerCase().trim();

    // 1. Navigation Query
    if (
      q.includes("go to") ||
      q.includes("take me to") ||
      q.includes("open") ||
      q.includes("show me") ||
      q.includes("navigate to") ||
      q.match(/^(goals|budget|transactions|calendar|reminders|settings|progress|analytics|home|advisor|ai)$/)
    ) {
      return "navigation_query";
    }

    // 2. Savings Advice Query (advice-seeking inputs)
    if (
      q.includes("how can i save more") ||
      q.includes("how do i save more") ||
      q.includes("improve my savings") ||
      q.includes("how can i reduce spending") ||
      q.includes("how can i improve my budget") ||
      q.includes("what should i cut down") ||
      q.includes("how can i spend less") ||
      q.includes("how can i improve financially") ||
      q.includes("save more") ||
      q.includes("spend less") ||
      q.includes("reduce spending") ||
      q.includes("cut down on")
    ) {
      return "savings_advice_query";
    }

    // 3. Savings & Saved Amount Query
    if (
      q.includes("how much have i saved") ||
      q.includes("how much did i save") ||
      q.includes("my savings") ||
      q.includes("total saved") ||
      q.includes("savings rate") ||
      q.includes("piggy bank")
    ) {
      return "saved_amount_query";
    }
    if (q.includes("save") || q.includes("saving")) {
      return "savings_query";
    }

    // 3. Top Expenses Query
    if (
      q.includes("top expense") ||
      q.includes("biggest spend") ||
      q.includes("spent most on") ||
      q.includes("highest expense") ||
      q.includes("most expensive") ||
      q.includes("where is my money going") ||
      q.includes("what did i spend most on")
    ) {
      return "top_expenses_query";
    }

    // 4. Overspending & Budget Analysis Query
    if (
      q.includes("over budget") ||
      q.includes("am i broke") ||
      q.includes("budget warning") ||
      q.includes("budget utilization") ||
      q.includes("what is killing my budget") ||
      q.includes("what is killing my spend")
    ) {
      return "overspending_query";
    }
    if (
      q.includes("budget") ||
      q.includes("limit") ||
      q.includes("staying within")
    ) {
      return "budget_analysis_query";
    }

    // 5. Cash Flow Query
    if (
      q.includes("cash flow") ||
      q.includes("net flow") ||
      q.includes("cashflow") ||
      q.includes("why is my cash flow negative")
    ) {
      return "cash_flow_query";
    }

    // 6. Income Query
    if (
      q.includes("income") ||
      q.includes("earn") ||
      q.includes("salary") ||
      q.includes("take home") ||
      q.includes("payday")
    ) {
      return "income_query";
    }

    // 7. Expense Query
    if (
      q.includes("expense") ||
      q.includes("spending") ||
      q.includes("outgoings") ||
      q.includes("bills")
    ) {
      return "expense_query";
    }

    // 8. Goal Progress Query
    if (
      q.includes("goal") ||
      q.includes("target") ||
      q.includes("macbook") ||
      q.includes("deadline") ||
      q.includes("recommended contribution")
    ) {
      return "goal_progress_query";
    }

    // 9. Subscription Query
    if (
      q.includes("subscription") ||
      q.includes("recurring") ||
      q.includes("netflix") ||
      q.includes("spotify")
    ) {
      return "subscription_query";
    }

    // 10. Reminder & Calendar Query
    if (
      q.includes("reminder") ||
      q.includes("due date") ||
      q.includes("bill due") ||
      q.includes("upcoming")
    ) {
      return "reminder_query";
    }
    if (q.includes("calendar")) {
      return "calendar_query";
    }

    // 11. Transaction Search Query
    if (
      q.includes("transaction") ||
      q.includes("history") ||
      q.includes("recent transactions") ||
      q.includes("activity")
    ) {
      return "transaction_search_query";
    }

    // 12. Investment / Financial Advice Queries
    if (
      q.includes("invest") ||
      q.includes("investment") ||
      q.includes("stock") ||
      q.includes("equity") ||
      q.includes("wealth") ||
      q.includes("portfolio")
    ) {
      return "investment_advice_query";
    }
    if (
      q.includes("advice") ||
      q.includes("tips") ||
      q.includes("how can i") ||
      q.includes("what should i") ||
      q.includes("how am i doing")
    ) {
      return "general_financial_advice_query";
    }

    // 13. Health Score Query
    if (
      q.includes("health score") ||
      q.includes("health rating") ||
      q.includes("health status") ||
      q.includes("financial health")
    ) {
      return "health_score_query";
    }

    // Check if query targets a specific category (e.g. Food, Groceries)
    const categories = ["groceries", "eating out", "transport", "shopping", "health", "education", "entertainment", "subscriptions", "savings", "rent"];
    for (const cat of categories) {
      if (q.includes(cat)) {
        return "spending_category_query";
      }
    }

    return "unknown_query";
  }

  static shouldUseAI(intent: string, query: string): boolean {
    const q = query.toLowerCase();
    
    // Explicit list of intents that should call AI (explorations, advice)
    if (
      intent === "investment_advice_query" ||
      intent === "general_financial_advice_query" ||
      intent === "savings_advice_query" ||
      intent === "unknown_query"
    ) {
      return true;
    }

    // Only invoke AI for factual queries if the user explicitly asks "why" or "explain"
    if (q.includes("why") || q.includes("explain")) {
      return true;
    }

    // All other factual queries bypass AI entirely
    return false;
  }

  static getFallbackResponse(query: string, context: AdvisorContext): string {
    const intent = this.detectIntent(query);
    const calculated = this.calculateAnswer(intent, query, context, 70);
    return this.getTemplateResponse(intent, calculated, context);
  }

  static calculateAnswer(
    intent: string,
    query: string,
    context: AdvisorContext,
    healthScore: number
  ): { calculatedAnswer: string; supportingData: any } {
    const currency = context.currency || "R";
    const name = context.userName || "there";
    const income = context.income || 0;
    const expenses = context.expenses || 0;
    const netCashFlow = context.netCashFlow || 0;
    const savingsRate = context.savingsRate || 0;
    const totalSaved = context.goalProgress.reduce((acc, g) => acc + g.current, 0);

    // Get top spending categories
    const topCategory = context.topSpending[0]?.category || "None";
    const topAmount = context.topSpending[0]?.amount || 0;
    const topPct = expenses > 0 ? Math.round((topAmount / expenses) * 100) : 0;

    const secondCategory = context.topSpending[1]?.category || "";
    const secondAmount = context.topSpending[1]?.amount || 0;

    const thirdCategory = context.topSpending[2]?.category || "";
    const thirdAmount = context.topSpending[2]?.amount || 0;

    let calculatedAnswer = "";
    let supportingData: any = {
      name,
      currency,
      income,
      expenses,
      netCashFlow,
      savingsRate,
      totalSaved,
      topCategory,
      topAmount,
      topPct,
      secondCategory,
      secondAmount,
      thirdCategory,
      thirdAmount,
      healthScore
    };

    switch (intent) {
      case "navigation_query": {
        const q = query.toLowerCase();
        let page = "dashboard";
        let pageName = "Home";
        if (q.includes("goal")) { page = "goals"; pageName = "Goals"; }
        else if (q.includes("budget")) { page = "budget"; pageName = "Budget"; }
        else if (q.includes("transaction") || q.includes("activity")) { page = "transactions"; pageName = "Transactions"; }
        else if (q.includes("calendar")) { page = "calendar"; pageName = "Calendar"; }
        else if (q.includes("reminder")) { page = "reminders"; pageName = "Reminders"; }
        else if (q.includes("setting")) { page = "settings"; pageName = "Settings"; }
        else if (q.includes("progress") || q.includes("analytic")) { page = "analytics"; pageName = "Progress"; }
        else if (q.includes("advisor") || q.includes("ai")) { page = "ai"; pageName = "Vylos Advisor"; }
        
        calculatedAnswer = `Navigate to ${pageName}.`;
        supportingData.page = page;
        supportingData.pageName = pageName;
        break;
      }
      case "savings_advice_query": {
        calculatedAnswer = `Advice on saving more requested.`;
        break;
      }
      case "saved_amount_query":
      case "savings_query": {
        calculatedAnswer = `User saved ${currency}${totalSaved.toLocaleString()} this month.`;
        break;
      }
      case "top_expenses_query": {
        calculatedAnswer = `Top expense is ${topCategory} at ${currency}${topAmount.toLocaleString()}.`;
        break;
      }
      case "spending_category_query": {
        const q = query.toLowerCase();
        let targetCategory = "";
        const categories = ["groceries", "eating out", "transport", "shopping", "health", "education", "entertainment", "subscriptions", "rent"];
        for (const cat of categories) {
          if (q.includes(cat)) {
            targetCategory = cat;
            break;
          }
        }

        const match = context.budgetPerformance.find(
          b => b.category.toLowerCase() === targetCategory
        );
        const spent = match ? match.spent : (context.topSpending.find(s => s.category.toLowerCase() === targetCategory)?.amount || 0);
        const limit = match ? match.limit : 0;
        const over = match ? match.over : false;
        const percent = match ? match.percent : 0;
        const prettyCat = targetCategory ? targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1) : "None";

        calculatedAnswer = `Spending on ${prettyCat} is ${currency}${spent.toLocaleString()}.`;
        supportingData.category = prettyCat;
        supportingData.spent = spent;
        supportingData.limit = limit;
        supportingData.over = over;
        supportingData.percent = percent;
        break;
      }
      case "overspending_query":
      case "budget_analysis_query": {
        const overList = context.budgetPerformance.filter(b => b.over);
        if (overList.length > 0) {
          const list = overList.map(b => `${b.category} (${currency}${(b.spent - b.limit).toLocaleString()} over)`).join(", ");
          calculatedAnswer = `Over budget in: ${list}.`;
          supportingData.isOver = true;
          supportingData.overCategories = list;
        } else {
          calculatedAnswer = "Staying within all budget limits.";
          supportingData.isOver = false;
        }
        break;
      }
      case "cash_flow_query": {
        calculatedAnswer = `Cash flow is ${currency}${netCashFlow.toLocaleString()}.`;
        break;
      }
      case "income_query": {
        calculatedAnswer = `Income is ${currency}${income.toLocaleString()}.`;
        break;
      }
      case "expense_query": {
        calculatedAnswer = `Expenses are ${currency}${expenses.toLocaleString()}.`;
        break;
      }
      case "goal_progress_query": {
        const q = query.toLowerCase();
        let matchingGoal = context.goalProgress.find(g => q.includes(g.title.toLowerCase()));
        const goal = matchingGoal || context.goalProgress[0];

        if (goal) {
          calculatedAnswer = `Goal '${goal.title}' is ${goal.progress}% complete.`;
          supportingData.hasGoal = true;
          supportingData.title = goal.title;
          supportingData.progress = goal.progress;
          supportingData.current = goal.current;
          supportingData.target = goal.target;
          supportingData.remaining = goal.remaining;
          supportingData.recommendedMonthly = Math.round(goal.recommendedMonthly);
        } else {
          calculatedAnswer = "No goals configured.";
          supportingData.hasGoal = false;
        }
        break;
      }
      case "subscription_query": {
        const subBudget = context.budgetPerformance.find(b => b.category === "Subscriptions");
        const spent = subBudget ? subBudget.spent : (context.topSpending.find(s => s.category === "Subscriptions")?.amount || 0);
        calculatedAnswer = `Subscription spending is ${currency}${spent.toLocaleString()}.`;
        supportingData.spent = spent;
        break;
      }
      case "reminder_query":
      case "calendar_query": {
        calculatedAnswer = "Calendar reminders available.";
        break;
      }
      case "transaction_search_query": {
        calculatedAnswer = "Activity history available.";
        break;
      }
      case "health_score_query": {
        const status = healthScore >= 85 ? "Excellent" : healthScore >= 70 ? "Good" : healthScore >= 40 ? "Fair" : "Poor";
        calculatedAnswer = `Financial health score is ${healthScore}/100 (${status}).`;
        supportingData.status = status;
        break;
      }
      default: {
        calculatedAnswer = "Factual data calculated.";
        break;
      }
    }

    return { calculatedAnswer, supportingData };
  }

  static getTemplateResponse(
    intent: string,
    calculatedData: { calculatedAnswer: string; supportingData: any },
    context: AdvisorContext
  ): string {
    const data = calculatedData.supportingData;
    const name = data.name;
    const currency = data.currency;
    const totalSaved = data.totalSaved;
    const savingsRate = data.savingsRate;
    const income = data.income;
    const expenses = data.expenses;
    const netCashFlow = data.netCashFlow;
    const topCategory = data.topCategory;
    const topAmount = data.topAmount;
    const topPct = data.topPct;
    const secondCategory = data.secondCategory;
    const secondAmount = data.secondAmount;
    const thirdCategory = data.thirdCategory;
    const thirdAmount = data.thirdAmount;
    const healthScore = data.healthScore;

    switch (intent) {
      case "navigation_query":
        return `Sure, ${name}! Let's head over to your ${data.pageName} view. [Open ${data.pageName}](/${data.page})`;

      case "savings_advice_query":
        return `Hi ${name}, based on your current numbers, you have a monthly income of **${currency}${income.toLocaleString()}** and expenses of **${currency}${expenses.toLocaleString()}**, leaving you with a net cash flow of **${currency}${netCashFlow.toLocaleString()}**.\n\nTo save more efficiently:\n- **Focus on the biggest leak**: Your highest category is **${topCategory}** at **${currency}${topAmount.toLocaleString()}**. Reducing this is your quickest win.\n- **Pay yourself first**: Move a fixed amount into your goals immediately after you receive your income rather than saving what is left over.\n- **Review budget targets**: Set limits on flexible categories like Entertainment or Dining to protect your cash flow. [Open Goals](/goals)`;

      case "saved_amount_query":
      case "savings_query":
        if (totalSaved === 0) {
          return `Hi ${name}, you haven't set up any savings goals yet, which makes it hard to track your exact savings. I recommend establishing your first goal (like an Emergency Fund) so we can track your progress. [Open Goals](/goals)`;
        }
        return `Hi ${name}, you've saved a total of **${currency}${totalSaved.toLocaleString()}** this month across your goals. This puts your savings rate at **${savingsRate}%**.\n\n${netCashFlow > 0 ? "That's a strong position because your current cash flow is positive." : "⚠️ Since your cash flow is currently negative, you should review your flexible spending to keep these savings secure."} Your next best move is to keep this amount protected and avoid pulling from it for spending categories like **${topCategory || 'Entertainment'}**. [Open Goals](/goals)`;

      case "top_expenses_query":
        if (expenses === 0) {
          return `Hi ${name}, you haven't recorded any expenses for this month yet. Start tracking your transactions to see your top categories! [View Transactions](/transactions)`;
        }
        return `Hi ${name}, your biggest spending category this month is **${topCategory}** at **${currency}${topAmount.toLocaleString()}**, which accounts for **${topPct}%** of your total monthly expenses.\n\n${secondCategory ? `Your next largest categories are **${secondCategory}** (${currency}${secondAmount.toLocaleString()}) and **${thirdCategory}** (${currency}${thirdAmount.toLocaleString()}).\n\n` : ""}To improve your cash flow quickly, review your flexible spending in **${topCategory}** and see where you can make quick cuts. [View Transactions](/transactions)`;

      case "spending_category_query": {
        const spent = data.spent || 0;
        const limit = data.limit || 0;
        const percent = data.percent || 0;
        const over = data.over || false;
        const category = data.category || "None";
        if (limit > 0) {
          return `Hi ${name}, you have spent **${currency}${spent.toLocaleString()}** on **${category}** this month.\n\nThis represents **${percent}%** of your set limit of ${currency}${limit.toLocaleString()}.\n\n${over ? `⚠️ You are currently **over budget** by ${currency}${(spent - limit).toLocaleString()} in this category.` : `You have ${currency}${(limit - spent).toLocaleString()} remaining before reaching your limit.`} [View Transactions](/transactions)`;
        }
        return `Hi ${name}, we didn't find a set budget for **${category}**. However, you have spent **${currency}${spent.toLocaleString()}** in this category this month. I recommend creating a budget limit for it to stay on track. [Open Budget](/budget)`;
      }

      case "overspending_query":
      case "budget_analysis_query":
        if (data.isOver) {
          return `Hi ${name}, you are currently over budget in: **${data.overCategories}**.\n\nThis overspending is reducing your available net cash flow. I recommend reviewing these categories immediately and cutting back on non-essentials for the remainder of the month. [Open Budget](/budget)`;
        }
        return `Hi ${name}, your budget is currently stable overall and you are staying within all your set limits! Great job. ${topCategory && topAmount > 0 ? `However, your largest category is **${topCategory}** (${currency}${topAmount.toLocaleString()}), which you should continue to monitor to protect your net cash flow.` : ""} [Open Budget](/budget)`;

      case "cash_flow_query":
        if (netCashFlow >= 0) {
          return `Hi ${name}, your net cash flow is **positive** at **${currency}${netCashFlow.toLocaleString()}** this month (Income: ${currency}${income.toLocaleString()}, Expenses: ${currency}${expenses.toLocaleString()}).\n\nThis is a healthy position! I recommend allocating some of this positive surplus toward your active savings goals to accelerate your progress. [View Transactions](/transactions)`;
        }
        return `⚠️ Hi ${name}, your net cash flow is **negative** at **-${currency}${Math.abs(netCashFlow).toLocaleString()}** this month (Income: ${currency}${income.toLocaleString()}, Expenses: ${currency}${expenses.toLocaleString()}).\n\nThis means you are spending more than you earn. I recommend reviewing your flexible spending in categories like **${topCategory || 'Shopping'}** immediately to balance your cash flow. [View Transactions](/transactions)`;

      case "income_query":
        return `Hi ${name}, your total income recorded this month is **${currency}${income.toLocaleString()}**.\n\n${netCashFlow >= 0 ? `Your net cash flow is positive at **${currency}${netCashFlow.toLocaleString()}**, which indicates positive financial health.` : `⚠️ However, your expenses are higher than this income, putting your cash flow in the negative. Let's look at reducing flexible costs.`} [View Transactions](/transactions)`;

      case "expense_query":
        return `Hi ${name}, your total expenses recorded this month are **${currency}${expenses.toLocaleString()}**.\n\nThis represents **${income > 0 ? Math.round((expenses / income) * 100) : 100}%** of your total monthly income (${currency}${income.toLocaleString()}).\n\n${netCashFlow >= 0 ? "You have a positive cash flow remaining, which is excellent." : "⚠️ You are spending more than your income, resulting in a negative net cash flow. Consider reviewing your top categories."} [View Transactions](/transactions)`;

      case "goal_progress_query":
        if (data.hasGoal) {
          return `Hi ${name}, your goal **'${data.title}'** is **${data.progress}%** complete.\n\nYou have saved **${currency}${data.current.toLocaleString()}** of **${currency}${data.target.toLocaleString()}** (remaining: **${currency}${data.remaining.toLocaleString()}**).\n\nTo stay on track and hit your target on schedule, you should contribute **${currency}${data.recommendedMonthly.toLocaleString()}/month**. [Open Goals](/goals)`;
        }
        return `Hi ${name}, you don't have any active savings goals set up. Setting up a goal is the best way to track your savings progress and build financial stability. Let's create your first goal today! [Open Goals](/goals)`;

      case "subscription_query": {
        const spent = data.spent || 0;
        return `Hi ${name}, you have spent **${currency}${spent.toLocaleString()}** on subscriptions this month, which represents **${expenses > 0 ? Math.round((spent / expenses) * 100) : 0}%** of your total monthly expenses.\n\nIf you want to free up cash flow, consider auditing these for any unused services. [Open Budget](/budget)`;
      }

      case "reminder_query":
      case "calendar_query":
        return `Hi ${name}, you can view and manage all your upcoming bills, tasks, and financial reminders in your calendar. Staying ahead of these keeps your budget stable. [Open Calendar](/calendar)`;

      case "transaction_search_query":
        return `Hi ${name}, to search, filter, or audit your transaction logs, head over to the transactions view. Tracking every entry ensures accurate budgeting. [View Transactions](/transactions)`;

      case "health_score_query":
        return `Hi ${name}, your Vylos Financial Health Score is **${healthScore}/100**, which is considered **${data.status}**.\n\nHere is a quick breakdown of your indicators:\n- **Cash Flow**: ${netCashFlow >= 0 ? "✅ Positive (healthy surplus)" : "❌ Negative (spending exceeds income)"}\n- **Savings Rate**: ${savingsRate >= 20 ? `✅ Strong (${savingsRate}%)` : `⚠️ Low (${savingsRate}% - aim for 20%)`}\n- **Budget Limits**: ${data.overCategories ? "⚠️ Some categories are over budget" : "✅ Staying within limits"}\n\nTo improve your score, focus on keeping your cash flow positive and reducing spending in your top categories. [View Health Report](/analytics)`;

      default:
        return `Hi ${name}, I'm the Vylos Logic Engine. I can help you understand your budget, goals, spending, and cash flow. Try asking "How is my budget?" or "What is my goal progress?".`;
    }
  }
}
