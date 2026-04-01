'use client';

import React, { useState } from 'react';
import { Home, LayoutGrid, Loader2, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { url } from 'inspector';
import { usePathname } from 'next/navigation';
import { initializeSubscription } from '@/lib/api';
import { toast } from 'sonner';

interface HomeSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const HomeSidebar = ({ isOpen, onClose }: HomeSidebarProps) => {
  const { user } = useAuth();
  const pathname = usePathname()
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', url: '/' },
    { id: 'templates', icon: LayoutGrid, label: 'Templates', url: '/templates' },
    { id: 'settings', icon: Settings, label: 'Settings', url: '/settings' },
  ];

    const handleUpgrade = async () => {
      setIsUpgrading(true);
      try {
        const data = await initializeSubscription();
        if (data?.authorization_url) {
          window.location.href = data.authorization_url;
        } else {
          toast.error("Failed to initialize payment.");
        }
      } catch (error) {
        toast.error("An error occurred. Please try again.");
      } finally {
        setIsUpgrading(false);
      }
    };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-[240px] bg-[#0f172a] border-r border-[#414868] 
        transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col text-tokyo-fg select-none
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center p-1 border border-tokyo-blue border-dashed relative">
              <svg className='size-6' width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 24C2.175 24 1.46875 23.7062 0.88125 23.1187C0.29375 22.5312 0 21.825 0 21V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H27C27.825 0 28.5312 0.29375 29.1187 0.88125C29.7062 1.46875 30 2.175 30 3V21C30 21.825 29.7062 22.5312 29.1187 23.1187C28.5312 23.7062 27.825 24 27 24H3ZM3 21H27V6H3V21ZM8.25 19.5L6.15 17.4L10.0125 13.5L6.1125 9.6L8.25 7.5L14.25 13.5L8.25 19.5ZM15 19.5V16.5H24V19.5H15Z" fill="#3C83F6" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white">Codexa AI</h1>
              <p className="text-[10px] text-tokyo-blue font-bold tracking-widest uppercase">
                {user?.plan ? `${user.plan} Plan` : 'Loading...'}
              </p>
            </div>
          </div>
          
          {/* Close button - mobile only */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-tokyo-muted hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
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

        {user?.plan === 'free' && (
          <button 
            onClick={handleUpgrade}
            className="w-full mt-4 flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-white bg-linear-to-r from-tokyo-blue to-purple-500 hover:opacity-90 transition-all sm:hidden"
          >
            {isUpgrading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles size={16} />}
            {isUpgrading ? 'Redirecting...' : 'Upgrade to Pro'}          </button>
        )}
      </nav>

      <div className="p-4 border-t border-[#414868]/50 space-y-2">
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
        <button 
          onClick={async () => {
            try {
              const { useQueryClient } = await import('@tanstack/react-query');
              const { api } = await import('@/lib/api');
              // Using basic fetch/api approach for logout client side, or just relying on api instance.
              await api.post('/api/auth/logout/');
              window.location.replace('/login');
            } catch (error) {
              console.log("Error logging out", error);
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors rounded-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Log Out
        </button>
      </div>
    </div>
    </>
  );
};

export default HomeSidebar;