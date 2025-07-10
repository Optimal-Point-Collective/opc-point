import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Get authenticated user session from server component
export async function getSession() {
  const supabase = createServerComponentClient({ cookies });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Check if user is authenticated, redirect to login if not
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    // If no session, redirect to login
    redirect('/passport/login');
  }
  
  return session;
}

// Check if user has admin role, redirect to dashboard if not
export async function requireAdmin() {
  const session = await requireAuth();
  
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Check if user has admin role in profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (error || !profile || profile.role !== 'admin') {
      // If not admin, redirect to dashboard
      redirect('/dashboard');
    }
    
    return session;
  } catch (error) {
    console.error('Error checking admin role:', error);
    // If there's an error, redirect to dashboard to be safe
    redirect('/dashboard');
  }
}
