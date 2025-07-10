const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and anon key
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUserRoles() {
  // Get all users in the profiles table
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }
  
  console.log('User profiles:');
  profiles.forEach(profile => {
    console.log(`ID: ${profile.id}`);
    console.log(`Email: ${profile.email || 'Not set'}`);
    console.log(`Role: ${profile.role || 'Not set'}`);
    console.log(`Name: ${profile.full_name || 'Not set'}`);
    console.log('-------------------');
  });

  // Count admin users
  const adminUsers = profiles.filter(profile => profile.role === 'admin');
  console.log(`Total users: ${profiles.length}`);
  console.log(`Admin users: ${adminUsers.length}`);
}

checkUserRoles();
