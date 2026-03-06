"use client";

import { ChevronRight, ChevronDown, FileText, Folder, FilePlus, FolderPlus, Edit2, Trash2, X } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { FileNode, useFileTree } from '@/contexts/FileTreeContext'
import { useLeftPanelContext } from '@/contexts/LayoutContext';
import { getIconForFile } from 'vscode-icons-js';

const FileTreeNode = ({ 
  node, 
  depth = 0,
  renamingId,
  setRenamingId
}: { 
  node: FileNode, 
  depth?: number,
  renamingId: string | null,
  setRenamingId: (id: string | null) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const { addNode, deleteNode, renameNode, activeFileId, setActiveFileId } = useFileTree();
  const inputRef = useRef<HTMLInputElement>(null);
  const icon = getIconForFile(node.name)

  
  const paddingLeft = `${(depth * 12) + 16}px`;
  const isRenaming = renamingId === node.id;
  const isActive = activeFileId === node.id;

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleCreateNew = (e: React.MouseEvent, type: 'file' | 'folder') => {
    e.stopPropagation();
    setIsOpen(true);
    const name = type === 'file' ? prompt("Enter new file name:") : prompt("Enter new folder name:");
    if (name) {
      if (type === 'file') {
        addNode({ type: "file", name, content: "" } as any, node.id);
      } else {
        addNode({ type: "folder", name, children: [] } as any, node.id);
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete '${node.name}'?`)) {
      deleteNode(node.id);
    }
  };

  const handleRenameStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(node.id);
    setRenameValue(node.name);
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      renameNode(node.id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') setRenamingId(null);
  };

  const renderActions = () => (
    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 ml-auto shrink-0 transition-opacity">
      {node.type === 'folder' && (
        <>
          <button onClick={(e) => handleCreateNew(e, 'file')} className="p-0.5 hover:bg-white/10 rounded" title="New File" aria-label="New File">
            <FilePlus size={12} />
          </button>
          <button onClick={(e) => handleCreateNew(e, 'folder')} className="p-0.5 hover:bg-white/10 rounded" title="New Folder" aria-label="New Folder">
            <FolderPlus size={12} />
          </button>
        </>
      )}
      <button onClick={handleRenameStart} className="p-0.5 hover:bg-white/10 rounded" title="Rename" aria-label="Rename">
        <Edit2 size={12} />
      </button>
      <button onClick={handleDelete} className="p-0.5 hover:bg-white/10 text-red-400 hover:text-red-300 rounded" title="Delete" aria-label="Delete">
        <Trash2 size={12} />
      </button>
    </div>
  );

  const renderContent = () => (
    <div className="flex items-center min-w-0 pr-2 pb-[1px]">
      {node.type === "file" ? (
        // <FileText size={15} className={`mr-1.5 shrink-0 ${isActive ? 'text-tokyo-blue' : 'text-tokyo-fg/60'}`} />
        <img
        src={`https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/${icon}`}
        width={16}
      />
      ) : (
        <>
          <div className="mr-0.5 text-tokyo-fg/60 shrink-0">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          <Folder size={15} className="mr-1.5 text-blue-400 shrink-0" />
        </>
      )}
      
      {isRenaming ? (
        <input 
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 bg-black/30 border border-tokyo-border text-sm px-1 py-0 outline-none text-tokyo-fg"
        />
      ) : (
        <span className={`truncate text-sm mr-2 ${isActive ? 'text-tokyo-blue font-medium' : ''}`}>{node.name}</span>
      )}
    </div>
  );

  if (node.type === "file") {
    return (
      <div 
        className={`flex items-center py-1 cursor-pointer group w-full ${isActive ? 'bg-[#37373d]/50 text-white' : 'hover:bg-white/5 text-tokyo-fg/80 hover:text-tokyo-fg'}`}
        style={{ paddingLeft }}
        onClick={() => setActiveFileId(node.id)}
      >
        <div className="flex items-center flex-1 min-w-0">
          {renderContent()}
        </div>
        {!isRenaming && renderActions()}
      </div>
    );
  }

  return (
    <div>
      <div 
        className="flex items-center py-1 hover:bg-white/5 cursor-pointer text-tokyo-fg/80 hover:text-tokyo-fg group w-full"
        style={{ paddingLeft }}
        onClick={() => !isRenaming && setIsOpen(!isOpen)}
      >
        <div className="flex items-center flex-1 min-w-0">
          {renderContent()}
        </div>
        {!isRenaming && renderActions()}
      </div>
      {isOpen && node.children.map((child) => (
        <FileTreeNode 
          key={child.id} 
          node={child} 
          depth={depth + 1} 
          renamingId={renamingId} 
          setRenamingId={setRenamingId} 
        />
      ))}
    </div>
  );
}

const Explorer = () => {
  const { fileTree, addNode } = useFileTree();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const {isOpen, setIsOpen} = useLeftPanelContext()


  const handleCreateFile = () => {
    const fileName = prompt("Enter file name:");
    if (fileName) {
      addNode({ type: "file", name: fileName, content: "" } as any);
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      addNode({ type: "folder", name: folderName, children: [] } as any);
    }
  };

  return (
    <div className={`${isOpen ? 'w-[250px]' : 'w-0'} h-full bg-tokyo-panel flex flex-col border-r border-tokyo-border text-tokyo-fg overflow-hidden select-none `}>
      <div className="flex flex-col h-full w-full">
        <div className="flex items-center justify-between px-4 h-[35px] text-[11px] font-semibold tracking-wide text-tokyo-fg uppercase shrink-0">
          <span>EXPLORER</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 overflow-x-hidden">
          {fileTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center text-tokyo-fg/60">
              <p className="text-sm mb-4">No files open</p>
              <button 
                onClick={handleCreateFile}
                className="w-full flex items-center justify-center py-1.5 mb-2 rounded bg-white/5 hover:bg-white/10 text-sm transition-colors border border-tokyo-border"
              >
                <FilePlus size={16} className="mr-2" />
                Create File
              </button>
              <button 
                onClick={handleCreateFolder}
                className="w-full flex items-center justify-center py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm transition-colors border border-tokyo-border"
              >
                <FolderPlus size={16} className="mr-2" />
                Create Folder
              </button>
            </div>
          ) : (
            <div className="flex flex-col py-1">
              <div className="px-4 py-1 flex items-center justify-between group">
                <span className="text-xs font-bold text-tokyo-fg/80 uppercase tracking-wider">PROJECT</span>
                <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                  <button onClick={handleCreateFile} className="p-0.5 hover:bg-white/10 rounded" title="New File" aria-label="New File"><FilePlus size={14} /></button>
                  <button onClick={handleCreateFolder} className="p-0.5 hover:bg-white/10 rounded" title="New Folder" aria-label="New Folder"><FolderPlus size={14} /></button>
                </div>
              </div>
              <div className="mt-1">
                {fileTree.map((node) => (
                  <FileTreeNode 
                    key={node.id} 
                    node={node} 
                    renamingId={renamingId} 
                    setRenamingId={setRenamingId} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>  
  )
}

export default Explorer