"use client";

import React from 'react';
import { Minus, Square, X, Hexagon, PanelLeft, PanelBottom, PanelRight, Chromium, Settings, ChevronDown } from 'lucide-react';
import { useFileTree } from '@/contexts/FileTreeContext';
import { VscLayoutPanel } from "react-icons/vsc";
import { useLeftPanelContext, useRightPanelContext, useBottomPanelContext } from '@/contexts/LayoutContext';
import OpenFiles from './OpenFiles';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';


const Header = () => {
  const { activeFile, saveStatus } = useFileTree();
  const {isOpen, setIsOpen} = useLeftPanelContext();
  const { isOpen: isRightOpen, setIsOpen: setIsRightOpen } = useRightPanelContext();
  const { isOpen: isBottomOpen, setIsOpen: setIsBottomOpen } = useBottomPanelContext();
  const {user, loading} = useAuth()
  console.log(user)
  return (
    <div className="fixed top-0 left-0 w-full">
      <div className="flex items-center justify-between h-[35px] bg-tokyo-bg text-tokyo-fg text-[13px] select-none font-sans px-2 border-b border-tokyo-border w-full z-[1000]">
      <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center p-0.5 border border-tokyo-blue border-dashed relative">
          <svg className='size-5' width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 24C2.175 24 1.46875 23.7062 0.88125 23.1187C0.29375 22.5312 0 21.825 0 21V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H27C27.825 0 28.5312 0.29375 29.1187 0.88125C29.7062 1.46875 30 2.175 30 3V21C30 21.825 29.7062 22.5312 29.1187 23.1187C28.5312 23.7062 27.825 24 27 24H3ZM3 21H27V6H3V21ZM8.25 19.5L6.15 17.4L10.0125 13.5L6.1125 9.6L8.25 7.5L14.25 13.5L8.25 19.5ZM15 19.5V16.5H24V19.5H15Z" fill="#3C83F6" />
          </svg>
        </div>
        <nav className="hidden md:flex items-center space-x-0.5">
          {['File', 'Edit','Help'].map((item) => (
            <div key={item} className="px-2 py-1 hover:bg-tokyo-hover rounded cursor-pointer transition-colors duration-100">
              {item}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-center text-center max-w-[40%]">
        <span className="truncate">
          {activeFile ? `${activeFile.name} - codexa - Visual Studio Code` : 'codexa - Visual Studio Code'}
        </span>
        {saveStatus === 'saving' && <span className="ml-2 text-xs text-tokyo-muted bg-white/5 px-1.5 py-0.5 rounded-sm">Saving...</span>}
        {saveStatus === 'saved' && <span className="ml-2 text-xs text-tokyo-blue bg-tokyo-blue/10 px-1.5 py-0.5 rounded-sm">Saved</span>}
        {saveStatus === 'error' && <span className="ml-2 text-xs text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-sm">Failed to save</span>}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center h-full gap-1.5">
          {isOpen ? (
            <button onClick={() => setIsOpen(false)} className="flex items-center justify-center hover:bg-tokyo-hover hover:text-tokyo-blue transition-colors cursor-pointer p-1 rounded-md">
              <VscLayoutPanel className="text-xl rotate-90" />
            </button>
          ) : (
            <button  onClick={() => setIsOpen(true)} className="flex items-center justify-center hover:bg-tokyo-hover hover:text-tokyo-blue transition-colors cursor-pointer p-1 rounded-md">
              <PanelLeft className="size-5" strokeWidth={1.5} />
            </button>
          )}
          
          {isBottomOpen ? (
            <button onClick={() => setIsBottomOpen(false)} className="flex items-center justify-center hover:bg-tokyo-hover hover:text-tokyo-blue transition-colors cursor-pointer p-1 rounded-md">
              <VscLayoutPanel className="text-xl rotate-180" />
            </button>
          ) : (
            <button onClick={() => setIsBottomOpen(true)} className="flex items-center justify-center hover:bg-tokyo-hover hover:text-tokyo-blue transition-colors cursor-pointer p-1 rounded-md">
              <PanelBottom className="size-5" strokeWidth={1.5} />
            </button>
          )}

          {isRightOpen ? (
            <button onClick={() => setIsRightOpen(false)} className="flex items-center justify-center hover:bg-tokyo-hover hover:text-tokyo-blue transition-colors cursor-pointer p-1 rounded-md">
              <VscLayoutPanel className="text-xl -rotate-90" />
            </button>
          ) : (
            <button onClick={() => setIsRightOpen(true)} className="flex items-center justify-center hover:bg-tokyo-hover hover:text-tokyo-blue transition-colors cursor-pointer p-1 rounded-md">
              <PanelRight className="size-5" strokeWidth={1.5} />
            </button>
          )}
        </div>
        <div className="h-4 w-px bg-tokyo-border"></div>
        {user && (
          <div className="flex items-center gap-1">
             <button className="flex items-center justify-center hover:bg-tokyo-hover hover:text-tokyo-blue transition-colors cursor-pointer p-1 rounded-md">
              <Chromium className="size-5" strokeWidth={1.5} />
            </button>
             <button className="flex items-center justify-center hover:bg-tokyo-hover hover:text-tokyo-blue transition-colors cursor-pointer p-1 rounded-md">
              <Settings  className="size-5" strokeWidth={1.5} />
            </button>
            <button className="flex items-center gap-[2px] hover:bg-tokyo-hover hover:text-tokyo-blue transition-colors cursor-pointer p-1 rounded-md">
              <div className='size-[21px] rounded-full overflow-hidden cursor-pointer relative'>
                <Image
                className='object-cover'
                fill
                sizes="(max-width: 768px) 100px, 100px"
                src={user.profile_pic_url}
                loading='eager'
                placeholder='blur'
                blurDataURL='/assets/images/default-avatar.png'
                alt='Profle Picture'
                />
              </div>
              <ChevronDown className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Header;