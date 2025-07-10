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
    // Parse request body
    const body = await request.json();
    
    const { 
      email = '',
      name, 
      membershipType = 'Free',
      daysLeft = 0, 
      affiliateLink = '', 
      telegramId = '',
      status = 'Active',
      role = 'MEMBER',
      sendActivationEmail = false // Default to not sending email
    } = body;
    
    // Validate required fields
    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }
    
    // Check if user already exists by email (if email is provided)
    if (email) {
      // Check in auth.users instead of profiles since that's where emails are stored
      const { data: existingUsers, error: existingUserError } = await adminSupabase.auth.admin.listUsers();
      
      if (existingUserError) {
        console.error('Error checking for existing user:', existingUserError);
        return NextResponse.json({ error: 'Failed to check for existing user' }, { status: 500 });
      }
      
      // Manually filter users by email
      const userExists = existingUsers?.users.some(user => user.email?.toLowerCase() === email.toLowerCase());
      
      if (userExists) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
      }
    }

    console.log('Creating user with email:', email);
    
    // Validate admin permissions
    const { error: settingsError } = await adminSupabase.auth.admin.listUsers({
      perPage: 1, 
      page: 1
    });
    
    if (settingsError) {
      console.error('Admin permissions check failed:', settingsError);
      return NextResponse.json({ error: `Service role key authorization failed: ${settingsError.message}` }, { status: 401 });
    }
    
    console.log('Admin access validated, proceeding with user creation');
    
    // Create the user directly without invitation

    
    // Generate a username from the name
    const username = name.trim().toLowerCase().replace(/\s+/g, '.');
    // Generate a random password (will be replaced by user later)
    const tempPassword = Math.random().toString(36).slice(-10) + 
                       Math.random().toString(36).toUpperCase().slice(-2) + 
                       Math.floor(Math.random() * 10).toString();
    
    // Use provided email or generate a placeholder
    const userEmail = email?.trim() || `${username}@placeholder.opcpoint`;
    
    // Create the auth user with or without sending an email
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: userEmail,
      password: tempPassword,
      email_confirm: true, // Always confirm the email for admin-created accounts
      user_metadata: {
        name: name,
        full_name: name
      },
      // Only send the email if explicitly requested
      // If false, the user will be created but no email will be sent
      ...(sendActivationEmail ? { } : { email_confirm_only: true })
    });
    
    if (authError) {
      console.error('Error creating user:', authError);
      return NextResponse.json({ error: `Failed to create user: ${authError.message}` }, { status: 500 });
    }
    
    if (!authUser || !authUser.user) {
      console.error('No user data returned from create operation');
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
    }
    
    const userId = authUser.user.id;
    console.log('User created successfully with ID:', userId);
    
    // Wait a moment for the profile to be created by the trigger
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the profile with our additional data
    console.log('Updating profile for user ID:', userId);
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .update({
        full_name: name,
        role: role,
        membership_type: membershipType,
        days_left: daysLeft,
        affiliate_code: affiliateLink,
        telegram_id: telegramId,
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Clean up the auth user if profile update fails
      await adminSupabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: `Failed to create user profile: ${profileError.message}` }, { status: 500 });
    }
    
    const userProfile = profile;
    console.log('Profile updated successfully');
    
    // Return the created user data
    return NextResponse.json({
      id: userId,
      email: email || null,
      full_name: name,
      role: role,
      membership_type: membershipType,
      days_left: daysLeft,
      affiliate_code: affiliateLink,
      telegram_id: telegramId,
      status: status,
      created_at: userProfile.created_at,
      updated_at: userProfile.updated_at
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? `Server error: ${error.message}` : 'An unknown server error occurred';
    console.error('Error creating user:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
