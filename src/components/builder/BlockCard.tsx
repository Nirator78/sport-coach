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
} from 'lucide-react';
import type { Block } from '../../types/workout';
import { formatDuration } from '../../utils/estimateDuration';

interface BlockCardProps {
  block: Block;
  index: number;
  onUpdate: (id: string, updates: Partial<Block>) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  nested?: boolean;
  // For repeat block children management
  onAddChild?: (parentId: string, blockType: Block['type']) => void;
  onUpdateChild?: (parentId: string, childId: string, updates: Partial<Block>) => void;
  onDeleteChild?: (parentId: string, childId: string) => void;
  onReorderChildren?: (parentId: string, fromIndex: number, toIndex: number) => void;
}

const TYPE_STYLES: Record<Block['type'], { bg: string; border: string; icon: typeof Dumbbell; label: string }> = {
  'exercise-reps': { bg: 'bg-emerald-900/40', border: 'border-emerald-700/50', icon: Dumbbell, label: 'Exercice (reps)' },
  'exercise-timed': { bg: 'bg-sky-900/40', border: 'border-sky-700/50', icon: Timer, label: 'Exercice (chrono)' },
  rest: { bg: 'bg-amber-900/40', border: 'border-amber-700/50', icon: Coffee, label: 'Repos' },
  repeat: { bg: 'bg-violet-900/40', border: 'border-violet-700/50', icon: Repeat, label: 'Répétition' },
};

export function BlockCard({
  block,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  nested = false,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  onReorderChildren,
}: BlockCardProps) {
  const [expanded, setExpanded] = useState(false);
  const style = TYPE_STYLES[block.type];
  const Icon = style.icon;

  const [childDragIdx, setChildDragIdx] = useState<number | null>(null);

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
      <div className="flex items-center gap-2">
        {!nested && (
          <GripVertical className="h-5 w-5 shrink-0 text-slate-500" />
        )}
        <Icon className="h-5 w-5 shrink-0 text-slate-300" />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-slate-200">
            {block.type === 'exercise-reps' && `${block.name} — ${block.reps} reps`}
            {block.type === 'exercise-timed' && `${block.name} — ${formatDuration(block.duration)}`}
            {block.type === 'rest' && `Repos — ${formatDuration(block.duration)}`}
            {block.type === 'repeat' && `Répéter ×${block.times}`}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
          aria-label={expanded ? 'Réduire' : 'Développer'}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="rounded-lg p-1 text-red-400 transition-colors hover:bg-red-900/50 hover:text-red-300"
          aria-label="Supprimer le bloc"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-slate-700/50 pt-3">
          {(block.type === 'exercise-reps' || block.type === 'exercise-timed') && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Nom</label>
                <input
                  type="text"
                  value={block.name}
                  onChange={(e) => onUpdate(block.id, { name: e.target.value })}
                  onDoubleClick={(e) => e.currentTarget.select()}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500"
                />
              </div>
              {block.type === 'exercise-reps' ? (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Répétitions</label>
                  <input
                    type="number"
                    min={1}
                    value={block.reps}
                    onChange={(e) => onUpdate(block.id, { reps: Math.max(1, Number(e.target.value)) })}
                    onDoubleClick={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Durée (secondes)</label>
                  <input
                    type="number"
                    min={1}
                    value={block.duration}
                    onChange={(e) => onUpdate(block.id, { duration: Math.max(1, Number(e.target.value)) })}
                    onDoubleClick={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Notes (optionnel)</label>
                <input
                  type="text"
                  value={block.notes ?? ''}
                  onChange={(e) => onUpdate(block.id, { notes: e.target.value || undefined })}
                  onDoubleClick={(e) => e.currentTarget.select()}
                  placeholder="Instructions..."
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          {block.type === 'rest' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Durée (secondes)</label>
              <input
                type="number"
                min={1}
                value={block.duration}
                onChange={(e) => onUpdate(block.id, { duration: Math.max(1, Number(e.target.value)) })}
                onDoubleClick={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {block.type === 'repeat' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Nombre de répétitions</label>
                <input
                  type="number"
                  min={1}
                  value={block.times}
                  onChange={(e) => onUpdate(block.id, { times: Math.max(1, Number(e.target.value)) })}
                  onDoubleClick={(e) => e.currentTarget.select()}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400">Blocs contenus :</p>
                {block.children.length === 0 && (
                  <p className="text-xs italic text-slate-500">Aucun bloc. Ajoutez-en avec les boutons ci-dessous.</p>
                )}
                {block.children.map((child, childIdx) => (
                  <BlockCard
                    key={child.id}
                    block={child}
                    index={childIdx}
                    onUpdate={(childId, updates) => onUpdateChild?.(block.id, childId, updates)}
                    onDelete={(childId) => onDeleteChild?.(block.id, childId)}
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
                    nested
                  />
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(['exercise-reps', 'exercise-timed', 'rest'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => onAddChild?.(block.id, type)}
                      className="rounded-lg bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-600"
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
