import { useState, useRef, useCallback, useEffect } from 'react';

interface CountdownState {
  remaining: number;
  total: number;
  isRunning: boolean;
  progress: number;
}

interface CountdownControls {
  start: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useCountdown(onComplete: () => void): [CountdownState, CountdownControls] {
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds: number) => {
      clearTimer();
      setTotal(seconds);
      setRemaining(seconds);
      setIsRunning(true);
    },
    [clearTimer],
  );

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(0);
    setTotal(0);
    setIsRunning(false);
  }, [clearTimer]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearTimer();
          setIsRunning(false);
          onCompleteRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, remaining, clearTimer]);

  const progress = total > 0 ? (total - remaining) / total : 0;

  return [
    { remaining, total, isRunning, progress },
    { start, pause, resume, reset },
  ];
}
