import { AdvisorContext } from "./AdvisorEngine";

export interface LogicAnswer {
  intent: string;
  calculatedAnswer: string;
  supportingData: any;
  shouldUseAI: boolean;
}

export class LogicAdvisor {
  static isGeneralOrEducational(query: string): boolean {
    const q = query.toLowerCase().trim();

    // 1. Navigation queries should not be treated as general advice
    if (
      q.includes("go to") ||
      q.includes("take me to") ||
      q.includes("open") ||
      q.includes("show me") ||
      q.includes("navigate to") ||
      q.match(/^(goals|budget|transactions|calendar|reminders|settings|progress|analytics|home|advisor|ai)$/)
    ) {
      return false;
    }

    // 2. Specific personal data indicators that MUST use Logic Engine
    const specificDataIndicators = [
      "my budget", "my spending", "my cash flow", "my expense", "my savings", 
      "my goals", "my transaction", "my health score", "my account", "my data",
      "how much did i", "how much have i", "am i over", "spent most on", "my progress",
      "analyse my", "analyze my", "show my", "what is my", "what's my"
    ];

    if (specificDataIndicators.some(indicator => q.includes(indicator))) {
      return false;
    }

    // 3. General advice / educational terms
    const generalKeywords = [
      "tip", "tips", "advice", "habit", "habits", "explain", "teach me", 
      "tutorial", "guide", "concept", "define", "what is a good", "what are good", 
      "best practices", "how to manage money", "manage money better", "financial literacy",
      "investment tips", "savings tip", "budgeting tip", "how do i save more money",
      "how can i save more money", "how to save more money", "how do i reduce spending",
      "how can i reduce spending", "how to reduce spending", "how to save more",
      "how can i save more", "how do i save more", "explain budgeting",
      "explain saving", "explain finance", "investment advice", "financial advice",
      "how can i save", "how do i save", "how to save", "reduce spending", "spend less",
      "save more", "cut down on", "habit", "habits", "tips", "suggest", "ideas", "how to"
    ];

    if (generalKeywords.some(keyword => q.includes(keyword))) {
      return true;
    }

    // 4. Broad questions starting with how/what/why asking for advice
    if (
      (q.startsWith("how can i") || q.startsWith("how do i") || q.startsWith("how to") || q.startsWith("what should i")) &&
      !q.includes("my") &&
      !q.includes("mine")
    ) {
      return true;
    }

    return false;
  }

  static detectIntent(query: string): string {
    // Detect PDF/statement intent before other checks
    const pdfKeywords = [
      "pdf",
      "statement",
      "download statement",
      "budget statement",
      "report",
      "export",
      "download"
    ];
    const lower = query.toLowerCase();
    if (pdfKeywords.some(k => lower.includes(k))) {
      return "pdf_statement_query";
    }
    if (this.isGeneralOrEducational(query)) {
      return "general_financial_advice_query";
    }

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
    const totalSaved = context.goalProgress.reduce((acc, g) => acc + g.current, 0);

    let calculatedAnswer = "";
    let supportingData: any = {};

    switch (intent) {
      case "navigation_query": {
        const q = query.toLowerCase();
        let page = "dashboard";
        let pageName = "Home";
        if (q.includes("goal")) { page = "goals"; pageName = "Goals"; }
        else if (q.includes("budget")) { page = "budget"; pageName = "Budget"; }
        else if (q.includes("transaction")) { page = "transactions"; pageName = "Transactions"; }
        else if (q.includes("calendar")) { page = "calendar"; pageName = "Calendar"; }
        else if (q.includes("reminder")) { page = "reminders"; pageName = "Reminders"; }
        else if (q.includes("setting")) { page = "settings"; pageName = "Settings"; }
        else if (q.includes("progress") || q.includes("analytic")) { page = "analytics"; pageName = "Progress"; }
        else if (q.includes("advisor") || q.includes("ai")) { page = "ai"; pageName = "Vylos Advisor"; }
        
        calculatedAnswer = `Navigate to ${pageName}.`;
        supportingData = { page, pageName };
        break;
      }
      case "savings_advice_query": {
        calculatedAnswer = `Advice on saving more requested. Monthly Income: ${currency}${context.income.toLocaleString()}, Expenses: ${currency}${context.expenses.toLocaleString()}, Net Cash Flow: ${currency}${context.netCashFlow.toLocaleString()}, Total Saved: ${currency}${totalSaved.toLocaleString()}, Savings Rate: ${context.savingsRate}%.`;
        supportingData = {
          income: `${currency}${context.income.toLocaleString()}`,
          expenses: `${currency}${context.expenses.toLocaleString()}`,
          netCashFlow: `${currency}${context.netCashFlow.toLocaleString()}`,
          totalSaved: `${currency}${totalSaved.toLocaleString()}`,
          savingsRate: `${context.savingsRate}%`
        };
        break;
      }
      case "saved_amount_query":
      case "savings_query": {
        calculatedAnswer = `User saved ${currency}${totalSaved.toLocaleString()} this month.`;
        supportingData = {
          totalSaved: `${currency}${totalSaved.toLocaleString()}`,
          savingsRate: `${context.savingsRate}%`
        };
        break;
      }
      case "top_expenses_query": {
        const top = context.topSpending[0] || { category: "None", amount: 0 };
        const pct = context.expenses > 0 ? Math.round((top.amount / context.expenses) * 100) : 0;
        calculatedAnswer = `Top expense is ${top.category} at ${currency}${top.amount.toLocaleString()}.`;
        supportingData = {
          category: top.category,
          amount: `${currency}${top.amount.toLocaleString()}`,
          percentage: `${pct}`
        };
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
        const amount = match ? match.spent : (context.topSpending.find(s => s.category.toLowerCase() === targetCategory)?.amount || 0);
        const prettyCat = targetCategory ? targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1) : "None";

        calculatedAnswer = `Spending on ${prettyCat} is ${currency}${amount.toLocaleString()}.`;
        supportingData = {
          category: prettyCat,
          amount: `${currency}${amount.toLocaleString()}`
        };
        break;
      }
      case "overspending_query":
      case "budget_analysis_query": {
        const overList = context.budgetPerformance.filter(b => b.over);
        if (overList.length > 0) {
          const list = overList.map(b => `${b.category} (${currency}${(b.spent - b.limit).toLocaleString()} over)`).join(", ");
          calculatedAnswer = `Over budget in: ${list}.`;
          supportingData = {
            isOver: true,
            overCategories: list
          };
        } else {
          calculatedAnswer = "Staying within all budget limits.";
          supportingData = {
            isOver: false
          };
        }
        break;
      }
      case "cash_flow_query": {
        calculatedAnswer = `Cash flow is ${currency}${context.netCashFlow.toLocaleString()}.`;
        supportingData = {
          cashFlow: `${currency}${context.netCashFlow.toLocaleString()}`,
          income: `${currency}${context.income.toLocaleString()}`,
          expenses: `${currency}${context.expenses.toLocaleString()}`
        };
        break;
      }
      case "income_query": {
        calculatedAnswer = `Income is ${currency}${context.income.toLocaleString()}.`;
        supportingData = {
          income: `${currency}${context.income.toLocaleString()}`
        };
        break;
      }
      case "expense_query": {
        calculatedAnswer = `Expenses are ${currency}${context.expenses.toLocaleString()}.`;
        supportingData = {
          expenses: `${currency}${context.expenses.toLocaleString()}`
        };
        break;
      }
      case "goal_progress_query": {
        const q = query.toLowerCase();
        let matchingGoal = context.goalProgress.find(g => q.includes(g.title.toLowerCase()));
        const goal = matchingGoal || context.goalProgress[0];

        if (goal) {
          calculatedAnswer = `Goal '${goal.title}' is ${goal.progress}% complete.`;
          supportingData = {
            title: goal.title,
            progress: `${goal.progress}%`,
            current: `${currency}${goal.current.toLocaleString()}`,
            target: `${currency}${goal.target.toLocaleString()}`,
            remaining: `${currency}${goal.remaining.toLocaleString()}`,
            recommendedMonthly: `${currency}${Math.round(goal.recommendedMonthly).toLocaleString()}`
          };
        } else {
          calculatedAnswer = "No goals configured.";
          supportingData = {
            hasGoal: false
          };
        }
        break;
      }
      case "subscription_query": {
        const subBudget = context.budgetPerformance.find(b => b.category === "Subscriptions");
        const spent = subBudget ? subBudget.spent : 0;
        calculatedAnswer = `Subscription spending is ${currency}${spent.toLocaleString()}.`;
        supportingData = {
          spent: `${currency}${spent.toLocaleString()}`
        };
        break;
      }
      case "reminder_query":
      case "calendar_query": {
        calculatedAnswer = "Calendar reminders available.";
        supportingData = {
          message: "Check your upcoming bills and calendar."
        };
        break;
      }
      case "transaction_search_query": {
        calculatedAnswer = "Activity history available.";
        supportingData = {
          message: "Full transaction search is active in Transactions."
        };
        break;
      }
      case "health_score_query": {
        calculatedAnswer = `Financial health score is ${healthScore}/100 (${healthScore >= 85 ? "Excellent" : healthScore >= 70 ? "Good" : healthScore >= 40 ? "Fair" : "Poor"}).`;
        supportingData = {
          score: `${healthScore}/100`,
          status: healthScore >= 85 ? "Excellent" : healthScore >= 70 ? "Good" : healthScore >= 40 ? "Fair" : "Poor"
        };
        break;
      }
      default: {
        calculatedAnswer = "Factual data calculated.";
        supportingData = {
          income: `${currency}${context.income.toLocaleString()}`,
          expenses: `${currency}${context.expenses.toLocaleString()}`,
          netCashFlow: `${currency}${context.netCashFlow.toLocaleString()}`,
          healthScore: `${healthScore}/100`
        };
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
    switch (intent) {
      case "navigation_query":
        return `Sure! Let's head over to your ${data.pageName} view. [Open ${data.pageName}](/${data.page})`;

      case "savings_advice_query":
        return `Based on your Vylos data: monthly income is ${data.income}, expenses are ${data.expenses}, and net cash flow is ${data.netCashFlow}. To save more: 1) Review over-budget categories, 2) Set a concrete goals target, and 3) Automate a monthly savings contribution. [Open Goals](/goals)`;

      case "saved_amount_query":
      case "savings_query":
        return `You have saved a total of ${data.totalSaved} this month across your goals, achieving a ${data.savingsRate} savings rate. [Open Goals](/goals)`;

      case "top_expenses_query":
        return `Your top spending category is ${data.category} at ${data.amount}. This accounts for ${data.percentage}% of your monthly expenses. [View Transactions](/transactions)`;

      case "spending_category_query":
        return `You have spent ${data.amount} on ${data.category} this month. [View Transactions](/transactions)`;

      case "overspending_query":
      case "budget_analysis_query":
        if (data.isOver) {
          return `You are over budget in: ${data.overCategories}. Reducing spending in these categories will help improve your cash flow. [Open Budget](/budget)`;
        }
        return `Your budget statement is ready. You can download it below. [Download PDF Statement](download-statement)`;

      case "pdf_statement_query":
        return `Your budget statement is ready. You can download it below.`;

      case "cash_flow_query":
        return `Your net cash flow is ${data.cashFlow} this month. (Income: ${data.income}, Expenses: ${data.expenses}). [View Transactions](/transactions)`;

      case "income_query":
        return `Your total income recorded this month is ${data.income}. [View Transactions](/transactions)`;

      case "expense_query":
        return `Your total expenses recorded this month are ${data.expenses}. [View Transactions](/transactions)`;

      case "goal_progress_query":
        if (data.title) {
          return `Your goal '${data.title}' is ${data.progress} complete. You have saved ${data.current} of ${data.target} (remaining: ${data.remaining}). To stay on track, save ${data.recommendedMonthly}/month. [Open Goals](/goals)`;
        }
        return `You don't have any active savings goals set up. Set one up to start tracking your progress! [Open Goals](/goals)`;

      case "subscription_query":
        return `You have spent ${data.spent} on your Subscriptions category this month. [Open Budget](/budget)`;

      case "reminder_query":
      case "calendar_query":
        return `You can view and manage all your upcoming bills, tasks, and due dates in the calendar view. [Open Calendar](/calendar)`;

      case "transaction_search_query":
        return `To inspect or filter your full transaction logs, head over to the transactions view. [View Transactions](/transactions)`;

      case "health_score_query":
        return `Your Vylos financial health score is ${data.score}, which is considered ${data.status}. [View Health Report](/analytics)`;

      default:
        return `Vylos Logic Engine: I can help you understand your budget, goals, spending, and cash flow. Try asking "How is my budget?" or "What is my goal progress?".`;
    }
  }
}
