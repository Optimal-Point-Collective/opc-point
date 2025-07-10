"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { User } from "@supabase/supabase-js";
import LoadingCircle from "@/components/ui/LoadingCircle";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  fallbackPath = "/passport/login" 
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (isMounted) {
            router.replace(fallbackPath);
          }
          return;
        }

        if (!session?.user) {
          if (isMounted) {
            router.replace(fallbackPath);
          }
          return;
        }

        // If admin access is required, check user role
        if (requireAdmin) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError || !profile || profile.role !== "ADMIN") {
            console.error("Admin access denied:", profileError);
            if (isMounted) {
              router.replace("/unauthorized");
            }
            return;
          }
        }

        // If we get here, user is authenticated and authorized
        if (isMounted) {
          setUser(session.user);
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted) {
          router.replace(fallbackPath);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          router.replace(fallbackPath);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Re-run auth check for role verification if needed
          checkAuth();
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, requireAdmin, fallbackPath]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0c0c0c]">
        <LoadingCircle />
      </div>
    );
  }

  // Don't render children until user is authorized
  if (!isAuthorized || !user) {
    return null;
  }

  return <>{children}</>;
}
