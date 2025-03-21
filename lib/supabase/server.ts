import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({
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
        },
      },
    }
  );
} 