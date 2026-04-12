export type BlockType = 'exercise-reps' | 'exercise-timed' | 'rest' | 'repeat';

interface BlockBase {
  id: string;
  type: BlockType;
}

export interface ExerciseRepsBlock extends BlockBase {
  type: 'exercise-reps';
  name: string;
  reps: number;
  notes?: string;
}

export interface ExerciseTimedBlock extends BlockBase {
  type: 'exercise-timed';
  name: string;
  duration: number;
  notes?: string;
}

export interface RestBlock extends BlockBase {
  type: 'rest';
  duration: number;
}

export interface RepeatBlock extends BlockBase {
  type: 'repeat';
  times: number;
  children: Block[];
}

export type Block = ExerciseRepsBlock | ExerciseTimedBlock | RestBlock | RepeatBlock;

export interface WorkoutSession {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  blocks: Block[];
}

export interface WorkoutLog {
  id: string;
  sessionId: string;
  sessionName: string;
  startedAt: string;
  completedAt: string | null;
  totalDuration: number;
  blocks: Block[];
  completed: boolean;
  totalExercises: number;
  totalReps: number;
  totalActiveTime: number;
  totalRestTime: number;
  estimatedCalories?: number;
}
