"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Trash2, X, Play, Square, Loader2 } from 'lucide-react';
import { usePyodide } from '@/contexts/PyodideContext';
import { useBottomPanelContext } from '@/contexts/LayoutContext';

const Terminal = () => {
  const { terminalOutput, clearTerminal, isRunning, awaitingInput, onInputSubmit, interruptExecution } = usePyodide();
  const { isOpen, setIsOpen } = useBottomPanelContext();
  const [inputValue, setInputValue] = useState('');
  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalOutput]);

  useEffect(() => {
    if (awaitingInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [awaitingInput]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onInputSubmit(inputValue);
      setInputValue('');
    }
  };


  return (
    <div className={`h-[250px] lg:h-[300px] w-full bg-[#0a0a0a] border-t border-tokyo-border flex flex-col font-mono text-[13px] z-[10000] fixed bottom-0 left-0 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-between px-4 h-[35px] bg-tokyo-bg border-b border-tokyo-border shrink-0">
        <div className="flex items-center gap-2 text-tokyo-fg/70">
          <TerminalIcon size={14} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Terminal</span>
          {isRunning && (
            <div className="flex items-center gap-1.5 ml-2 text-tokyo-blue animate-pulse">
              <Loader2 size={12} className="animate-spin" />
              <span className="text-[10px]">Running...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {isRunning && (
            <button 
              onClick={interruptExecution}
              className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
              title="Stop Execution"
            >
              <Square size={14} fill="currentColor" />
            </button>
          )}
          <button 
            onClick={clearTerminal}
            className="p-1.5 hover:bg-tokyo-hover text-tokyo-fg/60 hover:text-tokyo-fg transition-colors"
            title="Clear Console"
          >
            <Trash2 size={14} />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-tokyo-hover text-tokyo-fg/60 hover:text-tokyo-fg transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-0.5 custom-scrollbar text-[10px] lg:text-base">
        {terminalOutput.map((line, i) => (
          <div 
            key={i} 
            className={`whitespace-pre-wrap break-all ${
              line.type === 'stderr' ? 'text-red-400' :
              line.type === 'system' ? 'text-tokyo-blue font-bold italic' :
              line.type === 'input-prompt' ? 'text-tokyo-green font-bold' :
              line.type === 'input-value' ? 'text-white' :
              'text-tokyo-fg/90'
            }`}
          >
            {line.content}
          </div>
        ))}
        
        {awaitingInput && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-tokyo-blue font-bold">{">"}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-white selection:bg-tokyo-blue/30"
              autoFocus
            />
          </div>
        )}
        <div ref={outputEndRef} />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #41486833;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #41486855;
        }
      `}</style>
    </div>
  );
};

export default Terminal;
