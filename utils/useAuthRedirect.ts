"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";

/**
 * @deprecated Use ProtectedRoute component instead for better UX and cleaner code.
 * Custom hook to redirect unauthenticated users to /passport/login.
 * Usage: Call useAuthRedirect() at the top of any client component/page you want to protect.
 */
export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (isMounted && !session) {
        router.replace("/passport/login");
      }
    };
    checkUser();
    // Optionally, subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/passport/login");
      }
    });
    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [router]);
}
