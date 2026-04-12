import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Play,
  Pencil,
  Copy,
  Trash2,
  Upload,
  Clock,
  Layers,
} from 'lucide-react';
import { useWorkout } from '../stores/workoutStore';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { estimateDuration, formatDuration } from '../utils/estimateDuration';
import { importSession } from '../utils/exportImport';
import { HelpButton } from '../components/ui/HelpPanel';

export function HomePage() {
  const navigate = useNavigate();
  const { sessions, createSession, deleteSession, duplicateSession, importSession: importToStore } = useWorkout();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
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

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-50">Mes séances</h1>
        <div className="flex gap-2">
          <HelpButton variant="home" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-600"
            aria-label="Importer une séance"
          >
            <Upload className="h-4 w-4" />
            Importer
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
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
            aria-label="Créer une séance"
          >
            <Plus className="h-4 w-4" />
            Nouvelle séance
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-600 p-12 text-center">
          <Layers className="mx-auto mb-3 h-12 w-12 text-slate-500" />
          <p className="text-lg font-medium text-slate-400">Aucune séance</p>
          <p className="mt-1 text-sm text-slate-500">
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
                className="group rounded-2xl bg-slate-800 p-4 shadow-lg transition-all hover:bg-slate-750 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-slate-50">
                      {session.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
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
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => navigate(`/player/${session.id}`)}
                      className="rounded-xl bg-emerald-600 p-2.5 text-white transition-colors hover:bg-emerald-500"
                      aria-label={`Lancer ${session.name}`}
                    >
                      <Play className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/builder/${session.id}`)}
                      className="rounded-xl bg-slate-700 p-2.5 text-slate-300 transition-colors hover:bg-slate-600"
                      aria-label={`Éditer ${session.name}`}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => duplicateSession(session.id)}
                      className="rounded-xl bg-slate-700 p-2.5 text-slate-300 transition-colors hover:bg-slate-600"
                      aria-label={`Dupliquer ${session.name}`}
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(session.id)}
                      className="rounded-xl bg-slate-700 p-2.5 text-red-400 transition-colors hover:bg-red-600 hover:text-white"
                      aria-label={`Supprimer ${session.name}`}
                    >
                      <Trash2 className="h-5 w-5" />
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
            className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-slate-50 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            autoFocus
          />
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
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
    </div>
  );
}
