'use client';

import React, { useState } from 'react';
import { Search, Plus, Sparkles, Loader2 } from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';
import { useAuth } from '@/contexts/AuthContext';
import { initializeSubscription } from '@/lib/api';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const HomeHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        
        // Wait a bit for the webhook to potentially process
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        await refreshUser();
        
        // Clear the query params
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
    <header className="h-16 flex items-center justify-between px-8 bg-tokyo-bg border-b border-[#414868]/30">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tokyo-muted" size={16} />
        <input 
          type="text" 
          placeholder="Search projects..." 
          className="w-full bg-[#1E293B] border border-[#414868]/50 py-2 pl-10 pr-4 text-sm text-tokyo-fg placeholder:text-tokyo-muted outline-none focus:border-tokyo-blue/50 transition-colors shadow-sm"
        />
      </div>
      
      <div className="flex items-center gap-4">
        {user?.plan === 'free' && (
          <button 
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-tokyo-blue to-purple-500 hover:scale-105 transition-all shadow-lg shadow-tokyo-blue/20 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isUpgrading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles size={16} />}
            {isUpgrading ? 'Redirecting...' : 'Upgrade to Pro'}
          </button>
        )}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-tokyo-blue hover:bg-tokyo-blue/90 text-white px-4 py-2 text-sm font-semibold transition-all shadow-lg shadow-tokyo-blue/20"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      <CreateProjectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </header>
  );
};

export default HomeHeader;