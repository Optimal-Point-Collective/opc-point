"use client";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-[#f9f9fb] flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col ml-56">
          <AdminHeader />
          <main className="flex-1 px-10 lg:px-20 py-4 lg:py-6 min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
