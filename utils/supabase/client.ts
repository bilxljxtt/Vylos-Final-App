import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient(options: { persistSession?: boolean } = {}) {
  // If we need a specific persistence, we might need a new client or reconfigure
  // But usually for SSR, we want a singleton for the browser.
  if (client && options.persistSession === undefined) return client

  const newClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: options.persistSession ?? true,
        storage: (options.persistSession === false) ? 
          (typeof window !== 'undefined' ? window.sessionStorage : undefined) : 
          (typeof window !== 'undefined' ? window.localStorage : undefined),
      }
    }
  )
  
  if (!client) client = newClient
  return newClient
}
