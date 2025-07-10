"use client";

import Link from 'next/link';

export default function AdminNav() {
  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Admin Navigation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/admin/users" 
          className="block p-4 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
        >
          <h2 className="text-lg font-bold">User Management</h2>
          <p className="text-sm text-gray-600">Manage user accounts, memberships and profiles</p>
        </Link>
        
        <Link 
          href="/debug-auth" 
          className="block p-4 bg-green-100 hover:bg-green-200 rounded-lg transition"
        >
          <h2 className="text-lg font-bold">Auth Debugger</h2>
          <p className="text-sm text-gray-600">Debug authentication and user permissions</p>
        </Link>
      </div>
    </div>
  );
}
