"use client";

import { Files, Search, GitBranch, Blocks, Settings, ChevronRight, Folder, FileText } from 'lucide-react';
import React from 'react';
import { useTabContext } from '@/contexts/TabContext';
import Explorer from './Explorer';

const Sidebar = () => {
  const { activeTab, setActiveTab } = useTabContext();

  const topIcons = [
    { id: 'explorer', Icon: Files },
    { id: 'search', Icon: Search },
    { id: 'source-control', Icon: GitBranch },
    { id: 'extensions', Icon: Blocks },
  ];

  return (
    <div className="flex h-full select-none font-sans pt-10 bg-[#1e1e1e]">
      <div className="w-[48px] h-full bg-[#1e1e1e] flex flex-col items-center py-2 space-y-4 border-r border-[#2d2d2d] z-10">
        {topIcons.map(({ id, Icon }) => {
          const isActive = activeTab === id;
          return (
            <div 
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative group cursor-pointer flex items-center justify-center w-full h-12 transition-colors ${
                isActive ? 'text-white' : 'text-[#858585] hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-400"></div>
              )}
              <Icon className="w-6 h-6" strokeWidth={1.5} />
            </div>
          );
        })}

        <div className="flex-1"></div>

        <div 
          onClick={() => setActiveTab('settings')}
          className={`relative group cursor-pointer flex items-center justify-center w-full h-12 transition-colors ${
            activeTab === 'settings' ? 'text-white' : 'text-[#858585] hover:text-white'
          }`}
        >
          {activeTab === 'settings' && (
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-400"></div>
          )}
          <Settings className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>

      {activeTab === 'explorer' && <Explorer />}
    </div>
  );
};

export default Sidebar;
