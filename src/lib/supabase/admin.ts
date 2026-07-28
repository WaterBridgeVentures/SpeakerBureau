import 'server-only';

import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

/**
 * Privileged Supabase client using the service role key. BYPASSES Row Level
 * Security — use ONLY in trusted server-side code (Route Handlers, Server
 * Actions, cron jobs), e.g. sending the warm-intro email after admin approval.
 *
 * Never import this into a Client Component; the `server-only` guard above will
 * throw at build time if you do.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
