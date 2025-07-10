import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // If the user is logged in, redirect them to the dashboard.
  if (session) {
    redirect('/dashboard');
  }

  // If the user is not logged in, redirect to login page.
  redirect('/passport/login');
}
