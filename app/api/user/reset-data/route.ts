import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = 'force-dynamic';

const TABLES_TO_DELETE = [
  "receipts",
  "receipt_upload_sessions",
  "goal_contributions",
  "goals",
  "reminder_completions",
  "reminders",
  "transactions",
  "budgets",
  "subscriptions",
  "notifications",
  "ai_conversations",
  "ai_usage",
  "ai_daily_usage",
  "xp_events",
  "streak_bonus_events",
  "feedback",
  "debts",
  "import_batches",
  "merchant_category_rules",
  "merchant_rules",
  "user_health_scores"
];

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user from server session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // 2. Validate request body confirmation text
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { confirmText } = body;
    if (confirmText !== "RESET") {
      return NextResponse.json({ error: "Confirmation text is required." }, { status: 400 });
    }

    // 3. Initialize Admin Client to bypass RLS limits
    const adminSupabase = createAdminClient();

    // 4. Perform ordered deletion to satisfy foreign key constraints
    for (const table of TABLES_TO_DELETE) {
      try {
        const { error } = await adminSupabase
          .from(table)
          .delete()
          .eq("user_id", userId);

        if (error) {
          // If a table is missing or doesn't exist, we log a warning but don't crash
          console.warn(`[Reset Account] Non-critical warning deleting from '${table}':`, error.message);
        }
      } catch (err: any) {
        console.warn(`[Reset Account] Exception deleting from '${table}':`, err.message);
      }
    }

    // 5. Reset the user profile settings for financial data (keep onboarding completed, answers, and terms)
    const { error: profileError } = await adminSupabase
      .from("user_profiles")
      .update({
        total_assets: 0,
        total_liabilities: 0,
        total_xp: 0,
        current_rank: "Scout Analyst",
        xp_multiplier: 1.0,
        current_streak: 0,
        longest_streak: 0,
        daily_consistency_score: 0,
        last_consistency_date: null,
        last_login_xp_date: null,
        dismissed_notifications: []
      })
      .eq("id", userId);

    if (profileError) {
      console.error("[Reset Account] Profile update error:", profileError);
      return NextResponse.json({ error: "Failed to reset profile settings." }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[Reset Account] Unexpected internal error:", error.message);
    return NextResponse.json({ error: "An unexpected error occurred during reset." }, { status: 500 });
  }
}
