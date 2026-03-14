"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface SettingsContextType {
  editorTheme: string;
  setEditorTheme: (theme: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [editorTheme, setEditorTheme] = useState<string>("vs-dark");

  // Load from local storage on mount if available
  useEffect(() => {
    const savedTheme = localStorage.getItem("editorTheme");
    if (savedTheme) {
      setEditorTheme(savedTheme);
    }
  }, []);

  const updateEditorTheme = (theme: string) => {
    setEditorTheme(theme);
    localStorage.setItem("editorTheme", theme);
  };

  return (
    <SettingsContext.Provider value={{ 
      editorTheme, 
      setEditorTheme: updateEditorTheme 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
