import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { uid } from '../utils/uid';
import type { WorkoutSession, WorkoutLog, Block } from '../types/workout';

interface WorkoutStore {
  sessions: WorkoutSession[];
  logs: WorkoutLog[];
  createSession: (name: string) => WorkoutSession;
  updateSession: (id: string, updates: Partial<Pick<WorkoutSession, 'name' | 'blocks'>>) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (id: string) => WorkoutSession | null;
  importSession: (session: WorkoutSession) => void;
  getSession: (id: string) => WorkoutSession | undefined;
  addLog: (log: WorkoutLog) => void;
}

const WorkoutContext = createContext<WorkoutStore | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>('workout-sessions', []);
  const [logs, setLogs] = useLocalStorage<WorkoutLog[]>('workout-logs', []);

  const createSession = useCallback(
    (name: string): WorkoutSession => {
      const session: WorkoutSession = {
        id: uid(),
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: [],
      };
      setSessions((prev) => [...prev, session]);
      return session;
    },
    [setSessions],
  );

  const updateSession = useCallback(
    (id: string, updates: Partial<Pick<WorkoutSession, 'name' | 'blocks'>>) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s,
        ),
      );
    },
    [setSessions],
  );

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    },
    [setSessions],
  );

  const duplicateSession = useCallback(
    (id: string): WorkoutSession | null => {
      const original = sessions.find((s) => s.id === id);
      if (!original) return null;

      const cloneBlocks = (blocks: Block[]): Block[] =>
        blocks.map((b) => {
          const cloned = { ...b, id: uid() };
          if (cloned.type === 'repeat') {
            return { ...cloned, children: cloneBlocks(cloned.children) };
          }
          return cloned;
        });

      const copy: WorkoutSession = {
        id: uid(),
        name: `${original.name} (copie)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: cloneBlocks(original.blocks),
      };
      setSessions((prev) => [...prev, copy]);
      return copy;
    },
    [sessions, setSessions],
  );

  const importSession = useCallback(
    (session: WorkoutSession) => {
      const imported: WorkoutSession = {
        ...session,
        id: uid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSessions((prev) => [...prev, imported]);
    },
    [setSessions],
  );

  const getSession = useCallback(
    (id: string) => sessions.find((s) => s.id === id),
    [sessions],
  );

  const addLog = useCallback(
    (log: WorkoutLog) => {
      setLogs((prev) => [...prev, log]);
    },
    [setLogs],
  );

  return (
    <WorkoutContext.Provider
      value={{
        sessions,
        logs,
        createSession,
        updateSession,
        deleteSession,
        duplicateSession,
        importSession,
        getSession,
        addLog,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutStore {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout must be used within WorkoutProvider');
  return ctx;
}
