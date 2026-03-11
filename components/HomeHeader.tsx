'use client';

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';

const HomeHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-tokyo-blue hover:bg-tokyo-blue/90 text-white px-4 py-2 text-sm font-semibold transition-all shadow-lg shadow-tokyo-blue/20"
      >
        <Plus size={18} />
        New Project
      </button>

      <CreateProjectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </header>
  );
};

export default HomeHeader;