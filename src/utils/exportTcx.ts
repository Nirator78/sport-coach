import type { WorkoutLog } from '../types/workout';
import { flattenBlocks } from './flattenBlocks';

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function generateTcx(log: WorkoutLog): string {
  const flat = flattenBlocks(log.blocks);
  const startTime = new Date(log.startedAt);
  let elapsed = 0;

  const trackpoints = flat.map((block) => {
    const time = new Date(startTime.getTime() + elapsed * 1000).toISOString();
    let duration: number;
    switch (block.type) {
      case 'exercise-timed':
      case 'rest':
        duration = block.duration;
        break;
      case 'exercise-reps':
        duration = block.reps * 3; // ~3s per rep
        break;
      default:
        duration = 0;
    }
    elapsed += duration;
    return `        <Trackpoint>\n          <Time>${time}</Time>\n        </Trackpoint>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Other">
      <Id>${startTime.toISOString()}</Id>
      <Lap StartTime="${startTime.toISOString()}">
        <TotalTimeSeconds>${log.totalDuration}</TotalTimeSeconds>
        <Calories>${log.estimatedCalories ?? 0}</Calories>
        <Intensity>Active</Intensity>
        <TriggerMethod>Manual</TriggerMethod>
        <Track>
${trackpoints.join('\n')}
        </Track>
      </Lap>
      <Notes>${escapeXml(log.sessionName)} - Home Workout App</Notes>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;
}

export function exportTcx(log: WorkoutLog): void {
  const tcx = generateTcx(log);
  const blob = new Blob([tcx], { type: 'application/vnd.garmin.tcx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date(log.startedAt).toISOString().slice(0, 10);
  a.download = `workout_${log.sessionName.replace(/\s+/g, '_')}_${date}.tcx`;
  a.click();
  URL.revokeObjectURL(url);
}
