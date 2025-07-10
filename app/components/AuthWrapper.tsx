import { requireAuth } from '@/lib/auth';

// AuthWrapper is a server component that ensures pages are only accessible to authenticated users
export default async function AuthWrapper({ children }: { children: React.ReactNode }) {
  // This will redirect to login if no session exists
  await requireAuth();
  
  // If we get here, the user is authenticated
  return <>{children}</>;
}
