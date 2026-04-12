import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SkipBack,
  SkipForward,
  Pause,
  Play,
  Square,
  Mic,
  MicOff,
  ArrowLeft,
  Trophy,
  Download,
} from 'lucide-react';
import { useWorkout } from '../stores/workoutStore';
import { useWorkoutPlayer } from '../hooks/useWorkoutPlayer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ProgressRing } from '../components/ui/ProgressRing';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatDuration } from '../utils/estimateDuration';
import type { WorkoutLog } from '../types/workout';
import { exportLog } from '../utils/exportImport';

function blockColor(type: string): string {
  switch (type) {
    case 'exercise-reps':
      return '#10b981';
    case 'exercise-timed':
      return '#0ea5e9';
    case 'rest':
      return '#f59e0b';
    default:
      return '#8b5cf6';
  }
}

function blockLabel(block: { type: string; name?: string }): string {
  switch (block.type) {
    case 'exercise-reps':
    case 'exercise-timed':
      return (block as { name: string }).name;
    case 'rest':
      return 'Repos';
    default:
      return '';
  }
}

export function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSession, addLog } = useWorkout();
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [finishedLog, setFinishedLog] = useState<WorkoutLog | null>(null);

  const session = id ? getSession(id) : undefined;

  const handleFinish = useCallback(
    (log: WorkoutLog) => {
      addLog(log);
      setFinishedLog(log);
    },
    [addLog],
  );

  const [state, controls] = useWorkoutPlayer(
    session?.id ?? '',
    session?.name ?? '',
    handleFinish,
  );

  const handleVoiceCommand = useCallback(
    (cmd: 'next' | 'previous' | 'pause') => {
      switch (cmd) {
        case 'next':
          controls.next();
          break;
        case 'previous':
          controls.previous();
          break;
        case 'pause':
          controls.togglePause();
          break;
      }
    },
    [controls],
  );

  const speech = useSpeechRecognition(handleVoiceCommand);

  useEffect(() => {
    if (session && state.status === 'idle') {
      controls.start(session.blocks);
    }
  }, [session, state.status, controls]);

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-slate-400">Séance introuvable</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 rounded-xl bg-slate-700 px-4 py-2 text-sm text-slate-200"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Finished screen
  if (state.status === 'finished' && finishedLog) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-6 text-center">
        <Trophy className="mb-4 h-16 w-16 text-amber-400" />
        <h1 className="mb-2 text-3xl font-bold text-slate-50">Bravo !</h1>
        <p className="mb-1 text-lg text-slate-300">{session.name}</p>
        <p className="mb-8 text-slate-400">
          Durée totale : {formatDuration(finishedLog.totalDuration)}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => exportLog(finishedLog)}
            className="flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-3 font-medium text-slate-200 transition-colors hover:bg-slate-600"
          >
            <Download className="h-5 w-5" />
            Exporter le log
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-500"
          >
            <ArrowLeft className="h-5 w-5" />
            Accueil
          </button>
        </div>
      </div>
    );
  }

  const { currentBlock, nextBlock, currentIndex, totalBlocks, countdown } = state;

  if (!currentBlock) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-slate-400">Chargement...</p>
      </div>
    );
  }

  const progressGlobal = totalBlocks > 0 ? (currentIndex + 1) / totalBlocks : 0;
  const hasTiming = currentBlock.type === 'exercise-timed' || currentBlock.type === 'rest';
  const color = blockColor(currentBlock.type);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-slate-400">{session.name}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={speech.supported ? speech.toggle : undefined}
            disabled={!speech.supported}
            className={`relative rounded-xl p-2 transition-colors ${
              !speech.supported || speech.error
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : speech.listening
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            aria-label={
              !speech.supported
                ? 'Commande vocale non supportée par ce navigateur'
                : speech.listening
                  ? 'Désactiver le micro'
                  : 'Activer le micro'
            }
            title={speech.error ?? (!speech.supported ? 'Commande vocale non supportée (utilisez Chrome)' : undefined)}
          >
            {speech.listening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            {speech.listening && (
              <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-red-400" />
            )}
          </button>
          <button
            onClick={() => setShowStopConfirm(true)}
            className="rounded-xl bg-slate-700 p-2 text-red-400 transition-colors hover:bg-red-600 hover:text-white"
            aria-label="Arrêter la séance"
          >
            <Square className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Voice feedback */}
      {speech.error && (
        <div className="mx-4 mb-2 rounded-xl bg-red-900/30 px-3 py-2 text-center text-xs text-red-300">
          {speech.error}
        </div>
      )}
      {speech.lastCommand && (
        <div className="mx-auto mb-2 rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-medium text-emerald-300 animate-pulse">
          Commande : &quot;{speech.lastCommand}&quot;
        </div>
      )}

      {/* Progress bar */}
      <div className="px-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressGlobal * 100}%`, backgroundColor: color }}
          />
        </div>
        <p className="mt-1 text-center text-xs text-slate-500">
          {currentIndex + 1} / {totalBlocks}
        </p>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        {/* Block type badge */}
        <span
          className="mb-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {currentBlock.type === 'rest' ? 'Repos' : currentBlock.type === 'exercise-reps' ? 'Reps' : 'Chrono'}
        </span>

        {/* Exercise name */}
        <h1 className="mb-6 text-center text-4xl font-bold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
          {blockLabel(currentBlock)}
        </h1>

        {/* Notes */}
        {(currentBlock.type === 'exercise-reps' || currentBlock.type === 'exercise-timed') &&
          currentBlock.notes && (
            <p className="mb-6 text-center text-sm text-slate-400">{currentBlock.notes}</p>
          )}

        {/* Countdown or reps */}
        {hasTiming ? (
          <ProgressRing
            progress={countdown.progress}
            size={220}
            strokeWidth={10}
            color={color}
          >
            <span className="text-5xl font-bold tabular-nums text-slate-50 sm:text-6xl">
              {countdown.remaining}
            </span>
          </ProgressRing>
        ) : (
          <div className="flex h-[220px] items-center justify-center">
            <span className="text-6xl font-bold text-slate-50 sm:text-7xl">
              {currentBlock.type === 'exercise-reps' ? currentBlock.reps : ''}
            </span>
          </div>
        )}

        {/* Next block preview */}
        {nextBlock && (
          <p className="mt-6 text-sm text-slate-500">
            Ensuite : {blockLabel(nextBlock)}
            {(nextBlock.type === 'exercise-timed' || nextBlock.type === 'rest') &&
              ` — ${formatDuration(nextBlock.duration)}`}
            {nextBlock.type === 'exercise-reps' && ` — ${nextBlock.reps} reps`}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="safe-bottom flex items-center justify-center gap-4 px-4 pb-8">
        <button
          onClick={controls.previous}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-700 text-slate-200 transition-all hover:bg-slate-600 active:scale-95"
          aria-label="Bloc précédent"
        >
          <SkipBack className="h-6 w-6" />
        </button>
        <button
          onClick={controls.togglePause}
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-white transition-all active:scale-95"
          style={{ backgroundColor: color }}
          aria-label={state.status === 'paused' ? 'Reprendre' : 'Pause'}
        >
          {state.status === 'paused' ? (
            <Play className="h-7 w-7" />
          ) : (
            <Pause className="h-7 w-7" />
          )}
        </button>
        <button
          onClick={controls.next}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-700 text-slate-200 transition-all hover:bg-slate-600 active:scale-95"
          aria-label="Bloc suivant"
        >
          <SkipForward className="h-6 w-6" />
        </button>
      </div>

      {/* Stop confirmation */}
      <ConfirmDialog
        open={showStopConfirm}
        onClose={() => setShowStopConfirm(false)}
        onConfirm={() => {
          controls.stop();
          speech.stop();
          navigate('/');
        }}
        title="Arrêter la séance"
        message="Voulez-vous vraiment arrêter la séance en cours ?"
        confirmLabel="Arrêter"
        danger
      />
    </div>
  );
}
