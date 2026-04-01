"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { FileNode, useFileTree } from './FileTreeContext';

type TerminalLine = {
  type: 'stdout' | 'stderr' | 'system' | 'input-prompt' | 'input-value';
  content: string;
};

type PyodideContextType = {
  runCode: (code: string, fileName: string) => Promise<void>;
  terminalOutput: TerminalLine[];
  clearTerminal: () => void;
  isRunning: boolean;
  isLoading: boolean;
  isReady: boolean;
  onInputSubmit: (value: string) => void;
  awaitingInput: boolean;
  interruptExecution: () => void;
};

const PyodideContext = createContext<PyodideContextType | undefined>(undefined);

export function PyodideProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<TerminalLine[]>([]);
  const [awaitingInput, setAwaitingInput] = useState(false);
  
  const workerRef = useRef<Worker | null>(null);
  const controlBufferRef = useRef<Int32Array | null>(null);
  const dataBufferRef = useRef<Uint8Array | null>(null);
  
  const { fileTree } = useFileTree();

  const appendOutput = useCallback((type: TerminalLine['type'], content: string) => {
    setTerminalOutput(prev => [...prev, { type, content }]);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminalOutput([]);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || workerRef.current) return;

    setIsLoading(true);
    
    try {
      // 0. Check for SharedArrayBuffer (CORS Headers)
      if (typeof SharedArrayBuffer === 'undefined') {
        console.error("SharedArrayBuffer is not available. Check COOP/COEP headers.");
        appendOutput('stderr', ">>> Error: SharedArrayBuffer is not available.");
        appendOutput('system', ">>> Tip: Restart your dev server and ensure next.config.ts has COOP/COEP headers.");
        setIsLoading(false);
        return;
      }

      // 1. Create SharedArrayBuffers
      const cb = new SharedArrayBuffer(16);
      const db = new SharedArrayBuffer(1024 * 64); // 64KB for input
      
      controlBufferRef.current = new Int32Array(cb);
      dataBufferRef.current = new Uint8Array(db);

      // 2. Spawn worker
      const worker = new Worker('/pyodideWorker.js');
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const { type, content, prompt, message } = e.data;
        
        switch (type) {
          case 'ready':
            setIsLoading(false);
            setIsReady(true);
            appendOutput('system', ">>> Python runtime ready.");
            break;
          case 'stdout':
            appendOutput('stdout', content);
            break;
          case 'stderr':
            appendOutput('stderr', content);
            break;
          case 'input':
            appendOutput('input-prompt', prompt);
            setAwaitingInput(true);
            break;
          case 'finished':
            setIsRunning(false);
            appendOutput('system', "\n>>> Execution finished.");
            break;
          case 'error':
            setIsRunning(false);
            appendOutput('stderr', `\nError: ${message}`);
            break;
        }
      };

      worker.onerror = (e) => {
        console.error("Worker error:", e);
        setIsLoading(false);
        appendOutput('stderr', ">>> Fatal Error: Python worker crashed. Try refreshing.");
      };

      console.log("PyodideWorker: Sending init message...");
      worker.postMessage({ 
        type: 'init', 
        controlBuffer: controlBufferRef.current, 
        dataBuffer: dataBufferRef.current 
      });

    } catch (e) {
      console.error("Worker initialization failed:", e);
      appendOutput('stderr', "Failed to initialize background worker. Cross-origin isolation might be disabled.");
      setIsLoading(false);
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [appendOutput]);

  const onInputSubmit = (value: string) => {
    if (controlBufferRef.current && dataBufferRef.current) {
      appendOutput('input-value', value);
      
      // 1. Encode value to data buffer
      const encoder = new TextEncoder();
      const encoded = encoder.encode(value);
      dataBufferRef.current.set(encoded);
      
      // 2. Store length and signal
      Atomics.store(controlBufferRef.current, 1, encoded.length);
      Atomics.store(controlBufferRef.current, 0, 1);
      Atomics.notify(controlBufferRef.current, 0);
      
      setAwaitingInput(false);
    }
  };

  const runCode = async (code: string, fileName: string) => {
    if (!workerRef.current || !isReady) {
      appendOutput('system', ">>> Python runtime is still loading... Please wait.");
      return;
    }
    if (isRunning) return;
    
    setIsRunning(true);
    clearTerminal();
    appendOutput('system', `>>> Running ${fileName}...`);

    workerRef.current.postMessage({
      type: 'run',
      code,
      fileName,
      fileTree
    });
  };

  const interruptExecution = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setIsReady(false);
      setIsRunning(false);
      appendOutput('system', "\n>>> Runtime interrupted. Restarting...");
    }
  };

  return (
    <PyodideContext.Provider value={{ 
      runCode, 
      terminalOutput, 
      clearTerminal, 
      isRunning, 
      isLoading, 
      isReady,
      onInputSubmit,
      awaitingInput,
      interruptExecution
    }}>
      {children}
    </PyodideContext.Provider>
  );
}

export function usePyodide() {
  const context = useContext(PyodideContext);
  if (!context) {
    throw new Error("usePyodide must be used within a PyodideProvider");
  }
  return context;
}
