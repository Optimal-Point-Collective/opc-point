"use client";
import { useAuthRedirect } from "@/utils/useAuthRedirect";

export default function AtlasProPage() {
  useAuthRedirect();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Atlas Pro</h1>
      <p>This is the Atlas Pro add-on page.</p>
    </main>
  );
}
