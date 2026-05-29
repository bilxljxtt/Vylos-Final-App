import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/services/import/AIService";
import { AdvisorEngine } from "@/lib/services/AdvisorEngine";
import { LogicAdvisor } from "@/lib/services/LogicAdvisor";
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

    // 3. Subscription Block check
    if (!Permissions.canUseAIAdvisor(profile)) {
      return NextResponse.json({ 
        reply: "Vylos Advisor is currently unavailable. Please check your account settings." 
      });
    }

    // 4. Usage Tracking & Limits
    const isDeveloper = user.email === 'bilxljxtt10@gmail.com';
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    let dailyUsed = 0;
    let monthlyUsed = 0;
    const monthlyLimit = Permissions.getAIMonthlyLimit(profile);

    if (!isDeveloper) {
      if (profile.subscription_tier === 'free') {
        const { data: dailyUsage } = await supabase
          .from('ai_daily_usage')
          .select('message_count')
          .eq('user_id', user.id)
          .eq('usage_date', today)
          .maybeSingle();
        
        dailyUsed = dailyUsage?.message_count || 0;
        if (dailyUsed >= 5) {
          return NextResponse.json({ 
            reply: "Daily AI limit reached. Please try again tomorrow." 
          }, { status: 429 });
        }
      } else {
        const { data: usageData } = await supabase
          .from('ai_usage')
          .select('*')
          .eq('user_id', user.id)
          .eq('billing_month', currentMonth)
          .maybeSingle();

        monthlyUsed = usageData?.messages_used || 0;
        if (monthlyUsed >= monthlyLimit) {
          return NextResponse.json({ 
            reply: `You have reached your Vylos Advisor limit of ${monthlyLimit} messages for this month. Upgrade your plan or wait until your limit resets next month.` 
          }, { status: 429 });
        }
      }
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
      
      RULES FOR STATEMENTS / PDF / EXPORTS:
      - If the user asks to download, export, print, or get a PDF of their statement, finances, transactions, or report, you MUST output a Markdown link: [Download PDF Statement](download-statement) in your response. Do not output any other link or invent a URL.

      GENERAL RULES:
      - Do NOT use emojis in your response under any circumstances. Keep the tone professional, direct, analytical, and written as if by a human financial analyst/advisor. Emojis make the response look automated/AI-generated, which is unacceptable for corporate presentation standards.
      - You provide general financial information only. You are not a licensed financial advisor.
      - Do not give regulated financial advice.
      - Do not invent numbers. If data is missing, say so.
      - Keep answers short, simple, practical, and supportive.
    `;

    const onboarding = profile.onboarding_answers || {};
    const hasOnboarding = onboarding && Object.keys(onboarding).length > 0;
    const onboardingSummary = hasOnboarding ? `
      User Profile Context (Onboarding Answers):
      - User Type: ${profile.user_type || onboarding.userType || "N/A"}
      - Age: ${profile.age || onboarding.age || "N/A"}
      - Budget Target Scope: ${onboarding.budgetTarget || "N/A"}
      - Prior Tracking Method: ${onboarding.trackingMethod || "N/A"}
      - Take-Home Monthly Income: ${context.currency}${parseFloat(onboarding.takeHomePay || "0").toLocaleString()}
      - Selected Hobbies & Outings: ${onboarding.hobbies ? onboarding.hobbies.join(", ") : "None"}
      - Monthly Outings Spend: ${context.currency}${parseFloat(onboarding.hobbiesSpend || "0").toLocaleString()}
      - Active Investing types: ${onboarding.investingTypes ? onboarding.investingTypes.join(", ") : "None"}
      - Survival Baseline essentials: ${context.currency}${parseFloat(onboarding.survivalBaseline || "0").toLocaleString()}
      - Debts/ Freedom Blockers: ${onboarding.debts && onboarding.debts.length > 0 ? onboarding.debts.map((d: any) => `${d.name} (${d.type}): Repayment ${context.currency}${parseFloat(d.repayment).toLocaleString()}/mo, Balance ${context.currency}${parseFloat(d.balance).toLocaleString()}`).join("; ") : "None"}
    ` : "";

    const summarisedData = `
      ${onboardingSummary}

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

    // 7. Call Railway AI Backend or Fallback
    let reply = "";
    try {
      const apiUrl = process.env.NEXT_PUBLIC_VYLOS_AI_API_URL;
      if (!apiUrl) throw new Error("Vylos AI URL is not configured");

      const backendResponse = await fetch(`${apiUrl}/bot/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          question: lastMessage, 
          user_id: user.id 
        }),
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        throw new Error(`Backend error: ${errorText}`);
      }

      const data = await backendResponse.json();
      reply = data.reply || data.answer || "";
    } catch (aiErr) {
      console.error("Railway AI Backend failed, falling back to Logic Engine:", aiErr);
      reply = LogicAdvisor.getFallbackResponse(lastMessage, context);
    }

    // 8. Increment Usage on Success
    if (!isDeveloper) {
      if (profile.subscription_tier === 'free') {
        await supabase.from('ai_daily_usage').upsert({
          user_id: user.id,
          usage_date: today,
          message_count: dailyUsed + 1,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,usage_date'
        });
      } else {
        await supabase.from('ai_usage').upsert({
          user_id: user.id,
          billing_month: currentMonth,
          messages_used: monthlyUsed + 1,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,billing_month'
        });
      }
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("AI Advisor Route Error:", err);
    return NextResponse.json({ reply: "Vylos Logic Engine: I'm currently unable to access your data to generate a response. Please try again." });
  }
}
