"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingCircle from "@/components/ui/LoadingCircle";

interface ProtectedPageProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedPage({ children, requireAdmin = false }: ProtectedPageProps) {
  const { user, profile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/passport/login');
        return;
      }
      
      if (requireAdmin && !isAdmin) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, isAdmin, requireAdmin, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0c0c0c]">
        <LoadingCircle />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
