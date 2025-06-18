
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: 'driver' | 'admin' | null;
  loading: boolean;
  signIn: (mobile: string, pin: string) => Promise<{ error: any }>;
  signUp: (mobile: string, pin: string, userData: { full_name: string; role: 'driver' | 'admin' }) => Promise<{ error: any }>;
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

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        console.log('User role fetched:', data.role);
        setUserRole(data.role);
      } else {
        console.log('Error fetching user role:', error);
      }
    } catch (err) {
      console.log('Exception fetching user role:', err);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (mobile: string, pin: string) => {
    console.log('Attempting sign in for mobile:', mobile);
    
    try {
      // First try to find user by mobile number in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('mobile_number', mobile)
        .single();

      if (profileError || !profileData) {
        console.log('User not found:', profileError);
        return { error: { message: 'User not found. Please sign up first.' } };
      }

      // Use the email from profile to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: pin,
      });

      if (error) {
        console.log('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful:', data.user?.id);
      return { error: null };
    } catch (err) {
      console.log('Sign in exception:', err);
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signUp = async (
    mobile: string, 
    pin: string, 
    userData: { full_name: string; role: 'driver' | 'admin' }
  ) => {
    console.log('Attempting sign up for mobile:', mobile, 'role:', userData.role);
    
    try {
      // Check if mobile number already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('mobile_number')
        .eq('mobile_number', mobile)
        .single();

      if (existingProfile) {
        return { error: { message: 'Mobile number already registered. Please sign in instead.' } };
      }

      // Create a unique email using mobile number and timestamp
      const timestamp = Date.now();
      const email = `user_${mobile}_${timestamp}@tanker.app`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pin,
        options: {
          data: {
            ...userData,
            mobile_number: mobile
          },
          emailRedirectTo: undefined // Disable email confirmation completely
        }
      });

      if (error) {
        console.log('Sign up error:', error);
        return { error };
      }

      console.log('Sign up successful:', data.user?.id);
      return { error: null };
    } catch (err) {
      console.log('Sign up exception:', err);
      return { error: { message: 'An unexpected error occurred during signup' } };
    }
  };

  const signOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
    setUserRole(null);
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
