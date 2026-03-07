import React from 'react'
import { X } from 'lucide-react'
import { getIconForFile } from 'vscode-icons-js';
import { FileNode, useFileTree } from '@/contexts/FileTreeContext';

const OpenFile = ({file, activeFileId}: {file: FileNode, activeFileId: string | null}) => {
  const icon = getIconForFile(file.name)
  const { removeFileFromOpenFiles, setActiveFileId } = useFileTree();
return (
<div onClick={() => setActiveFileId(file.id)} key={file.id} className={`flex items-center gap-1.5 px-1.5 py-0.5 hover:bg-tokyo-bg cursor-pointer text-tokyo-fg/80 hover:text-tokyo-fg group border border-r-0 last:border-r border-tokyo-border ${activeFileId === file.id ? 'bg-tokyo-bg text-white border-t-tokyo-blue' : 'hover:bg-tokyo-bg text-tokyo-fg/80 hover:text-tokyo-fg'}`}>
    <img
    src={`https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/${icon}`}
    width={16}
    />
    <span className="truncate text-xs">{file.name}</span>
    <button onClick={() => removeFileFromOpenFiles(file.id)} className={`${activeFileId === file.id ? 'opacity-100' : 'opacity-0'} items-center justify-center hover:bg-tokyo-hover hover:text-tokyo-blue transition-colors cursor-pointer p-0.5 rounded-md group-hover:opacity-100`}>
    <X strokeWidth={1} className={`size-3.5 ${activeFileId === file.id ? 'text-white' : 'text-tokyo-fg/80 hover:text-tokyo-fg'}`} />
    </button>
</div>
)
}

export default OpenFile