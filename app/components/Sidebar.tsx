"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

// Placeholder Icons - I will use simple paths for now
// and you can replace them with your custom icons later.
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <Image 
    src={isActive ? '/home-fill.svg' : '/home-outline.svg'} 
    alt="Home" 
    width={24} 
    height={24} 
  />
);

const SignalsIcon = ({ isActive }: { isActive: boolean }) => (
  <Image 
    src={isActive ? '/signals-fill.svg' : '/signals-outline.svg'} 
    alt="Signals" 
    width={24} 
    height={24} 
  />
);

const DcaToolIcon = ({ isActive }: { isActive: boolean }) => (
  <Image 
    src={isActive ? '/precision-fill.svg' : '/precision-outline.svg'} 
    alt="DCA Tool" 
    width={24} 
    height={24} 
  />
);

const ChatIcon = ({ isActive }: { isActive: boolean }) => (
  <Image 
    src={isActive ? '/chat-fill.svg' : '/chat-outline.svg'} 
    alt="Chat" 
    width={24} 
    height={24} 
  />
);

const SettingsIcon = ({ isActive }: { isActive: boolean }) => (
  <Image 
    src={isActive ? '/cpu-fill.svg' : '/cpu-outline.svg'} 
    alt="Atlas" 
    width={24} 
    height={24} 
  />
);

const EducationIcon = ({ isActive }: { isActive: boolean }) => (
  <Image 
    src={isActive ? '/codex-fill.svg' : '/codex-outline.svg'} 
    alt="Education" 
    width={24} 
    height={24} 
  />
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
  { name: 'Atlas', href: '/atlas', icon: SettingsIcon },
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
        <Image src="/icon.svg" alt="OPC Logo" width={40} height={40} />
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
