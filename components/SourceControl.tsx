"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  GitBranch, 
  RotateCw, 
  MoreVertical, 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Minus, 
  Undo2, 
  FileText,
  FileCode,
  FileJson,
  FileImage,
  Loader2,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface ChangedFile {
  id: string;
  name: string;
  path: string;
  status: 'M' | 'A' | 'D';
  extension: string;
}

const SourceControl = () => {
  const [commitMessage, setCommitMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCommitHighligted, setIsCommitHighlighted] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<ChangedFile[]>([
    { id: '1', name: 'RightPanel.tsx', path: 'components/RightPanel.tsx', status: 'M', extension: 'tsx' },
  ]);
  const [unstagedFiles, setUnstagedFiles] = useState<ChangedFile[]>([
    { id: '2', name: 'layout.tsx', path: 'app/layout.tsx', status: 'M', extension: 'tsx' },
    { id: '3', name: 'api.ts', path: 'lib/api.ts', status: 'M', extension: 'ts' },
    { id: '4', name: 'schema.ts', path: 'lib/schema.ts', status: 'A', extension: 'ts' },
  ]);
  const [isStagedExpanded, setIsStagedExpanded] = useState(true);
  const [isUnstagedExpanded, setIsUnstagedExpanded] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerateAICommit = async () => {
    if (stagedFiles.length === 0) {
      toast.error("No staged changes to analyze.");
      return;
    }

    setIsGenerating(true);
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const messages = [
      "feat: implement AI commit message generation and Source Control UI",
      "refactor: improve and stylize Source Control panel with interactive actions",
      "fix: correct layout issues and add collapsible groups to Git panel"
    ];
    const generated = messages[Math.floor(Math.random() * messages.length)];
    
    setCommitMessage(generated);
    setIsGenerating(false);
    setIsCommitHighlighted(true);
    setTimeout(() => setIsCommitHighlighted(false), 1000);
  };

  const handleCommit = () => {
    if (!commitMessage.trim() || stagedFiles.length === 0) return;
    
    toast.success("Changes committed successfully!");
    setStagedFiles([]);
    setCommitMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleCommit();
    }
  };

  const stageFile = (file: ChangedFile) => {
    setUnstagedFiles(prev => prev.filter(f => f.id !== file.id));
    setStagedFiles(prev => [...prev, file]);
  };

  const unstageFile = (file: ChangedFile) => {
    setStagedFiles(prev => prev.filter(f => f.id !== file.id));
    setUnstagedFiles(prev => [...prev, file]);
  };

  const getFileIcon = (ext: string) => {
    switch (ext) {
      case 'tsx':
      case 'ts':
      case 'js':
      case 'jsx': return <FileCode size={14} className="text-blue-400" />;
      case 'json': return <FileJson size={14} className="text-yellow-400" />;
      case 'png':
      case 'jpg': return <FileImage size={14} className="text-purple-400" />;
      default: return <FileText size={14} className="text-tokyo-muted" />;
    }
  };

  const statusColors = {
    M: 'text-yellow-500',
    A: 'text-green-500',
    D: 'text-red-500'
  };

  const FileItem = ({ file, isStaged }: { file: ChangedFile, isStaged: boolean }) => (
    <div className="group flex items-center justify-between px-4 py-1 hover:bg-tokyo-hover cursor-pointer transition-colors duration-150">
      <div className="flex items-center gap-2 min-w-0">
        {getFileIcon(file.extension)}
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-bold text-tokyo-fg truncate font-mono">{file.name}</span>
          <span className="text-[10px] text-tokyo-muted truncate font-mono -mt-0.5">{file.path}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isStaged ? (
            <button onClick={(e) => { e.stopPropagation(); unstageFile(file); }} className="p-0.5 hover:bg-white/10 rounded transition-colors" title="Unstage Changes">
              <Minus size={14} className="text-tokyo-muted hover:text-white" />
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); stageFile(file); }} className="p-0.5 hover:bg-white/10 rounded transition-colors" title="Stage Changes">
              <Plus size={14} className="text-tokyo-muted hover:text-white" />
            </button>
          )}
          <button className="p-0.5 hover:bg-white/10 rounded transition-colors" title="Discard Changes">
            <Undo2 size={14} className="text-tokyo-muted hover:text-red-400" />
          </button>
        </div>
        <span className={`text-[10px] font-bold w-3 text-center ${statusColors[file.status]}`}>
          {file.status}
        </span>
      </div>
    </div>
  );

  return (
    <div className="w-[300px] h-full bg-[#0f172a] flex flex-col border-r border-tokyo-border text-tokyo-fg select-none overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[45px] border-b border-tokyo-border shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-tokyo-muted" />
          <span className="text-[11px] font-bold tracking-wider text-white uppercase">Source Control</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-tokyo-muted hover:text-white hover:bg-white/5 rounded transition-all">
            <RotateCw size={14} />
          </button>
          <button className="p-1.5 text-tokyo-muted hover:text-white hover:bg-white/5 rounded transition-all">
            <Check size={14} />
          </button>
          <button className="p-1.5 text-tokyo-muted hover:text-white hover:bg-white/5 rounded transition-all">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* Commit Section */}
      <div className="p-3 space-y-2 border-b border-tokyo-border bg-[#10141f]">
        <div className="relative group">
          <textarea 
            ref={textareaRef}
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message (Ctrl+Enter to commit)"
            className={`
              w-full h-24 bg-[#0b0f1a] border border-tokyo-border rounded p-2 text-[12px] text-tokyo-fg 
              resize-none outline-none focus:border-tokyo-blue transition-all duration-300 font-mono
              ${isCommitHighligted ? 'ring-2 ring-tokyo-blue/50 bg-tokyo-blue/5' : ''}
            `}
          />
          <button 
            onClick={handleGenerateAICommit}
            disabled={isGenerating || stagedFiles.length === 0}
            className="absolute bottom-2 right-2 p-1.5 bg-tokyo-blue/10 hover:bg-tokyo-blue/20 text-tokyo-blue rounded border border-tokyo-blue/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Generate commit message with AI"
          >
            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          </button>
        </div>
        
        <button 
          onClick={handleCommit}
          disabled={!commitMessage.trim() || stagedFiles.length === 0}
          className="w-full bg-tokyo-blue hover:bg-tokyo-blue/90 disabled:bg-tokyo-blue/30 disabled:cursor-not-allowed text-white py-1.5 rounded text-[11px] font-bold tracking-tight transition-all shadow-lg shadow-tokyo-blue/10"
        >
          {stagedFiles.length > 0 ? `COMMIT` : 'COMMIT (NO STAGED CHANGES)'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Staged Changes */}
        <div className="py-0.5">
          <div 
            onClick={() => setIsStagedExpanded(!isStagedExpanded)}
            className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-1">
              {isStagedExpanded ? <ChevronDown size={14} className="text-tokyo-muted" /> : <ChevronRight size={14} className="text-tokyo-muted" />}
              <span className="text-[11px] font-bold text-tokyo-muted uppercase tracking-tight">Staged Changes</span>
            </div>
            {stagedFiles.length > 0 && (
              <span className="bg-tokyo-blue/20 text-tokyo-blue px-1.5 rounded-full text-[9px] font-bold mr-1">
                {stagedFiles.length}
              </span>
            )}
          </div>
          {isStagedExpanded && (
            <div className="mt-0.5">
              {stagedFiles.length > 0 ? (
                stagedFiles.map((file) => <FileItem key={file.id} file={file} isStaged={true} />)
              ) : (
                <div className="px-10 py-2 text-[11px] text-tokyo-muted italic">No staged changes</div>
              )}
            </div>
          )}
        </div>

        {/* Unstaged Changes */}
        <div className="py-0.5">
          <div 
            onClick={() => setIsUnstagedExpanded(!isUnstagedExpanded)}
            className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-1">
              {isUnstagedExpanded ? <ChevronDown size={14} className="text-tokyo-muted" /> : <ChevronRight size={14} className="text-tokyo-muted" />}
              <span className="text-[11px] font-bold text-tokyo-muted uppercase tracking-tight">Changes</span>
            </div>
            {unstagedFiles.length > 0 && (
              <span className="bg-white/10 text-tokyo-muted px-1.5 rounded-full text-[9px] font-bold mr-1">
                {unstagedFiles.length}
              </span>
            )}
          </div>
          {isUnstagedExpanded && (
            <div className="mt-0.5">
              {unstagedFiles.length > 0 ? (
                unstagedFiles.map((file) => <FileItem key={file.id} file={file} isStaged={false} />)
              ) : (
                <div className="px-10 py-2 text-[11px] text-tokyo-muted italic">No changes</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SourceControl;

