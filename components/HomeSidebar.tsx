'use client';

import React from 'react';
import { Home, LayoutGrid, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { url } from 'inspector';
import { usePathname } from 'next/navigation';

const HomeSidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname()
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', url: '/' },
    { id: 'templates', icon: LayoutGrid, label: 'Templates', url: '/templates' },
    { id: 'settings', icon: Settings, label: 'Settings', url: '/settings' },
  ];

  return (
    <div className="w-[240px] h-full flex flex-col border-r border-[#414868] bg-[#0f172a] text-tokyo-fg select-none">
      <div className="p-6 flex items-center gap-3">
        <div className="flex items-center justify-center p-1 border border-tokyo-blue border-dashed relative">
          <svg className='size-6' width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 24C2.175 24 1.46875 23.7062 0.88125 23.1187C0.29375 22.5312 0 21.825 0 21V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H27C27.825 0 28.5312 0.29375 29.1187 0.88125C29.7062 1.46875 30 2.175 30 3V21C30 21.825 29.7062 22.5312 29.1187 23.1187C28.5312 23.7062 27.825 24 27 24H3ZM3 21H27V6H3V21ZM8.25 19.5L6.15 17.4L10.0125 13.5L6.1125 9.6L8.25 7.5L14.25 13.5L8.25 19.5ZM15 19.5V16.5H24V19.5H15Z" fill="#3C83F6" />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white">Codexa AI</h1>
          <p className="text-[10px] text-tokyo-blue font-bold tracking-widest uppercase">Pro Plan</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => (
          <Link href={item.url}
            key={item.id}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 ${
              item.url == pathname 
                ? 'bg-[#3C83F6]/10 text-tokyo-blue font-medium' 
                : 'text-tokyo-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[#414868]/50">
        <div className="flex items-center gap-3 p-2 hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-tokyo-active flex items-center justify-center overflow-hidden border border-[#414868]">
            {user?.profile_pic_url ? (
               <Image src={user.profile_pic_url} alt="Profile" width={32} height={32} />
            ) : (
                <div className="text-xs font-bold text-tokyo-blue">
                    {user?.first_name?.charAt(0) || 'U'}
                </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-[10px] text-tokyo-muted truncate">{user?.email || 'user@dev.ai'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSidebar;