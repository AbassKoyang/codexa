"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";

export type FileNode =
  | {
      id: string;
      type: "file";
      name: string;
      content: string;
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
  setActiveFileId: (id: string | null) => void;
  addNode: (node: FileNodeInput, parentId?: string) => void;
  deleteNode: (id: string) => void;
  renameNode: (id: string, newName: string) => void;
  updateNodeContent: (id: string, content: string) => void;
}

const FileTreeContext = createContext<FileTreeContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 9);

export function FileTreeProvider({ children }: { children: ReactNode }) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);

  const activeFile = useMemo(() => {
    if (!activeFileId) return null;
    
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
    
    return findNode(fileTree, activeFileId);
  }, [fileTree, activeFileId]);

  const checkDuplicateName = (siblings: FileNode[], name: string, type: "file" | "folder") => {
    return siblings.some(node => node.name === name && node.type === type);
  };

  const addNode = (nodeData: FileNodeInput, parentId?: string) => {
    const newNode = { ...nodeData, id: generateId() } as FileNode;

    if (!parentId) {
      if (checkDuplicateName(fileTree, newNode.name, newNode.type)) {
        alert(`A ${newNode.type} named '${newNode.name}' already exists in this location.`);
        return;
      }

      setFileTree((prev) => {
        const newTree = [...prev, newNode];
        return newTree.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'folder' ? -1 : 1;
        });
      });
      if (newNode.type === "file") {
        setOpenFiles((prev) => [...prev, newNode]);
        console.log("Truuuu")
        setActiveFileId(newNode.id);
      };
      return;
    }

    setFileTree((prev) => {
      let duplicateFound = false;

      const addRecursively = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((node) => {
          if (node.id === parentId && node.type === "folder") {
            if (checkDuplicateName(node.children, newNode.name, newNode.type)) {
              duplicateFound = true;
              return node; // Return unchanged if duplicate
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
      
      const newTree = addRecursively(prev);

      if (duplicateFound) {
        alert(`A ${newNode.type} named '${newNode.name}' already exists in this location.`);
        return prev;
      }

      if (newNode.type === "file") {
        setActiveFileId(newNode.id);
        setOpenFiles((prev) => [...prev.filter((node) => node.id !== newNode.id), newNode]);
      }
      return newTree;
    });
  };

  const deleteNode = (id: string) => {
    setFileTree((prev) => {
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
      return deleteRecursively(prev);
    });
    
    if (activeFileId === id) {
      setActiveFileId(null);
    }
  };

  const renameNode = (id: string, newName: string) => {
    setFileTree((prev) => {
      let duplicateFound = false;

      const renameRecursively = (nodes: FileNode[]): FileNode[] => {
        // First check if renaming would cause a collision in this array
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
        
        // Only re-sort if we're in the array that had the change (or if child arrays changed, they sort themselves)
        if (nodes.some(n => n.id === id)) {
            return updatedNodes.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
            });
        }
        return updatedNodes;
      };
      
      const newTree = renameRecursively(prev);

      if (duplicateFound) {
          alert(`A file or folder named '${newName}' already exists in this location.`);
          return prev;
      }

      return newTree;
    });
    setOpenFiles((prev) => [...prev.filter((node) => node.id !== id), {...fileTree.find((node) => node.id === id)!, name: newName}]);
  };

  const updateNodeContent = (id: string, content: string) => {
    setFileTree((prev) => {
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
      return updateRecursively(prev);
    });
  };

  const removeFileFromOpenFiles = (id: string) => {
    setOpenFiles((prev) => prev.filter((node) => node.id !== id));
  };

  const addFileToOpenFiles = (id: string) => {
    if (openFiles.find((node) => node.id === id)) return;
    const file = fileTree.find((node) => node.id === id);
    if (!file) return;
    setOpenFiles((prev) => [...prev, file]);
  };

  return (
    <FileTreeContext.Provider value={{ 
      fileTree, 
      activeFileId, 
      activeFile, 
      openFiles,
      setOpenFiles,
      setActiveFileId, 
      addNode, 
      deleteNode, 
      renameNode,
      updateNodeContent,
      removeFileFromOpenFiles,
      addFileToOpenFiles
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
