import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  MonitorSmartphone,
  Vibrate,
  VibrateOff,
} from 'lucide-react';
import { useWorkout } from '../stores/workoutStore';
import { useTheme } from '../stores/themeStore';
import { useWorkoutPlayer } from '../hooks/useWorkoutPlayer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ProgressRing, getTimerColor } from '../components/ui/ProgressRing';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatDuration } from '../utils/estimateDuration';
import type { WorkoutLog } from '../types/workout';
import { exportLog } from '../utils/exportImport';
import { exportTcx } from '../utils/exportTcx';
import { HelpButton } from '../components/ui/HelpPanel';
import { useWakeLock } from '../hooks/useWakeLock';
import { useIsLandscape } from '../hooks/useOrientation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

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
  const transitionDirRef = useRef<'right' | 'left'>('right');
  const prevIndexRef = useRef(-1);

  const session = id ? getSession(id) : undefined;

  const handleFinish = useCallback(
    (log: WorkoutLog) => {
      addLog(log);
      setFinishedLog(log);
    },
    [addLog],
  );

  const [state, controls, settings] = useWorkoutPlayer(
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
  const wakeLock = useWakeLock();
  const isLandscape = useIsLandscape();
  const { resolved: resolvedTheme } = useTheme();
  const trackColor = resolvedTheme === 'dark' ? '#334155' : '#e2e8f0';

  const shortcutHandlers = useMemo(() => ({
    togglePause: controls.togglePause,
    next: controls.next,
    previous: controls.previous,
    openStop: () => setShowStopConfirm(true),
    toggleMic: speech.supported ? speech.toggle : undefined,
    toggleSound: () => settings.setSoundEnabled(!settings.soundEnabled),
    toggleVoice: () => settings.setVoiceEnabled(!settings.voiceEnabled),
  }), [controls, speech, settings]);

  useKeyboardShortcuts(shortcutHandlers);

  const hasStartedRef = useRef(false);
  useEffect(() => {
    if (session && state.status === 'idle' && !hasStartedRef.current) {
      hasStartedRef.current = true;
      controls.start(session.blocks);
      void wakeLock.acquire();
    }
  }, [session, state.status, controls, wakeLock]);

  // Release wake lock on finish
  useEffect(() => {
    if (state.status === 'finished') {
      void wakeLock.release();
    }
  }, [state.status, wakeLock]);

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-slate-500 dark:text-slate-400">Séance introuvable</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 rounded-xl bg-slate-200 px-4 py-2 text-sm text-slate-700 dark:bg-slate-700 dark:text-slate-200"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Finished screen
  if (state.status === 'finished' && finishedLog) {
    const timings = state.blockTimings;
    return (
      <div className="flex min-h-dvh flex-col items-center p-6">
        <div className="w-full max-w-md text-center">
          <Trophy className="mx-auto mb-4 h-16 w-16 text-amber-400" />
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Bravo !</h1>
          <p className="mb-1 text-lg text-slate-600 dark:text-slate-300">{session.name}</p>
          <p className="mb-6 text-slate-500 dark:text-slate-400">
            Durée totale : {formatDuration(finishedLog.totalDuration)}
          </p>

          {/* Block timings recap */}
          {timings.length > 0 && (
            <div className="mb-6 rounded-2xl bg-white p-4 text-left shadow dark:bg-slate-800">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Détail par exercice</h2>
              <div className="space-y-1.5">
                {timings.map((t, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          t.type === 'rest' ? 'bg-amber-400' : t.type === 'exercise-timed' ? 'bg-sky-400' : 'bg-emerald-400'
                        }`}
                      />
                      <span className="truncate text-sm text-slate-700 dark:text-slate-200">{t.name}</span>
                    </div>
                    <span className="shrink-0 tabular-nums text-sm font-medium text-slate-500 dark:text-slate-400">
                      {formatDuration(t.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => exportLog(finishedLog)}
              className="flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <Download className="h-5 w-5" />
              JSON
            </button>
            <button
              onClick={() => exportTcx(finishedLog)}
              className="flex items-center gap-2 rounded-xl bg-orange-100 px-4 py-3 font-medium text-orange-700 transition-colors hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
            >
              <Download className="h-5 w-5" />
              Strava (.tcx)
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
      </div>
    );
  }

  const { currentBlock, nextBlock, currentIndex, totalBlocks, countdown, elapsed } = state;

  // Track block transition direction
  if (currentIndex !== prevIndexRef.current && prevIndexRef.current !== -1) {
    transitionDirRef.current = currentIndex > prevIndexRef.current ? 'right' : 'left';
  }
  prevIndexRef.current = currentIndex;

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
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">{session.name}</span>
          <span className="tabular-nums text-sm font-medium text-slate-700 dark:text-slate-200">{formatDuration(elapsed)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Wake lock indicator */}
          {wakeLock.supported && wakeLock.active && (
            <span
              className="rounded-xl bg-slate-100 p-2 text-emerald-600 dark:bg-slate-800 dark:text-emerald-400"
              title="Écran maintenu allumé"
              aria-label="Wake Lock actif"
            >
              <MonitorSmartphone className="h-5 w-5" />
            </span>
          )}

          {/* Help */}
          <HelpButton variant="player" />

          {/* Sound toggle (beeps) */}
          <button
            onClick={() => settings.setSoundEnabled(!settings.soundEnabled)}
            className={`rounded-xl p-2 transition-colors ${
              settings.soundEnabled
                ? 'bg-slate-200 text-amber-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-amber-400 dark:hover:bg-slate-600'
                : 'bg-slate-100 text-slate-400 hover:text-slate-500 dark:bg-slate-800 dark:text-slate-600 dark:hover:text-slate-400'
            }`}
            aria-label={settings.soundEnabled ? 'Couper les bips' : 'Activer les bips'}
            title={settings.soundEnabled ? 'Bips activés' : 'Bips désactivés'}
          >
            {settings.soundEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </button>

          {/* Voice toggle (TTS) */}
          <button
            onClick={() => settings.setVoiceEnabled(!settings.voiceEnabled)}
            className={`rounded-xl p-2 transition-colors ${
              settings.voiceEnabled
                ? 'bg-slate-200 text-sky-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-sky-400 dark:hover:bg-slate-600'
                : 'bg-slate-100 text-slate-400 hover:text-slate-500 dark:bg-slate-800 dark:text-slate-600 dark:hover:text-slate-400'
            }`}
            aria-label={settings.voiceEnabled ? 'Couper la voix' : 'Activer la voix'}
            title={settings.voiceEnabled ? 'Synthèse vocale activée' : 'Synthèse vocale désactivée'}
          >
            {settings.voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>

          {/* Vibration toggle */}
          {settings.vibrationSupported && (
            <button
              onClick={() => settings.setVibrationEnabled(!settings.vibrationEnabled)}
              className={`rounded-xl p-2 transition-colors ${
                settings.vibrationEnabled
                  ? 'bg-slate-200 text-violet-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-violet-400 dark:hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-400 hover:text-slate-500 dark:bg-slate-800 dark:text-slate-600 dark:hover:text-slate-400'
              }`}
              aria-label={settings.vibrationEnabled ? 'Couper les vibrations' : 'Activer les vibrations'}
              title={settings.vibrationEnabled ? 'Vibrations activées' : 'Vibrations désactivées'}
            >
              {settings.vibrationEnabled ? <Vibrate className="h-5 w-5" /> : <VibrateOff className="h-5 w-5" />}
            </button>
          )}

          {/* Mic (speech recognition) */}
          <button
            onClick={speech.supported ? speech.toggle : undefined}
            disabled={!speech.supported}
            className={`relative rounded-xl p-2 transition-colors ${
              !speech.supported || speech.error
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                : speech.listening
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            aria-label={
              !speech.supported
                ? 'Commande vocale non supportée par ce navigateur'
                : speech.listening
                  ? 'Désactiver le micro'
                  : 'Activer le micro'
            }
            title={speech.error ?? (!speech.supported ? 'Commande vocale non supportée (utilisez Chrome)' : speech.listening ? 'Micro activé' : 'Commande vocale')}
          >
            {speech.listening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            {speech.listening && (
              <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-red-400" />
            )}
          </button>

          {/* Stop */}
          <button
            onClick={() => setShowStopConfirm(true)}
            className="rounded-xl bg-slate-200 p-2 text-red-500 transition-colors hover:bg-red-600 hover:text-white dark:bg-slate-700 dark:text-red-400"
            aria-label="Arrêter la séance"
          >
            <Square className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Voice feedback */}
      {speech.error && (
        <div className="mx-4 mb-2 rounded-xl bg-red-100 px-3 py-2 text-center text-xs text-red-600 dark:bg-red-900/30 dark:text-red-300">
          {speech.error}
        </div>
      )}
      {speech.lastCommand && (
        <div className="mx-auto mb-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 animate-pulse dark:bg-emerald-600/20 dark:text-emerald-300">
          Commande : &quot;{speech.lastCommand}&quot;
        </div>
      )}

      {/* Progress bar */}
      <div className="px-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressGlobal * 100}%`, backgroundColor: color }}
          />
        </div>
        <p className="mt-1 text-center text-xs text-slate-500">
          {currentIndex + 1} / {totalBlocks}
        </p>
      </div>

      {/* Main content + Controls */}
      <div className={`flex flex-1 ${isLandscape ? 'flex-row items-center gap-4 px-4 py-2' : 'flex-col'}`}>
        {/* Exercise info & timer */}
        <div
          key={`block-${currentIndex}`}
          className={`flex flex-col items-center justify-center motion-reduce:!animate-none ${isLandscape ? 'flex-1' : 'flex-1 px-4 py-8'}`}
          style={{
            animation: `${transitionDirRef.current === 'right' ? 'slideFromRight' : 'slideFromLeft'} 300ms ease-out`,
          }}
        >
          {/* Block type badge */}
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${isLandscape ? 'mb-2' : 'mb-4'}`}
            style={{ backgroundColor: `${color}22`, color }}
          >
            {currentBlock.type === 'rest' ? 'Repos' : currentBlock.type === 'exercise-reps' ? 'Reps' : 'Chrono'}
          </span>

          {/* Exercise name */}
          <h1 className={`text-center font-bold leading-tight text-slate-900 dark:text-slate-50 ${isLandscape ? 'mb-2 text-2xl' : 'mb-6 text-4xl sm:text-5xl lg:text-6xl'}`}>
            {blockLabel(currentBlock)}
          </h1>

          {/* Notes */}
          {!isLandscape && (currentBlock.type === 'exercise-reps' || currentBlock.type === 'exercise-timed') &&
            currentBlock.notes && (
              <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">{currentBlock.notes}</p>
            )}

          {/* Countdown or reps */}
          {hasTiming ? (
            (() => {
              const timerStyle = getTimerColor(countdown.remaining, countdown.total);
              const ringSize = isLandscape ? 150 : 220;
              return (
                <ProgressRing
                  progress={countdown.progress}
                  size={ringSize}
                  strokeWidth={isLandscape ? 8 : 10}
                  color={timerStyle.color}
                  trackColor={trackColor}
                  pulsing={timerStyle.pulsing}
                >
                  <span
                    className={`font-bold tabular-nums transition-colors duration-500 ${isLandscape ? 'text-4xl' : 'text-5xl sm:text-6xl'}`}
                    style={{ color: timerStyle.color }}
                  >
                    {countdown.remaining}
                  </span>
                </ProgressRing>
              );
            })()
          ) : (
            <div className={`flex items-center justify-center ${isLandscape ? 'h-[150px]' : 'h-[220px]'}`}>
              <span className={`font-bold text-slate-900 dark:text-slate-50 ${isLandscape ? 'text-5xl' : 'text-6xl sm:text-7xl'}`}>
                {currentBlock.type === 'exercise-reps' ? currentBlock.reps : ''}
              </span>
            </div>
          )}

          {/* Next block preview */}
          {nextBlock && !isLandscape && (
            <p className="mt-6 text-sm text-slate-500">
              Ensuite : {blockLabel(nextBlock)}
              {(nextBlock.type === 'exercise-timed' || nextBlock.type === 'rest') &&
                ` — ${formatDuration(nextBlock.duration)}`}
              {nextBlock.type === 'exercise-reps' && ` — ${nextBlock.reps} reps`}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className={`safe-bottom flex items-center justify-center gap-4 ${isLandscape ? 'flex-col px-4' : 'px-4 pb-8'}`}>
          <button
            onClick={controls.previous}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
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
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            aria-label="Bloc suivant"
          >
            <SkipForward className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Share panel */}
      {/* Stop confirmation */}
      <ConfirmDialog
        open={showStopConfirm}
        onClose={() => setShowStopConfirm(false)}
        onConfirm={() => {
          controls.stop();
          speech.stop();
          void wakeLock.release();
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
