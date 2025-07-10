"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";


interface NewsItem {
  id: number;
  title: string;
  content: string;
  published_at: string;
}

export default function AdminNewsFeed() {

  const [news, setNews] = useState<NewsItem[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published_at, setPublishedAt] = useState("");
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

      const { data, error: fetchError } = await supabase
        .from("news_feed")
        .select("*")
        .order("published_at", { ascending: false });
      if (!fetchError && data) setNews(data);
      setLoading(false);
    };
    checkAdminAndFetch();
  }, []);

  const createNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !published_at) return;
    const { error } = await supabase.from("news_feed").insert([{ title, content, published_at }]);
    if (!error) {
      setTitle(""); setContent(""); setPublishedAt("");
      const { data } = await supabase.from("news_feed").select("*").order("published_at", { ascending: false });
      if (data) setNews(data);
    }
  };

  const deleteNews = async (id: number) => {
    await supabase.from("news_feed").delete().eq("id", id);
    setNews(news.filter(n => n.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div></div>;
  if (error) return <div className="bg-[#252523] text-red-400 p-4 rounded border border-red-800 mt-4">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">News Feed</h1>
      <form onSubmit={createNews} className="mb-8 flex flex-col space-y-3 max-w-lg bg-[#1c1c1a] p-6 rounded-lg border border-[#2d2d2b]">
        <label className="text-sm text-[#b1b1a9]">Title</label>
        <input 
          className="bg-[#252523] border border-[#2d2d2b] p-3 rounded text-white focus:border-white focus:outline-none" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Enter news title" 
        />
        <label className="text-sm text-[#b1b1a9] mt-2">Content</label>
        <textarea 
          className="bg-[#252523] border border-[#2d2d2b] p-3 rounded text-white h-32 focus:border-white focus:outline-none" 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="Enter news content" 
        />
        <label className="text-sm text-[#b1b1a9] mt-2">Publication Date</label>
        <input 
          className="bg-[#252523] border border-[#2d2d2b] p-3 rounded text-white focus:border-white focus:outline-none" 
          value={published_at} 
          onChange={e => setPublishedAt(e.target.value)} 
          type="date" 
        />
        <button 
          className="bg-[#4a4a48] hover:bg-[#5a5a58] text-white font-medium px-4 py-3 rounded mt-2 transition-colors duration-200" 
          type="submit"
        >
          Publish News Item
        </button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-[#2d2d2b]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#252523] text-white">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Content</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d2d2b]">
            {news.map(item => (
              <tr key={item.id} className="hover:bg-[#1c1c1a] transition-colors duration-150">
                <td className="p-3 font-medium text-white">{item.title}</td>
                <td className="p-3 whitespace-pre-wrap max-w-xs text-[#b1b1a9]">{item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}</td>
                <td className="p-3 text-[#b1b1a9]">{item.published_at}</td>
                <td className="p-3">
                  {/* Edit can be implemented later */}
                  <button 
                    className="text-white hover:text-red-200 bg-[#353533] hover:bg-[#454543] border border-[#555553] rounded px-3 py-1 text-sm transition-colors duration-200" 
                    onClick={() => deleteNews(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
