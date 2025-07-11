import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Admin Supabase Client with service role key (has full access)
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
    const body = await request.json();
    const {
      email,
      name,
      membershipType = 'Free',
      daysLeft = 0,
      affiliateLink = '',
      telegramId = '',
      status = 'Pending', // Default to Pending for invited users
      role = 'MEMBER',
      sendActivationEmail = true, // Default to sending activation email
    } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    // Check if email looks like a placeholder email
    const isPlaceholderEmail = email.includes('@placeholder.opcpoint');
    
    if (isPlaceholderEmail) {
      console.log(`Creating user with placeholder email: ${email} (no invitation will be sent)`);
      
      // For placeholder emails, create the user without sending an invitation
      const { data: userData, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        user_metadata: { full_name: name },
        email_confirm: true, // Skip email confirmation for placeholder emails
      });

      if (createError) {
        console.error('Error creating user with placeholder email:', createError);
        return NextResponse.json({ error: `Failed to create user: ${createError.message}` }, { status: 500 });
      }

      if (!userData || !userData.user) {
        return NextResponse.json({ error: 'User data not returned from Supabase.' }, { status: 500 });
      }

      console.log('User created successfully with placeholder email. Auth ID:', userData.user.id);
      
      // Create the profile for placeholder email user
      const profileData = {
        id: userData.user.id,
        full_name: name,
        membership_type: membershipType,
        days_left: daysLeft,
        affiliate_code: affiliateLink,
        telegram_id: telegramId,
        status: status,
        role: role,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await adminSupabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return NextResponse.json({ error: `Failed to create user profile: ${profileError.message}` }, { status: 500 });
      }

      return NextResponse.json({ message: 'User created successfully (no email sent for placeholder address)' });
    }

    // For real email addresses, decide whether to send invitation or not
    if (sendActivationEmail) {
      console.log(`Inviting user with email: ${email}`);
      
      // Use inviteUserByEmail - it's idempotent. It creates the user and sends an invite.
      const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
        data: { full_name: name },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005'}/passport/set-password`
      });

      if (inviteError) {
        console.error('Error inviting user:', inviteError);
        return NextResponse.json({ error: `Failed to invite user: ${inviteError.message}` }, { status: 500 });
      }

      if (!inviteData || !inviteData.user) {
        return NextResponse.json({ error: 'Invited user data not returned from Supabase.' }, { status: 500 });
      }

      console.log('User invited successfully. Auth ID:', inviteData.user.id);
      
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the profile with additional details (the trigger creates a basic profile)
      const profileData = {
        full_name: name,
        membership_type: membershipType,
        days_left: daysLeft,
        affiliate_code: affiliateLink,
        telegram_id: telegramId,
        status: status,
        role: role,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await adminSupabase
        .from('profiles')
        .update(profileData)
        .eq('id', inviteData.user.id);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
        return NextResponse.json({ error: `Failed to update user profile: ${profileError.message}` }, { status: 500 });
      }

      return NextResponse.json({ message: 'User invited successfully - activation email sent' });
    } else {
      // Create user without sending invitation email
      console.log(`Creating user without invitation: ${email}`);
      
      const { data: userData, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        user_metadata: { full_name: name },
        email_confirm: true, // Skip email confirmation when not sending invitation
      });

      if (createError) {
        console.error('Error creating user without invitation:', createError);
        return NextResponse.json({ error: `Failed to create user: ${createError.message}` }, { status: 500 });
      }

      if (!userData || !userData.user) {
        return NextResponse.json({ error: 'User data not returned from Supabase.' }, { status: 500 });
      }

      console.log('User created successfully without invitation. Auth ID:', userData.user.id);
      
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the profile with additional details (the trigger creates a basic profile)
      const profileData = {
        full_name: name,
        membership_type: membershipType,
        days_left: daysLeft,
        affiliate_code: affiliateLink,
        telegram_id: telegramId,
        status: status,
        role: role,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await adminSupabase
        .from('profiles')
        .update(profileData)
        .eq('id', userData.user.id);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return NextResponse.json({ error: `Failed to create user profile: ${profileError.message}` }, { status: 500 });
      }

      return NextResponse.json({ message: 'User created successfully (no activation email sent)' });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Server error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
