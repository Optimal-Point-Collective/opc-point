"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface Message {
  id: number;
  user_id: string;
  username?: string | null;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user and messages
  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        router.push("/passport/login");
        return;
      }
      setUser(userData.user);
      const { data: msgs, error: msgsError } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (!msgsError && msgs) setMessages(msgs);
      setLoading(false);
    };
    fetchUserAndMessages();
  }, [router]);

  // Listen for new messages in real-time
  useEffect(() => {
    const channel = supabase
      .channel("messages-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a new message
  const [sending, setSending] = useState(false);
const sendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newMessage.trim() || !user) return;
  setSending(true);
  const { error } = await supabase.from("messages").insert([
    {
      user_id: user.id,
      username: user.email,
      content: newMessage.trim(),
    },
  ]);
  setSending(false);
  if (!error) {
    setNewMessage("");
    // Optionally, refetch messages in case realtime is slow
    const { data: msgs, error: msgsError } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });
    if (!msgsError && msgs) setMessages(msgs);
  } else {
    alert("Failed to send message. Please try again.");
  }
};

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-2">Chat</h1>
      <div className="mb-4 text-gray-400 text-sm">Signed in as: <span className="font-mono">{user.email || user.id}</span></div>
      <div className="w-full max-w-xl flex-1 flex flex-col border rounded bg-gray-800 p-4 overflow-y-auto mb-4" style={{ height: 400 }}>
        {messages.map((msg) => (
          <div key={msg.id} className={
            msg.user_id === user.id
              ? "text-right mb-2"
              : "text-left mb-2"
          }>
            <span className="block font-semibold text-xs text-gray-400">
              {msg.username || msg.user_id}
            </span>
            <span className="inline-block px-2 py-1 rounded bg-blue-700 text-white">
              {msg.content}
            </span>
            <span className="block text-xs text-gray-500">
              {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="w-full max-w-xl flex">
        <input
          type="text"
          className="flex-1 rounded-l px-3 py-2 text-black"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-r bg-blue-700 hover:bg-blue-800 px-4 py-2 text-white font-semibold disabled:opacity-50"
          disabled={sending || !newMessage.trim()}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </main>
  );
}
