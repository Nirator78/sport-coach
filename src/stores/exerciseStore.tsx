import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { uid } from '../utils/uid';
import type { Exercise } from '../types/exercise';
import { BUILTIN_EXERCISES } from '../data/exercises';

interface ExerciseStore {
  exercises: Exercise[];
  customExercises: Exercise[];
  addCustomExercise: (exercise: Omit<Exercise, 'id' | 'custom'>) => Exercise;
  updateCustomExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteCustomExercise: (id: string) => void;
  getExercise: (id: string) => Exercise | undefined;
}

const ExerciseContext = createContext<ExerciseStore | null>(null);

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const [customExercises, setCustomExercises] = useLocalStorage<Exercise[]>('workout-custom-exercises', []);

  const exercises = useMemo(
    () => [...BUILTIN_EXERCISES, ...customExercises],
    [customExercises],
  );

  const addCustomExercise = useCallback(
    (exercise: Omit<Exercise, 'id' | 'custom'>): Exercise => {
      const newExercise: Exercise = { ...exercise, id: uid(), custom: true };
      setCustomExercises((prev) => [...prev, newExercise]);
      return newExercise;
    },
    [setCustomExercises],
  );

  const updateCustomExercise = useCallback(
    (id: string, updates: Partial<Exercise>) => {
      setCustomExercises((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      );
    },
    [setCustomExercises],
  );

  const deleteCustomExercise = useCallback(
    (id: string) => {
      setCustomExercises((prev) => prev.filter((e) => e.id !== id));
    },
    [setCustomExercises],
  );

  const getExercise = useCallback(
    (id: string) => exercises.find((e) => e.id === id),
    [exercises],
  );

  return (
    <ExerciseContext.Provider value={{ exercises, customExercises, addCustomExercise, updateCustomExercise, deleteCustomExercise, getExercise }}>
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExercises(): ExerciseStore {
  const ctx = useContext(ExerciseContext);
  if (!ctx) throw new Error('useExercises must be used within ExerciseProvider');
  return ctx;
}
