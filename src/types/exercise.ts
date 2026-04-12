export type ExerciseCategory = 'upper' | 'lower' | 'core' | 'cardio' | 'stretch' | 'full-body';
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'abs' | 'obliques' | 'full';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  description: string;
  defaultType: 'reps' | 'timed';
  defaultValue: number;
  difficulty: Difficulty;
  variants?: string[];
  met?: number;
  custom?: boolean;
}

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  upper: 'Haut du corps',
  lower: 'Bas du corps',
  core: 'Abdos / Core',
  cardio: 'Cardio',
  stretch: 'Étirements',
  'full-body': 'Full Body',
};

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  upper: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  lower: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  core: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  cardio: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  stretch: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  'full-body': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
};

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pectoraux',
  back: 'Dos',
  shoulders: 'Épaules',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quads: 'Quadriceps',
  hamstrings: 'Ischio-jambiers',
  glutes: 'Fessiers',
  calves: 'Mollets',
  abs: 'Abdos',
  obliques: 'Obliques',
  full: 'Complet',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};
