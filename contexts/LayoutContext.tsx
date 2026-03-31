"use client";

import React, { createContext, useContext, useState, Dispatch, SetStateAction } from "react";

// --- Left Panel ---
type leftPanelContextType = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const leftPanelContext = createContext<leftPanelContextType | undefined>(undefined);

export function LeftPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

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

// --- Right Panel ---
type rightPanelContextType = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const rightPanelContext = createContext<rightPanelContextType | undefined>(undefined);

export function RightPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <rightPanelContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </rightPanelContext.Provider>
  );
}

export function useRightPanelContext() {
  const context = useContext(rightPanelContext);
  if (context === undefined) {
    throw new Error("useRightPanelContext must be used within a RightPanelProvider");
  }
  return context;
}

// --- Bottom Panel ---
type bottomPanelContextType = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const bottomPanelContext = createContext<bottomPanelContextType | undefined>(undefined);


export function BottomPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <bottomPanelContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </bottomPanelContext.Provider>
  );
}

export function useBottomPanelContext() {
  const context = useContext(bottomPanelContext);
  if (context === undefined) {
    throw new Error("useBottomPanelContext must be used within a BottomPanelProvider");
  }
  return context;
}
