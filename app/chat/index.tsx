"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface Message {
  id: number;
  user_id: string;
  username: string | null;
  content: string;
  inserted_at: string;
}

export default function ChatIndex() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
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
        .order("inserted_at", { ascending: true });
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
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const { error } = await supabase.from("messages").insert([
      {
        user_id: user.id,
        username: user.email,
        content: newMessage.trim(),
      },
    ]);
    if (!error) setNewMessage("");
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Group Chat</h1>
      <div className="w-full max-w-xl flex-1 flex flex-col border rounded bg-gray-800 p-4 overflow-y-auto" style={{ height: 400 }}>
        {messages.map((msg) => (
          <div key={msg.id} className={
            msg.user_id === user.id
              ? "text-right mb-2"
              : "text-left mb-2"
          }>
            <span className="block font-semibold text-sm text-gray-400">
              {msg.username || msg.user_id}
            </span>
            <span className="inline-block px-2 py-1 rounded bg-blue-700 text-white">
              {msg.content}
            </span>
            <span className="block text-xs text-gray-500">
              {new Date(msg.inserted_at).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="w-full max-w-xl flex mt-4">
        <input
          type="text"
          className="flex-1 rounded-l px-3 py-2 text-black"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-r bg-blue-700 hover:bg-blue-800 px-4 py-2 text-white font-semibold"
        >
          Send
        </button>
      </form>
    </main>
  );
}
