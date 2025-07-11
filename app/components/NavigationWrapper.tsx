"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const pathname = usePathname();
  
  // Paths where we don't want to show the sidebar
  const authPaths = [
    '/passport/login',
    '/passport/signup',
    '/passport/logout',
    '/passport/reset-password',
    '/passport/set-password', // Added this line
    '/auth/callback',
  ];
  
  // Don't show regular sidebar on admin paths - admin has its own sidebar
  const isAdminPath = pathname?.startsWith('/admin');
  
  // Check if we're on a passport route to show the passport sidebar
  const isAuthPath = authPaths.some(path => pathname === path);

  // If we are on an auth path (login, signup), render nothing but the page content.
  if (isAuthPath) {
    return <>{children}</>;
  }

  // If we are on an admin path, render nothing but the page content.
  // The admin layout file (/app/admin/layout.tsx) is responsible for the admin UI.
  if (isAdminPath) {
    return <>{children}</>;
  }

  // For all other pages (Dashboard, Signals, Passport, etc.), render the main layout with the member sidebar.
  
  return (
    <div className="flex h-screen text-white">
      <Sidebar />
      <main 
        className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out" 
      >
        {children}
      </main>
    </div>
  );
}
