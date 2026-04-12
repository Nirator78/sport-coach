import type { WorkoutSession, WorkoutLog } from '../types/workout';

export function exportSession(session: WorkoutSession): void {
  const data = JSON.stringify(session, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.name.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportLog(log: WorkoutLog): void {
  const data = JSON.stringify(log, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `log_${log.sessionName.replace(/\s+/g, '_')}_${new Date(log.startedAt).toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSession(file: File): Promise<WorkoutSession> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const session = JSON.parse(reader.result as string) as WorkoutSession;
        if (!session.id || !session.name || !Array.isArray(session.blocks)) {
          reject(new Error('Format de fichier invalide'));
          return;
        }
        resolve(session);
      } catch {
        reject(new Error('Fichier JSON invalide'));
      }
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}
