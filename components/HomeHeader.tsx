'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Sparkles, Loader2, Command } from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';
import ProjectSearchModal from './ProjectSearchModal';
import { useAuth } from '@/contexts/AuthContext';
import { initializeSubscription } from '@/lib/api';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';

interface HomeHeaderProps {
  onMenuClick?: () => void;
}

const HomeHeader = ({ onMenuClick }: HomeHeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get('reference');

  useEffect(() => {
    if (reference && user && user.plan === 'free') {
      const verifyPayment = async () => {
        setIsVerifying(true);
        toast.loading("Verifying your subscription...", { id: 'verify-payment' });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        await refreshUser();
        
        router.replace('/');
        
        toast.dismiss('verify-payment');
        setIsVerifying(false);
      };
      
      verifyPayment();
    }
  }, [reference, user?.id, refreshUser, router]);

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
    <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-tokyo-bg border-b border-[#414868]/30 shrink-0">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-tokyo-muted hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div className="flex-1 relative">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between bg-[#1E293B] border border-[#414868]/50 py-2 pl-3 pr-4 text-sm text-tokyo-muted outline-none hover:border-tokyo-blue/50 transition-colors shadow-sm cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search size={16} />
            <span className="hidden sm:inline group-hover:text-tokyo-fg transition-colors">Search projects...</span>
            <span className="sm:hidden group-hover:text-tokyo-fg transition-colors">Search...</span>
          </div>
          <kbd className="hidden lg:flex py-0.5 items-center gap-1 rounded border border-[#414868]/60 bg-tokyo-bg px-0.5 font-mono text-[10px] font-medium text-tokyo-muted opacity-100">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </button>
      </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-4">
        {user?.plan === 'free' && (
          <button 
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-tokyo-blue to-purple-500 hover:scale-105 transition-all shadow-lg shadow-tokyo-blue/20 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isUpgrading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles size={16} />}
            {isUpgrading ? 'Redirecting...' : 'Upgrade to Pro'}
          </button>
        )}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-tokyo-blue hover:bg-tokyo-blue/90 text-white px-3 sm:px-4 py-2 text-sm font-semibold transition-all shadow-lg shadow-tokyo-blue/20"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Project</span>
        </button>
      </div>

      <CreateProjectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <ProjectSearchModal open={isSearchOpen} setOpen={setIsSearchOpen} />
    </header>
  );
};

export default HomeHeader;