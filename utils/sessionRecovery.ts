import { supabase } from './supabaseClient';

export interface SessionRecoveryResult {
  success: boolean;
  user: any | null;
  error: string | null;
}

export const recoverSession = async (): Promise<SessionRecoveryResult> => {
  try {
    console.log('Attempting session recovery...');
    
    // First, try to get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session recovery error:', sessionError);
      return {
        success: false,
        user: null,
        error: sessionError.message
      };
    }
    
    if (session?.user) {
      console.log('Session recovered successfully');
      return {
        success: true,
        user: session.user,
        error: null
      };
    }
    
    // If no session found, try to refresh the token
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('Token refresh error:', refreshError);
      return {
        success: false,
        user: null,
        error: refreshError.message
      };
    }
    
    if (refreshedSession?.user) {
      console.log('Session refreshed successfully');
      return {
        success: true,
        user: refreshedSession.user,
        error: null
      };
    }
    
    console.log('No session found during recovery');
    return {
      success: false,
      user: null,
      error: 'No valid session found'
    };
    
  } catch (error) {
    console.error('Session recovery failed:', error);
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const clearSessionData = () => {
  try {
    // Clear any cached session data
    localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
    sessionStorage.clear();
    
    // Clear any other auth-related data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('Session data cleared');
  } catch (error) {
    console.error('Error clearing session data:', error);
  }
};

export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null && session.user !== null;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};
