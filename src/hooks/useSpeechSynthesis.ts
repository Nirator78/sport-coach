import { useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Block } from '../types/workout';

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function describeBlock(block: Block): string {
  switch (block.type) {
    case 'exercise-reps':
      return `${block.name}, ${block.reps} répétitions`;
    case 'exercise-timed':
      return `${block.name}, ${block.duration} secondes`;
    case 'rest':
      return `Repos, ${block.duration} secondes`;
    default:
      return '';
  }
}

export function useSpeechSynthesis() {
  const [enabled, setEnabled] = useLocalStorage('workout-voice-enabled', true);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const announce = useCallback((block: Block) => {
    if (!enabledRef.current || !supported) return;
    const text = describeBlock(block);
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.1;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { supported, enabled, setEnabled, announce, stop };
}
