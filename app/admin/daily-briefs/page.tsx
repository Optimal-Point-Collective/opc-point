"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import AdminProtected from "@/components/AdminProtected";

interface Brief {
  id: number;
  title: string;
  content: string;
  brief_date: string;
  published?: boolean;
}

// Action Icons
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PublishIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3.09 8.26L12 14L20.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.09 15.74L12 22L20.91 15.74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.09 8.26L12 14.5L20.91 8.26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function AdminDailyBriefsPage() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [brief_date, setBriefDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingBrief, setEditingBrief] = useState<Brief | null>(null);

  useEffect(() => {
    fetchBriefs();
  }, []);

  const fetchBriefs = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("daily_briefs")
      .select("*")
      .order("brief_date", { ascending: false });
    
    if (!fetchError && data) setBriefs(data);
    setLoading(false);
  };

  const createOrUpdateBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !brief_date) return;

    let error = null;
    
    if (editingBrief) {
      // Update existing brief
      const result = await supabase
        .from("daily_briefs")
        .update({ title, content, brief_date })
        .eq("id", editingBrief.id);
      error = result.error;
      
      if (!error) {
        setEditingBrief(null);
      }
    } else {
      // Create new brief
      const result = await supabase
        .from("daily_briefs")
        .insert([{ title, content, brief_date, published: false }]);
      error = result.error;
    }

    if (!error) {
      setTitle(""); 
      setContent(""); 
      setBriefDate("");
      fetchBriefs();
    }
  };

  const editBrief = (brief: Brief) => {
    setEditingBrief(brief);
    setTitle(brief.title);
    setContent(brief.content);
    setBriefDate(brief.brief_date);
  };

  const publishBrief = async (id: number) => {
    const { error } = await supabase
      .from("daily_briefs")
      .update({ published: true })
      .eq("id", id);
    
    if (!error) {
      fetchBriefs();
    }
  };

  const deleteBrief = async (id: number) => {
    if (confirm("Are you sure you want to delete this brief?")) {
      const { error } = await supabase
        .from("daily_briefs")
        .delete()
        .eq("id", id);
      
      if (!error) {
        setBriefs(briefs.filter(b => b.id !== id));
      }
    }
  };

  const cancelEdit = () => {
    setEditingBrief(null);
    setTitle("");
    setContent("");
    setBriefDate("");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600"></div></div>;
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Daily Briefs</h1>
        <p className="text-sm text-gray-600">Manage Essential Market Summaries & Insights</p>
      </div>

      {/* Create/Edit Brief Form */}
      <div className="bg-white rounded-lg p-8 mb-8 w-full max-w-2xl mx-auto" style={{ border: '0.5px solid #7c7c7c' }}>
        <form onSubmit={createOrUpdateBrief} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter brief title"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              style={{ border: '0.5px solid #7c7c7c' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter brief content"
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
              style={{ border: '0.5px solid #7c7c7c' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date"
              value={brief_date}
              onChange={(e) => setBriefDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              style={{ border: '0.5px solid #7c7c7c' }}
              required
            />
          </div>

          <div className="flex space-x-3">
            <button 
              type="submit"
              className="bg-[#BDB7A9] hover:bg-[#A9A299] text-black font-medium w-full py-3 rounded-lg transition-colors duration-200"
            >
              {editingBrief ? 'Update Brief' : 'Create Brief'}
            </button>
            {editingBrief && (
              <button 
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Briefs List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Previous Daily Briefs</h2>
        </div>
        
        {briefs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No daily briefs created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {briefs.map((brief) => (
                  <tr key={brief.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{brief.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs">
                        {brief.content.length > 100 ? `${brief.content.substring(0, 100)}...` : brief.content}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{brief.brief_date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        brief.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {brief.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editBrief(brief)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        {!brief.published && (
                          <button
                            onClick={() => publishBrief(brief.id)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="Publish"
                          >
                            <PublishIcon />
                          </button>
                        )}
                        <button
                          onClick={() => deleteBrief(brief.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default function ProtectedAdminDailyBriefsPage() {
  return (
    <AdminProtected>
      <AdminDailyBriefsPage />
    </AdminProtected>
  );
}
