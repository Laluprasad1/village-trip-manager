
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: 'driver' | 'admin' | null;
  loading: boolean;
  authError: string | null;
  initialLoadComplete: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { full_name: string; mobile_number: string; role: 'driver' | 'admin' }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'driver' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Memoize fetchUserRole to prevent unnecessary re-renders
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        setAuthError('Failed to fetch user role');
        return;
      }

      setUserRole(data?.role ?? null);
      setInitialLoadComplete(true);
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      setAuthError('Failed to fetch user role');
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isSubscribed) return;

        setSession(session);
        setUser(session?.user ?? null);
        setAuthError(null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isSubscribed) return;

      if (error) {
        console.error('Error getting session:', error);
        setAuthError('Failed to get session');
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    }).catch((err) => {
      console.error('Error in getSession:', err);
      setAuthError('Failed to get session');
      setLoading(false);
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setAuthError(error.message);
      }

      return { error };
    } catch (err) {
      console.error('Error in signIn:', err);
      setAuthError('Failed to sign in');
      return { error: err };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { full_name: string; mobile_number: string; role: 'driver' | 'admin' }
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    authError,
    initialLoadComplete,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
