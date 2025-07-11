"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

// Icon Components
const HomeIcon = () => <Image src="/admin-home-outline.svg" alt="Dashboard" width={20} height={20} />;



const DailyBriefsIcon = () => <Image src="/admin-daily-brief-outline.svg" alt="Daily Briefs" width={20} height={20} />;
const RadioIcon = () => <Image src="/admin-signal-outline.svg" alt="Signals" width={20} height={20} />;

const GlobeIcon = () => <Image src="/admin-atlas-outline.svg" alt="Atlas Content" width={20} height={20} />;

const NewsIcon = () => <Image src="/news-outline.svg" alt="News" width={20} height={20} />;
const AnnouncementIcon = () => <Image src="/admin-announcement-outline.svg" alt="Announcement" width={20} height={20} />;



const UsersIcon = () => <Image src="/users-outline.svg" alt="All Users" width={20} height={20} />;

const ShieldIcon = () => <Image src="/roles-outline.svg" alt="Roles & Permissions" width={20} height={20} />;

const BarChartIcon = () => <Image src="/analytics-outline.svg" alt="Analytics" width={20} height={20} />;

const CreditCardIcon = () => <Image src="/subscription-outline.svg" alt="Subscriptions" width={20} height={20} />;

const SettingsIcon = () => <Image src="/admin-settings-outline.svg" alt="Settings" width={20} height={20} />;

const BackToMainSiteIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 9L9 1M9 1H1M9 1V9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType;
}

const contentManagementItems: NavItem[] = [
  { name: 'Daily Briefs', href: '/admin/daily-briefs', icon: DailyBriefsIcon },
  { name: 'Signals', href: '/admin/signals', icon: RadioIcon },
  { name: 'Atlas Content', href: '/admin/atlas-lite', icon: GlobeIcon },
  { name: 'News', href: '/admin/news-feed', icon: NewsIcon },
  { name: 'Announcement', href: '/admin/announcements', icon: AnnouncementIcon },
];

const userManagementItems: NavItem[] = [
  { name: 'All Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Roles & Permissions', href: '/admin/members', icon: ShieldIcon },
];

const systemItems: NavItem[] = [
  { name: 'Analytics', href: '/admin/analytics', icon: BarChartIcon },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCardIcon },
  { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
];

const NavLink = ({ item, isActive }: { item: NavItem, isActive: boolean }) => (
  <Link
    href={item.href}
    className={`group flex items-center py-2 px-2 rounded-lg transition-colors duration-200 no-underline ${
      isActive 
        ? 'bg-gray-200 text-[#0c0c0c]' 
        : 'text-[#717171] hover:text-[#0c0c0c] hover:bg-gray-100'
    }`}
  >
    <div className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-[#0c0c0c]' : 'text-[#717171] group-hover:text-[#0c0c0c]'}`}>
      <item.icon />
    </div>
    <span className="ml-3 text-sm">{item.name}</span>
  </Link>
);

const NavSection = ({ title, items, pathname }: { title: string, items: NavItem[], pathname: string }) => (
  <div className="mb-1">
    <h3 className="px-2 py-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">{title}</h3>
    {items.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
      return <NavLink key={item.name} item={item} isActive={isActive} />;
    })}
  </div>
);

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboardActive = pathname === '/admin';

  const handleBackToMainSite = () => {
    router.push('/dashboard');
  };

  return (
    <div className="w-56 h-screen bg-[#fcfcfc] flex flex-col py-6 px-3 fixed top-0 left-0" style={{ borderRight: '0.5px solid #e5e5e5' }}>
      <div className="flex items-start mb-8 px-2">
        <Image src="/opc-logo-black.svg" alt="OPC Logo" width={120} height={50} className="h-auto" />
      </div>

      <nav className="flex-grow">
        <div className="mb-4">
          <NavLink item={{ name: 'Dashboard', href: '/admin', icon: HomeIcon }} isActive={isDashboardActive} />
        </div>
        <NavSection title="Content Management" items={contentManagementItems} pathname={pathname} />
        <NavSection title="User Management" items={userManagementItems} pathname={pathname} />
        <NavSection title="System" items={systemItems} pathname={pathname} />
      </nav>

      <div className="mt-auto mb-8">
        <button 
          onClick={handleBackToMainSite}
          className="group flex items-center py-2 px-2 text-[#717171] hover:text-[#0c0c0c] transition-colors duration-200 w-full text-left"
        >
          <span className="text-sm">Back to The Point</span>
          <span className="ml-2 transform transition-transform duration-300 group-hover:rotate-90">
            <BackToMainSiteIcon />
          </span>
        </button>
      </div>
    </div>
  );
}
