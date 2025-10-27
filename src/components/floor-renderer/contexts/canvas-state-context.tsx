'use client';

import { createContext, useContext, useState } from 'react';

type ViewMode = '2d' | '3d';

interface CanvasStateContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const canvasStateContext = createContext<CanvasStateContextValue | null>(null);

interface CanvasStateProviderProps {
  children: React.ReactNode;
}

export function CanvasStateProvider({ children }: CanvasStateProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('3d');

  const toggleViewMode = () => {
    setViewMode(prev => (prev === '2d' ? '3d' : '2d'));
  };

  return (
    <canvasStateContext.Provider
      value={{ viewMode, setViewMode, toggleViewMode }}
    >
      {children}
    </canvasStateContext.Provider>
  );
}

export function useCanvasState() {
  const context = useContext(canvasStateContext);
  if (!context) {
    throw new Error('useCanvasState must be used within a CanvasStateProvider');
  }
  return context;
}
