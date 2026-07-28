import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import type { Database } from '@/lib/database.types';

/**
 * Refreshes the Supabase auth session on each request and optimistically gates
 * the /admin area. Called from `src/proxy.ts` (Next.js 16 renamed `middleware`
 * to `proxy`; it runs on the Node.js runtime).
 *
 * IMPORTANT: do not run other logic between creating the client and calling
 * `getUser()` — that call revalidates the token and refreshes cookies. Role
 * checks live in the DAL / Server Actions, not here (proxy is optimistic only).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminArea =
    path.startsWith('/admin') && !path.startsWith('/admin/login');

  // Not signed in and trying to reach a gated admin page → send to login.
  if (isAdminArea && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  return response;
}
