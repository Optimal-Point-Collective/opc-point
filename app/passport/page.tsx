"use client";
import { useAuthRedirect } from "@/utils/useAuthRedirect";

export default function PassportPage() {
  useAuthRedirect();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Passport</h1>
      <p>This is the Passport core app page.</p>
    </main>
  );
}
