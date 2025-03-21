import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if this is a protected route
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = ['/login', '/signup'].includes(req.nextUrl.pathname);

  // Redirect if not authenticated and trying to access protected route
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if already authenticated and trying to access auth routes
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    // Auth routes
    '/login',
    '/signup',
  ],
}; 