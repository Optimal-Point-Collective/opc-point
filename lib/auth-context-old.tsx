"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabaseClient";

interface UserProfile {
  id: string;
  email?: string;
  role: 'USER' | 'ADMIN';
  full_name?: string;
  membership_type?: string;
  subscription_end_date?: string;
  days_left?: number;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoized fetch profile function
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setError(error.message);
        return null;
      }

      setError(null);
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to fetch user profile");
      return null;
    }
  }, []);

  // Memoized refresh profile function
  const refreshProfile = useCallback(async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    }
  }, [user, fetchUserProfile]);

  // Session recovery function
  const recoverSession = useCallback(async () => {
    if (isRecovering || !sessionChecked) return;
    
    try {
      setIsRecovering(true);
      console.log('Attempting session recovery...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session recovery error:', error);
        // Don't set error here to avoid conflicts
        return;
      }
      
      if (session?.user) {
        // Only update if the user is actually different
        if (!user || user.id !== session.user.id) {
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
          console.log('Session recovered successfully');
        }
      }
    } catch (error) {
      console.error('Session recovery failed:', error);
      // Don't set error state in recovery to avoid conflicts
    } finally {
      setIsRecovering(false);
    }
  }, [isRecovering, sessionChecked, user, fetchUserProfile]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      router.push('/passport/login');
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Only check session once
        if (sessionChecked) return;

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(sessionError.message);
          setSessionChecked(true);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
          }
        }

        if (mounted) {
          setSessionChecked(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setError("Failed to initialize authentication");
          setSessionChecked(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", event);

      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          if (session?.user) {
            setUser(session.user);
            const userProfile = await fetchUserProfile(session.user.id);
            if (mounted) {
              setProfile(userProfile);
              setError(null);
            }
          }
          break;
          
        case 'SIGNED_OUT':
          setUser(null);
          setProfile(null);
          setError(null);
          // Don't redirect here - let individual pages handle it
          break;
          
        case 'USER_UPDATED':
          if (session?.user) {
            setUser(session.user);
            // Refresh profile data
            const userProfile = await fetchUserProfile(session.user.id);
            if (mounted) {
              setProfile(userProfile);
            }
          }
          break;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [sessionChecked, fetchUserProfile]);

  // Handle focus/blur events for desktop switching
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionChecked) return;

    let focusTimer: NodeJS.Timeout;
    let blurTimer: NodeJS.Timeout;

    const handleFocus = () => {
      clearTimeout(blurTimer);
      
      // Delay recovery to avoid rapid fire events
      focusTimer = setTimeout(() => {
        if (user && sessionChecked && !isRecovering) {
          console.log('Window focused, checking session...');
          recoverSession();
        }
      }, 500); // Increased delay to prevent rapid firing
    };

    const handleBlur = () => {
      clearTimeout(focusTimer);
      
      // Set a longer timer for blur to prevent unnecessary operations
      blurTimer = setTimeout(() => {
        console.log('Window blurred for extended time');
      }, 2000); // Increased delay
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBlur();
      } else {
        handleFocus();
      }
    };

    // Only add listeners if we have a user and session is checked
    if (user && sessionChecked) {
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Cleanup
    return () => {
      clearTimeout(focusTimer);
      clearTimeout(blurTimer);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, sessionChecked, isRecovering]); // Removed recoverSession from deps

  const isAdmin = profile?.role === 'ADMIN';

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    error,
    refreshProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
