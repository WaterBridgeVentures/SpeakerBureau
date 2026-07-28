import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';

/**
 * Auth redirect target for two flows:
 *  - OAuth (LinkedIn OIDC): exchanges the PKCE `code` for a session.
 *  - Email / magic-link (e.g. admin sign-in): verifies a `token_hash`.
 * The server client writes the session cookies, then we return the user to
 * `next` (defaults to /nominate).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get('next') ?? '/nominate';
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // No/invalid credentials — send them back with a flag so the form can show a
  // message. Manual entry (and the admin password login) still work.
  return NextResponse.redirect(`${origin}/nominate?linkedin=error`);
}
