import type { Block, WorkoutLog } from '../types/workout';
import { flattenBlocks } from './flattenBlocks';

interface LogStats {
  totalExercises: number;
  totalReps: number;
  totalActiveTime: number;
  totalRestTime: number;
}

export function computeLogStats(blocks: Block[]): LogStats {
  const flat = flattenBlocks(blocks);
  let totalExercises = 0;
  let totalReps = 0;
  let totalActiveTime = 0;
  let totalRestTime = 0;

  for (const block of flat) {
    switch (block.type) {
      case 'exercise-reps':
        totalExercises++;
        totalReps += block.reps;
        break;
      case 'exercise-timed':
        totalExercises++;
        totalActiveTime += block.duration;
        break;
      case 'rest':
        totalRestTime += block.duration;
        break;
    }
  }

  return { totalExercises, totalReps, totalActiveTime, totalRestTime };
}

export function estimateCalories(log: WorkoutLog, weightKg: number): number {
  // Simplified MET-based estimation
  // Average MET for bodyweight exercises: ~5
  // For reps: estimate 3s per rep
  const repsTime = log.totalReps * 3; // seconds
  const activeSeconds = log.totalActiveTime + repsTime;
  const hours = activeSeconds / 3600;
  const avgMet = 5;
  return Math.round(avgMet * weightKg * hours);
}
