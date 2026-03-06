"use client";

import React from 'react';
import { Minus, Square, X, Hexagon, PanelLeft, PanelBottom, PanelRight } from 'lucide-react';
import { useFileTree } from '@/contexts/FileTreeContext';
import { VscLayoutPanel } from "react-icons/vsc";
import { useLeftPanelContext, useRightPanelContext, useBottomPanelContext } from '@/contexts/LayoutContext';


const Header = () => {
  const { activeFile } = useFileTree();
  const {isOpen, setIsOpen} = useLeftPanelContext();
  const { isOpen: isRightOpen, setIsOpen: setIsRightOpen } = useRightPanelContext();
  const { isOpen: isBottomOpen, setIsOpen: setIsBottomOpen } = useBottomPanelContext();
  return (
    <div className="fixed top-0 left-0 flex items-center justify-between h-[35px] bg-tokyo-bg text-tokyo-fg text-[13px] select-none font-sans px-2 border-b border-tokyo-border w-full z-[1000]">
      <div className="flex items-center space-x-3">
          <h4 className='font-mono text-xl font-bold text-tokyo-blue'>CX</h4>
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
      </div>

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
    </div>
  );
};

export default Header;