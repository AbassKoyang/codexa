'use client';
import React from 'react'
import { useFileTree } from '@/contexts/FileTreeContext'
import OpenFile from './OpenFile';
const OpenFiles = () => {
  const { openFiles, activeFileId } = useFileTree();
  return (
    <div className="w-full overflow-x-auto flex items-center bg-tokyo-panel scrollbar-hide">
      {openFiles.map((file) => <OpenFile key={file.id} file={file} activeFileId={activeFileId} />)}
    </div>
  )
}

export default OpenFiles