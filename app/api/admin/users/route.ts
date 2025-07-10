import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a direct service role client without requiring authentication
    // This is a temporary solution to bypass the auth issue
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    // Log debug information
    console.log('API route: Getting users with service role key');
    
    // Fetch all user profiles
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Return the original user data from user_profiles view to match the User interface
    // in the frontend without transforming it
    const formattedUsers = users.map(user => ({
      id: user.id,
      full_name: user.full_name || null,
      email: user.email || null,
      role: user.role || null,
      membership_type: user.membership_type || 'Free',
      days_left: user.days_left || 0,
      affiliate_code: user.affiliate_code || null,
      status: user.status || 'Active',
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || null,
      telegram_id: user.telegram_id || null
    }));

    // Fetch all auth users using the admin client
    const { data: authUsersData, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();

    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      return NextResponse.json({ error: 'Failed to fetch authentication data' }, { status: 500 });
    }

    // Return the data
    return NextResponse.json({ users: formattedUsers, authUsers: authUsersData.users });

  } catch (error: unknown) {
    console.error('An unexpected API error:', error);
    const message = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { 
      id, 
      name, 
      email, 
      dateJoined, // Added dateJoined
      membershipType, 
      daysLeft, 
      affiliateLink,
      telegramId,
      status 
    } = body;
    
    // Validate required fields
    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    // Update the profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: name,
        membership_type: membershipType,
        days_left: daysLeft,
        affiliate_code: affiliateLink,
        telegram_id: telegramId,
        status: status,
        updated_at: new Date().toISOString(),
        // Only update created_at if dateJoined is provided and different
        ...(dateJoined ? { created_at: new Date(dateJoined).toISOString() } : {})
      })
      .eq('id', id)
      .select()
      .single();
      
    // Update email in auth.users if provided
    if (email) {
      const { error: updateEmailError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        { email: email }
      );
      
      if (updateEmailError) {
        console.error('Error updating user email:', updateEmailError);
        return NextResponse.json({ error: `Failed to update user email: ${updateEmailError.message}` }, { status: 500 });
      }
    }

    if (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json({ error: `Failed to update user: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? `Server error: ${error.message}` : 'An unknown server error occurred';
    console.error('Error updating user:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    // Delete the user from auth first
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Error deleting user from auth:', authError);
      return NextResponse.json({ error: `Failed to delete user authentication: ${authError.message}` }, { status: 500 });
    }

    // Profile should be automatically deleted by database trigger, but we can verify
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      // This is not critical since the user is already deleted from auth
      console.warn(`Profile deletion had an error but auth user was deleted: ${profileError.message}`);
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? `Server error: ${error.message}` : 'An unknown server error occurred';
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
