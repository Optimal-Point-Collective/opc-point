# Admin Routes Security Review

## Executive Summary

After reviewing the `/app/api/admin/` routes, I've identified critical security vulnerabilities related to service-role key usage. All admin routes are currently using the service-role key directly without proper authentication checks, creating significant security risks.

## Current State Analysis

### 1. Service-Role Key Usage

All admin routes are using the service-role key:
- `/app/api/admin/createUser/route.ts`
- `/app/api/admin/mockCreateUser/route.ts`
- `/app/api/admin/resend-invite/route.ts`
- `/app/api/admin/users/route.ts`

**Critical Issue**: These routes instantiate Supabase clients with `SUPABASE_SERVICE_ROLE_KEY` directly in the API routes without any authentication checks.

### 2. Environment Variable Exposure

**Good**: The service-role key is correctly stored as `SUPABASE_SERVICE_ROLE_KEY` (without `NEXT_PUBLIC_` prefix), which means it won't be exposed to the browser.

**Bad**: The routes themselves are publicly accessible without authentication.

### 3. Missing Authentication

**Critical Issue**: None of the admin routes check if the requesting user:
- Is authenticated
- Has admin privileges
- Has permission to perform the requested operation

## Security Vulnerabilities

1. **Unauthenticated Access**: Anyone who knows the API endpoints can create users, delete users, or modify user data.

2. **No Rate Limiting**: These endpoints could be abused for DoS attacks or mass user creation.

3. **Direct Database Access**: Using service-role key bypasses all Row Level Security (RLS) policies.

4. **No Audit Trail**: Actions performed through these endpoints are not tracked or attributed to specific admin users.

## Recommended Solutions

### 1. Immediate Security Fixes

Create a middleware function to protect admin routes:

```typescript
// app/api/admin/_middleware.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function verifyAdmin(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (profile?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  return null; // Allow request to proceed
}
```

### 2. Migrate to Server Actions (Recommended)

Convert admin functions to Server Actions that run on the server with proper authentication:

```typescript
// app/actions/admin.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function createUser(userData: UserInput) {
  const supabase = createServerActionClient({ cookies });
  
  // Verify admin status
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (profile?.role !== 'ADMIN') throw new Error('Forbidden');
  
  // Use admin client only after verification
  const adminSupabase = createAdminClient();
  
  // Perform admin operation
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email: userData.email,
    // ... other user data
  });
  
  // Log admin action
  await supabase.from('admin_audit_log').insert({
    admin_id: session.user.id,
    action: 'CREATE_USER',
    target_user_id: data?.user?.id,
    metadata: userData,
    timestamp: new Date().toISOString()
  });
  
  return { data, error };
}

// Helper to create admin client (isolated)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

### 3. Implement RLS-Based Admin Functions

Create database functions that respect RLS:

```sql
-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user management function
CREATE OR REPLACE FUNCTION admin_create_user(
  user_email TEXT,
  user_name TEXT,
  user_role TEXT DEFAULT 'MEMBER'
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if caller is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Create user (would need to use auth.users through extension)
  -- This is a simplified example
  INSERT INTO profiles (email, full_name, role)
  VALUES (user_email, user_name, user_role)
  RETURNING id INTO new_user_id;
  
  -- Log action
  INSERT INTO admin_audit_log (admin_id, action, target_user_id)
  VALUES (auth.uid(), 'CREATE_USER', new_user_id);
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. Protected API Route Pattern

If you must keep API routes, implement this pattern:

```typescript
// app/api/admin/users/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Use regular client for authentication
  const supabase = createRouteHandlerClient({ cookies });
  
  // Verify session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (profile?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // NOW use service-role for admin operations
  const adminSupabase = createAdminClient();
  
  const { data: users, error } = await adminSupabase
    .from('user_profiles')
    .select('*');
    
  return NextResponse.json({ users });
}
```

## Migration Plan

1. **Phase 1 - Immediate** (Critical)
   - Add authentication checks to all admin routes
   - Implement rate limiting
   - Add audit logging

2. **Phase 2 - Short Term** (1-2 weeks)
   - Migrate to Server Actions for admin operations
   - Implement proper error handling and validation
   - Create admin dashboard with proper authentication flow

3. **Phase 3 - Long Term** (1 month)
   - Move complex admin logic to database functions
   - Implement comprehensive RLS policies
   - Remove direct service-role usage from application code

## Environment Variable Best Practices

1. **Never prefix service-role keys with `NEXT_PUBLIC_`**
2. **Store service-role key in secure environment variables**
3. **Use different keys for different environments**
4. **Rotate keys regularly**
5. **Monitor key usage through Supabase dashboard**

## Conclusion

The current implementation poses significant security risks. The service-role key should never be used in publicly accessible API routes without proper authentication and authorization checks. Implement the recommended solutions starting with immediate security fixes to protect your application and user data.
