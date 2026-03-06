"use client"

import { useState, useEffect } from "react"
import Editor from "@monaco-editor/react"
import { useFileTree } from "@/contexts/FileTreeContext"

export default function CodeEditor() {
  const { activeFile } = useFileTree();
  const [code, setCode] = useState("")

  // Update local code state when active file changes
  useEffect(() => {
    if (activeFile && activeFile.type === "file") {
      setCode(activeFile.content || "");
    } else {
      setCode("");
    }
  }, [activeFile]);

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
        language="javascript"
        theme="vs-dark" 
        value={code}
        onChange={(value) => setCode(value || "")}
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
