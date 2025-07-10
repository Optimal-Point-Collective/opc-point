"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/utils/supabaseClient";

const SearchIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NotificationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className="h-4 w-4">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MemberHeader() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getUserInitials = (email: string) => {
    if (!email) return "";
    const name = email.split('@')[0];
    const parts = name.split(/[._-]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  
  const getUsername = (email: string) => {
    if (!email) return "";
    return email.split('@')[0];
  }

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      
      console.log('User signed out successfully');
      
      // Force a hard reload to clear all state
      window.location.href = '/passport/login';
    } catch (error) {
      console.error('Error in logout process:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full flex items-center justify-between py-6 pl-16 pr-[120px] bg-opc-primary-dark" style={{ paddingTop: '60px' }}>
      {/* Search Bar */}
      <div className="relative w-full max-w-sm">
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-gray-400">
          <SearchIcon className="mb-1" />
        </div>
        <input
          type="text"
          className="w-full pl-8 bg-transparent border-b border-[#9C9C9C] text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors duration-300"
          placeholder="Search"
        />
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-6">
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <NotificationIcon />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        <div 
          ref={dropdownRef}
          className="group relative flex items-center space-x-3 cursor-pointer bg-[#121212] hover:bg-[#BDB7A9] hover:text-black p-1 pr-3 rounded-full transition-colors"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="flex items-center space-x-1.5">
            <ChevronDownIcon />
            <span className="text-white group-hover:text-black text-sm font-medium">
              {profile?.full_name || (user?.email ? getUsername(user.email) : 'Loading...')}
            </span>
          </div>
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
            {user?.email ? getUserInitials(user.email) : '?'}
          </div>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                <div className="font-medium">{profile?.full_name || (user?.email ? getUsername(user.email) : 'User')}</div>
                <div className="text-gray-500">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

