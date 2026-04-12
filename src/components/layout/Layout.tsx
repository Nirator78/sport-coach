import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, Home, BookOpen, Clock, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/exercises', label: 'Exercices', icon: BookOpen },
  { to: '/history', label: 'Historique', icon: Clock },
  { to: '/settings', label: 'Réglages', icon: Settings },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isPlayer = location.pathname.startsWith('/player');
  const isBuilder = location.pathname.startsWith('/builder');

  if (isPlayer) {
    return <div className="min-h-dvh bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      {/* Top header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
            <Dumbbell className="h-6 w-6" />
            <span className="text-lg font-bold">Home Workout</span>
          </Link>
          {/* Desktop nav */}
          {!isBuilder && (
            <nav className="ml-auto hidden items-center gap-1 sm:flex">
              {NAV_ITEMS.map(({ to, label, icon: NavIcon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <NavIcon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main content — add bottom padding for mobile nav */}
      <main className={`mx-auto max-w-3xl px-4 py-6 ${!isBuilder ? 'pb-24 sm:pb-6' : ''}`}>{children}</main>

      {/* Bottom navigation (mobile only, not in builder) */}
      {!isBuilder && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur-sm sm:hidden dark:border-slate-700/50 dark:bg-slate-900/90">
          <div className="flex items-stretch">
            {NAV_ITEMS.map(({ to, label, icon: NavIcon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                    active
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                  }`}
                >
                  <NavIcon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
