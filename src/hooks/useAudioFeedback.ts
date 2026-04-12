import { useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

function createContext(): AudioContext | null {
  try {
    return new AudioContext();
  } catch {
    return null;
  }
}

function playTone(ctx: AudioContext, frequency: number, duration: number, startTime: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.3, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function useAudioFeedback() {
  const [muted, setMuted] = useLocalStorage('workout-sound-muted', false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (mutedRef.current) return null;
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = createContext();
    }
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const tickBeep = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 440, 0.1, ctx.currentTime);
  }, [getCtx]);

  const transitionBeep = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 523, 0.12, ctx.currentTime);
    playTone(ctx, 659, 0.12, ctx.currentTime + 0.15);
  }, [getCtx]);

  const finishBeep = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 523, 0.15, ctx.currentTime);
    playTone(ctx, 659, 0.15, ctx.currentTime + 0.2);
    playTone(ctx, 784, 0.25, ctx.currentTime + 0.4);
  }, [getCtx]);

  return { tickBeep, transitionBeep, finishBeep, muted, setMuted };
}
