"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function DashboardIndex() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/passport/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Passport Dashboard</h1>
      {user && (
        <div className="mb-6 text-center">
          <p className="text-lg">Signed in as:</p>
          <p className="font-mono text-xl">{user.email}</p>
          <p className="text-sm text-gray-400 mt-2">User ID: {user.id}</p>
        </div>
      )}
      <nav className="w-full max-w-md">
        <ul className="space-y-3">
          <li><Link href="/chat" className="block bg-blue-700 hover:bg-blue-800 rounded px-4 py-2 text-center">Chat</Link></li>
          <li><Link href="/daily-briefs" className="block bg-green-700 hover:bg-green-800 rounded px-4 py-2 text-center">Daily Briefs</Link></li>
          <li><Link href="/news-feed" className="block bg-yellow-700 hover:bg-yellow-800 rounded px-4 py-2 text-center">News Feed</Link></li>
          <li><Link href="/atlas-lite" className="block bg-purple-700 hover:bg-purple-800 rounded px-4 py-2 text-center">Atlas Lite</Link></li>
          <li><Link href="/education" className="block bg-pink-700 hover:bg-pink-800 rounded px-4 py-2 text-center">Education</Link></li>
          <li><Link href="/precision" className="block bg-red-700 hover:bg-red-800 rounded px-4 py-2 text-center">Precision</Link></li>
        </ul>
      </nav>
    </main>
  );
}
