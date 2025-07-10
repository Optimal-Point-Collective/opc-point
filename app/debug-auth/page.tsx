"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  role: string | null;
  updated_at: string;
}

export default function DebugAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserAndProfile() {
      try {
        setLoading(true);
        
        // Get current auth user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        setUser(user);
        
        if (user) {
          // Get profile data if user exists
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') throw profileError;
          setProfile(profileData);
        }
      } catch (err: unknown) {
        console.error("Error fetching data:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndProfile();
  }, []);

  const handleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/debug-auth`
        }
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const makeAdmin = async () => {
    if (!user) {
      setError("You need to be logged in to become an admin");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: 'ADMIN',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      
      setAdminMessage("You are now an admin! Refresh the page to see the change.");
      
      // Refresh profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);
    } catch (err: unknown) {
      console.error("Error making user admin:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Authentication</h1>
      
      <div className="mb-6 bg-blue-100 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Admin Navigation</h2>
        <div className="flex gap-2">
          <a 
            href="/admin/users" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Admin Users Page
          </a>
        </div>
      </div>
      
      {loading && <p>Loading...</p>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Error: {error}</div>}
      {adminMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{adminMessage}</div>}
      
      {!user && !loading && (
        <div className="mb-6">
          <p className="mb-4">You are not logged in.</p>
          <button
            onClick={handleLogin}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Log in with GitHub
          </button>
        </div>
      )}
      
      {user && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Auth User</h2>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
          </div>
        </div>
      )}
      
      {profile && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Profile Data</h2>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p><strong>ID:</strong> {profile.id}</p>
            <p><strong>Role:</strong> {profile.role || 'No role set'}</p>
            {profile.role !== 'ADMIN' && (
              <button
                onClick={makeAdmin}
                className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
              >
                Make Admin
              </button>
            )}
            {profile.role === 'ADMIN' && (
              <p className="mt-4 text-green-600 font-bold">✓ You have admin access</p>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold">Navigation</h2>
        <ul className="space-y-2">
          <li><a href="/admin/users" className="text-blue-600 hover:underline">Admin User Management</a></li>
          <li><a href="/admin" className="text-blue-600 hover:underline">Admin Dashboard</a></li>
          <li><a href="/dashboard" className="text-blue-600 hover:underline">User Dashboard</a></li>
        </ul>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Raw Profile Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>
    </div>
  );
}
