import { NextRequest, NextResponse } from "next/server";
import { FinancialAdvisor } from "@/lib/ai/FinancialAdvisor";
import { withAiRateLimit } from "@/lib/ai/aiLimitHelper";

export async function POST(req: NextRequest) {
  return withAiRateLimit(req, async (request, user, profile, supabase) => {
    const { state, goal } = await request.json();

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ 
        isRealistic: true, 
        suggestedTimelineMonths: 12, 
        monthlyContribution: goal.targetAmount / 12, 
        analysis: "Please set your GOOGLE_AI_API_KEY in .env.local to enable AI-powered validation." 
      });
    }

    const advisor = new FinancialAdvisor();
    const result = await advisor.validateGoal(state, goal);

    return NextResponse.json(result);
  });
}
