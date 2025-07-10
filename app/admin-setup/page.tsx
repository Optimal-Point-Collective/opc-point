"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Get current user
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (!data?.user) {
          setMessage("No user is logged in. Please log in first.");
          setLoading(false);
          return;
        }
        
        // Check current role in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          setMessage(`Current user: ${data.user.email}. No profile found in database.`);
        } else {
          setMessage(`Current user: ${data.user.email}. Current role: ${profile.role || 'No role set'}`);
        }
        setLoading(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const setAdminRole = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error('No user found');
      }
      
      // Update role in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userData.user.id,
          role: 'ADMIN'
        });
      
      if (updateError) throw updateError;
      
      setMessage(`Successfully updated user role to ADMIN in profiles table!`);
      setLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Setup</h1>
      
      <div className="mb-4">
        <strong>Status:</strong>
        <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">{message}</pre>
      </div>
      
      <button 
        onClick={setAdminRole}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? "Processing..." : "Set Admin Role"}
      </button>
      
      <div className="mt-6">
        <a href="/admin" className="text-blue-600 hover:underline">Go to Admin Dashboard</a>
      </div>
    </div>
  );
}
