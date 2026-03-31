"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";

export type FileNode =
  | {
      id: string;
      type: "file";
      name: string;
      content: string;
      pendingContent?: string;
    }
  | {
      id: string;
      type: "folder";
      name: string;
      children: FileNode[];
    };

// Helper for unions so that Omit preserves the discriminated structure
type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type FileNodeInput = DistributiveOmit<FileNode, 'id'>;

interface FileTreeContextType {
  fileTree: FileNode[];
  activeFileId: string | null;
  activeFile: FileNode | null;
  openFiles: FileNode[];
  removeFileFromOpenFiles: (id: string) => void;
  addFileToOpenFiles: (id: string) => void;
  setOpenFiles: (files: FileNode[]) => void;
  setFileTree: (files: FileNode[]) => void;
  setActiveFileId: (id: string | null) => void;
  saveStatus: 'saving' | 'saved' | 'error' | null;
  setSaveStatus: (status: 'saving' | 'saved' | 'error' | null) => void;
  addNode: (node: FileNodeInput, parentId?: string) => FileNode[] | undefined;
  deleteNode: (id: string) => FileNode[];
  renameNode: (id: string, newName: string) => FileNode[] | undefined;
  updateNodeContent: (id: string, content: string) => FileNode[];
  setPendingContent: (id: string, content: string) => FileNode[];
  acceptChanges: (id: string) => FileNode[];
  rejectChanges: (id: string) => FileNode[];
  searchTarget: { fileId: string; line: number } | null;
  setSearchTarget: (target: { fileId: string; line: number } | null) => void;
  isLoaded: boolean;
  setIsLoaded: (val: boolean) => void;
}

const FileTreeContext = createContext<FileTreeContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 9);

export function FileTreeProvider({ children }: { children: ReactNode }) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const [searchTarget, setSearchTarget] = useState<{ fileId: string; line: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const findNode = (nodes: FileNode[], targetId: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.type === "folder") {
        const found = findNode(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const activeFile = useMemo(() => {
    if (!activeFileId) return null;
    return findNode(fileTree, activeFileId);
  }, [fileTree, activeFileId]);


  const checkDuplicateName = (siblings: FileNode[], name: string, type: "file" | "folder") => {
    return siblings.some(node => node.name === name && node.type === type);
  };

  const addNode = (nodeData: FileNodeInput, parentId?: string): FileNode[] | undefined => {
    const newNode = { ...nodeData, id: generateId() } as FileNode;

    if (!parentId) {
      if (checkDuplicateName(fileTree, newNode.name, newNode.type)) {
        throw new Error(`A ${newNode.type} named '${newNode.name}' already exists in this location.`);
      }


      const newTree = [...fileTree, newNode].sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
      });
      setFileTree(newTree);
      if (newNode.type === "file") {
        setOpenFiles((prev) => [...prev, newNode]);
        setActiveFileId(newNode.id);
      }
      return newTree;
    }

    let duplicateFound = false;

    const addRecursively = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === parentId && node.type === "folder") {
          if (checkDuplicateName(node.children, newNode.name, newNode.type)) {
            duplicateFound = true;
            return node; 
          }
          
          const newChildren = [...node.children, newNode].sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
          });
          return { ...node, children: newChildren };
        }
        if (node.type === "folder") {
          return { ...node, children: addRecursively(node.children) };
        }
        return node;
      });
    };
    
    const newTree = addRecursively(fileTree);

    if (duplicateFound) {
      throw new Error(`A ${newNode.type} named '${newNode.name}' already exists in this location.`);
    }


    setFileTree(newTree);

    if (newNode.type === "file") {
      setActiveFileId(newNode.id);
      setOpenFiles((prev) => [...prev.filter((node) => node.id !== newNode.id), newNode]);
    }
    return newTree;
  };

  const deleteNode = (id: string): FileNode[] => {
    const deleteRecursively = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .filter((node) => node.id !== id)
        .map((node) => {
          if (node.type === "folder") {
            return { ...node, children: deleteRecursively(node.children) };
          }
          return node;
        });
    };
    
    const newTree = deleteRecursively(fileTree);
    setFileTree(newTree);
    
    setOpenFiles((prev) => prev.filter((file) => findNode(newTree, file.id) !== null));

    if (activeFileId && findNode(newTree, activeFileId) === null) {
      setActiveFileId(null);
    }

    return newTree;
  };


  const renameNode = (id: string, newName: string): FileNode[] | undefined => {
    let duplicateFound = false;

    const renameRecursively = (nodes: FileNode[]): FileNode[] => {
      const nodeToRename = nodes.find(n => n.id === id);
      if (nodeToRename) {
          if (checkDuplicateName(nodes, newName, nodeToRename.type)) {
              duplicateFound = true;
              return nodes;
          }
      }

      const updatedNodes = nodes.map((node) => {
        if (node.id === id) {
          return { ...node, name: newName };
        }
        if (node.type === "folder") {
          return { ...node, children: renameRecursively(node.children) };
        }
        return node;
      });
      
      if (nodes.some(n => n.id === id)) {
          return updatedNodes.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'folder' ? -1 : 1;
          });
      }
      return updatedNodes;
    };
    
    const newTree = renameRecursively(fileTree);

    if (duplicateFound) {
        throw new Error(`A file or folder named '${newName}' already exists in this location.`);
    }


    setFileTree(newTree);
    setOpenFiles((prev) => [...prev.filter((node) => node.id !== id), {...fileTree.find((node) => node.id === id)!, name: newName}]);
    return newTree;
  };

  const updateNodeContent = (id: string, content: string): FileNode[] => {
    const updateRecursively = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id && node.type === "file") {
          return { ...node, content };
        }
        if (node.type === "folder") {
          return { ...node, children: updateRecursively(node.children) };
        }
        return node;
      });
    };
    const newTree = updateRecursively(fileTree);
    setFileTree(newTree);
    return newTree;
  };

  const setPendingContent = (id: string, content: string): FileNode[] => {
    const updateRecursively = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id && node.type === "file") {
          return { ...node, pendingContent: content };
        }
        if (node.type === "folder") {
          return { ...node, children: updateRecursively(node.children) };
        }
        return node;
      });
    };
    const newTree = updateRecursively(fileTree);
    setFileTree(newTree);
    return newTree;
  };

  const acceptChanges = (id: string): FileNode[] => {
    const updateRecursively = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id && node.type === "file") {
          return { ...node, content: node.pendingContent || node.content, pendingContent: undefined };
        }
        if (node.type === "folder") {
          return { ...node, children: updateRecursively(node.children) };
        }
        return node;
      });
    };
    const newTree = updateRecursively(fileTree);
    setFileTree(newTree);
    return newTree;
  };

  const rejectChanges = (id: string): FileNode[] => {
    const updateRecursively = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id && node.type === "file") {
          return { ...node, pendingContent: undefined };
        }
        if (node.type === "folder") {
          return { ...node, children: updateRecursively(node.children) };
        }
        return node;
      });
    };
    const newTree = updateRecursively(fileTree);
    setFileTree(newTree);
    return newTree;
  };


  const removeFileFromOpenFiles = (id: string) => {
    setOpenFiles((prev) => {
      const fileIndex = prev.findIndex((file) => file.id === id);
      const newOpenFiles = prev.filter((node) => node.id !== id);

      if (activeFileId === id) {
        if (newOpenFiles.length > 0) {
          // If there are still open files, pick the one next to the closed one
          const nextIndex = Math.min(fileIndex, newOpenFiles.length - 1);
          setActiveFileId(newOpenFiles[nextIndex].id);
        } else {
          setActiveFileId(null);
        }
      }

      return newOpenFiles;
    });
  };

  const addFileToOpenFiles = (id: string) => {
    if (openFiles.find((node) => node.id === id)) return;
    const file = findNode(fileTree, id);
    if (!file) return;
    setOpenFiles((prev) => [...prev, file]);
  };


  return (
    <FileTreeContext.Provider value={{ 
      fileTree, 
      activeFileId, 
      activeFile, 
      openFiles,
      saveStatus,
      setSaveStatus,
      setOpenFiles,
      setFileTree,
      setActiveFileId, 
      addNode, 
      deleteNode, 
      renameNode,
      updateNodeContent,
      setPendingContent,
      acceptChanges,
      rejectChanges,
      removeFileFromOpenFiles,
      addFileToOpenFiles,
      searchTarget,
      setSearchTarget,
      isLoaded,
      setIsLoaded
    }}>
      {children}
    </FileTreeContext.Provider>
  );
}

export function useFileTree() {
  const context = useContext(FileTreeContext);
  if (context === undefined) {
    throw new Error("useFileTree must be used within a FileTreeProvider");
  }
  return context;
}
