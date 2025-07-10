"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Using client-side ProtectedRoute for authentication
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
