'use client';

import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';

export function LinkedInButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/nominate`,
        scopes: 'openid profile email',
      },
    });
    // On success the browser is redirected to LinkedIn, so we only reach here
    // on failure (e.g. the provider isn't configured in Supabase yet).
    if (error) {
      setError(error.message);
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={connect}
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0a66c2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#004182] disabled:opacity-50"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-current"
        >
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
        </svg>
        {pending ? 'Redirecting…' : 'Sign in with LinkedIn to autofill'}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
