'use client';
import React from 'react'
import { useFileTree } from '@/contexts/FileTreeContext'
import OpenFile from './OpenFile';
const OpenFiles = () => {
  const { openFiles, activeFileId } = useFileTree();
  return (
    <div className="w-full flex items-center bg-tokyo-panel mb-1">
      {openFiles.map((file) => <OpenFile key={file.id} file={file} activeFileId={activeFileId} />)}
    </div>
  )
}

export default OpenFiles