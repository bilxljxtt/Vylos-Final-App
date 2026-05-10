import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/services/import/AIService";
import { AdvisorEngine } from "@/lib/services/AdvisorEngine";
import { createClient } from "@/utils/supabase/server";
import { Permissions } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // 1. Authenticate User
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ reply: "I need you to be logged in to help with your finances." });
    }

    // 2. Fetch Profile to check Tier
    const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
    if (!profile) return NextResponse.json({ reply: "Profile not found." });

    // 3. Subscription Block for Free Users
    if (!Permissions.canUseAIAdvisor(profile)) {
      return NextResponse.json({ 
        reply: "Vylos Advisor is a premium feature. Please upgrade your plan to unlock personalized AI guidance." 
      });
    }

    // 4. Usage Tracking & Limits
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyLimit = Permissions.getAIMonthlyLimit(profile);

    // Fetch usage record
    const { data: usageData } = await supabase
      .from('ai_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('billing_month', currentMonth)
      .single();

    const used = usageData?.messages_used || 0;

    if (used >= monthlyLimit) {
      return NextResponse.json({ 
        reply: `You have reached your Vylos Advisor limit of ${monthlyLimit} messages for this month. Upgrade your plan or wait until your limit resets next month.` 
      });
    }

    // 5. Fetch Real Data Context
    const context = await AdvisorEngine.getContext(user.id);

    // 6. Construct AI Prompt
    const systemInstruction = `
      You are Vylos Advisor, a financial guidance assistant inside the Vylos app. 
      You help users understand their spending, budgets, goals, and financial habits using their Vylos data provided in the summary.
      
      RULES FOR GOALS:
      - If a user asks about a goal (e.g., "MacBook", "S63"), check the "Goal Progress" section below.
      - Use the EXACT numbers from that goal (Target, Saved, Remaining, Deadline, Recommended Contribution).
      - Do NOT ask the user for information that is already in the summary.
      - If they ask "How much do I need to save monthly for X?", give them the 'Recommended Contribution' from the summary for that specific goal.
      - Match goal names case-insensitively (e.g., "macbook" matches "MacBook").
      
      GENERAL RULES:
      - You provide general financial information only. You are not a licensed financial advisor.
      - Do not give regulated financial advice.
      - Do not invent numbers. If data is missing, say so.
      - Keep answers short, simple, practical, and supportive.
    `;

    const summarisedData = `
      Current Month (${context.monthName}):
      - Income: ${context.currency}${context.income.toLocaleString()}
      - Expenses: ${context.currency}${context.expenses.toLocaleString()}
      - Net Cash Flow: ${context.currency}${context.netCashFlow.toLocaleString()}
      - Savings Rate: ${context.savingsRate}%
      
      Top Spending:
      ${context.topSpending.map(s => `- ${s.category}: ${context.currency}${s.amount.toLocaleString()}`).join("\n")}
      
      Budget Usage:
      ${context.budgetPerformance.map(b => `- ${b.category}: ${b.percent}% utilized (${b.over ? 'OVER BUDGET' : 'OK'})`).join("\n")}
      
      Goal Progress:
      ${context.goalProgress.map(g => {
        const d = new Date(g.deadline);
        const dateStr = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        return `- ${g.title}: Target ${context.currency}${g.target.toLocaleString()}, Saved ${context.currency}${g.current.toLocaleString()}, Remaining ${context.currency}${g.remaining.toLocaleString()}, Deadline ${dateStr}, Recommended Contribution: ${context.currency}${Math.round(g.recommendedMonthly).toLocaleString()}/month (${g.progress}% reached)`;
      }).join("\n")}
    `;

    const fullPrompt = `
      ${systemInstruction}

      User question:
      ${lastMessage}

      User Vylos financial summary:
      ${summarisedData}

      Rules:
      - Answer using the Vylos summary above.
      - Do not make up numbers.
      - If data is missing, say there is not enough data.
      - Give simple next steps.
      - Keep response concise (max 100 words).
      - Do not give regulated financial advice.
    `;

    // 7. Call AI
    const reply = await AIService.getSimpleAIResponse(fullPrompt);

    // 8. Increment Usage on Success
    await supabase.from('ai_usage').upsert({
      user_id: user.id,
      billing_month: currentMonth,
      messages_used: used + 1,
      last_used_at: new Date().toISOString()
    });

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("AI Advisor Route Error:", err);
    return NextResponse.json({ reply: err.message || "Vylos Advisor is temporarily unavailable. Please try again later." });
  }
}
