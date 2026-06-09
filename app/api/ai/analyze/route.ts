import { NextRequest, NextResponse } from "next/server";
import { FinancialAdvisor } from "@/lib/ai/FinancialAdvisor";
import { withAiRateLimit } from "@/lib/ai/aiLimitHelper";

export async function POST(req: NextRequest) {
  return withAiRateLimit(req, async (request, user, profile, supabase) => {
    const { mode, data } = await request.json();

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const advisor = new FinancialAdvisor();
    const result = await advisor.analyze(mode, data);

    return NextResponse.json(result);
  });
}
