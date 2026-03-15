"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search as SearchIcon, ChevronRight, ChevronDown, Replace as ReplaceIcon, ChevronLast as ReplaceAllIcon, X } from 'lucide-react';
import { useFileTree, FileNode } from '@/contexts/FileTreeContext';

interface SearchResult {
  fileId: string;
  fileName: string;
  filePath: string;
  line: number;
  content: string;
  previewBefore: string;
  match: string;
  previewAfter: string;
}

interface FileResults {
  fileId: string;
  fileName: string;
  results: SearchResult[];
  isExpanded: boolean;
}

const Search = () => {
  const { fileTree, setActiveFileId, updateNodeContent, setSearchTarget } = useFileTree();
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [fileResults, setFileResults] = useState<FileResults[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = (query: string) => {
    if (!query) {
      setFileResults([]);
      return;
    }

    const results: FileResults[] = [];

    const searchInNode = (node: FileNode, path: string) => {
      if (node.type === 'file') {
        const content = node.content || '';
        const lines = content.split('\n');
        const matches: SearchResult[] = [];

        lines.forEach((lineText, index) => {
          let pos = 0;
          while ((pos = lineText.toLowerCase().indexOf(query.toLowerCase(), pos)) !== -1) {
            const start = Math.max(0, pos - 20);
            const end = Math.min(lineText.length, pos + query.length + 20);
            
            matches.push({
              fileId: node.id,
              fileName: node.name,
              filePath: `${path}${node.name}`,
              line: index + 1,
              content: lineText,
              previewBefore: lineText.substring(start, pos),
              match: lineText.substring(pos, pos + query.length),
              previewAfter: lineText.substring(pos + query.length, end)
            });
            pos += query.length;
          }
        });

        if (matches.length > 0) {
          results.push({
            fileId: node.id,
            fileName: node.name,
            results: matches,
            isExpanded: true
          });
        }
      } else if (node.type === 'folder') {
        node.children.forEach(child => searchInNode(child, `${path}${node.name}/`));
      }
    };

    fileTree.forEach(node => searchInNode(node, ''));
    setFileResults(results);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fileTree]);

  const toggleFileExpansion = (fileId: string) => {
    setFileResults(prev => prev.map(fr => 
      fr.fileId === fileId ? { ...fr, isExpanded: !fr.isExpanded } : fr
    ));
  };

  const handleResultClick = (fileId: string, line: number) => {
    setActiveFileId(fileId);
    setSearchTarget({ fileId, line });
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    
    fileResults.forEach(fr => {
      const fileNode = findFileById(fileTree, fr.fileId);
      if (fileNode && fileNode.type === 'file') {
        const escapedSearch = escapeRegExp(searchQuery);
        const newContent = fileNode.content.replace(new RegExp(escapedSearch, 'gi'), replaceQuery);
        updateNodeContent(fr.fileId, newContent);
      }
    });
  };

  const handleReplaceInFile = (fileId: string) => {
    const fileNode = findFileById(fileTree, fileId);
    if (fileNode && fileNode.type === 'file') {
      const escapedSearch = escapeRegExp(searchQuery);
      const newContent = fileNode.content.replace(new RegExp(escapedSearch, 'gi'), replaceQuery);
      updateNodeContent(fileId, newContent);
    }
  };

  const findFileById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.type === 'folder') {
        const found = findFileById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const totalMatches = useMemo(() => 
    fileResults.reduce((acc, fr) => acc + fr.results.length, 0), 
    [fileResults]
  );

  return (
    <div className="w-[300px] h-full bg-tokyo-panel flex flex-col border-r border-tokyo-border text-tokyo-fg overflow-hidden">
      <div className="flex items-center px-4 h-[35px] text-[11px] font-semibold tracking-wide text-tokyo-fg/60 uppercase shrink-0">
        Search
      </div>
      
      <div className="p-4 space-y-2 shrink-0">
        <div className="relative group">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search" 
            className="w-full bg-tokyo-bg border border-tokyo-border rounded px-2 py-1.5 pr-8 text-sm text-tokyo-fg focus:outline-none focus:border-tokyo-blue transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1.5 text-tokyo-muted hover:text-tokyo-fg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="relative group flex items-center gap-2">
          <input 
            type="text" 
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="Replace" 
            className="flex-1 bg-tokyo-bg border border-tokyo-border rounded px-2 py-1.5 text-sm text-tokyo-fg focus:outline-none focus:border-tokyo-blue transition-colors"
          />
          <button 
            onClick={handleReplaceAll}
            title="Replace All"
            disabled={!searchQuery}
            className={`p-1.5 rounded border border-tokyo-border hover:bg-tokyo-bg transition-colors ${!searchQuery ? 'opacity-50 cursor-not-allowed' : 'text-tokyo-blue'}`}
          >
            <ReplaceAllIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {searchQuery && (
        <div className="px-4 py-1 text-[11px] text-tokyo-muted border-b border-tokyo-border shrink-0">
          {totalMatches} results in {fileResults.length} files
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {fileResults.map(fr => (
          <div key={fr.fileId} className="select-none">
            <div 
              className="flex items-center px-2 py-1 hover:bg-tokyo-bg/50 cursor-pointer group"
              onClick={() => toggleFileExpansion(fr.fileId)}
            >
              <div className="mr-1 text-tokyo-muted group-hover:text-tokyo-fg">
                {fr.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
              <span className="text-sm truncate flex-1">{fr.fileName}</span>
              <span className="text-[10px] bg-tokyo-bg px-1.5 py-0.5 rounded-full text-tokyo-muted ml-2">
                {fr.results.length}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplaceInFile(fr.fileId);
                }}
                className="hidden group-hover:block ml-2 p-0.5 hover:text-tokyo-blue"
                title="Replace in this file"
              >
                <ReplaceIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {fr.isExpanded && (
              <div className="bg-tokyo-bg/20">
                {fr.results.map((result, idx) => (
                  <div 
                    key={`${fr.fileId}-${idx}`}
                    className="pl-8 pr-4 py-1.5 hover:bg-tokyo-blue/10 cursor-pointer border-l-2 border-transparent hover:border-tokyo-blue group"
                    onClick={() => handleResultClick(fr.fileId, result.line)}
                  >
                    <div className="text-[11px] text-tokyo-muted flex justify-between">
                      <span>Line {result.line}</span>
                    </div>
                    <div className="text-xs font-mono truncate whitespace-pre overflow-hidden">
                      <span className="text-tokyo-fg/70">{result.previewBefore}</span>
                      <span className="bg-tokyo-blue/30 text-tokyo-blue-hover font-bold px-0.5 rounded">
                        {result.match}
                      </span>
                      <span className="text-tokyo-fg/70">{result.previewAfter}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {searchQuery && fileResults.length === 0 && (
          <div className="p-8 text-center text-sm text-tokyo-muted">
            No results found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
