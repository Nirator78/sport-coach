import type { Block } from '../types/workout';

const DEFAULT_REPS_DURATION = 30;

export function estimateDuration(blocks: Block[]): number {
  let total = 0;
  for (const block of blocks) {
    switch (block.type) {
      case 'exercise-reps':
        total += DEFAULT_REPS_DURATION;
        break;
      case 'exercise-timed':
      case 'rest':
        total += block.duration;
        break;
      case 'repeat':
        total += block.times * estimateDuration(block.children);
        break;
    }
  }
  return total;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}min`;
  return `${mins}min ${secs}s`;
}
