"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import LoginCard from "@/app/components/LoginCard";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Clear any existing auth state on mount
  useEffect(() => {
    const clearAuthState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is already logged in, redirect to dashboard
        const returnUrl = searchParams.get('returnUrl');
        router.replace(returnUrl ? decodeURIComponent(returnUrl) : '/dashboard');
      }
    };
    
    clearAuthState();
  }, [router, searchParams]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Get the return URL from query params
        const returnUrl = searchParams.get('returnUrl');
        const redirectTo = returnUrl ? decodeURIComponent(returnUrl) : '/dashboard';
        
        console.log('Login successful, redirecting to:', redirectTo);
        router.replace(redirectTo);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while logging in.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[url('/login-background-bridge.jpg')] bg-cover bg-center">
      {/* Page-wide overlay */}
      <div className="absolute inset-0 bg-[#0c0c0c] opacity-80 z-0"></div>

      {/* Content container (sits above overlay) */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Column with Login Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 lg:p-8">
          <LoginCard 
            onSubmit={handleLogin}
            error={error}
            loading={loading}
          />
        </div>
        
        {/* Right Column with Branding (no separate overlay here) */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
          {/* Removed: <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black z-10"></div> */}
          
          <div className="flex flex-col items-center justify-center w-full h-full p-12 text-white">
            <div className="flex flex-col items-center mb-8">
              <Image src="/opc-logo.svg" alt="OPC Logo" width={320} height={80} className="mb-8 opacity-60" />
            </div>
            
            <p className="text-center text-xl font-light italic max-w-md">
              Your access to digital asset intelligence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
