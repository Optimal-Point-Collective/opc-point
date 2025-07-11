"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import toast from '@/utils/toast';

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Listen for the SIGNED_IN event
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User has been signed in via magic link.');
        setIsAuthenticated(true);
      }
    });

    // Check for an active session on page load
    const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            setIsAuthenticated(true);
        }
    };
    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    const toastId = toast.loading('Setting your password...');

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      toast.error(`Failed to set password: ${updateError.message}`, { id: toastId });
      setError(updateError.message);
    } else {
      toast.success('Password set successfully! Redirecting...', { id: toastId });
      router.push('/dashboard');
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0C0C0C]">
      {!isAuthenticated ? (
        <div className="w-full max-w-[575px] bg-[#121212] rounded-2xl shadow-[inset_0_0_0_0.5px_#7C7C7C] p-16 text-center">
          <h1 className="text-3xl font-semibold text-white">Processing Authentication</h1>
          <p className="mt-4 text-gray-400">Please wait while we verify your invitation...</p>
        </div>
      ) : (
        <div className="w-full max-w-[575px] bg-[#121212] rounded-2xl shadow-[inset_0_0_0_0.5px_#7C7C7C] overflow-hidden flex flex-col">
          <div className="pt-16 pb-8 flex-1 flex flex-col">
            <div className="text-center">
              <h1 className="text-5xl font-semibold text-white">Set Your Password</h1>
              <p className="mt-6 text-gray-400 font-light text-xl tracking-wide">Welcome! Create a secure password to access your account.</p>
            </div>
            
            <div className="w-full mt-16 flex-1 flex flex-col">
              <form onSubmit={handleSetPassword} className="flex flex-col flex-1 px-[98.5px]">
                <div className="mb-8">
                  <label htmlFor="password" className="block text-base font-light text-white mb-3">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 box-border py-3 px-4 bg-[#0c0c0c] border-[0.5px] border-[#7C7C7C]/25 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#BDB7A9]"
                    required
                  />
                </div>
                
                <div className="mb-10">
                  <label htmlFor="confirmPassword" className="block text-base font-light text-white mb-3">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 box-border py-3 px-4 bg-[#0c0c0c] border-[0.5px] border-[#7C7C7C]/25 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#BDB7A9]"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 box-border py-3 bg-[#BDB7A9] hover:bg-opacity-90 text-black text-base font-semibold rounded-lg transition-colors border-[0.5px] border-[#7C7C7C]/25"
                  >
                    {loading ? 'Saving...' : 'Set Password & Login'}
                  </button>
                </div>

                {error && (
                  <div className="text-red-400 text-sm text-center mb-4">{error}</div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
