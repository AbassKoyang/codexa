"use client"

import { useState, useEffect, useRef } from "react"
import Editor, { useMonaco } from "@monaco-editor/react"
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
  const { activeFile, updateNodeContent } = useFileTree()
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

  editor.onDidChangeModelContent(() => {
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

    debouncedGenerateSuggestion({
      prompt
    })
  })
}

  // -----------------------------
  // Proper debounce
  // -----------------------------
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
      const response = await api.post("/api/ai/", data)

      const aiCode = cleanAIResponse(response.data.response) || cleanAIResponse(response.data)

      setSuggestion(aiCode)

      // force inline suggestion refresh
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
  }, [activeFile?.id])

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || ""

    setCode(newContent)

    if (activeFile && activeFile.type === "file") {
      const newTree = updateNodeContent(activeFile.id, newContent)
      saveTree(newTree as any)
    }
  }

  // -----------------------------
  // Empty state
  // -----------------------------
  if (!activeFile || activeFile.type !== "file") {
    return (
      <div className="w-full h-full text-tokyo-fg bg-tokyo-bg flex flex-col">
        <OpenFiles />

        <div className="flex-1 flex items-center justify-center text-tokyo-fg/50 bg-[#1e1e1e]">
          <div className="text-center">
            <div className="text-4xl font-bold font-mono text-tokyo-blue/20 mb-4">
              CX
            </div>
            <p>Open a file from the Explorer to start editing</p>
          </div>
        </div>
      </div>
    )
  }

  // -----------------------------
  // Editor
  // -----------------------------
  return (
    <div className="w-full h-full text-tokyo-fg bg-tokyo-bg flex flex-col">
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