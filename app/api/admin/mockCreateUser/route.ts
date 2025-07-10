import { NextResponse } from 'next/server';


// Initialize Admin Supabase Client (with service role key)
const adminSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const adminSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!adminSupabaseUrl || !adminSupabaseKey) {
  throw new Error('Missing environment variables for Supabase Admin');
}



export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    console.log('Received request body:', body);
    
    const { 
      email,
      name, 
      membershipType = 'Free',
      daysLeft = 0, 
      affiliateLink = '', 
      status = 'Active',
      role = 'MEMBER'
    } = body;
    
    // Validate required fields
    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }
    
    // Generate a UUID for the user (simplified version for testing)
    // In production, this would be the ID from auth.users
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    
    // Return a mock successful response with the data that would have been created
    return NextResponse.json({
      id,
      email,
      full_name: name,
      role,
      membership_type: membershipType,
      days_left: daysLeft,
      affiliate_code: affiliateLink,
      status,
      created_at,
      updated_at: created_at
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error in mockCreateUser:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
