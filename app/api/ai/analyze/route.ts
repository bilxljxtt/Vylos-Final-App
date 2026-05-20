import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { FinancialAdvisor } from "@/lib/ai/FinancialAdvisor";

export async function POST(req: NextRequest) {
  try {
    const { mode, data } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const advisor = new FinancialAdvisor();
    const result = await advisor.analyze(mode, data);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`AI Analyze API Error (${req.url}):`, error);
    return NextResponse.json({ error: "Failed to perform AI analysis due to an unexpected server error." }, { status: 500 });
  }
}
