"use client";

import React, { createContext, useContext, useState } from "react";

type leftPanelContextType = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

const leftPanelContext = createContext<leftPanelContextType | undefined>(undefined);

export function LeftPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <leftPanelContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </leftPanelContext.Provider>
  );
}

export function useLeftPanelContext() {
  const context = useContext(leftPanelContext);
  if (context === undefined) {
    throw new Error("useLeftPanelContext must be used within a LeftPanelProvider");
  }
  return context;
}
