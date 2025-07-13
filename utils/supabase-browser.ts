import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient({
      options: {
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'x-application-name': 'opc-point',
          },
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      },
    });
  }
  
  return supabaseInstance;
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  
  if (error?.code === 'PGRST301') {
    return 'Authentication required. Please sign in.';
  }
  
  if (error?.code === '23505') {
    return 'This record already exists.';
  }
  
  if (error?.message?.includes('JWT expired')) {
    return 'Your session has expired. Please sign in again.';
  }
  
  return error?.message || 'An unexpected error occurred.';
}
