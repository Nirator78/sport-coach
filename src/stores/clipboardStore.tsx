import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Block } from '../types/workout';

interface ClipboardStore {
  copiedBlock: Block | null;
  copyBlock: (block: Block) => void;
  clear: () => void;
}

const ClipboardContext = createContext<ClipboardStore | null>(null);

export function ClipboardProvider({ children }: { children: ReactNode }) {
  const [copiedBlock, setCopiedBlock] = useState<Block | null>(null);

  const copyBlock = useCallback((block: Block) => {
    setCopiedBlock(structuredClone(block));
  }, []);

  const clear = useCallback(() => setCopiedBlock(null), []);

  return (
    <ClipboardContext.Provider value={{ copiedBlock, copyBlock, clear }}>
      {children}
    </ClipboardContext.Provider>
  );
}

export function useClipboard(): ClipboardStore {
  const ctx = useContext(ClipboardContext);
  if (!ctx) throw new Error('useClipboard must be used within ClipboardProvider');
  return ctx;
}
