"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";


interface Member {
  id: string;
  email: string;
  user_metadata: { role?: string };
  created_at: string;
}

export default function AdminMembers() {

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setError("Access denied: Please log in.");
        setLoading(false);
        return;
      }
      
      // Check role in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
      
      if (profileError || !profile || profile.role !== "ADMIN") {
        setError("Access denied: Admins only.");
        setLoading(false);
        return;
      }

      // Fetch all users via Supabase Admin API (requires service role key in server env)
      const { data, error: fetchError } = await supabase.auth.admin.listUsers();
      if (!fetchError && data?.users) setMembers(data.users as Member[]);
      setLoading(false);
    };
    checkAdminAndFetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div></div>;
  if (error) return <div className="bg-[#252523] text-red-400 p-4 rounded border border-red-800 mt-4">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Members</h1>
      <div className="overflow-x-auto rounded-lg border border-[#2d2d2b]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#252523] text-white">
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d2d2b]">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-[#1c1c1a] transition-colors duration-150">
                <td className="p-3 font-mono text-white">{member.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded ${member.user_metadata?.role === 'admin' ? 'bg-[#353533] text-white' : 'bg-[#252523] text-[#b1b1a9]'}`}>
                    {member.user_metadata?.role || "member"}
                  </span>
                </td>
                <td className="p-3 text-[#b1b1a9]">{member.created_at?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
