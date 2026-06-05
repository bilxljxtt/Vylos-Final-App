import { AdvisorEngine } from "@/lib/services/AdvisorEngine";
import { createClient } from "@/utils/supabase/server";

export class RagContext {
  static async getPromptContext(userId: string): Promise<{
    formattedContext: string;
    hasHistory: boolean;
  }> {
    const supabase = await createClient();
    
    // 1. Get Advisor Engine context
    const context = await AdvisorEngine.getContext(userId);

    // 2. Get Health Score
    let healthScore = 70;
    try {
      const { data: scoreData } = await supabase
        .from('user_health_scores')
        .select('score')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (scoreData?.score !== undefined) {
        healthScore = scoreData.score;
      }
    } catch (err) {
      console.warn("Failed to fetch health score from DB:", err);
    }

    // 3. Get Subscriptions
    let subscriptionsText = "None recorded.";
    try {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('name, amount, frequency, next_due')
        .eq('user_id', userId);
      
      if (subs && subs.length > 0) {
        subscriptionsText = subs
          .map(s => `- ${s.name}: ${context.currency}${Number(s.amount).toLocaleString()} (${s.frequency}, next due: ${s.next_due})`)
          .join('\n');
      }
    } catch (err) {
      console.warn("Failed to fetch subscriptions:", err);
    }

    // 4. Get Upcoming Reminders
    let remindersText = "None pending.";
    try {
      const { data: rems } = await supabase
        .from('reminders')
        .select('title, amount, due_date, status')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(5);

      if (rems && rems.length > 0) {
        remindersText = rems
          .map(r => `- ${r.title}: ${context.currency}${Number(r.amount).toLocaleString()} (due: ${r.due_date})`)
          .join('\n');
      }
    } catch (err) {
      console.warn("Failed to fetch reminders:", err);
    }

    // 5. Get Recent AI Conversations (last 6 messages / 3 rounds)
    let historyText = "";
    let hasHistory = false;
    try {
      const { data: conversations } = await supabase
        .from('ai_conversations')
        .select('role, content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(6);

      if (conversations && conversations.length > 0) {
        hasHistory = true;
        // The query returns DESC, so we reverse it to chronological order
        const chrono = [...conversations].reverse();
        historyText = chrono
          .map(c => `${c.role === 'user' ? 'User' : 'Advisor'}: "${c.content}"`)
          .join('\n');
      }
    } catch (err) {
      console.warn("Failed to fetch conversation history:", err);
    }

    // 6. Format RAG Context (excluding sensitive PII)
    const formattedContext = `
[FINANCIAL METRICS]
Monthly Income: ${context.currency}${context.income.toLocaleString()}
Monthly Expenses: ${context.currency}${context.expenses.toLocaleString()}
Net Cash Flow: ${context.currency}${context.netCashFlow.toLocaleString()}
Savings Rate: ${context.savingsRate}%
Financial Health Score: ${healthScore}/100

[TOP SPENDING CATEGORIES]
${context.topSpending.length > 0 ? context.topSpending.map(t => `- ${t.category}: ${context.currency}${t.amount.toLocaleString()}`).join('\n') : 'No spending data.'}

[BUDGET PERFORMANCE]
${context.budgetPerformance.length > 0 ? context.budgetPerformance.map(b => `- ${b.category}: Limit ${context.currency}${b.limit.toLocaleString()}, Spent ${context.currency}${b.spent.toLocaleString()} (${b.percent}% utilized)${b.over ? ' [OVER BUDGET]' : ''}`).join('\n') : 'No budget limits configured.'}

[SAVINGS GOALS]
${context.goalProgress.length > 0 ? context.goalProgress.map(g => `- ${g.title}: Progress ${context.currency}${g.current.toLocaleString()} / ${context.currency}${g.target.toLocaleString()} (${g.progress}% completed, recommended monthly: ${context.currency}${Math.round(g.recommendedMonthly).toLocaleString()})`).join('\n') : 'No active savings goals.'}

[ACTIVE SUBSCRIPTIONS]
${subscriptionsText}

[UPCOMING REMINDERS]
${remindersText}

${hasHistory ? `[RECENT CONVERSATION CONTEXT]\n${historyText}` : ''}
`;

    return {
      formattedContext,
      hasHistory
    };
  }
}
