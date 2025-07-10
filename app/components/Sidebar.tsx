"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

// Placeholder Icons - I will use simple paths for now
// and you can replace them with your custom icons later.
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? 'white' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  </svg>
);

const SignalsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? 'white' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2"/>
    <path d="M16.24 7.76C18.28 9.8 18.28 13.2 16.24 15.24M19.07 4.93C22.31 8.17 22.31 13.83 19.07 17.07M7.76 16.24C5.72 14.2 5.72 10.8 7.76 8.76M4.93 19.07C1.69 15.83 1.69 10.17 4.93 6.93"/>
  </svg>
);

const DcaToolIcon = ({ isActive }: { isActive: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? 'white' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0l.879-.659M7 10.5h10M7.159 14.25h9.682"/>
  </svg>
);

const ChatIcon = ({ isActive }: { isActive: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? 'white' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const SettingsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? 'white' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15c-1.3-1.3-1.3-3.4 0-4.7l1.3-1.3c.6-.6.6-1.5 0-2.1l-2.1-2.1c-.6-.6-1.5-.6-2.1 0l-1.3 1.3c-1.3 1.3-3.4 1.3-4.7 0L8.4 4.8c-.6-.6-1.5-.6-2.1 0L4.2 6.9c-.6.6-.6 1.5 0 2.1l1.3 1.3c1.3 1.3 1.3 3.4 0 4.7l-1.3 1.3c-.6.6-.6 1.5 0 2.1l2.1 2.1c.6.6 1.5.6 2.1 0l1.3-1.3c1.3-1.3 3.4-1.3 4.7 0l1.3 1.3c.6.6 1.5.6 2.1 0l2.1-2.1c.6-.6.6-1.5 0-2.1l-1.3-1.3z"/>
  </svg>
);

const EducationIcon = ({ isActive }: { isActive: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? 'white' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10v6M12 2v20M20 6l-8 4-8-4M20 18l-8-4-8 4"/>
  </svg>
);

const LogoutIcon = ({ isActive }: { isActive: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? 'white' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
);

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Signals', href: '/signals', icon: SignalsIcon },
  { name: 'DCA Tool', href: '/dca', icon: DcaToolIcon },
  { name: 'Chat', href: '/chat', icon: ChatIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
  { name: 'Education', href: '/education', icon: EducationIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/passport/login');
  };

  return (
    <aside className="w-20 h-screen bg-opc-primary-dark flex flex-col items-center py-6 border-r-[0.25px] border-r-[#9C9C9C]" style={{ paddingTop: '40px' }}>
      <Link href="/dashboard">
        <Image src="/opc-logo-icon.svg" alt="OPC Logo" width={40} height={40} />
      </Link>

      <nav className="flex flex-col items-center space-y-8 mt-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.name} href={item.href} className={`p-2 rounded-lg transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-600 hover:text-white'}`}>
              <item.icon isActive={isActive} />
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-8">
        <button onClick={handleLogout} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white">
          <LogoutIcon isActive={false} />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </aside>
  );
}
