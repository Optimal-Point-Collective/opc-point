"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL fragment (hash) which contains the auth tokens
        const hashFragment = window.location.hash;
        
        if (hashFragment) {
          // Parse the hash fragment to extract the tokens
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            router.push('/passport/login?error=expired');
            return;
          }
          
          if (data.session) {
            // User is authenticated, redirect to dashboard
            console.log('User authenticated successfully');
            router.push('/dashboard');
          } else {
            // No session, redirect to login
            router.push('/passport/login?error=no_session');
          }
        } else {
          // No hash fragment, redirect to login
          router.push('/passport/login?error=no_hash');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/passport/login?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Completing Authentication...</h2>
        <p className="text-gray-400">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}
