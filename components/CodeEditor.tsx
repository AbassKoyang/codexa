"use client"

import { useState, useEffect, useRef } from "react"
import Editor, { DiffEditor, useMonaco } from "@monaco-editor/react"
import { Check, X, Sparkles } from "lucide-react"
import { useFileTree } from "@/contexts/FileTreeContext"
import OpenFiles from "./OpenFiles"
import { useProjectSave } from "@/lib/useProjectSave"
import { useSettings } from "@/contexts/SettingsContext"
import { getThemeData } from "@/lib/themes"
import { api } from "@/lib/api"

const getLanguageFromExtension = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "js":
    case "jsx":
      return "javascript"
    case "ts":
    case "tsx":
      return "typescript"
    case "html":
      return "html"
    case "css":
      return "css"
    case "json":
      return "json"
    case "md":
      return "markdown"
    case "py":
      return "python"
    default:
      return "plaintext"
  }
}

export default function CodeEditor() {
  const { activeFile, updateNodeContent, acceptChanges, rejectChanges, searchTarget, setSearchTarget } = useFileTree()
  const [code, setCode] = useState("")
  const [suggestion, setSuggestion] = useState("")

  const saveTree = useProjectSave()
  const { editorTheme } = useSettings()
  const monaco = useMonaco()

  const editorRef = useRef<any>(null)
  const providerRef = useRef<any>(null)

  function cleanAIResponse(text: string) {
  return text
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```/g, "")
    .trim()
}

 function handleEditorDidMount(editor: any, monacoInstance: any) {
  editorRef.current = editor

  editor.addCommand(
  monaco?.KeyCode.Tab,
  () => {
    setSuggestion("")
  },
  "inlineSuggestionVisible"
)

  editor.onDidType((text: string) => {
    console.log("typing detected")
    const model = editor.getModel()
    const position = editor.getPosition()

    if (!model || !position) return

    const context = model.getValueInRange({
  startLineNumber: Math.max(1, position.lineNumber - 20),
  startColumn: 1,
  endLineNumber: position.lineNumber,
  endColumn: position.column
})

    const prompt = `
You are an AI code autocomplete engine.

Continue the code EXACTLY from the cursor.
Do not repeat any existing code.
Return only NEW lines that follow the cursor.

Rules:
- Return ONLY the continuation
- Do NOT repeat existing code
- Do NOT include explanations
- Do NOT include markdown
- Do NOT include language labels
- Return plain code only

Code before cursor:

${context}

Continuation:
`

    if ([" ", ".", "(", "{", "\n"].includes(text)){
      debouncedGenerateSuggestion({
        prompt
      })
    }
  })
}
  const debounce = (func: any, wait: number) => {
    let timeout: any

    return (...args: any[]) => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        func(...args)
      }, wait)
    }
  }

  // -----------------------------
  // AI Request
  // -----------------------------
  const generateSuggestion = async (data: any) => {
    try {
      const response = await api.post("/api/ai/autocomplete/", data)

      const aiCode = cleanAIResponse(response.data.response) || cleanAIResponse(response.data)

      setSuggestion(aiCode)

      editorRef.current?.trigger(
        "keyboard",
        "editor.action.inlineSuggest.trigger",
        {}
      )

      console.log("AI Suggestion:", aiCode)
    } catch (error) {
      console.error("error getting ai response", error)
    }
  }

  const debouncedGenerateSuggestion = useRef(
    debounce(generateSuggestion, 10000)
  ).current

  // -----------------------------
  // Inline suggestion provider
  // -----------------------------
  useEffect(() => {
    if (!monaco || !activeFile) return

    if (providerRef.current) {
      providerRef.current.dispose()
    }

    const language = getLanguageFromExtension(activeFile.name)

    providerRef.current =
      monaco.languages.registerInlineCompletionsProvider(language, {
        provideInlineCompletions: (model, position) => {
          if (!suggestion) return { items: [] }

          const word = model.getWordUntilPosition(position)

          const range = new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          )

          return {
            items: [
              {
                insertText: suggestion,
                range
              }
            ]
          }
        },

        disposeInlineCompletions: () => {}
      })

    return () => {
      providerRef.current?.dispose()
    }
  }, [monaco, suggestion, activeFile])


       


  // -----------------------------
  // Theme Loader
  // -----------------------------
  useEffect(() => {
    if (!monaco) return

    if (editorTheme === "vs-dark") {
      monaco.editor.setTheme("vs-dark")
      return
    }

    const loadTheme = async () => {
      try {
        const themeData = await getThemeData(editorTheme)

        if (themeData) {
          monaco.editor.defineTheme(editorTheme, themeData)
          monaco.editor.setTheme(editorTheme)
        } else {
          monaco.editor.setTheme("vs-dark")
        }
      } catch (err) {
        console.error("Error setting theme", err)
        monaco.editor.setTheme("vs-dark")
      }
    }

    loadTheme()
  }, [monaco, editorTheme])

  // -----------------------------
  // File switching
  // -----------------------------
  useEffect(() => {
    if (activeFile && activeFile.type === "file") {
      setCode(activeFile.content || "")
    } else {
      setCode("")
    }
  }, [activeFile?.id, activeFile?.type === "file" ? activeFile?.content : null])

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || ""

    setCode(newContent)

    if (activeFile && activeFile.type === "file") {
      const newTree = updateNodeContent(activeFile.id, newContent)
      saveTree(newTree as any)
    }
  }

  const handleAcceptChanges = () => {
    if (activeFile) {
        const newTree = acceptChanges(activeFile.id);
        saveTree(newTree as any);
    }
  };

  const handleRejectChanges = () => {
    if (activeFile) {
        rejectChanges(activeFile.id);
    }
  };

  const handleDiffEditorDidMount = (editor: any) => {
    const modifiedEditor = editor.getModifiedEditor();
    
    setTimeout(() => {
      modifiedEditor.getAction('editor.action.formatDocument')?.run();
    }, 200);
  };

  // -----------------------------
  // Search navigation jump
  // -----------------------------
  useEffect(() => {
    if (editorRef.current && searchTarget && activeFile?.id === searchTarget.fileId) {
      const editor = editorRef.current;
      editor.revealLineInCenter(searchTarget.line);
      editor.setPosition({ lineNumber: searchTarget.line, column: 1 });
      editor.focus();
      
      setSearchTarget(null);
    }
  }, [searchTarget, activeFile?.id, monaco]);

  // -----------------------------
  // Empty state
  // -----------------------------
  if (!activeFile || activeFile.type !== "file") {
    return (
      <div className="w-full h-full pl-14 lg:pl-0 text-tokyo-fg bg-tokyo-bg flex flex-col">
        <OpenFiles />

        <div className="flex-1 flex items-center justify-center text-tokyo-fg/50 bg-tokyo-bg">
          <div className="text-center flex items-center justify-center flex-col">
            <div className="flex items-center justify-center p-0.5 lg:p-2 border border-tokyo-blue border-dashed relative w-fit mb-4">
              <svg className='size-6 lg:size-8' width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 24C2.175 24 1.46875 23.7062 0.88125 23.1187C0.29375 22.5312 0 21.825 0 21V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H27C27.825 0 28.5312 0.29375 29.1187 0.88125C29.7062 1.46875 30 2.175 30 3V21C30 21.825 29.7062 22.5312 29.1187 23.1187C28.5312 23.7062 27.825 24 27 24H3ZM3 21H27V6H3V21ZM8.25 19.5L6.15 17.4L10.0125 13.5L6.1125 9.6L8.25 7.5L14.25 13.5L8.25 19.5ZM15 19.5V16.5H24V19.5H15Z" fill="#3C83F6" />
              </svg>
            </div>
            <p className="text-xs lg:text-base max-w-[200px] lg:max-w-fit">Open a file from the Explorer to start editing</p>
          </div>
        </div>
      </div>
    )
  }

  // -----------------------------
  // Editor / Diff View
  // -----------------------------
  if (activeFile.pendingContent) {
    return (
      <div className="w-full h-full pl-14 lg:pl-0 text-tokyo-fg bg-tokyo-bg flex flex-col overflow-hidden relative">
        <OpenFiles />

        <div className="flex items-center justify-center px-6 py-2 bg1-tokyo-blue/5 border-b border-tokyo-border animate-in fade-in slide-in-from-top-2 duration-300 shrink-0 absolute bottom-0 left-1/2 -translate-x-1/2 z-10000">
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRejectChanges}
              className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-tokyo-muted hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-transparent transition-all cursor-pointer"
            >
              <X size={14} />
              REJECT
            </button>
            <button 
              onClick={handleAcceptChanges}
              className="flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold bg-tokyo-blue text-white hover:bg-tokyo-blue/80 shadow-lg shadow-tokyo-blue/20 transition-all cursor-pointer"
            >
              <Check size={14} />
              ACCEPT
            </button>
          </div>
        </div>

        <div className="flex-1">
          <DiffEditor
            height="100%"
            onMount={handleDiffEditorDidMount}
            language={getLanguageFromExtension(activeFile.name)}
            theme={editorTheme}
            original={activeFile.content}
            modified={activeFile.pendingContent}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Geist Mono', monospace",
              wordWrap: "on",
              scrollBeyondLastLine: false,
              renderSideBySide: true,
              readOnly: true,
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pl-14 lg:pl-0 text-tokyo-fg bg-tokyo-bg flex flex-col">
      <OpenFiles />

      <Editor
        height="calc(100vh - 40px)"
        onMount={handleEditorDidMount}
        language={getLanguageFromExtension(activeFile.name)}
        theme={editorTheme}
        value={code}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Geist Mono', monospace",
          wordWrap: "on",
          inlineSuggest: { enabled: true }
        }}
      />
    </div>
  )
}