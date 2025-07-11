"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // First, attempt to sign up the user
    const { error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      // Check if the error is because the user already exists
      if (signUpError.message.includes('User already registered')) {
        setError('User already exists. Sending a magic link to log in.');
        
        // If user exists, send them a magic link to sign in instead
        const { error: signInError } = await supabase.auth.signInWithOtp({ email });
        
        if (signInError) {
          setError(`Could not send magic link: ${signInError.message}`);
        } else {
          setError('A login link has been sent to your email address.');
        }
      } else {
        setError(signUpError.message);
      }
    } else {
      // On successful sign-up, redirect to a confirmation page or login
      setError('Please check your email to confirm your account.');
      // Optionally, redirect after a delay
      // setTimeout(() => router.push('/passport/login'), 5000);
    }
    
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSignUp} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {error && <div className="text-red-400">{error}</div>}
        <div className="text-gray-400 text-sm mt-2">
          Already have an account? <a href="/passport/login" className="underline">Log in</a>
        </div>
      </form>
    </main>
  );
}
