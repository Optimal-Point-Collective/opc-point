# Authentication Components Security Audit

## Audit Summary Table

| Component | Current Behaviour | Risk | Improvement |
|-----------|-------------------|------|-------------|
| **AuthProvider** | - Client-side only authentication<br>- Fetches user profile on mount<br>- Stores auth state in React context<br>- No server-side validation<br>- Loading state shows children immediately after setting `loading=false` | **HIGH RISK**<br>- Auth state only exists on client<br>- SSR/curl requests bypass auth entirely<br>- Profile data can be manipulated via browser devtools<br>- Race condition: children render before auth check completes (line 111-112) | - Add server-side auth validation in middleware<br>- Use server components for initial auth state<br>- Implement proper loading boundaries<br>- Fix race condition in loading state logic |
| **ProtectedRoute** | - Client-side auth check via `supabase.auth.getSession()`<br>- Shows loading spinner during check<br>- Redirects to login if no session<br>- Admin role check queries database<br>- Returns `null` if not authorized | **MEDIUM RISK**<br>- Protection only works with JS enabled<br>- Direct URL access shows loading spinner briefly<br>- Admin check happens client-side (bypassable)<br>- Potential flash of loading state<br>- No server-side validation | - Move auth checks to middleware.ts<br>- Implement server-side role validation<br>- Add route guards in Next.js config<br>- Consider RSC with server-side auth |
| **AdminProtected** | - Duplicate of ProtectedRoute functionality<br>- Uses `supabase.auth.getUser()` instead of session<br>- Shows error message if not admin<br>- Different loading spinner style<br>- No redirect loop protection | **HIGH RISK**<br>- Redundant component (use ProtectedRoute)<br>- Client-side only protection<br>- Shows "Access denied" message (info leak)<br>- No server validation<br>- Potential infinite redirect if used incorrectly | - Remove this component entirely<br>- Use `ProtectedRoute` with `requireAdmin=true`<br>- Implement server-side admin validation<br>- Add redirect loop protection |
| **middleware.ts** | - Only logs session status<br>- No actual protection or routing logic<br>- Runs on all routes except static files<br>- Uses auth-helpers-nextjs | **CRITICAL RISK**<br>- Middleware does nothing protective<br>- All routes are unprotected at server level<br>- API routes have no auth checks<br>- Complete bypass via curl/Postman | - Implement actual route protection<br>- Check auth status and redirect<br>- Validate roles for admin routes<br>- Protect API routes<br>- Add CSRF protection |
| **API Routes** | - `/api/admin/users/route.ts` uses service role key<br>- No auth validation in routes<br>- Direct database access with admin privileges<br>- No request origin validation | **CRITICAL RISK**<br>- Anyone can call admin APIs<br>- Service role key exposed in API<br>- No rate limiting<br>- No auth checks<br>- Data manipulation possible | - Add auth checks to all API routes<br>- Validate user session and roles<br>- Remove service role from client APIs<br>- Implement rate limiting<br>- Add request validation |

## Critical Vulnerabilities Found

### 1. **No Server-Side Protection**
- All authentication happens client-side
- Direct requests (curl, Postman) bypass all auth
- Server components/API routes have no protection

### 2. **Middleware Not Implemented**
- Current middleware only logs, doesn't protect
- No route guards at server level
- API endpoints completely exposed

### 3. **Race Conditions**
- AuthProvider has faulty loading logic (line 111-112)
- Potential flash of unauthorized content
- Loading states not properly synchronized

### 4. **API Security**
- Admin APIs use service role (bypasses RLS)
- No authentication checks in API routes
- Direct database manipulation possible

### 5. **Redundant Components**
- AdminProtected duplicates ProtectedRoute
- Inconsistent protection patterns
- Maintenance overhead

## Recommended Immediate Actions

1. **Implement Proper Middleware Protection**
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/passport/login', req.url));
    }
    
    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (profile?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }
  
  // Protect API routes
  if (req.nextUrl.pathname.startsWith('/api/admin')) {
    if (!session || /* check admin role */) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  return res;
}
```

2. **Fix API Route Authentication**
```typescript
// In each API route
const session = await getServerSession(req);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

3. **Remove AdminProtected Component**
- Use ProtectedRoute everywhere
- Consolidate protection logic

4. **Fix Race Conditions**
- Proper loading state management
- Prevent render until auth confirmed

5. **Add Security Headers**
- CSRF protection
- Rate limiting
- Request validation
