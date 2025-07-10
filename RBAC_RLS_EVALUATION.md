# RBAC & RLS Strategy Evaluation

## Current Implementation Summary

### 1. Role Storage in `profiles` Table
- **Location**: Roles are stored in the `profiles.role` column as TEXT with values 'USER' or 'ADMIN'
- **Default**: New users get 'USER' role by default
- **Migration**: Added via `20240621_add_role_to_profiles.sql`

### 2. Ad-hoc Role Queries

#### Client-Side (React)
```typescript
// AuthProvider.tsx fetches profile on every auth state change
const fetchUserProfile = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
};

// Role check in component
const isAdmin = profile?.role === 'ADMIN';
```

#### Server-Side (API Routes & Server Actions)
```typescript
// Repeated pattern across multiple files
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', session.user.id)
  .single();

if (profile?.role !== 'ADMIN') {
  return { error: 'Admin access required' };
}
```

### 3. RLS Policies
- Database function `is_admin()` checks role from profiles table
- Policies use this function for admin access:
  ```sql
  CREATE POLICY "Admins can view all profiles" ON profiles 
    FOR SELECT USING (is_admin());
  ```

## Issues with Current Approach

1. **Performance**: Every protected route/action queries the database for role
2. **Latency**: Additional round trip to check roles on each request
3. **Consistency**: Role checks scattered across codebase
4. **Security**: No role information in JWT, relies entirely on database queries

## Supabase Best Practices Comparison

### 1. JWT Claims Approach
Supabase recommends adding custom claims to JWTs at sign-in time:

```sql
-- Add this function to set custom claims
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Get user role from profiles
  SELECT role INTO user_role FROM public.profiles WHERE id = (event->>'user_id')::uuid;
  
  -- Add custom claims
  claims := event->'claims';
  
  -- Add role to app_metadata (secure, not modifiable by user)
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata, role}', to_jsonb(user_role));
  END IF;
  
  -- Update the event
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Configure the hook
ALTER DATABASE postgres SET "supabase.auth.hook.custom_access_token" = 'public.custom_access_token_hook';
```

### 2. RLS with JWT Claims
Update RLS policies to use JWT claims instead of database lookups:

```sql
-- More efficient is_admin function using JWT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Check JWT claim instead of database
  RETURN auth.jwt()->'app_metadata'->>'role' = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Recommended Implementation Strategy

### Phase 1: Add JWT Claims (Immediate)

1. **Create Custom Claims Hook**
```sql
-- Migration: 20240701_add_jwt_role_claims.sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = (event->>'user_id')::uuid;
  
  claims := event->'claims';
  
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata, role}', to_jsonb(user_role));
  END IF;
  
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable the hook
ALTER DATABASE postgres SET "supabase.auth.hook.custom_access_token" = 'public.custom_access_token_hook';
```

### Phase 2: Update RLS Policies

2. **Optimize Database Functions**
```sql
-- Update is_admin to use JWT claims
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(auth.jwt()->'app_metadata'->>'role' = 'ADMIN', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get current user role
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text AS $$
BEGIN
  RETURN COALESCE(auth.jwt()->'app_metadata'->>'role', 'USER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Phase 3: Update Client Code

3. **Enhance AuthProvider**
```typescript
// Get role from JWT instead of profile query
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  role: 'USER' | 'ADMIN' | null;
  refreshProfile: () => Promise<void>;
}

// In AuthProvider
const role = session?.user?.app_metadata?.role || 'USER';
const isAdmin = role === 'ADMIN';

// Only fetch full profile when needed, not for role checks
```

4. **Update Server-Side Checks**
```typescript
// New utility function
export async function getUserRole(session: Session): 'USER' | 'ADMIN' {
  return session.user.app_metadata?.role || 'USER';
}

// Simplified admin check
export async function verifyAdminAccess(session: Session) {
  const role = getUserRole(session);
  return role === 'ADMIN';
}
```

### Phase 4: Handle Role Changes

5. **Force Token Refresh on Role Update**
```typescript
// When updating user role
export async function updateUserRole(userId: string, newRole: string) {
  // Update in database
  await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);
  
  // Force user to re-authenticate to get new token
  await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { force_reauthentication: true }
  });
}
```

## Benefits of Recommended Approach

1. **Performance**: Role available immediately in JWT, no database queries
2. **Security**: Roles in `app_metadata` cannot be modified by users
3. **Scalability**: Reduces database load significantly
4. **Consistency**: Single source of truth for roles in JWT
5. **Offline Support**: Role checks work without database connection

## Migration Checklist

- [ ] Create and test custom JWT hook in development
- [ ] Update all RLS policies to use JWT claims
- [ ] Update AuthProvider to read role from JWT
- [ ] Remove ad-hoc profile queries for role checks
- [ ] Add role refresh mechanism for role changes
- [ ] Test thoroughly with both USER and ADMIN roles
- [ ] Monitor performance improvements

## Security Considerations

1. **Role Changes**: Require re-authentication or token refresh
2. **Audit Trail**: Keep logging role-based actions
3. **Principle of Least Privilege**: Default to USER role
4. **Regular Reviews**: Audit admin role assignments

## Performance Metrics to Track

- Reduction in database queries per request
- Improved page load times for protected routes
- Reduced latency in API endpoints
- Lower database connection count

This approach aligns with Supabase best practices and provides a more scalable, performant, and secure RBAC implementation.
