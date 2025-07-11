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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Processing authentication... Please wait.
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSetPassword} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold mb-4">Create Your Password</h1>
        <p className="text-gray-400 mb-6">Welcome! Please set a password for your account.</p>
        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Set Password and Login'}
        </button>
        {error && <div className="text-red-400 mt-4">{error}</div>}
      </form>
    </main>
  );
}
