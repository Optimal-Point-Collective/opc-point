"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function EducationPage() {
  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Education</h1>
      <p>This is the Education core app page.</p>
      </main>
    </ProtectedRoute>
  );
}
