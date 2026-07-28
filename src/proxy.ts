import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/proxy';

// Next.js 16: `middleware` was renamed to `proxy` (Node.js runtime only).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets and image files so the Supabase
     * session cookie is refreshed everywhere, while CSS/JS/images load freely.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
