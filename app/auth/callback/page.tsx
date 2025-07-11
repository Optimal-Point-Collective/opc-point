"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Processing invitation...');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('Auth callback params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
        
        if (type === 'invite' && accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Error setting session:', error);
            setMessage('Error processing invitation. Redirecting to login...');
            setTimeout(() => router.push('/passport/login?error=session_error'), 3000);
            return;
          }
          
          if (data.session) {
            setMessage('Invitation verified! Please set your password.');
            setShowPasswordForm(true);
            setLoading(false);
          } else {
            setMessage('No session created. Redirecting to login...');
            setTimeout(() => router.push('/passport/login'), 3000);
          }
        } else {
          // Regular auth callback (not invitation)
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            setMessage('Authentication failed. Redirecting to login...');
            setTimeout(() => router.push('/passport/login?error=auth_error'), 3000);
            return;
          }
          
          if (data.session) {
            setMessage('Welcome back! Redirecting to dashboard...');
            setTimeout(() => router.push('/dashboard'), 2000);
          } else {
            setMessage('No active session. Redirecting to login...');
            setTimeout(() => router.push('/passport/login'), 3000);
          }
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setMessage('An error occurred. Redirecting to login...');
        setTimeout(() => router.push('/passport/login?error=callback_error'), 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      setMessage('Setting your password...');
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('Error updating password:', error);
        setPasswordError('Failed to set password. Please try again.');
        setLoading(false);
        return;
      }
      
      setMessage('Password set successfully! Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error) {
      console.error('Error setting password:', error);
      setPasswordError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-opc-primary-dark font-montserrat" style={{ fontFamily: 'var(--font-montserrat)' }}>
      <div className="bg-opc-secondary-dark p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        {loading && !showPasswordForm && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#BDB7A9] mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-[#BDB7A9] mb-4">Processing Invitation</h2>
            <p className="text-[#9C9C9C]">{message}</p>
          </div>
        )}

        {showPasswordForm && (
          <div>
            <h2 className="text-2xl font-bold text-[#BDB7A9] mb-6 text-center">Set Your Password</h2>
            <p className="text-[#9C9C9C] mb-6 text-center">Welcome to OPC! Please create a password to complete your account setup.</p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#BDB7A9] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-opc-primary-dark border border-gray-600 rounded-lg focus:outline-none focus:border-[#BDB7A9] text-white"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#BDB7A9] mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-opc-primary-dark border border-gray-600 rounded-lg focus:outline-none focus:border-[#BDB7A9] text-white"
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
              </div>
              
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#BDB7A9] text-black font-semibold py-3 px-4 rounded-lg hover:bg-[#A8A396] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting Password...' : 'Set Password & Continue'}
              </button>
            </form>
          </div>
        )}

        {!loading && !showPasswordForm && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#BDB7A9] mb-4">Success!</h2>
            <p className="text-[#9C9C9C]">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
