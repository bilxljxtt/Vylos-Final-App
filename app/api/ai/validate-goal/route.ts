import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { FinancialAdvisor } from "@/lib/ai/FinancialAdvisor";

export async function POST(req: NextRequest) {
  try {
    const { state, goal } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  } catch (error: any) {
    console.error("AI Goal Validation API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
