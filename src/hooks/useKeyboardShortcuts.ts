import { useEffect } from 'react';

interface ShortcutHandlers {
  togglePause: () => void;
  next: () => void;
  previous: () => void;
  openStop: () => void;
  toggleMic: (() => void) | undefined;
  toggleSound: () => void;
  toggleVoice: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlers.togglePause();
          break;
        case 'ArrowRight':
        case 'n':
        case 'N':
          handlers.next();
          break;
        case 'ArrowLeft':
        case 'p':
        case 'P':
          handlers.previous();
          break;
        case 'Escape':
          handlers.openStop();
          break;
        case 'm':
        case 'M':
          handlers.toggleMic?.();
          break;
        case 's':
        case 'S':
          handlers.toggleSound();
          break;
        case 'v':
        case 'V':
          handlers.toggleVoice();
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
