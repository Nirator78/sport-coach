import { useState } from 'react';
import {
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Repeat,
  Timer,
  Dumbbell,
  Coffee,
  Copy,
  Clipboard,
} from 'lucide-react';
import type { Block } from '../../types/workout';
import { formatDuration } from '../../utils/estimateDuration';
import { useExercises } from '../../stores/exerciseStore';

interface BlockCardProps {
  block: Block;
  index: number;
  onUpdate: (id: string, updates: Partial<Block>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopy: (block: Block) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
  defaultExpanded?: boolean;
  lastAddedId?: string | null;
  nested?: boolean;
  // For repeat block children management
  onAddChild?: (parentId: string, blockType: Block['type']) => void;
  onUpdateChild?: (parentId: string, childId: string, updates: Partial<Block>) => void;
  onDeleteChild?: (parentId: string, childId: string) => void;
  onReorderChildren?: (parentId: string, fromIndex: number, toIndex: number) => void;
}

const TYPE_STYLES: Record<Block['type'], { bg: string; border: string; icon: typeof Dumbbell; label: string }> = {
  'exercise-reps': { bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-700/50', icon: Dumbbell, label: 'Exercice (reps)' },
  'exercise-timed': { bg: 'bg-sky-100 dark:bg-sky-900/40', border: 'border-sky-700/50', icon: Timer, label: 'Exercice (chrono)' },
  rest: { bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-700/50', icon: Coffee, label: 'Repos' },
  repeat: { bg: 'bg-violet-100 dark:bg-violet-900/40', border: 'border-violet-700/50', icon: Repeat, label: 'Répétition' },
};

export function BlockCard({
  block,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onCopy,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  defaultExpanded = false,
  lastAddedId = null,
  nested = false,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  onReorderChildren,
}: BlockCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const style = TYPE_STYLES[block.type];
  const Icon = style.icon;
  const { exercises } = useExercises();

  const [childDragIdx, setChildDragIdx] = useState<number | null>(null);

  const nameSuggestions = (block.type === 'exercise-reps' || block.type === 'exercise-timed') && showSuggestions && block.name.length >= 1
    ? exercises.filter((e) => e.name.toLowerCase().includes(block.name.toLowerCase())).slice(0, 6)
    : [];

  return (
    <div
      draggable={!nested}
      onDragStart={(e) => !nested && onDragStart(e, index)}
      onDragOver={(e) => {
        e.preventDefault();
        if (!nested) onDragOver(e, index);
      }}
      onDrop={(e) => !nested && onDrop(e, index)}
      className={`rounded-xl border ${style.border} ${style.bg} p-3 transition-all ${
        nested ? '' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        {!nested && (
          <GripVertical className="hidden h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500 sm:block" />
        )}
        <Icon className="h-5 w-5 shrink-0 text-slate-600 dark:text-slate-300" />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {block.type === 'exercise-reps' && `${block.name} - ${block.reps} reps`}
            {block.type === 'exercise-timed' && `${block.name} - ${formatDuration(block.duration)}`}
            {block.type === 'rest' && `Repos - ${formatDuration(block.duration)}`}
            {block.type === 'repeat' && `Répéter ×${block.times}`}
          </span>
        </div>
        {/* Mobile move arrows */}
        {onMoveUp && !isFirst && (
          <button
            onClick={() => onMoveUp(index)}
            className="rounded-lg p-1 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 sm:hidden"
            aria-label="Monter"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
        {onMoveDown && !isLast && (
          <button
            onClick={() => onMoveDown(index)}
            className="rounded-lg p-1 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 sm:hidden"
            aria-label="Descendre"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-lg p-1 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
          aria-label={expanded ? 'Réduire' : 'Développer'}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button
          onClick={() => onCopy(block)}
          className="hidden rounded-lg p-1 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 sm:block"
          aria-label="Copier le bloc"
          title="Copier"
        >
          <Clipboard className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDuplicate(block.id)}
          className="hidden rounded-lg p-1 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 sm:block"
          aria-label="Dupliquer le bloc"
          title="Dupliquer"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="rounded-lg p-1 text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-300"
          aria-label="Supprimer le bloc"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-slate-200 dark:border-slate-700/50 pt-3">
          {(block.type === 'exercise-reps' || block.type === 'exercise-timed') && (
            <>
              <div className="relative">
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Nom</label>
                <input
                  type="text"
                  value={block.name}
                  onChange={(e) => { onUpdate(block.id, { name: e.target.value }); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onDoubleClick={(e) => e.currentTarget.select()}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-emerald-500"
                />
                {nameSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700">
                    {nameSuggestions.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          const updates: Partial<Block> = { name: ex.name };
                          if (block.type === 'exercise-reps' && ex.defaultType === 'reps') {
                            (updates as Record<string, unknown>)['reps'] = ex.defaultValue;
                          } else if (block.type === 'exercise-timed' && ex.defaultType === 'timed') {
                            (updates as Record<string, unknown>)['duration'] = ex.defaultValue;
                          }
                          onUpdate(block.id, updates);
                          setShowSuggestions(false);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-600"
                      >
                        {ex.name}
                        <span className="ml-2 text-xs text-slate-400">
                          {ex.defaultType === 'reps' ? `${ex.defaultValue} reps` : `${ex.defaultValue}s`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {block.type === 'exercise-reps' ? (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Répétitions</label>
                  <input
                    type="number"
                    min={1}
                    value={block.reps}
                    onChange={(e) => onUpdate(block.id, { reps: Math.max(1, Number(e.target.value)) })}
                    onDoubleClick={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Durée (secondes)</label>
                  <input
                    type="number"
                    min={1}
                    value={block.duration}
                    onChange={(e) => onUpdate(block.id, { duration: Math.max(1, Number(e.target.value)) })}
                    onDoubleClick={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-emerald-500"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Notes (optionnel)</label>
                <input
                  type="text"
                  value={block.notes ?? ''}
                  onChange={(e) => onUpdate(block.id, { notes: e.target.value || undefined })}
                  onDoubleClick={(e) => e.currentTarget.select()}
                  placeholder="Instructions..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          {block.type === 'rest' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Durée (secondes)</label>
              <input
                type="number"
                min={1}
                value={block.duration}
                onChange={(e) => onUpdate(block.id, { duration: Math.max(1, Number(e.target.value)) })}
                onDoubleClick={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {block.type === 'repeat' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Nombre de répétitions</label>
                <input
                  type="number"
                  min={1}
                  value={block.times}
                  onChange={(e) => onUpdate(block.id, { times: Math.max(1, Number(e.target.value)) })}
                  onDoubleClick={(e) => e.currentTarget.select()}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Blocs contenus :</p>
                {block.children.length === 0 && (
                  <p className="text-xs italic text-slate-400 dark:text-slate-500">Aucun bloc. Ajoutez-en avec les boutons ci-dessous.</p>
                )}
                {block.children.map((child, childIdx) => (
                  <BlockCard
                    key={child.id}
                    block={child}
                    index={childIdx}
                    onUpdate={(childId, updates) => onUpdateChild?.(block.id, childId, updates)}
                    onDelete={(childId) => onDeleteChild?.(block.id, childId)}
                    onDuplicate={() => {
                      /* Child duplication: not supported in nested for simplicity */
                    }}
                    onCopy={onCopy}
                    onDragStart={(e) => {
                      setChildDragIdx(childIdx);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (childDragIdx !== null && childDragIdx !== childIdx) {
                        onReorderChildren?.(block.id, childDragIdx, childIdx);
                      }
                      setChildDragIdx(null);
                    }}
                    defaultExpanded={child.id === lastAddedId}
                    nested
                  />
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(['exercise-reps', 'exercise-timed', 'rest'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => onAddChild?.(block.id, type)}
                      className="rounded-lg bg-slate-200 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                      + {TYPE_STYLES[type].label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
