"use client";

import React, { useState } from 'react';
import { useRightPanelContext } from '@/contexts/LayoutContext';
import { Bot, Send, User } from 'lucide-react';

type Message = {
  id: string;
  role: 'agent' | 'user';
  content: string;
};

const RightPanel = () => {
  const { isOpen } = useRightPanelContext();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: 'Hello! I am your AI coding assistant. How can I help you today?'
    }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `I am a simulated AI agent, but in the future I'll be able to help you build out this file!`
      };
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`
      ${isOpen ? 'w-[300px]' : 'w-0'} 
      h-full bg-tokyo-panel flex flex-col border-l border-tokyo-border text-tokyo-fg 
      transition-[width] duration-300 ease-in-out overflow-hidden select-none shrink-0
    `}>
      <div className="flex flex-col h-full w-full min-w-[300px]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-[35px] text-[11px] font-semibold tracking-wide text-tokyo-fg uppercase shrink-0 border-b border-tokyo-border">
          <div className="flex items-center space-x-2">
            <Bot size={14} className="text-tokyo-purple" />
            <span>AI AGENT</span>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 text-sm">
              <div className="shrink-0 mt-0.5">
                {msg.role === 'agent' ? (
                  <div className="bg-tokyo-purple/20 p-1.5 rounded-md text-tokyo-purple">
                    <Bot size={16} />
                  </div>
                ) : (
                  <div className="bg-tokyo-blue/20 p-1.5 rounded-md text-tokyo-blue">
                    <User size={16} />
                  </div>
                )}
              </div>
              <div className={`flex flex-col ${msg.role === 'user' ? 'text-tokyo-fg' : 'text-tokyo-fg/90'} leading-relaxed`}>
                <span className="font-semibold text-xs text-tokyo-fg/50 mb-1">
                  {msg.role === 'agent' ? 'Codexa AI' : 'You'}
                </span>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-tokyo-border shrink-0 bg-tokyo-bg/50">
          <div className="relative flex items-center bg-[#1e1e2e] border border-tokyo-border rounded-md focus-within:border-tokyo-purple/50 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full bg-transparent text-sm text-tokyo-fg placeholder:text-tokyo-fg/30 resize-none py-2.5 pl-3 pr-10 outline-none min-h-[40px] max-h-[120px]"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-2 bottom-2 p-1 text-tokyo-fg/50 hover:text-tokyo-purple disabled:hover:text-tokyo-fg/50 disabled:opacity-50 transition-colors rounded-md"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
