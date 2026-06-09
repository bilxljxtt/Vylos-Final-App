import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { Permissions } from "@/lib/permissions";

export async function withAiRateLimit(
  req: NextRequest,
  handler: (req: NextRequest, user: any, profile: any, userSupabase: any) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch Profile from user_profiles to verify subscription tier & role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_internal_user, subscription_tier')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!Permissions.canUseAIAdvisor(profile as any)) {
      return NextResponse.json({
        error: "Vylos Advisor is currently unavailable. Please check your account settings."
      }, { status: 403 });
    }

    const isDeveloper = user.email === 'bilxljxtt10@gmail.com';
    const today = new Date().toISOString().slice(0, 10);
    let dailyUsed = 0;
    let monthlyUsed = 0;
    const monthlyLimit = Permissions.getAIMonthlyLimit(profile as any);

    const adminSupabase = createAdminClient();

    if (!isDeveloper) {
      if (profile.subscription_tier === 'free') {
        const { data: dailyUsage } = await adminSupabase
          .from('ai_daily_usage')
          .select('message_count')
          .eq('user_id', user.id)
          .eq('usage_date', today)
          .maybeSingle();

        dailyUsed = dailyUsage?.message_count || 0;
        if (dailyUsed >= 5) {
          return NextResponse.json({
            error: "Daily AI limit reached. Please try again tomorrow.",
            reply: "Daily AI limit reached. Please try again tomorrow."
          }, { status: 429 });
        }
      } else {
        let { data: usageData, error: usageErr } = await adminSupabase
          .from('ai_usage')
          .select('id, user_id, messages, date')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        if (usageErr) {
          console.warn("Failed to fetch monthly AI usage in rate limit wrapper:", usageErr.message);
        }

        if (!usageData && !usageErr) {
          try {
            const { data: newUsage, error: insertErr } = await adminSupabase
              .from('ai_usage')
              .insert([{ user_id: user.id, date: today, messages: 0 }])
              .select('id, user_id, messages, date')
              .maybeSingle();

            if (insertErr) {
              console.warn("Failed to auto-create ai_usage in rate limit wrapper:", insertErr.message);
            } else if (newUsage) {
              usageData = newUsage;
            }
          } catch (err: any) {
            console.warn("Exception during ai_usage auto-creation in rate limit wrapper:", err.message);
          }
        }

        monthlyUsed = usageData?.messages || 0;
        if (monthlyUsed >= monthlyLimit) {
          const limitMsg = `You have reached your Vylos Advisor limit of ${monthlyLimit} messages for this month. Upgrade your plan or wait until your limit resets next month.`;
          return NextResponse.json({
            error: limitMsg,
            reply: limitMsg
          }, { status: 429 });
        }
      }
    }

    // Call the actual AI handler
    const response = await handler(req, user, profile, supabase);

    // If successful (status 200) and not developer, increment usage using admin client
    if (response.status === 200 && !isDeveloper) {
      try {
        if (profile.subscription_tier === 'free') {
          await adminSupabase.from('ai_daily_usage').upsert({
            user_id: user.id,
            usage_date: today,
            message_count: dailyUsed + 1,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,usage_date'
          });
        } else {
          await adminSupabase.from('ai_usage').upsert({
            user_id: user.id,
            date: today,
            messages: monthlyUsed + 1
          }, {
            onConflict: 'user_id,date'
          });
        }
      } catch (err: any) {
        console.error("Exception incrementing usage in rate limit wrapper:", err.message);
      }
    }

    return response;
  } catch (error: any) {
    console.error("AI rate limit wrapper error:", error);
    return NextResponse.json({ error: "Internal server error during rate limit verification." }, { status: 500 });
  }
}
