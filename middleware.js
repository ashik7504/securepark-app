// middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          req.cookies.set({ name, value, ...options });
          // The middleware must update the response to persist the cookie
          return res;
        },
        remove(name, options) {
          req.cookies.set({ name, value: '', ...options });
          // The middleware must update the response to persist the cookie
          return res;
        },
      },
    }
  );

  // This refreshes the session cookie on every request, which is crucial for Server Components.
  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};