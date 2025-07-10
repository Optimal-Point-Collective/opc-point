"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await supabase.auth.signOut();
      router.push("/passport/login");
    };
    doLogout();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-xl">Logging out...</div>
    </main>
  );
}
