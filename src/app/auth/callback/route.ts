import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * OAuth (LinkedIn OIDC) redirect target. Exchanges the PKCE code for a session
 * — the server client writes the session cookies — then returns the user to
 * wherever they started (`next`, defaults to /nominate).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/nominate';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code, or exchange failed — send them back with a flag so the form can
  // show a message. Manual entry still works.
  return NextResponse.redirect(`${origin}/nominate?linkedin=error`);
}
