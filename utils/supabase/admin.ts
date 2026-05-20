import { createClient } from "@supabase/supabase-js";

let _supabaseAdmin: any = null;

export function createAdminClient() {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.warn("Supabase Admin credentials missing.");
    }
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  }
  return _supabaseAdmin;
}
