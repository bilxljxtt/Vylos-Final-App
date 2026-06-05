import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { HealthScoreService } from "@/lib/services/HealthScoreService";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting: Only allow recalculation once every 5 minutes
    const { data: lastScore } = await supabase
      .from('user_health_scores')
      .select('calculated_at')
      .eq('user_id', user.id)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastScore) {
      const lastCalc = new Date(lastScore.calculated_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastCalc.getTime()) / (1000 * 60);
      
      if (diffMinutes < 5) {
        return NextResponse.json({ 
          error: "Calculation too frequent. Please wait 5 minutes between updates.",
          nextAvailableAt: new Date(lastCalc.getTime() + 5 * 60 * 1000).toISOString()
        }, { status: 429 });
      }
    }

    const result = await HealthScoreService.recalculateUserHealthScore(user.id);

    return NextResponse.json({
      success: true,
      score: result.score,
      status: result.status,
      breakdown: result.breakdown
    });

  } catch (error: any) {
    console.error("Recalculate API Error:", error);
    return NextResponse.json({ error: "Failed to recalculate health score due to an unexpected internal error." }, { status: 500 });
  }
}
