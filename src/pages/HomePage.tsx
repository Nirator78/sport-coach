import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import {
  Plus,
  Play,
  Pencil,
  Copy,
  Trash2,
  Upload,
  Clock,
  Layers,
  BookTemplate,
  Flame,
  TrendingUp,
  Timer,
} from 'lucide-react';
import { useWorkout } from '../stores/workoutStore';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { estimateDuration, formatDuration } from '../utils/estimateDuration';
import { importSession } from '../utils/exportImport';
import { HelpButton } from '../components/ui/HelpPanel';
import { TEMPLATES } from '../data/templates';

export function HomePage() {
  const navigate = useNavigate();
  const { sessions, logs, createSession, updateSession, deleteSession, duplicateSession, importSession: importToStore } = useWorkout();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const session = createSession(name);
    setNewName('');
    setShowCreate(false);
    navigate(`/builder/${session.id}`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const session = await importSession(file);
      importToStore(session);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    }
    e.target.value = '';
  };

  const handleUseTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const session = createSession(template.name);
    updateSession(session.id, { blocks: template.blocks() });
    setShowTemplates(false);
    navigate(`/builder/${session.id}`);
  };

  const weekStats = useMemo(() => {
    const now = Date.now();
    const weekLogs = logs.filter((l) => now - new Date(l.startedAt).getTime() < 7 * 86400000);
    // Streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    const d = new Date(today);
    let first = true;
    while (true) {
      const dayStr = d.toISOString().slice(0, 10);
      const has = logs.some((l) => l.startedAt.slice(0, 10) === dayStr && l.completed);
      if (!has) {
        if (first) { first = false; d.setDate(d.getDate() - 1); continue; }
        break;
      }
      first = false;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return {
      streak,
      sessions: weekLogs.length,
      totalTime: weekLogs.reduce((s, l) => s + l.totalDuration, 0),
    };
  }, [logs]);

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Mes séances</h1>
        <div className="flex flex-wrap gap-2">
          <HelpButton variant="home" />
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-200 px-2.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 sm:px-4"
            aria-label="Créer depuis un template"
          >
            <BookTemplate className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Templates</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl bg-slate-200 px-2.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 sm:px-4"
            aria-label="Importer une séance"
          >
            <Upload className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Importer</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 sm:gap-2 sm:px-4"
            aria-label="Créer une séance"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Nouvelle séance</span>
          </button>
        </div>
      </div>

      {/* Quick stats */}
      {logs.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white p-3 text-center shadow dark:bg-slate-800">
            <Flame className="mx-auto mb-1 h-5 w-5 text-orange-500" />
            <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{weekStats.streak}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">streak (jours)</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-center shadow dark:bg-slate-800">
            <TrendingUp className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
            <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{weekStats.sessions}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">cette semaine</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-center shadow dark:bg-slate-800">
            <Timer className="mx-auto mb-1 h-5 w-5 text-sky-500" />
            <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{formatDuration(weekStats.totalTime)}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">temps cette semaine</p>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-600">
          <Layers className="mx-auto mb-3 h-12 w-12 text-slate-400 dark:text-slate-500" />
          <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Aucune séance</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Créez votre première séance d&apos;entraînement
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sorted.map((session) => {
            const duration = estimateDuration(session.blocks);
            return (
              <div
                key={session.id}
                className="group rounded-2xl bg-white p-4 shadow-lg transition-all hover:shadow-xl dark:bg-slate-800 dark:hover:bg-slate-750"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {session.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {session.blocks.length} bloc{session.blocks.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        ~{formatDuration(duration)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5 sm:gap-1">
                    <button
                      onClick={() => navigate(`/player/${session.id}`)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 sm:flex-initial sm:p-2.5"
                      aria-label={`Lancer ${session.name}`}
                    >
                      <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="sm:hidden">Lancer</span>
                    </button>
                    <button
                      onClick={() => navigate(`/builder/${session.id}`)}
                      className="flex items-center justify-center rounded-xl bg-slate-100 p-2.5 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      aria-label={`Éditer ${session.name}`}
                    >
                      <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => duplicateSession(session.id)}
                      className="flex items-center justify-center rounded-xl bg-slate-100 p-2.5 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      aria-label={`Dupliquer ${session.name}`}
                    >
                      <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(session.id)}
                      className="flex items-center justify-center rounded-xl bg-slate-100 p-2.5 text-red-500 transition-colors hover:bg-red-600 hover:text-white dark:bg-slate-700 dark:text-red-400"
                      aria-label={`Supprimer ${session.name}`}
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create session modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle séance">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de la séance"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
            autoFocus
          />
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!newName.trim()}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
            >
              Créer
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteSession(deleteTarget);
        }}
        title="Supprimer la séance"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette séance ?"
        confirmLabel="Supprimer"
        danger
      />

      {/* Templates modal */}
      <Modal open={showTemplates} onClose={() => setShowTemplates(false)} title="Créer depuis un template">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {TEMPLATES.map((template) => {
            const diffColor = template.difficulty === 'easy' ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40' : template.difficulty === 'medium' ? 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40' : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40';
            const diffLabel = template.difficulty === 'easy' ? 'Facile' : template.difficulty === 'medium' ? 'Moyen' : 'Difficile';
            return (
              <div
                key={template.id}
                className="rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">{template.name}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{template.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                        <Clock className="h-3 w-3" />
                        ~{formatDuration(template.estimatedDuration)}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${diffColor}`}>
                        {diffLabel}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                  >
                    Utiliser
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
