import { useRef, useCallback, useEffect, useState } from 'react';

const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

export function useWakeLock() {
  const lockRef = useRef<WakeLockSentinel | null>(null);
  const [active, setActive] = useState(false);

  const acquire = useCallback(async () => {
    if (!supported) return;
    try {
      lockRef.current = await navigator.wakeLock.request('screen');
      setActive(true);
      lockRef.current.addEventListener('release', () => {
        lockRef.current = null;
        setActive(false);
      });
    } catch {
      // Silently fail - user navigated away or API not available
    }
  }, []);

  const release = useCallback(async () => {
    if (lockRef.current) {
      try {
        await lockRef.current.release();
      } catch {
        // Already released
      }
      lockRef.current = null;
      setActive(false);
    }
  }, []);

  // Re-acquire on visibility change (tab focus)
  useEffect(() => {
    if (!supported) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !lockRef.current && active) {
        void acquire();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [acquire, active]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lockRef.current) {
        void lockRef.current.release().catch(() => {});
        lockRef.current = null;
      }
    };
  }, []);

  return { supported, active, acquire, release };
}
