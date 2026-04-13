import { useState, useMemo } from 'react';
import { Trash2, Download, CheckCircle, XCircle, Flame, Timer, Repeat2, TrendingUp } from 'lucide-react';
import { useWorkout } from '../stores/workoutStore';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { exportLog } from '../utils/exportImport';
import { exportTcx } from '../utils/exportTcx';
import { formatDuration } from '../utils/estimateDuration';
import type { WorkoutLog } from '../types/workout';

function WeeklyBarChart({ logs }: { logs: WorkoutLog[] }) {
  const days = useMemo(() => {
    const now = new Date();
    const result: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const count = logs.filter((l) => l.startedAt.slice(0, 10) === dayStr).length;
      result.push({ label: d.toLocaleDateString('fr-FR', { weekday: 'short' }), count });
    }
    return result;
  }, [logs]);

  const max = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="flex items-end justify-between gap-1" style={{ height: 80 }}>
      {days.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-emerald-500 transition-all dark:bg-emerald-400"
            style={{ height: `${(d.count / max) * 60}px`, minHeight: d.count > 0 ? 4 : 0 }}
          />
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function HistoryPage() {
  const { logs, deleteLog } = useWorkout();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  const sorted = useMemo(() => {
    let filtered = [...logs];
    const now = Date.now();
    if (filter === 'week') {
      filtered = filtered.filter((l) => now - new Date(l.startedAt).getTime() < 7 * 86400000);
    } else if (filter === 'month') {
      filtered = filtered.filter((l) => now - new Date(l.startedAt).getTime() < 30 * 86400000);
    }
    return filtered.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [logs, filter]);

  // Streak calculation
  const streak = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let count = 0;
    const d = new Date(today);
    while (true) {
      const dayStr = d.toISOString().slice(0, 10);
      const hasLog = logs.some((l) => l.startedAt.slice(0, 10) === dayStr && l.completed);
      if (!hasLog) {
        if (count === 0 && d.getTime() === today.getTime()) {
          // Today doesn't count yet, check yesterday
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [logs]);

  // This week stats
  const weekStats = useMemo(() => {
    const now = Date.now();
    const weekLogs = logs.filter((l) => now - new Date(l.startedAt).getTime() < 7 * 86400000);
    const sessions = weekLogs.length;
    const totalTime = weekLogs.reduce((acc, l) => acc + l.totalDuration, 0);
    const totalReps = weekLogs.reduce((acc, l) => acc + (l.totalReps ?? 0), 0);
    return { sessions, totalTime, totalReps };
  }, [logs]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-50">Historique</h1>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-3 text-center shadow dark:bg-slate-800">
          <Flame className="mx-auto mb-1 h-5 w-5 text-orange-500" />
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{streak}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">jours consécutifs</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow dark:bg-slate-800">
          <TrendingUp className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{weekStats.sessions}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">cette semaine</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow dark:bg-slate-800">
          <Timer className="mx-auto mb-1 h-5 w-5 text-sky-500" />
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{formatDuration(weekStats.totalTime)}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">temps cette semaine</p>
        </div>
      </div>

      {/* Weekly activity chart */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow dark:bg-slate-800">
        <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Activité (7 derniers jours)</h2>
        <WeeklyBarChart logs={logs} />
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        {(['all', 'week', 'month'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {f === 'all' ? 'Tout' : f === 'week' ? 'Cette semaine' : 'Ce mois'}
          </button>
        ))}
      </div>

      {/* Logs */}
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-slate-500 dark:text-slate-400">Aucune séance enregistrée</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((log) => (
            <div key={log.id} className="rounded-2xl bg-white p-4 shadow dark:bg-slate-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {log.completed ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-amber-500" />
                    )}
                    <h3 className="truncate font-semibold text-slate-900 dark:text-slate-50">{log.sessionName}</h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(log.startedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {formatDuration(log.totalDuration)}
                    </span>
                    {log.totalReps > 0 && (
                      <span className="flex items-center gap-1">
                        <Repeat2 className="h-3 w-3" />
                        {log.totalReps} reps
                      </span>
                    )}
                    {log.estimatedCalories != null && log.estimatedCalories > 0 && (
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        ~{log.estimatedCalories} kcal
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5 sm:flex-col sm:gap-1">
                  <button
                    onClick={() => exportLog(log)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600 sm:flex-initial sm:p-2"
                    aria-label="Exporter JSON"
                    title="Exporter JSON"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sm:hidden">JSON</span>
                  </button>
                  <button
                    onClick={() => exportTcx(log)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30 sm:flex-initial sm:p-2"
                    aria-label="Exporter TCX (Strava)"
                    title="Export Strava (.tcx)"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sm:hidden">TCX</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(log.id)}
                    className="rounded-xl bg-slate-100 p-2 text-red-500 transition-colors hover:bg-red-100 dark:bg-slate-700 dark:text-red-400 dark:hover:bg-red-900/30"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteLog(deleteTarget); }}
        title="Supprimer le log"
        message="Supprimer cet enregistrement ?"
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}
