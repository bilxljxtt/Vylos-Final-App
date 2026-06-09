import { NextRequest, NextResponse } from "next/server";
import { AdvisorEngine } from "@/lib/services/AdvisorEngine";
import { LogicAdvisor } from "@/lib/services/LogicAdvisor";
import { AiRouter } from "@/lib/ai/aiRouter";
import { AiLogger } from "@/lib/ai/aiLogger";
import { withAiRateLimit } from "@/lib/ai/aiLimitHelper";

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(req: NextRequest) {
  return withAiRateLimit(req, async (request, user, profile, supabase) => {
    const startTime = Date.now();
    let intent = "unknown_query";
    let aiNeeded = false;

    const { messages } = (await request.json()) as { messages?: ChatMessage[] };
    if (!messages || messages.length === 0) {
      return NextResponse.json({ reply: "No messages provided." });
    }
    const lastMessage = messages[messages.length - 1].content;

    // Fetch Context and Run Intent Detection
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
      if (intent === "pdf_statement_query") {
        const pdfAvailable = true;
        const answer = "Your budget statement is ready. You can download it below.";
        const responseData = {
          type: "pdf_statement",
          payload: { available: pdfAvailable }
        };
        const totalTime = Date.now() - startTime;
        console.log(`[AI Performance Log] Intent: ${intent} | PDF Response | Total Time: ${totalTime}ms`);
        return NextResponse.json({ reply: answer, source: "Logic Engine", layer: 3, data: responseData });
      }

      await AiLogger.logTurn(user.id, lastMessage, templateReply, "logic_engine", logicTime, true);
      const totalTime = Date.now() - startTime;
      console.log(`[AI Performance Log] Intent: ${intent} | Logic Calc Time: ${logicTime}ms | AI Needed: false | Total Time: ${totalTime}ms`);
      return NextResponse.json({ reply: templateReply, source: "Logic Engine", layer: 3 });
    }

    // AI is needed: route via multi-model router
    const result = await AiRouter.routeMessage(user.id, lastMessage);

    const totalTime = Date.now() - startTime;
    console.log(`[AI Performance Log] Intent: ${intent} | AI Needed: true | Source: ${result.source} | Total Time: ${totalTime}ms`);

    return NextResponse.json({ reply: result.reply, source: result.source, layer: result.layer });
  });
}
