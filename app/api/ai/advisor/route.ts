import { NextRequest, NextResponse } from "next/server";
import { AdvisorEngine } from "@/lib/services/AdvisorEngine";
import { LogicAdvisor } from "@/lib/services/LogicAdvisor";
import { createClient } from "@/utils/supabase/server";
import { Permissions } from "@/lib/permissions";
import { AiRouter } from "@/lib/ai/aiRouter";
import { AiLogger } from "@/lib/ai/aiLogger";

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let intent = "unknown_query";
  let aiNeeded = false;

  try {
    const { messages } = (await req.json()) as { messages?: ChatMessage[] };
    if (!messages || messages.length === 0) {
      return NextResponse.json({ reply: "No messages provided." });
    }
    const lastMessage = messages[messages.length - 1].content;

    // 1. Authenticate User
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ reply: "I need you to be logged in to help with your finances." });
    }

    // 2. Fetch Profile to check Tier
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_internal_user, subscription_tier')
      .eq('id', user.id)
      .single();
    if (!profile) return NextResponse.json({ reply: "Profile not found." });

    // 3. Subscription Block check
    if (!Permissions.canUseAIAdvisor(profile as any)) {
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
    const monthlyLimit = Permissions.getAIMonthlyLimit(profile as any);

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
          .select('messages_used')
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

    // 5. Fetch Context and Run Intent Detection
    const context = await AdvisorEngine.getContext(user.id);
    let healthScore = 70;
    try {
      const { data: scoreData } = await supabase
        .from('user_health_scores')
        .select('score')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (scoreData?.score !== undefined) {
        healthScore = scoreData.score;
      }
    } catch (err) {
      console.warn("Failed to fetch health score from DB:", err);
    }

    const logicStartTime = Date.now();
    intent = LogicAdvisor.detectIntent(lastMessage);
    const calculatedData = LogicAdvisor.calculateAnswer(intent, lastMessage, context, healthScore);
    const templateReply = LogicAdvisor.getTemplateResponse(intent, calculatedData, context);
    const logicTime = Date.now() - logicStartTime;

    aiNeeded = LogicAdvisor.shouldUseAI(intent, lastMessage);

    if (!aiNeeded) {
      // Return Logic template instantly
      await incrementUsage(supabase, profile, user.id, isDeveloper, today, currentMonth, dailyUsed, monthlyUsed);
      await AiLogger.logTurn(user.id, lastMessage, templateReply, "logic_engine", logicTime, true);
      const totalTime = Date.now() - startTime;
      console.log(`[AI Performance Log] Intent: ${intent} | Logic Calc Time: ${logicTime}ms | AI Needed: false | Total Time: ${totalTime}ms`);
      return NextResponse.json({ reply: templateReply, source: "Logic Engine", layer: 3 });
    }

    // AI is needed: route via multi-model router
    const result = await AiRouter.routeMessage(user.id, lastMessage);

    // Increment usage on success
    await incrementUsage(supabase, profile, user.id, isDeveloper, today, currentMonth, dailyUsed, monthlyUsed);

    const totalTime = Date.now() - startTime;
    console.log(`[AI Performance Log] Intent: ${intent} | AI Needed: true | Source: ${result.source} | Total Time: ${totalTime}ms`);

    return NextResponse.json({ reply: result.reply, source: result.source, layer: result.layer });
  } catch (err) {
    console.error("AI Advisor Route Error:", err);
    return NextResponse.json({ 
      reply: "Vylos Logic Engine: I'm currently unable to access your data to generate a response. Please try again.",
      source: "Logic Engine Fallback",
      layer: 5
    });
  }
}

async function incrementUsage(
  supabase: any,
  profile: any,
  userId: string,
  isDeveloper: boolean,
  today: string,
  currentMonth: string,
  dailyUsed: number,
  monthlyUsed: number
) {
  if (isDeveloper) return;
  if (profile.subscription_tier === 'free') {
    await supabase.from('ai_daily_usage').upsert({
      user_id: userId,
      usage_date: today,
      message_count: dailyUsed + 1,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,usage_date'
    });
  } else {
    await supabase.from('ai_usage').upsert({
      user_id: userId,
      billing_month: currentMonth,
      messages_used: monthlyUsed + 1,
      last_used_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,billing_month'
    });
  }
}
