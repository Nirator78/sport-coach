import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Download,
  ArrowLeft,
  Plus,
  Dumbbell,
  Timer,
  Coffee,
  Repeat,
  Clock,
  Layers,
  ClipboardPaste,
} from 'lucide-react';
import { useWorkout } from '../stores/workoutStore';
import { useClipboard } from '../stores/clipboardStore';
import { BlockCard } from '../components/builder/BlockCard';
import type { Block } from '../types/workout';
import { uid } from '../utils/uid';
import { estimateDuration, formatDuration } from '../utils/estimateDuration';
import { exportSession } from '../utils/exportImport';

const BLOCK_TEMPLATES: { type: Block['type']; label: string; icon: typeof Dumbbell }[] = [
  { type: 'exercise-reps', label: 'Exercice (reps)', icon: Dumbbell },
  { type: 'exercise-timed', label: 'Exercice (chrono)', icon: Timer },
  { type: 'rest', label: 'Repos', icon: Coffee },
  { type: 'repeat', label: 'Répétition', icon: Repeat },
];

function createDefaultBlock(type: Block['type']): Block {
  const id = uid();
  switch (type) {
    case 'exercise-reps':
      return { id, type, name: 'Exercice', reps: 10 };
    case 'exercise-timed':
      return { id, type, name: 'Exercice', duration: 30 };
    case 'rest':
      return { id, type, duration: 60 };
    case 'repeat':
      return { id, type, times: 3, children: [] };
  }
}

export function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSession, updateSession, createSession } = useWorkout();
  const clipboard = useClipboard();

  const [sessionId, setSessionId] = useState(id ?? '');
  const [name, setName] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const dragIdxRef = useRef<number | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const session = getSession(id);
      if (session) {
        setSessionId(session.id);
        setName(session.name);
        setBlocks(session.blocks);
      } else {
        navigate('/');
      }
    }
  }, [id, getSession, navigate]);

  const save = useCallback(() => {
    if (sessionId) {
      updateSession(sessionId, { name, blocks });
    } else {
      const session = createSession(name || 'Sans titre');
      setSessionId(session.id);
      updateSession(session.id, { blocks });
    }
    setHasUnsaved(false);
  }, [sessionId, name, blocks, updateSession, createSession]);

  const markDirty = useCallback(() => setHasUnsaved(true), []);

  const addBlock = useCallback(
    (type: Block['type']) => {
      const block = createDefaultBlock(type);
      setBlocks((prev) => [...prev, block]);
      setLastAddedId(block.id);
      markDirty();
      setShowAddPanel(false);
    },
    [markDirty],
  );

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<Block>) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, ...updates } as Block : b)),
      );
      markDirty();
    },
    [markDirty],
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      markDirty();
    },
    [markDirty],
  );

  const cloneBlock = useCallback((block: Block): Block => {
    const cloned = { ...block, id: uid() };
    if (cloned.type === 'repeat') {
      return { ...cloned, children: cloned.children.map((c) => ({ ...c, id: uid() })) };
    }
    return cloned;
  }, []);

  const duplicateBlock = useCallback(
    (blockId: string) => {
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.id === blockId);
        if (idx === -1) return prev;
        const original = prev[idx];
        if (!original) return prev;
        const copy = cloneBlock(original);
        const next = [...prev];
        next.splice(idx + 1, 0, copy);
        return next;
      });
      markDirty();
    },
    [markDirty, cloneBlock],
  );

  const pasteBlock = useCallback(() => {
    if (!clipboard.copiedBlock) return;
    const pasted = cloneBlock(clipboard.copiedBlock);
    setBlocks((prev) => [...prev, pasted]);
    markDirty();
  }, [clipboard.copiedBlock, cloneBlock, markDirty]);

  const moveBlock = useCallback(
    (fromIndex: number, direction: 'up' | 'down') => {
      setBlocks((prev) => {
        const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
        if (toIndex < 0 || toIndex >= prev.length) return prev;
        const next = [...prev];
        const moved = next[fromIndex];
        if (!moved) return prev;
        next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
      markDirty();
    },
    [markDirty],
  );

  const addChild = useCallback(
    (parentId: string, type: Block['type']) => {
      const child = createDefaultBlock(type);
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id === parentId && b.type === 'repeat') {
            return { ...b, children: [...b.children, child] };
          }
          return b;
        }),
      );
      setLastAddedId(child.id);
      markDirty();
    },
    [markDirty],
  );

  const updateChild = useCallback(
    (parentId: string, childId: string, updates: Partial<Block>) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id === parentId && b.type === 'repeat') {
            return {
              ...b,
              children: b.children.map((c) =>
                c.id === childId ? ({ ...c, ...updates } as Block) : c,
              ),
            };
          }
          return b;
        }),
      );
      markDirty();
    },
    [markDirty],
  );

  const deleteChild = useCallback(
    (parentId: string, childId: string) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id === parentId && b.type === 'repeat') {
            return { ...b, children: b.children.filter((c) => c.id !== childId) };
          }
          return b;
        }),
      );
      markDirty();
    },
    [markDirty],
  );

  const reorderChildren = useCallback(
    (parentId: string, fromIndex: number, toIndex: number) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id === parentId && b.type === 'repeat') {
            const newChildren = [...b.children];
            const [moved] = newChildren.splice(fromIndex, 1);
            if (moved) newChildren.splice(toIndex, 0, moved);
            return { ...b, children: newChildren };
          }
          return b;
        }),
      );
      markDirty();
    },
    [markDirty],
  );

  const handleDragStart = useCallback((_e: React.DragEvent, index: number) => {
    dragIdxRef.current = index;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, _index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (_e: React.DragEvent, toIndex: number) => {
      const fromIndex = dragIdxRef.current;
      if (fromIndex === null || fromIndex === toIndex) return;
      setBlocks((prev) => {
        const newBlocks = [...prev];
        const [moved] = newBlocks.splice(fromIndex, 1);
        if (moved) newBlocks.splice(toIndex, 0, moved);
        return newBlocks;
      });
      dragIdxRef.current = null;
      markDirty();
    },
    [markDirty],
  );

  const handleExport = () => {
    const session = getSession(sessionId);
    if (session) {
      exportSession({ ...session, name, blocks });
    }
  };

  const duration = estimateDuration(blocks);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex w-fit items-center gap-1 text-sm text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <div className="flex flex-wrap gap-2">
          {sessionId && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 px-2.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-300 dark:hover:bg-slate-600 sm:px-3"
              aria-label="Exporter"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Exporter</span>
            </button>
          )}
          <button
            onClick={save}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium text-white transition-colors sm:gap-2 sm:px-4 ${
              hasUnsaved
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
            aria-label="Sauvegarder"
          >
            <Save className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Sauvegarder</span>
          </button>
        </div>
      </div>

      {/* Session name */}
      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          markDirty();
        }}
        onDoubleClick={(e) => e.currentTarget.select()}
        placeholder="Nom de la séance"
        className="mb-4 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-xl font-bold text-slate-900 dark:text-slate-50 placeholder-slate-500 outline-none focus:border-emerald-500"
      />

      {/* Summary */}
      <div className="mb-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Layers className="h-4 w-4" />
          {blocks.length} bloc{blocks.length !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          ~{formatDuration(duration)}
        </span>
      </div>

      {/* Blocks list */}
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <BlockCard
            key={block.id}
            block={block}
            index={index}
            onUpdate={updateBlock}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
            onCopy={clipboard.copyBlock}
            onMoveUp={(i) => moveBlock(i, 'up')}
            onMoveDown={(i) => moveBlock(i, 'down')}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
            defaultExpanded={block.id === lastAddedId}
            lastAddedId={lastAddedId}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onAddChild={addChild}
            onUpdateChild={updateChild}
            onDeleteChild={deleteChild}
            onReorderChildren={reorderChildren}
          />
        ))}
      </div>

      {/* Clipboard indicator + paste */}
      {clipboard.copiedBlock && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">1 bloc copié</span>
          <button
            onClick={pasteBlock}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600/20 px-3 py-2 text-sm font-medium text-sky-400 transition-colors hover:bg-sky-600/30"
          >
            <ClipboardPaste className="h-4 w-4" />
            Coller
          </button>
        </div>
      )}

      {/* Add block button */}
      <div className="relative mt-4">
        <button
          onClick={() => setShowAddPanel(!showAddPanel)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all hover:border-emerald-500 hover:text-emerald-400"
        >
          <Plus className="h-5 w-5" />
          Ajouter un bloc
        </button>

        {showAddPanel && (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 grid grid-cols-2 gap-2 rounded-xl bg-white dark:bg-slate-800 p-3 shadow-xl border border-slate-200 dark:border-slate-700 sm:grid-cols-4">
            {BLOCK_TEMPLATES.map(({ type, label, icon: BIcon }) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 px-3 py-3 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-300 dark:hover:bg-slate-600 sm:flex-row sm:gap-2 sm:text-sm"
              >
                <BIcon className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="text-center">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
