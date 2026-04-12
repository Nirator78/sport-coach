import { useState, useEffect, useCallback } from 'react';

export function ReloadPrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').then((reg) => {
      setRegistration(reg);
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setNeedRefresh(true);
          }
        });
      });
    }).catch(() => {
      // SW registration failed — silently ignore
    });
  }, []);

  const handleRefresh = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }, [registration]);

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 sm:bottom-4 sm:left-auto sm:right-4 sm:w-80">
      <div className="rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-800">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Mise à jour disponible</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Une nouvelle version de l'app est prête.</p>
        <button
          onClick={handleRefresh}
          className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          Rafraîchir
        </button>
      </div>
    </div>
  );
}
