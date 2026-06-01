import { NextRequest, NextResponse } from "next/server";
import { AdvisorEngine } from "@/lib/services/AdvisorEngine";

interface ChatMessage {
  role: string;
  content: string;
}

interface OnboardingDebt {
  name: string;
  type: string;
  repayment: string;
  balance: string;
}
import { LogicAdvisor } from "@/lib/services/LogicAdvisor";
import { createClient } from "@/utils/supabase/server";
import { Permissions } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let intent = "unknown_query";
  let aiNeeded = false;
  let promptSize = 0;
  let ollamaTime = 0;
  let fallbackUsed = "None";

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
    const token = session?.access_token;

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

    // Fetch user health score from Supabase
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

    // 6. Intent Detection & Logic templates first
    const logicStartTime = Date.now();
    intent = LogicAdvisor.detectIntent(lastMessage);
    const calculatedData = LogicAdvisor.calculateAnswer(intent, lastMessage, context, healthScore);
    const templateReply = LogicAdvisor.getTemplateResponse(intent, calculatedData, context);
    const logicTime = Date.now() - logicStartTime;

    aiNeeded = LogicAdvisor.shouldUseAI(intent, lastMessage);

    const routeTimeout = 30000; // 30 seconds total route timeout
    let reply = "";
    let source = "Logic Engine";
    let layer = 3;

    if (!aiNeeded) {
      // Return Logic template instantly
      await incrementUsage(supabase, profile, user.id, isDeveloper, today, currentMonth, dailyUsed, monthlyUsed);
      await logConversation(supabase, user.id, lastMessage, templateReply);
      const totalTime = Date.now() - startTime;
      console.log(`[AI Performance Log] Intent: ${intent} | Logic Calc Time: ${logicTime}ms | AI Needed: false | Total Time: ${totalTime}ms`);
      return NextResponse.json({ reply: templateReply, source: "Logic Engine", layer: 3 });
    }

    // AI is needed to polish wording / explain
    const summarisedData = `
      Intent: ${intent}
      Logic Result: ${calculatedData.calculatedAnswer}
      Supporting Data: ${JSON.stringify(calculatedData.supportingData)}
      
      Income: ${context.currency}${context.income.toLocaleString()}
      Expenses: ${context.currency}${context.expenses.toLocaleString()}
      Net Cash Flow: ${context.currency}${context.netCashFlow.toLocaleString()}
      Total Saved: ${context.currency}${context.goalProgress.reduce((acc, g) => acc + g.current, 0).toLocaleString()}
      Financial Health Score: ${healthScore}/100
    `;

    const isGeneral = LogicAdvisor.isGeneralOrEducational(lastMessage);
    const systemInstruction = isGeneral
      ? `
      You are Vylos Advisor, a financial guidance assistant inside the Vylos app. 
      Answer the user's financial or budgeting question with practical, clear, and professional guidance.
      Keep your answer concise and easy to read, using 3-5 short bullet points.
      
      GENERAL RULES:
      - Do NOT use emojis in your response under any circumstances. Keep the tone professional, direct, analytical, and written as if by a human financial analyst/advisor. Emojis make the response look automated/AI-generated, which is unacceptable for corporate presentation standards.
      - You provide general financial information only. You are not a licensed financial advisor.
      - Do not give regulated financial advice.
      - Keep answers short, simple, practical, and supportive.
      `
      : `
      You are Vylos Advisor, a financial guidance assistant inside the Vylos app. 
      Answer in 3-5 short bullet points. Do not calculate anything. Use only the provided calculated data. If data is missing, say what is missing.
      
      RULES FOR STATEMENTS / PDF / EXPORTS:
      - If the user asks to download, export, print, or get a PDF of their statement, finances, transactions, or report, you MUST output a Markdown link: [Download PDF Statement](download-statement) in your response. Do not output any other link or invent a URL.

      GENERAL RULES:
      - Do NOT use emojis in your response under any circumstances. Keep the tone professional, direct, analytical, and written as if by a human financial analyst/advisor. Emojis make the response look automated/AI-generated, which is unacceptable for corporate presentation standards.
      - You provide general financial information only. You are not a licensed financial advisor.
      - Do not give regulated financial advice.
      - Do not invent numbers. If data is missing, say so.
      - Keep answers short, simple, practical, and supportive.
    `;

    const fullPrompt = `
      ${systemInstruction}

      User question:
      ${lastMessage}

      Calculated context structure:
      ${summarisedData}
    `;

    promptSize = fullPrompt.length;

    // Build the messages history for Ollama, inserting the prompt context into the latest user query
    const conversationHistory: ChatMessage[] = Array.isArray(messages) && messages.length > 0
      ? messages.map((m: ChatMessage, idx: number) => {
        if (idx === messages.length - 1 && m.role === 'user') {
          return { role: m.role, content: fullPrompt };
        }
        return { role: m.role, content: m.content };
      })
      : [{ role: "user", content: fullPrompt }];

    // Ollama timeout check (max 20 seconds, or remaining route time)
    const ollamaTimeoutMs = Math.max(1000, Math.min(20000, routeTimeout - (Date.now() - startTime)));

    try {
      console.log("[AI Router] Attempting to reach Local Ollama at:", process.env.LOCAL_OLLAMA_URL);
      const ollamaStartTime = Date.now();
      reply = await callLocalOllama(conversationHistory, ollamaTimeoutMs);
      ollamaTime = Date.now() - ollamaStartTime;
      source = "Local Ollama";
      layer = 1;
      console.log("[AI Router] Success: Response came from: Local Ollama");
    } catch (ollamaErr) {
      const ollamaErrMsg = ollamaErr instanceof Error ? ollamaErr.message : String(ollamaErr);
      console.warn(`[AI Router] Local Ollama failed or timed out. Falling back to Railway backend. Error: ${ollamaErrMsg}`);

      const elapsed = Date.now() - startTime;
      const remainingForRailway = Math.max(1000, routeTimeout - elapsed - 2000); // 2s buffer for network response overhead
      fallbackUsed = "Railway";

      try {
        console.log(`[AI Router] Attempting to reach Railway Backend with ${remainingForRailway}ms timeout...`);
        reply = await callRailwayChatbot(lastMessage, user.id, token, summarisedData, fullPrompt, remainingForRailway);
        source = "Railway fallback";
        layer = 2;
        console.log("[AI Router] Success: Response came from: Railway fallback");
      } catch (railwayErr) {
        const railwayErrMsg = railwayErr instanceof Error ? railwayErr.message : String(railwayErr);
        console.error(`[AI Router] Railway backend failed. Falling back to Logic Engine. Error: ${railwayErrMsg}`);
        fallbackUsed = "Logic Engine Fallback";

        reply = templateReply; // Fall back to logic template response directly
        source = "Logic Engine";
        layer = 3;
        console.log("[AI Router] Success: Response came from: Logic Engine");
      }
    }

    // 8. Increment Usage on Success
    await incrementUsage(supabase, profile, user.id, isDeveloper, today, currentMonth, dailyUsed, monthlyUsed);
    await logConversation(supabase, user.id, lastMessage, reply);

    const totalTime = Date.now() - startTime;
    console.log(`[AI Performance Log] Intent: ${intent} | Logic Calc Time: ${logicTime}ms | AI Needed: true | Prompt Size: ${promptSize} chars | Ollama Time: ${ollamaTime}ms | Fallback: ${fallbackUsed} | Total Time: ${totalTime}ms`);

    return NextResponse.json({ reply, source, layer });
  } catch (err) {
    console.error("AI Advisor Route Error:", err);
    return NextResponse.json({ reply: "Vylos Logic Engine: I'm currently unable to access your data to generate a response. Please try again." });
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

async function logConversation(supabase: any, userId: string, userMessage: string, aiMessage: string) {
  try {
    await supabase.from('ai_conversations').insert([
      { user_id: userId, content: userMessage, role: 'user' },
      { user_id: userId, content: aiMessage, role: 'ai' }
    ]);
  } catch (err) {
    console.error("Failed to log conversation to Supabase:", err);
  }
}

async function callLocalOllama(conversationHistory: ChatMessage[], timeoutMs: number = 20000): Promise<string> {
  const ollamaUrl = process.env.LOCAL_OLLAMA_URL;
  if (!ollamaUrl) {
    throw new Error("LOCAL_OLLAMA_URL is not configured in environment variables");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(ollamaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "phi3:mini",
        messages: conversationHistory,
        stream: false,
        keep_alive: "30m",
        options: {
          keep_alive: "30m",
          temperature: 0.3,
          num_predict: 120,
          num_ctx: 2048
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Local Ollama returned status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.message?.content || data.response;
    if (!content) {
      throw new Error("No content in Ollama response");
    }
    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callRailwayChatbot(
  lastMessage: string, 
  userId: string, 
  token?: string, 
  contextData?: string, 
  fullPrompt?: string, 
  timeoutMs: number = 10000
): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_VYLOS_AI_API_URL;
  if (!apiUrl) {
    throw new Error("Vylos AI URL is not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${apiUrl}/bot/ask`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        question: lastMessage,
        user_id: userId,
        context: contextData,
        full_prompt: fullPrompt
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Railway backend returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.reply || data.answer || "";
  } finally {
    clearTimeout(timeoutId);
  }
}
