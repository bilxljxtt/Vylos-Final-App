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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'founder') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const results = await HealthScoreService.recalculateAllUserHealthScores();

    return NextResponse.json({
      success: true,
      processed_count: results.length,
      details: results
    });

  } catch (error: any) {
    console.error("Admin Refresh All API Error:", error);
    return NextResponse.json({ error: "Failed to refresh health scores due to an unexpected internal error." }, { status: 500 });
  }
}
