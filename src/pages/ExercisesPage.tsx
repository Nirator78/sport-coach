import { useState, useMemo } from 'react';
import { Plus, Search, X, Trash2 } from 'lucide-react';
import { useExercises } from '../stores/exerciseStore';
import { useWorkout } from '../stores/workoutStore';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { uid } from '../utils/uid';
import type { Exercise, ExerciseCategory, Difficulty, MuscleGroup } from '../types/exercise';
import { CATEGORY_LABELS, CATEGORY_COLORS, DIFFICULTY_LABELS, DIFFICULTY_COLORS, MUSCLE_LABELS } from '../types/exercise';

const ALL_CATEGORIES: ExerciseCategory[] = ['upper', 'lower', 'core', 'cardio', 'stretch', 'full-body'];
const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const ALL_MUSCLES: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'abs', 'obliques', 'full'];

export function ExercisesPage() {
  const { exercises, addCustomExercise, deleteCustomExercise } = useExercises();
  const { sessions } = useWorkout();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExerciseCategory | ''>('');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | ''>('');
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | ''>('');
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [addToSession, setAddToSession] = useState<Exercise | null>(null);

  const filtered = useMemo(() => {
    let result = exercises;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }
    if (filterCategory) result = result.filter((e) => e.category === filterCategory);
    if (filterDifficulty) result = result.filter((e) => e.difficulty === filterDifficulty);
    if (filterMuscle) result = result.filter((e) => e.muscleGroups.includes(filterMuscle));
    return result;
  }, [exercises, search, filterCategory, filterDifficulty, filterMuscle]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Exercices</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          Créer un exercice
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un exercice..."
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ExerciseCategory | '')}
          className="flex-1 min-w-35 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="">Toutes catégories</option>
          {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value as Difficulty | '')}
          className="flex-1 min-w-35 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="">Toute difficulté</option>
          {ALL_DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>)}
        </select>
        <select
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value as MuscleGroup | '')}
          className="flex-1 min-w-35 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="">Tous muscles</option>
          {ALL_MUSCLES.map((m) => <option key={m} value={m}>{MUSCLE_LABELS[m]}</option>)}
        </select>
      </div>

      {/* Results count */}
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{filtered.length} exercice{filtered.length !== 1 ? 's' : ''}</p>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => setSelected(exercise)}
            className="cursor-pointer rounded-2xl bg-white p-4 shadow transition-all hover:shadow-lg dark:bg-slate-800 dark:hover:bg-slate-750"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-slate-900 dark:text-slate-50">{exercise.name}</h3>
                  {exercise.custom && (
                    <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">Custom</span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[exercise.category]}`}>
                    {CATEGORY_LABELS[exercise.category]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_COLORS[exercise.difficulty]}`}>
                    {DIFFICULTY_LABELS[exercise.difficulty]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.name}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_COLORS[selected.category]}`}>
                {CATEGORY_LABELS[selected.category]}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${DIFFICULTY_COLORS[selected.difficulty]}`}>
                {DIFFICULTY_LABELS[selected.difficulty]}
              </span>
              {selected.custom && (
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">Custom</span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{selected.description}</p>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Muscles ciblés</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {selected.muscleGroups.map((m) => (
                  <span key={m} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {MUSCLE_LABELS[m]}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span>Par défaut : {selected.defaultType === 'reps' ? `${selected.defaultValue} reps` : `${selected.defaultValue}s`}</span>
              {selected.met && <span>MET : {selected.met}</span>}
            </div>
            {selected.variants && selected.variants.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Variantes</p>
                <ul className="mt-1 list-inside list-disc text-sm text-slate-600 dark:text-slate-300">
                  {selected.variants.map((v) => <li key={v}>{v}</li>)}
                </ul>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setAddToSession(selected); setSelected(null); }}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
              >
                Ajouter à une séance
              </button>
              {selected.custom && (
                <button
                  onClick={() => { setDeleteTarget(selected.id); setSelected(null); }}
                  className="flex items-center justify-center rounded-xl bg-red-50 p-2.5 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add to session selector */}
      {addToSession && (
        <AddToSessionModal
          exercise={addToSession}
          sessions={sessions}
          onClose={() => setAddToSession(null)}
        />
      )}

      {/* Create exercise modal */}
      {showCreate && (
        <CreateExerciseModal
          onClose={() => setShowCreate(false)}
          onCreate={addCustomExercise}
        />
      )}

      {/* Delete custom exercise */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteCustomExercise(deleteTarget); }}
        title="Supprimer l'exercice"
        message="Supprimer cet exercice custom de la bibliothèque ?"
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}

function AddToSessionModal({ exercise, sessions, onClose }: { exercise: Exercise; sessions: { id: string; name: string }[]; onClose: () => void }) {
  const { updateSession, getSession } = useWorkout();

  const handleAdd = (sessionId: string) => {
    const session = getSession(sessionId);
    if (!session) return;
    const block = exercise.defaultType === 'reps'
      ? { id: uid(), type: 'exercise-reps' as const, name: exercise.name, reps: exercise.defaultValue }
      : { id: uid(), type: 'exercise-timed' as const, name: exercise.name, duration: exercise.defaultValue };
    updateSession(sessionId, { blocks: [...session.blocks, block] });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={`Ajouter "${exercise.name}"`}>
      {sessions.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Aucune séance. Créez-en une d'abord.</p>
      ) : (
        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleAdd(s.id)}
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

function CreateExerciseModal({ onClose, onCreate }: { onClose: () => void; onCreate: (e: Omit<Exercise, 'id' | 'custom'>) => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('upper');
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [description, setDescription] = useState('');
  const [defaultType, setDefaultType] = useState<'reps' | 'timed'>('reps');
  const [defaultValue, setDefaultValue] = useState(12);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const toggleMuscle = (m: MuscleGroup) => {
    setMuscleGroups((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || muscleGroups.length === 0) return;
    onCreate({ name: name.trim(), category, muscleGroups, description: description.trim(), defaultType, defaultValue, difficulty });
    onClose();
  };

  const inputClass = "w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50";
  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

  return (
    <Modal open onClose={onClose} title="Nouvel exercice">
      <form onSubmit={handleSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        <div>
          <label className={labelClass}>Nom</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Catégorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory)} className={inputClass}>
            {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Muscles (au moins 1)</label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_MUSCLES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMuscle(m)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  muscleGroups.includes(m)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {MUSCLE_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>Type par défaut</label>
            <select value={defaultType} onChange={(e) => setDefaultType(e.target.value as 'reps' | 'timed')} className={inputClass}>
              <option value="reps">Répétitions</option>
              <option value="timed">Chrono (secondes)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className={labelClass}>Valeur par défaut</label>
            <input type="number" min={1} value={defaultValue} onChange={(e) => setDefaultValue(Number(e.target.value))} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Difficulté</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className={inputClass}>
            {ALL_DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
            Annuler
          </button>
          <button type="submit" disabled={!name.trim() || muscleGroups.length === 0} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-40">
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}
