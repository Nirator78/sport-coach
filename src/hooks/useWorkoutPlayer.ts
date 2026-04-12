import { useState, useCallback, useRef, useEffect } from 'react';
import type { Block, WorkoutLog } from '../types/workout';
import { flattenBlocks } from '../utils/flattenBlocks';
import { useCountdown } from './useCountdown';
import { useAudioFeedback } from './useAudioFeedback';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { uid } from '../utils/uid';

type PlayerStatus = 'idle' | 'running' | 'paused' | 'finished';

interface PlayerState {
  status: PlayerStatus;
  flatBlocks: Block[];
  currentIndex: number;
  currentBlock: Block | null;
  nextBlock: Block | null;
  totalBlocks: number;
  countdown: { remaining: number; total: number; isRunning: boolean; progress: number };
}

interface PlayerControls {
  start: (blocks: Block[]) => void;
  next: () => void;
  previous: () => void;
  togglePause: () => void;
  stop: () => void;
}

interface PlayerSettings {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
}

export function useWorkoutPlayer(
  sessionId: string,
  sessionName: string,
  onFinish: (log: WorkoutLog) => void,
): [PlayerState, PlayerControls, PlayerSettings] {
  const [flatBlocks, setFlatBlocks] = useState<Block[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const startTimeRef = useRef<string>(new Date().toISOString());
  const blocksSnapshotRef = useRef<Block[]>([]);
  const { tickBeep, transitionBeep, finishBeep, muted: soundMuted, setMuted: setSoundMuted } = useAudioFeedback();
  const { announce, stop: stopTts, enabled: voiceEnabled, setEnabled: setVoiceEnabled } = useSpeechSynthesis();
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const handleCountdownComplete = useCallback(() => {
    // Will be handled by the effect that watches currentIndex
  }, []);

  const [countdown, countdownControls] = useCountdown(handleCountdownComplete);

  const goToBlock = useCallback(
    (index: number, blocks: Block[]) => {
      const block = blocks[index];
      if (!block) return;
      if (block.type === 'exercise-timed' || block.type === 'rest') {
        countdownControls.start(block.duration);
      } else {
        countdownControls.reset();
      }
      transitionBeep();
      announce(block);
    },
    [countdownControls, transitionBeep, announce],
  );

  // Beep on last 3 seconds
  useEffect(() => {
    if (countdown.isRunning && countdown.remaining > 0 && countdown.remaining <= 3) {
      tickBeep();
    }
  }, [countdown.remaining, countdown.isRunning, tickBeep]);

  // Auto-advance when countdown reaches 0
  useEffect(() => {
    if (status !== 'running') return;
    const block = flatBlocks[currentIndex];
    if (!block) return;

    if (
      (block.type === 'exercise-timed' || block.type === 'rest') &&
      countdown.remaining === 0 &&
      !countdown.isRunning &&
      countdown.total > 0
    ) {
      // Auto-advance
      const nextIdx = currentIndex + 1;
      if (nextIdx >= flatBlocks.length) {
        setStatus('finished');
        finishBeep();
        stopTts();
        const log: WorkoutLog = {
          id: uid(),
          sessionId,
          sessionName,
          startedAt: startTimeRef.current,
          completedAt: new Date().toISOString(),
          totalDuration: Math.round((Date.now() - new Date(startTimeRef.current).getTime()) / 1000),
          blocks: blocksSnapshotRef.current,
        };
        onFinishRef.current(log);
      } else {
        setCurrentIndex(nextIdx);
        goToBlock(nextIdx, flatBlocks);
      }
    }
  }, [countdown.remaining, countdown.isRunning, countdown.total, status, currentIndex, flatBlocks, finishBeep, goToBlock, sessionId, sessionName, stopTts]);

  const start = useCallback(
    (blocks: Block[]) => {
      const flat = flattenBlocks(blocks);
      setFlatBlocks(flat);
      blocksSnapshotRef.current = blocks;
      setCurrentIndex(0);
      setStatus('running');
      startTimeRef.current = new Date().toISOString();
      if (flat.length > 0) {
        goToBlock(0, flat);
      }
    },
    [goToBlock],
  );

  const next = useCallback(() => {
    if (status !== 'running' && status !== 'paused') return;
    const nextIdx = currentIndex + 1;
    if (nextIdx >= flatBlocks.length) {
      setStatus('finished');
      finishBeep();
      stopTts();
      const log: WorkoutLog = {
        id: uid(),
        sessionId,
        sessionName,
        startedAt: startTimeRef.current,
        completedAt: new Date().toISOString(),
        totalDuration: Math.round((Date.now() - new Date(startTimeRef.current).getTime()) / 1000),
        blocks: blocksSnapshotRef.current,
      };
      onFinishRef.current(log);
      return;
    }
    setCurrentIndex(nextIdx);
    if (status === 'paused') setStatus('running');
    goToBlock(nextIdx, flatBlocks);
  }, [status, currentIndex, flatBlocks, finishBeep, goToBlock, sessionId, sessionName, stopTts]);

  const previous = useCallback(() => {
    if (status !== 'running' && status !== 'paused') return;
    const prevIdx = Math.max(0, currentIndex - 1);
    setCurrentIndex(prevIdx);
    if (status === 'paused') setStatus('running');
    goToBlock(prevIdx, flatBlocks);
  }, [status, currentIndex, flatBlocks, goToBlock]);

  const togglePause = useCallback(() => {
    if (status === 'running') {
      setStatus('paused');
      countdownControls.pause();
    } else if (status === 'paused') {
      setStatus('running');
      countdownControls.resume();
    }
  }, [status, countdownControls]);

  const stop = useCallback(() => {
    setStatus('idle');
    countdownControls.reset();
    setCurrentIndex(0);
    setFlatBlocks([]);
    stopTts();
  }, [countdownControls, stopTts]);

  const currentBlock = flatBlocks[currentIndex] ?? null;
  const nextBlock = flatBlocks[currentIndex + 1] ?? null;

  return [
    {
      status,
      flatBlocks,
      currentIndex,
      currentBlock,
      nextBlock,
      totalBlocks: flatBlocks.length,
      countdown,
    },
    { start, next, previous, togglePause, stop },
    {
      soundEnabled: !soundMuted,
      setSoundEnabled: (v: boolean) => setSoundMuted(!v),
      voiceEnabled,
      setVoiceEnabled,
    },
  ];
}
