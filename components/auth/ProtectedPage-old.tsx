"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import LoadingCircle from "@/components/ui/LoadingCircle";

interface ProtectedPageProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

export default function ProtectedPage({ 
  children, 
  requireAdmin = false, 
  fallbackPath = "/passport/login" 
}: ProtectedPageProps) {
  const { user, loading, isAdmin, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing redirect timer
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }

    // Don't redirect while loading
    if (loading) return;

    // If no user, set a delayed redirect to allow session recovery
    if (!user) {
      const timer = setTimeout(() => {
        // Store the intended destination
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`${fallbackPath}?returnUrl=${returnUrl}`);
      }, 1000); // Give session recovery 1 second to work
      
      setRedirectTimer(timer);
      return;
    }

    // If admin is required but user is not admin
    if (requireAdmin && !isAdmin) {
      const timer = setTimeout(() => {
        router.replace("/unauthorized");
      }, 500);
      
      setRedirectTimer(timer);
      return;
    }
  }, [user, loading, isAdmin, requireAdmin, router, fallbackPath, pathname]); // Removed redirectTimer from deps

  // Cleanup redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0c0c0c]">
        <LoadingCircle />
      </div>
    );
  }

  // Show error state
  if (error && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0c0c0c]">
        <div className="text-center">
          <p className="text-red-500 mb-4">Authentication Error: {error}</p>
          <button 
            onClick={() => router.push(fallbackPath)}
            className="text-white underline"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Don't render children until we've verified authentication
  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
