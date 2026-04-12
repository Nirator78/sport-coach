import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isPlayer = location.pathname.startsWith('/player');

  if (isPlayer) {
    return <div className="min-h-dvh bg-slate-900 text-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-dvh bg-slate-900 text-slate-50">
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-emerald-400 transition-colors hover:text-emerald-300">
            <Dumbbell className="h-6 w-6" />
            <span className="text-lg font-bold">Home Workout</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
