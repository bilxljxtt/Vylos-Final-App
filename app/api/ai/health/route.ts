import { NextRequest, NextResponse } from "next/server";
import { FinancialAdvisor } from "@/lib/ai/FinancialAdvisor";
import { withAiRateLimit } from "@/lib/ai/aiLimitHelper";

export async function POST(req: NextRequest) {
  return withAiRateLimit(req, async (request, user, profile, supabase) => {
    const { state } = await request.json();

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ 
        summary: "Please set your GOOGLE_AI_API_KEY in .env.local to enable AI insights.", 
        recommendations: [] 
      });
    }

    const advisor = new FinancialAdvisor();
    const result = await advisor.getHealthOverview(state);

    return NextResponse.json(result);
  });
}
