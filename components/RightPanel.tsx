"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRightPanelContext } from '@/contexts/LayoutContext';
import { 
  Bot, 
  Send, 
  User, 
  MoreVertical, 
  Zap, 
  Paperclip,
  Image as ImageIcon,
  Loader2,
  X,
  Clipboard,
  Check
} from 'lucide-react';
import { useFileTree } from '@/contexts/FileTreeContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  id: string;
  role: 'agent' | 'user';
  content: string;
  timestamp: string;
};

const CodeBlock = ({ children, className }: { children: any; className?: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const handleCopy = () => {
    const codeContent = String(children).replace(/\n$/, '');
    navigator.clipboard.writeText(codeContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-tokyo-border bg-[#10141f] group/code">
      <div className="bg-[#1a1b26] px-3 py-1.5 border-b border-tokyo-border flex justify-between items-center">
        <span className="text-[10px] font-bold text-tokyo-muted uppercase tracking-widest">{language || 'code'}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-bold text-tokyo-muted hover:text-tokyo-blue transition-colors"
        >
          {isCopied ? (
            <div className="flex items-center gap-1.5 text-tokyo-blue">
              <Check size={12} />
              COPIED
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Clipboard size={12} />
              COPY
            </div>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto custom-scrollbar font-mono text-xs leading-normal">
        <code className={className}>
          {children}
        </code>
      </pre>
    </div>
  );
};

const RightPanel = () => {
  const { isOpen } = useRightPanelContext();
  const { fileTree } = useFileTree();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsStreaming(true);

    const agentMessageId = (Date.now() + 1).toString();
    const agentPlaceholder: Message = {
      id: agentMessageId,
      role: 'agent',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, agentPlaceholder]);

    try {
      const formData = new FormData();
      formData.append('prompt', currentInput);
      formData.append('file_tree', JSON.stringify(fileTree));
      if (attachment) {
        formData.append('file', attachment);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${baseUrl}/api/ai/assistant/`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunkValue = decoder.decode(value);
          accumulatedContent += chunkValue;
          
          setMessages(prev => prev.map(msg => 
            msg.id === agentMessageId ? { ...msg, content: accumulatedContent } : msg
          ));
        }
      }
      
      setAttachment(null);
    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error(error.message || "An unexpected error occurred.");
      setMessages(prev => prev.filter(msg => msg.id !== agentMessageId));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`
      ${isOpen ? 'w-[400px]' : 'w-0'} 
      h-full bg-tokyo-bg flex flex-col border-l border-tokyo-border text-tokyo-fg 
      transition-[width] duration-300 ease-in-out overflow-hidden select-none shrink-0
    `}>
      <div className="flex flex-col h-full w-full min-w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-[45px] border-b border-tokyo-border shrink-0">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-tokyo-blue" />
            <span className="text-xs font-bold tracking-wider text-white uppercase">AI ASSISTANT</span>
          </div>
          <button className="text-tokyo-muted hover:text-white transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none px-8 text-center space-y-4">
               <Bot size={48} />
               <p className="text-sm font-medium">How can I help you build today?</p>
            </div>
          ) : messages.map((msg) => (
            <div key={msg.id} className="space-y-4">
              {/* Message Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`size-6 rounded flex items-center justify-center ${msg.role === 'agent' ? 'bg-tokyo-blue/20 text-tokyo-blue' : 'bg-tokyo-purple/20 text-tokyo-purple'}`}>
                    {msg.role === 'agent' ? <Zap size={14} fill="currentColor" /> : <User size={14} />}
                  </div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-tight">
                    {msg.role === 'agent' ? 'LUMINAL AI' : 'YOU'}
                  </span>
                </div>
                <span className="text-[10px] text-tokyo-muted">{msg.timestamp}</span>
              </div>

              {/* Message Content */}
              <div className="text-[13px] leading-relaxed text-tokyo-fg/90 pl-1 prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                    code: ({ node, inline, className, children, ...props }: any) => {
                      return !inline ? (
                        <CodeBlock className={className}>{children}</CodeBlock>
                      ) : (
                        <code className="bg-tokyo-blue/10 text-tokyo-blue px-1.5 py-0.5 rounded text-[12px] font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                    h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-4 mt-6 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold text-white mb-3 mt-5 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-2 mt-4 first:mt-0">{children}</h3>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-tokyo-fg/80">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-tokyo-fg/80">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-tokyo-blue hover:underline font-medium">
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-tokyo-blue/30 pl-4 py-1 italic text-tokyo-muted my-4">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4 border border-tokyo-border rounded-lg">
                        <table className="w-full text-left border-collapse text-[12px]">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => <th className="p-2 border-b border-tokyo-border bg-tokyo-blue/5 font-bold text-white">{children}</th>,
                    td: ({ children }) => <td className="p-2 border-b border-tokyo-border">{children}</td>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
                
                {msg.role === 'agent' && isStreaming && msg.id === messages[messages.length - 1].id && (
                  <div className="flex gap-1 mt-4 ml-1">
                    <div className="size-1.5 bg-tokyo-blue rounded-full animate-bounce shrink-0" />
                    <div className="size-1.5 bg-tokyo-blue rounded-full animate-bounce delay-75 shrink-0" />
                    <div className="size-1.5 bg-tokyo-blue rounded-full animate-bounce delay-150 shrink-0" />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-tokyo-bg shrink-0">
          <div className="relative bg-[#0b0f1a] border border-tokyo-border rounded-lg p-2 focus-within:border-tokyo-blue/50 transition-colors">
            {attachment && (
              <div className="flex items-center gap-2 p-2 bg-[#1e293b] border border-tokyo-border rounded mb-2 group">
                <div className="size-8 bg-tokyo-blue/10 rounded flex items-center justify-center text-tokyo-blue">
                  {attachment.type.startsWith('image/') ? <ImageIcon size={16} /> : <Paperclip size={16} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-white truncate font-medium">{attachment.name}</p>
                  <p className="text-[9px] text-tokyo-muted uppercase tracking-wider">{(attachment.size / 1024).toFixed(0)} KB</p>
                </div>
                <button 
                  onClick={() => setAttachment(null)}
                  className="p-1 hover:bg-white/5 rounded text-tokyo-muted hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Ask AI to edit or explain..."
              className="w-full bg-transparent text-[13px] text-tokyo-fg placeholder:text-tokyo-muted resize-none p-2 pb-10 outline-none min-h-[80px] disabled:opacity-50"
            />
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
            />
            
            <div className="absolute bottom-2 left-2 flex items-center gap-3 text-tokyo-muted">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
                className="hover:text-white transition-colors disabled:opacity-50"
              >
                <Paperclip size={16} />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
                className="hover:text-white transition-colors disabled:opacity-50"
              >
                <ImageIcon size={16} />
              </button>
            </div>
            
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="absolute bottom-2 right-2 bg-tokyo-blue hover:bg-tokyo-blue/90 disabled:bg-tokyo-blue/50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-md flex items-center gap-2 text-[11px] font-bold transition-all"
            >
              {isStreaming ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  THINKING
                </>
              ) : (
                <>
                  SEND
                  <Send size={12} className="rotate-[-35deg]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
