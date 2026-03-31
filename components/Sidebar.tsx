"use client";

import { Files, Search as SearchIcon, GitBranch, Blocks, Settings } from 'lucide-react';
import React from 'react';
import { useTabContext } from '@/contexts/TabContext';
import Explorer from './Explorer';
import Search from './Search';
import SourceControl from './SourceControl';
import Extensions from './Extensions';
import { useLeftPanelContext } from '@/contexts/LayoutContext';

const Sidebar = () => {
  const { activeTab, setActiveTab } = useTabContext();
  const {isOpen, setIsOpen} = useLeftPanelContext();
  

  const topIcons = [
    { id: 'explorer', Icon: Files },
    { id: 'search', Icon: SearchIcon },
    { id: 'source-control', Icon: GitBranch },
    { id: 'extensions', Icon: Blocks },
  ];

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'explorer': return <Explorer />;
      case 'search': return <Search />;
      case 'source-control': return null;
      case 'extensions': return null;
      default: return null;
    }
  }

  return (
    <div className="fixed lg:static flex h-[calc(100vh-35px)] select-none font-sans bg-tokyo-bg self-end z-1000">
      <div className="w-[40px] lg:w-[48px] h-full bg-tokyo-panel flex flex-col items-center py-2 space-y-4 border-r border-tokyo-border z-10">
        {topIcons.map(({ id, Icon }) => {
          const isActive = activeTab === id;
          return (
            <div 
              key={id}
              onClick={() => {setActiveTab(id); if(isOpen && isActive) setIsOpen(false); else {setIsOpen(true)}}}
              className={`relative group cursor-pointer flex items-center justify-center w-full h-12 transition-colors ${
                isActive ? 'text-tokyo-fg' : 'text-tokyo-muted hover:text-tokyo-fg'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-tokyo-blue"></div>
              )}
              <Icon className="size-4 lg:size-6" strokeWidth={1.5} />
            </div>
          );
        })}

        <div className="flex-1"></div>

        <div 
          onClick={() => setActiveTab('settings')}
          className={`relative group cursor-pointer flex items-center justify-center w-full h-12 transition-colors ${
            activeTab === 'settings' ? 'text-tokyo-fg' : 'text-tokyo-muted hover:text-tokyo-fg'
          }`}
        >
          {activeTab === 'settings' && (
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-tokyo-blue"></div>
          )}
          <Settings className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>

      {renderActiveTab()}
    </div>
  );
};

export default Sidebar;
