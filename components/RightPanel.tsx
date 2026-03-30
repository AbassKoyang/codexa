"use client";

import { useRef, useEffect, useState } from 'react';
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
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSearchParams } from 'next/navigation';
import { useFetchHistory } from '@/lib/queries';
import { Message } from '@/lib/types';
import { useFileTree } from '@/contexts/FileTreeContext';
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="my-4 overflow-hidden border border-tokyo-border bg-[#10141f] group/code">
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

const formatMessageTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  } catch (e) {
    return timestamp;
  }
};

const getAgentDisplayContent = (content: string) => {
  if (!content.trim().startsWith('{')) return content;
  
  try {
    const parsed = JSON.parse(content);
    if (parsed.response) return parsed.response;
  } catch (e) {
    const responseMatch = content.match(/"response":\s*"([\s\S]*?)(?:"[,\}]|$)/);
    if (responseMatch) {
      return responseMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\t/g, '\t');
    }
  }
  return '';
};

const RightPanel = () => {
  const { isOpen } = useRightPanelContext();
  const { fileTree, openFiles, setPendingContent, setActiveFileId } = useFileTree();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [mode, setMode] = useState<'agent' | 'ask'>('agent');
  
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get('project') || '';
  const { data: historyData, isLoading: isHistoryLoading } = useFetchHistory(projectSlug);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyData) {
      console.log(historyData)
      setMessages(historyData.map(msg => ({
        ...msg,
        id: msg.id.toString(),
      } as Message)));
    }
  }, [historyData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const geminiHistory = messages.map(msg => ({
      role: msg.role === 'agent' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
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
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, agentPlaceholder]);

    try {
      const formData = new FormData();
      formData.append('prompt', currentInput);
      formData.append('file_tree', JSON.stringify(fileTree));
      formData.append('project_slug', projectSlug);
      formData.append('history', JSON.stringify(geminiHistory));
      formData.append('mode', mode);
      
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
          if (done) {
            if (mode === 'agent' && accumulatedContent.trim().startsWith('{')) {
              try {
                const parsed = JSON.parse(accumulatedContent);
                const { file_tree, modified_files, response } = parsed;
                
                if (file_tree && modified_files) {
                  file_tree.forEach((node: any) => {
                    if (node.type === 'file' && modified_files.includes(node.name)) {
                      setPendingContent(node.id, node.content);
                      
                      if (openFiles.some(f => f.id === node.id)) {
                        setActiveFileId(node.id);
                      }
                    }
                  });
                  toast.success(`Agent suggested changes for: ${modified_files.join(', ')}`);
                }
              } catch (e) {
                console.error("Failed to parse agent JSON:", e);
              }
            }
            break;
          }
          
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
          {isHistoryLoading ? (
            <div className="h-full flex flex-col space-y-6 pt-4 opacity-50">
               <div className="flex flex-col items-end w-full space-y-2">
                  <div className="flex items-center gap-2 justify-end w-full">
                     <Skeleton className="h-3 w-10 bg-tokyo-muted/20" />
                     <Skeleton className="size-6 bg-tokyo-purple/20" />
                  </div>
                  <Skeleton className="h-10 w-2/3 ml-auto bg-tokyo-muted/10" />
               </div>
               
               <div className="flex flex-col items-start w-full space-y-2 mt-6">
                  <div className="flex items-center gap-2">
                     <Skeleton className="size-6 bg-tokyo-blue/20" />
                     <Skeleton className="h-3 w-12 bg-tokyo-muted/20" />
                  </div>
                  <Skeleton className="h-20 w-[85%] bg-tokyo-blue/5" />
                  <Skeleton className="h-12 w-[70%] bg-tokyo-blue/5" />
               </div>

               <div className="flex flex-col items-end w-full space-y-2 mt-6">
                  <div className="flex items-center gap-2 justify-end w-full">
                     <Skeleton className="h-3 w-10 bg-tokyo-muted/20" />
                     <Skeleton className="size-6 bg-tokyo-purple/20" />
                  </div>
                  <Skeleton className="h-16 w-[60%] ml-auto bg-tokyo-muted/10" />
               </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none px-8 text-center space-y-4">
               <Bot size={48} />
               <p className="text-sm font-medium">How can I help you build today?</p>
            </div>
          ) : messages.map((msg) => (
            <div key={msg.id} className="space-y-4">
              {/* Message Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`size-6 flex items-center justify-center ${msg.role === 'agent' ? 'bg-tokyo-blue/20 text-tokyo-blue' : 'bg-tokyo-purple/20 text-tokyo-purple'}`}>
                    {msg.role === 'agent' ? 
                    <div className="flex items-center justify-center p-0.5 border border-tokyo-blue border-dashed relative">
                      <svg className='size-3.5' width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 24C2.175 24 1.46875 23.7062 0.88125 23.1187C0.29375 22.5312 0 21.825 0 21V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H27C27.825 0 28.5312 0.29375 29.1187 0.88125C29.7062 1.46875 30 2.175 30 3V21C30 21.825 29.7062 22.5312 29.1187 23.1187C28.5312 23.7062 27.825 24 27 24H3ZM3 21H27V6H3V21ZM8.25 19.5L6.15 17.4L10.0125 13.5L6.1125 9.6L8.25 7.5L14.25 13.5L8.25 19.5ZM15 19.5V16.5H24V19.5H15Z" fill="#3C83F6" />
                      </svg>
                    </div> : <User size={14} />}
                  </div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-tight">
                    {msg.role === 'agent' ? 'Codexa' : 'YOU'}
                  </span>
                </div>
                <span className="text-[10px] text-tokyo-muted">{formatMessageTime(msg.timestamp)}</span>
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
                        <code className="bg-tokyo-blue/10 text-tokyo-blue px-1.5 py-0.5 text-[12px] font-mono" {...props}>
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
                      <div className="overflow-x-auto my-4 border border-tokyo-border">
                        <table className="w-full text-left border-collapse text-[12px]">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => <th className="p-2 border-b border-tokyo-border bg-tokyo-blue/5 font-bold text-white">{children}</th>,
                    td: ({ children }) => <td className="p-2 border-b border-tokyo-border">{children}</td>,
                  }}
                >
                  {msg.role === 'agent' ? getAgentDisplayContent(msg.content) : msg.content}
                </ReactMarkdown>
                
                {msg.role === 'agent' && isStreaming && msg.id === messages[messages.length - 1].id && (
                  <div className="flex gap-1 mt-4 ml-1">
                    <div className="size-1.5 bg-tokyo-blue animate-bounce shrink-0" />
                    <div className="size-1.5 bg-tokyo-blue animate-bounce delay-75 shrink-0" />
                    <div className="size-1.5 bg-tokyo-blue animate-bounce delay-150 shrink-0" />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-tokyo-bg shrink-0">
          <div className="relative bg-[#0b0f1a] border border-tokyo-border p-2 focus-within:border-tokyo-blue/50 transition-colors">
            {attachment && (
              <div className="flex items-center gap-2 p-2 bg-[#1e293b] border border-tokyo-border mb-2 group">
                <div className="size-8 bg-tokyo-blue/10 flex items-center justify-center text-tokyo-blue">
                  {attachment.type.startsWith('image/') ? <ImageIcon size={16} /> : <Paperclip size={16} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] text-white truncate font-medium">{attachment.name}</p>
                  <p className="text-[9px] text-tokyo-muted uppercase tracking-wider">{(attachment.size / 1024).toFixed(0)} KB</p>
                </div>
                <button 
                  onClick={() => setAttachment(null)}
                  className="p-1 hover:bg-white/5 text-tokyo-muted hover:text-red-400 transition-colors"
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
              <div className="flex bg-[#1a1b26] border border-tokyo-border p-0.5 mr-1">
                <button 
                  onClick={() => setMode('agent')}
                  className={`px-2 py-1 text-[9px] font-bold transition-all flex items-center gap-1 ${mode === 'agent' ? 'bg-tokyo-blue text-white shadow-lg' : 'text-tokyo-muted hover:text-white'}`}
                >
                  <Zap size={10} fill={mode === 'agent' ? 'currentColor' : 'none'} />
                  AGENT
                </button>
                <button 
                  onClick={() => setMode('ask')}
                  className={`px-2 py-1 text-[9px] font-bold transition-all flex items-center gap-1 ${mode === 'ask' ? 'bg-tokyo-blue text-white shadow-lg' : 'text-tokyo-muted hover:text-white'}`}
                >
                  <Send size={10} />
                  ASK
                </button>
              </div>
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
              className="absolute bottom-2 right-2 bg-tokyo-blue hover:bg-tokyo-blue/90 disabled:bg-tokyo-blue/50 disabled:cursor-not-allowed text-white px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold transition-all"
            >
              {isStreaming ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
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
