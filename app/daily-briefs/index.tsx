"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

interface DailyBrief {
  id: number;
  title: string;
  content: string;
  brief_date: string; // ISO date string
}

export default function DailyBriefsIndex() {
  const [todayBrief, setTodayBrief] = useState<DailyBrief | null>(null);
  const [archive, setArchive] = useState<DailyBrief[]>([]);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        router.push("/passport/login");
        return;
      }

      // Fetch today's brief
      const today = new Date().toISOString().slice(0, 10);
      const { data: briefs, error: briefsError } = await supabase
        .from("daily_briefs")
        .select("*")
        .order("brief_date", { ascending: false });
      if (!briefsError && briefs) {
        setTodayBrief(briefs.find((b: DailyBrief) => b.brief_date.slice(0, 10) === today) || null);
        setArchive(briefs.filter((b: DailyBrief) => b.brief_date.slice(0, 10) !== today));
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Daily Briefs</h1>
      {todayBrief ? (
        <section className="w-full max-w-2xl bg-gray-800 rounded p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">Today&apos;s Brief</h2>
          <h3 className="text-xl font-bold mb-1">{todayBrief.title}</h3>
          <div className="text-md whitespace-pre-line">{todayBrief.content}</div>
          <div className="text-xs text-gray-400 mt-2">{todayBrief.brief_date.slice(0, 10)}</div>
        </section>
      ) : (
        <section className="w-full max-w-2xl bg-gray-800 rounded p-6 mb-8 shadow-lg text-center">
          <p>No brief found for today.</p>
        </section>
      )}
      <section className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Archive</h2>
        <ul className="space-y-3">
          {archive.length === 0 && <li className="text-gray-400">No past briefs.</li>}
          {archive.map((brief) => (
            <li key={brief.id} className="bg-gray-700 rounded p-4">
              <div className="flex justify-between items-center">
                <span className="font-bold">{brief.title}</span>
                <span className="text-xs text-gray-400">{brief.brief_date.slice(0, 10)}</span>
              </div>
              <div className="text-sm mt-2 whitespace-pre-line">{brief.content.slice(0, 200)}{brief.content.length > 200 ? "..." : ""}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
