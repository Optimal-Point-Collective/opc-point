"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

interface Profile {
  id: string;
  role: string | null;
  updated_at: string;
}

export default function DebugProfiles() {
  const [profileData, setProfileData] = useState<Profile[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) throw error;
        setProfileData(data);
      } catch (err: unknown) {
        console.error("Error fetching profiles:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Profiles Table Data</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {profileData && (
        <div>
          <p className="mb-4">Found {profileData.length} profiles</p>
          <div className="overflow-x-auto">
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
