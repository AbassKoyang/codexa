"use client"

import { useState, useEffect } from "react"
import Editor from "@monaco-editor/react"
import { useFileTree } from "@/contexts/FileTreeContext"

const getLanguageFromExtension = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    default:
      return 'plaintext';
  }
};

export default function CodeEditor() {
  const { activeFile, updateNodeContent } = useFileTree();
  const [code, setCode] = useState("")

  // Update local code state when active file changes
  useEffect(() => {
    if (activeFile && activeFile.type === "file") {
      setCode(activeFile.content || "");
    } else {
      setCode("");
    }
  }, [activeFile?.id]); // Only reset local state when the actual active file ID changes

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || "";
    setCode(newContent);
    if (activeFile && activeFile.type === "file") {
      updateNodeContent(activeFile.id, newContent);
    }
  };

  if (!activeFile || activeFile.type !== "file") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-tokyo-fg/50 bg-[#1e1e1e]">
        <div className="text-4xl font-bold font-mono text-tokyo-blue/20 mb-4 select-none">CX</div>
        <p className="select-none">Open a file from the Explorer to start editing</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full text-tokyo-fg bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={getLanguageFromExtension(activeFile.name)}
        theme="vs-dark" 
        value={code}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Geist Mono', monospace",
          wordWrap: "on",
        }}
      />
    </div>
  )
}
