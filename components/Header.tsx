import React from 'react';
import { Minus, Square, X, Hexagon, PanelLeft, PanelBottom, PanelRight } from 'lucide-react';

const Header = () => {
  return (
    <div className="fixed top-0 left-0 flex items-center justify-between h-[35px] bg-[#1e1e1e] text-[#cccccc] text-[13px] select-none font-sans px-2 border-b border-[#2d2d2d] w-full z-1000">
      <div className="flex items-center space-x-3">
          <h4 className='font-mono text-xl font-bold text-blue-400'>CX</h4>
        <nav className="hidden md:flex items-center space-x-0.5">
          {['File', 'Edit','Help'].map((item) => (
            <div key={item} className="px-2 py-1 hover:bg-[#333333] rounded cursor-pointer transition-colors duration-100">
              {item}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-center text-center max-w-[40%]">
        <span className="truncate">Header.tsx - codexa - Visual Studio Code</span>
      </div>

      <div className="flex items-center h-full gap-1.5">
        <button className="flex items-center justify-center hover:bg-[#333333] transition-colors cursor-pointer p-1 rounded-md">
          <PanelLeft className="size-5" strokeWidth={1.5} />
        </button>
        <button className="flex items-center justify-center hover:bg-[#333333] transition-colors cursor-pointer p-1 rounded-md">
          <PanelBottom className="size-5" strokeWidth={1.5} />
        </button>
        <button className="flex items-center justify-center hover:bg-[#333333] hover:text-white transition-colors cursor-pointer p-1 rounded-md">
          <PanelRight className="size-5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default Header;