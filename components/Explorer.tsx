"use client";

import { ChevronRight, ChevronDown, Folder, FilePlus, FolderPlus, Edit2, Trash2, Loader2 } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { FileNode, useFileTree } from '@/contexts/FileTreeContext'
import { useLeftPanelContext } from '@/contexts/LayoutContext';
import { getIconForFile } from 'vscode-icons-js';
import { useSearchParams } from 'next/navigation';
import { useFetchProject } from '@/lib/queries';
import { useProjectSave } from '@/lib/useProjectSave';
import { toast } from 'sonner';

type CreatingNodeState = { type: 'file' | 'folder'; parentId: string | null } | null;

const FileTreeNode = ({ 
  node, 
  depth = 0,
  renamingId,
  setRenamingId,
  creatingNode,
  setCreatingNode
}: { 
  node: FileNode, 
  depth?: number,
  renamingId: string | null,
  setRenamingId: (id: string | null) => void,
  creatingNode: CreatingNodeState,
  setCreatingNode: (val: CreatingNodeState) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const { addNode, deleteNode, renameNode, activeFileId, setActiveFileId, addFileToOpenFiles } = useFileTree();
  const inputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);
  const [createValue, setCreateValue] = useState("");
  const icon = getIconForFile(node.name)
  const saveTree = useProjectSave();

  const paddingLeft = `${(depth * 12) + 16}px`;
  const childPaddingLeft = `${((depth + 1) * 12) + 16}px`;
  const isRenaming = renamingId === node.id;
  const isActive = activeFileId === node.id;

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    if (creatingNode?.parentId === node.id && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [creatingNode, node.id]);

  const handleCreateNew = (e: React.MouseEvent, type: 'file' | 'folder') => {
    e.stopPropagation();
    setIsOpen(true);
    setCreatingNode({ type, parentId: node.id });
    setCreateValue("");
  };

  const handleCreateSubmit = () => {
    if (createValue.trim() && creatingNode) {
      try {
        let newTree;
        if (creatingNode.type === 'file') {
          newTree = addNode({ type: "file", name: createValue.trim(), content: "" } as any, node.id);
        } else {
          newTree = addNode({ type: "folder", name: createValue.trim(), children: [] } as any, node.id);
        }
        if (newTree) saveTree(newTree);
      } catch (err: any) {
        toast.error(err.message, {
          style: {
            background: '#1a1b26',
            color: '#c0caf5',
            border: '1px solid #414868'
          }
        });
      }
    }
    setCreatingNode(null);
    setCreateValue("");
  };

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateSubmit();
    if (e.key === 'Escape') setCreatingNode(null);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete '${node.name}'?`)) {
      const newTree = deleteNode(node.id);
      if (newTree) saveTree(newTree);
    }
  };

  const handleRenameStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(node.id);
    setRenameValue(node.name);
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      try {
        const newTree = renameNode(node.id, renameValue.trim());
        if (newTree) saveTree(newTree);
      } catch (err: any) {
         toast.error(err.message, {
          style: {
            background: '#1a1b26',
            color: '#c0caf5',
            border: '1px solid #414868'
          }
        });
        setRenameValue(node.name);
      }
    }
    setRenamingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') setRenamingId(null);
  };

  const renderActions = () => (
    <div className="opacity-0 group-hover:opacity-100 flex items-center ml-auto shrink-0 transition-opacity">
      {node.type === 'folder' && (
        <>
          <button onClick={(e) => handleCreateNew(e, 'file')} className="p-1 hover:bg-white/10 rounded-md text-tokyo-fg/70 hover:text-tokyo-fg" title="New File" aria-label="New File">
            <FilePlus size={14} strokeWidth={2} />
          </button>
          <button onClick={(e) => handleCreateNew(e, 'folder')} className="p-1 hover:bg-white/10 rounded-md text-tokyo-fg/70 hover:text-tokyo-fg" title="New Folder" aria-label="New Folder">
            <FolderPlus size={14} strokeWidth={2} />
          </button>
        </>
      )}
      <button onClick={handleRenameStart} className="p-1 hover:bg-white/10 rounded-md text-tokyo-fg/70 hover:text-tokyo-fg" title="Rename" aria-label="Rename">
        <Edit2 size={13} strokeWidth={2} />
      </button>
      <button onClick={handleDelete} className="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-md ml-0.5" title="Delete" aria-label="Delete">
        <Trash2 size={13} strokeWidth={2} />
      </button>
    </div>
  );

  const renderContent = () => (
    <div className="flex items-center min-w-0 pr-2 pb-[1px] gap-1">
      {node.type === "file" ? (
        <img src={`https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/${icon}`} width={16} />
      ) : (
        <>
          <div className="mr-0.5 text-tokyo-fg/60 shrink-0 transition-transform duration-100">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          <Folder size={15} className="mr-1.5 text-tokyo-blue shrink-0" fill="currentColor" fillOpacity={0.2} />
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
          className="flex-1 min-w-0 bg-tokyo-bg/50 border border-tokyo-blue text-[13px] px-1 py-0 outline-none text-tokyo-fg rounded-sm"
        />
      ) : (
        <span className={`truncate text-[13px] mr-2 ${isActive ? 'text-tokyo-blue font-medium' : ''}`}>{node.name}</span>
      )}
    </div>
  );

  if (node.type === "file") {
    return (
      <div 
        className={`flex items-center py-0.5 cursor-pointer group w-full ${isActive ? 'bg-tokyo-hover/80 text-white' : 'hover:bg-tokyo-hover text-tokyo-fg/90'}`}
        style={{ paddingLeft }}
        onClick={() => {setActiveFileId(node.id); addFileToOpenFiles(node.id)}}
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
        className="flex items-center py-0.5 hover:bg-tokyo-hover cursor-pointer text-tokyo-fg/90 group w-full"
        style={{ paddingLeft }}
        onClick={() => !isRenaming && setIsOpen(!isOpen)}
      >
        <div className="flex items-center flex-1 min-w-0">
          {renderContent()}
        </div>
        {!isRenaming && renderActions()}
      </div>
      {isOpen && (
        <>
          {node.children.map((child) => (
            <FileTreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              renamingId={renamingId} 
              setRenamingId={setRenamingId} 
              creatingNode={creatingNode}
              setCreatingNode={setCreatingNode}
            />
          ))}
          {creatingNode?.parentId === node.id && (
            <div className="flex items-center py-0.5 w-full" style={{ paddingLeft: childPaddingLeft }}>
              <div className="flex items-center min-w-0 pr-2 gap-1.5 w-full">
                {creatingNode.type === 'folder' ? (
                   <Folder size={15} className="mr-0.5 text-tokyo-blue shrink-0 ml-4" fill="currentColor" fillOpacity={0.2} />
                ) : (
                  <FilePlus size={14} className="text-tokyo-fg/50 ml-4 mr-0.5" />
                )}
                <input 
                  ref={createInputRef}
                  value={createValue}
                  onChange={(e) => setCreateValue(e.target.value)}
                  onBlur={handleCreateSubmit}
                  onKeyDown={handleCreateKeyDown}
                  className="flex-1 min-w-0 w-full bg-tokyo-bg/50 border border-tokyo-blue text-[13px] px-1 py-0 outline-none text-tokyo-fg rounded-sm"
                  placeholder={`New ${creatingNode.type}...`}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const Explorer = () => {
  const { fileTree, addNode, setFileTree, setActiveFileId, setOpenFiles } = useFileTree();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [creatingNode, setCreatingNode] = useState<CreatingNodeState>(null);
  const [createValue, setCreateValue] = useState("");
  const createRootInputRef = useRef<HTMLInputElement>(null);

  const {isOpen} = useLeftPanelContext();
  const saveTree = useProjectSave();

  const searchParams = useSearchParams();
  const projectSlug = searchParams.get('project');
  
  const { data: project, isLoading, isError } = useFetchProject(projectSlug || undefined);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (project && project.file_tree && project.file_tree.root) {
      if (!isLoaded) {
          setOpenFiles([]);
          setActiveFileId(null);
          
          const children = project.file_tree.root.children;
          if (Array.isArray(children)) {
            setFileTree(children);
          } else {
            setFileTree([]);
          }
          setIsLoaded(true);
      }
    } else if (project && !project.file_tree) {
      if(!isLoaded) {
          setFileTree([]);
          setIsLoaded(true);
      }
    }
  }, [project, setFileTree, setActiveFileId, setOpenFiles, isLoaded]);

  useEffect(() => {
    if (creatingNode?.parentId === null && createRootInputRef.current) {
      createRootInputRef.current.focus();
    }
  }, [creatingNode]);

  const handleCreateNewRoot = (type: 'file' | 'folder') => {
    setCreatingNode({ type, parentId: null });
    setCreateValue("");
  };

  const handleCreateRootSubmit = () => {
    if (createValue.trim() && creatingNode) {
      try {
        let newTree;
        if (creatingNode.type === 'file') {
          newTree = addNode({ type: "file", name: createValue.trim(), content: "" } as any, undefined);
        } else {
          newTree = addNode({ type: "folder", name: createValue.trim(), children: [] } as any, undefined);
        }
        if (newTree) saveTree(newTree);
      } catch (err: any) {
        toast.error(err.message, {
          style: {
            background: '#1a1b26',
            color: '#c0caf5',
            border: '1px solid #414868'
          }
        });
      }
    }
    setCreatingNode(null);
    setCreateValue("");
  };

  const handleCreateRootKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateRootSubmit();
    if (e.key === 'Escape') setCreatingNode(null);
  };


  return (
    <div className={`${isOpen ? 'w-[250px]' : 'w-0'} h-full bg-tokyo-bg flex flex-col border-r border-tokyo-border text-tokyo-fg overflow-hidden select-none`}>
      <div className="flex flex-col h-full w-full">
        <div className="flex items-center justify-between px-4 h-[35px] text-[11px] font-semibold tracking-wide text-tokyo-fg uppercase shrink-0">
          <span>EXPLORER</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 overflow-x-hidden">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-full px-6 text-center text-tokyo-fg/60">
                <Loader2 className="w-6 h-6 animate-spin text-tokyo-blue" />
                <p className="text-xs mt-2">Loading workspace...</p>
             </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center text-red-400">
               <p className="text-sm">Failed to load project.</p>
            </div>
          ) : fileTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center text-tokyo-fg/60">
              <p className="text-sm mb-4">No files open</p>
              <button 
                onClick={() => handleCreateNewRoot('file')}
                className="w-full flex items-center justify-center py-1.5 mb-2 rounded border border-tokyo-border bg-tokyo-bg hover:bg-tokyo-hover text-[13px] transition-colors"
              >
                <FilePlus size={16} className="mr-2 opacity-70" />
                Create File
              </button>
              <button 
                onClick={() => handleCreateNewRoot('folder')}
                className="w-full flex items-center justify-center py-1.5 rounded border border-tokyo-border bg-tokyo-bg hover:bg-tokyo-hover text-[13px] transition-colors"
              >
                <FolderPlus size={16} className="mr-2 opacity-70" />
                Create Folder
              </button>
              
              {creatingNode?.parentId === null && (
                <div className="flex items-center mt-4 w-full">
                  <input 
                    ref={createRootInputRef}
                    value={createValue}
                    onChange={(e) => setCreateValue(e.target.value)}
                    onBlur={handleCreateRootSubmit}
                    onKeyDown={handleCreateRootKeyDown}
                    className="flex-1 w-full min-w-0 bg-tokyo-bg/50 border border-tokyo-blue text-[13px] px-2 py-1 outline-none text-tokyo-fg rounded-sm"
                    placeholder={`New ${creatingNode.type}...`}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col py-1">
              <div className="px-4 py-1 flex items-center justify-between group">
                <span className="text-[11px] font-bold text-tokyo-fg/80 uppercase tracking-wider">{project ? project.name.toUpperCase() : 'PROJECT'}</span>
                <div className="opacity-0 group-hover:opacity-100 flex space-x-0.5">
                  <button onClick={() => handleCreateNewRoot('file')} className="p-1 hover:bg-tokyo-hover rounded-md text-tokyo-fg/70 hover:text-tokyo-fg transition-colors" title="New File" aria-label="New File"><FilePlus size={14} strokeWidth={2.5}/></button>
                  <button onClick={() => handleCreateNewRoot('folder')} className="p-1 hover:bg-tokyo-hover rounded-md text-tokyo-fg/70 hover:text-tokyo-fg transition-colors" title="New Folder" aria-label="New Folder"><FolderPlus size={14} strokeWidth={2.5} /></button>
                </div>
              </div>
              
              <div className="mt-1">
                {fileTree.map((node) => (
                  <FileTreeNode 
                    key={node.id} 
                    node={node} 
                    renamingId={renamingId} 
                    setRenamingId={setRenamingId} 
                    creatingNode={creatingNode}
                    setCreatingNode={setCreatingNode}
                  />
                ))}
                
                {creatingNode?.parentId === null && (
                  <div className="flex items-center py-0.5 w-full pl-4 mt-1">
                    <div className="flex items-center min-w-0 pr-2 gap-1.5 w-full">
                      {creatingNode.type === 'folder' ? (
                         <Folder size={15} className="mr-0.5 text-tokyo-blue shrink-0" fill="currentColor" fillOpacity={0.2} />
                      ) : (
                        <FilePlus size={14} className="text-tokyo-fg/50 mr-0.5" />
                      )}
                      <input 
                        ref={createRootInputRef}
                        value={createValue}
                        onChange={(e) => setCreateValue(e.target.value)}
                        onBlur={handleCreateRootSubmit}
                        onKeyDown={handleCreateRootKeyDown}
                        className="flex-1 w-full min-w-0 bg-tokyo-bg border border-tokyo-blue text-[13px] px-1 py-0 outline-none text-tokyo-fg rounded-sm"
                        placeholder={`New ${creatingNode.type}...`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>  
  )
}

export default Explorer

