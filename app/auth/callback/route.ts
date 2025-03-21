import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Create a separate response object for this route
  const response = new NextResponse();
  const cookieStore = cookies();
  
  // Add detailed logging for debugging
  console.log('Auth callback route called');

  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    console.log('OAuth code found');
    
    // Create a Supabase client for handling the auth callback
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            // Add security settings to cookies
            cookieStore.set({
              name,
              value,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              ...options
            });
            
            // Also set the cookie on the response for client-side access
            response.cookies.set({
              name,
              value,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              ...options
            });
          },
          remove(name, options) {
            cookieStore.set({
              name,
              value: '',
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              ...options,
              maxAge: 0
            });
            
            // Also remove from the response
            response.cookies.set({
              name,
              value: '',
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              ...options,
              maxAge: 0
            });
          },
        },
      }
    );

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/login?error=auth_callback_error', req.url));
    }

    // Redirect to the dashboard upon successful authentication
    console.log('Auth callback successful, redirecting to dashboard');
    
    // Get the redirectTo URL if it exists
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  // Redirect to login page if no code was provided
  console.log('No OAuth code found, redirecting to login');
  return NextResponse.redirect(new URL('/login', req.url));
}