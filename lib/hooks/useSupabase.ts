import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export function useSupabase() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        console.log('Session retrieved:', session ? 'Session exists' : 'No session');
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Unexpected error during getSession:', error);
      } finally {
        setLoading(false);
      }
    };

    // Call the function to get the initial session
    getInitialSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Explicitly set the session after login for better reliability
        if (event === 'SIGNED_IN' && newSession) {
          console.log('Explicitly setting session after sign in');
          await supabase.auth.setSession(newSession);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (options: any) => {
    const { error } = await supabase.auth.signInWithPassword(options);
    
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
    
    // Perform a full page reload after login to ensure middleware processes the new session
    window.location.href = '/dashboard';
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'facebook') => {
    // Get the current URL to use as a redirect URL
    const redirectTo = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo
      }
    });
    
    if (error) {
      console.error(`Sign in with ${provider} error:`, error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('Signing out');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    // Perform a full page reload after logout to ensure middleware processes the session change
    window.location.href = '/login';
  };

  return {
    supabase,
    user,
    session,
    loading,
    signIn,
    signInWithProvider,
    signOut
  };
} 