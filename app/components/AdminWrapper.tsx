import { requireAdmin } from '@/lib/auth';

// AdminWrapper is a server component that ensures pages are only accessible to admin users
export default async function AdminWrapper({ children }: { children: React.ReactNode }) {
  // This will redirect to dashboard if user is not an admin
  await requireAdmin();
  
  // If we get here, the user is authenticated and has admin role
  return <>{children}</>;
}
