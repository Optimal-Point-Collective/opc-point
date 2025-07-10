import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint resends an invitation email to a user who has not yet accepted their initial invite.

// Initialize Admin Supabase Client
const adminSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const adminSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!adminSupabaseUrl || !adminSupabaseKey) {
  console.error('Missing environment variables for Supabase');
  throw new Error('Server configuration error');
}

const adminSupabase = createClient(adminSupabaseUrl, adminSupabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Attempting to resend invitation to: ${email}`);

    // Supabase's inviteUserByEmail is idempotent. If the user is already in an invited state,
    // it invalidates the old link and sends a new one.
    const { error } = await adminSupabase.auth.admin.inviteUserByEmail(email);

    if (error) {
      console.error('Error resending invitation:', error);
      return NextResponse.json({ error: `Failed to resend invitation: ${error.message}` }, { status: 500 });
    }

    console.log(`Invitation successfully resent to: ${email}`);
    return NextResponse.json({ message: 'Invitation resent successfully' });

  } catch (error: unknown) {
    const message = error instanceof Error ? `Server error: ${error.message}` : 'An unknown server error occurred';
    console.error('Server error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
