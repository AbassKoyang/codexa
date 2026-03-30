"use client";

import { useEffect } from 'react';
import { useLeftPanelContext, useRightPanelContext, useBottomPanelContext } from '@/contexts/LayoutContext';
import { useFileTree } from '@/contexts/FileTreeContext';

export default function KeybindingsListener() {
  const { setIsOpen: setIsLeftOpen } = useLeftPanelContext();
  const { setIsOpen: setIsRightOpen } = useRightPanelContext();
  const { setIsOpen: setIsBottomOpen } = useBottomPanelContext();
  const { openFiles, activeFileId, setActiveFileId, removeFileFromOpenFiles } = useFileTree();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (!isCmdOrCtrl) return;

      const key = e.key.toLowerCase();

      if (key === 'tab') {
        e.preventDefault();
        if (openFiles.length <= 1) return;
        
        const currentIndex = openFiles.findIndex(f => f.id === activeFileId);
        if (currentIndex === -1) {
          setActiveFileId(openFiles[0].id);
          return;
        }

        if (e.shiftKey) {
          const prevIndex = currentIndex === 0 ? openFiles.length - 1 : currentIndex - 1;
          setActiveFileId(openFiles[prevIndex].id);
        } else {
          const nextIndex = (currentIndex + 1) % openFiles.length;
          setActiveFileId(openFiles[nextIndex].id);
        }
        return;
      }

      switch (key) {
        case 's':
        case 'p':
          e.preventDefault();
          break;
        case 'b':
          e.preventDefault();
          setIsLeftOpen(prev => !prev);
          break;
        case 'j':
          e.preventDefault();
          setIsBottomOpen(prev => !prev);
          break;
        case '\\':
        case 'd':
          e.preventDefault();
          setIsRightOpen(prev => !prev);
          break;
        case 'w':
          e.preventDefault();
          if (activeFileId) {
            const currentIndex = openFiles.findIndex(f => f.id === activeFileId);
            if (openFiles.length > 1) {
              const nextIndex = currentIndex === openFiles.length - 1 ? currentIndex - 1 : currentIndex + 1;
              setActiveFileId(openFiles[nextIndex].id);
            } else {
              setActiveFileId(null);
            }
            removeFileFromOpenFiles(activeFileId);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsLeftOpen, setIsRightOpen, setIsBottomOpen, openFiles, activeFileId, setActiveFileId, removeFileFromOpenFiles]);

  return null;
}
