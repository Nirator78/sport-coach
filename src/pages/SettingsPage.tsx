import { useState } from 'react';
import { Sun, Moon, Monitor, Trash2, Download, Upload } from 'lucide-react';
import { useTheme } from '../stores/themeStore';
import { useSettings } from '../stores/settingsStore';
import { useWorkout } from '../stores/workoutStore';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { sessions, logs } = useWorkout();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportAll = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      sessions: JSON.parse(localStorage.getItem('workout-sessions') ?? '[]'),
      logs: JSON.parse(localStorage.getItem('workout-logs') ?? '[]'),
      settings: JSON.parse(localStorage.getItem('workout-user-settings') ?? '{}'),
      preferences: {
        theme: localStorage.getItem('workout-theme'),
        soundMuted: localStorage.getItem('workout-sound-muted'),
        voiceEnabled: localStorage.getItem('workout-voice-enabled'),
        vibrationEnabled: localStorage.getItem('workout-vibration-enabled'),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `home-workout-backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Record<string, unknown>;
      if (data['sessions']) localStorage.setItem('workout-sessions', JSON.stringify(data['sessions']));
      if (data['logs']) localStorage.setItem('workout-logs', JSON.stringify(data['logs']));
      if (data['settings']) localStorage.setItem('workout-user-settings', JSON.stringify(data['settings']));
      const prefs = data['preferences'] as Record<string, string> | undefined;
      if (prefs) {
        if (prefs['theme']) localStorage.setItem('workout-theme', prefs['theme']);
        if (prefs['soundMuted']) localStorage.setItem('workout-sound-muted', prefs['soundMuted']);
        if (prefs['voiceEnabled']) localStorage.setItem('workout-voice-enabled', prefs['voiceEnabled']);
        if (prefs['vibrationEnabled']) localStorage.setItem('workout-vibration-enabled', prefs['vibrationEnabled']);
      }
      window.location.reload();
    } catch {
      alert('Fichier de sauvegarde invalide');
    }
    e.target.value = '';
  };

  const handleDeleteAll = () => {
    const keys = [
      'workout-sessions', 'workout-logs', 'workout-user-settings',
      'workout-theme', 'workout-sound-muted', 'workout-voice-enabled',
      'workout-vibration-enabled',
    ];
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-50">Réglages</h1>

      {/* Profile */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Profil</h2>
        <div className="space-y-4 rounded-2xl bg-white p-4 shadow dark:bg-slate-800">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Nom / Pseudo</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => updateSettings({ name: e.target.value })}
              placeholder="Optionnel"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              Poids (kg)
              <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">- pour l'estimation des calories</span>
            </label>
            <input
              type="number"
              min={20}
              max={300}
              value={settings.weight ?? ''}
              onChange={(e) => updateSettings({ weight: e.target.value ? Number(e.target.value) : null })}
              placeholder="Ex: 70"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
            />
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Apparence</h2>
        <div className="rounded-2xl bg-white p-4 shadow dark:bg-slate-800">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {themeOptions.map(({ value, label, icon: ThIcon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  theme === value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                <ThIcon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Données</h2>
        <div className="space-y-3 rounded-2xl bg-white p-4 shadow dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {sessions.length} séance{sessions.length !== 1 ? 's' : ''} · {logs.length} log{logs.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <Download className="h-4 w-4" />
              Exporter tout
            </button>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
              <Upload className="h-4 w-4" />
              Importer une sauvegarde
              <input type="file" accept=".json" onChange={handleImportAll} className="hidden" />
            </label>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer toutes mes données
          </button>
        </div>
      </section>

      {/* About */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">À propos</h2>
        <div className="rounded-2xl bg-white p-4 shadow dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-300">Home Workout v1.0.0</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Application de séances de sport à la maison. Toutes les données sont stockées localement.</p>
        </div>
      </section>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAll}
        title="Supprimer toutes les données"
        message="Cette action est irréversible. Toutes vos séances, logs et réglages seront supprimés."
        confirmLabel="Tout supprimer"
        danger
      />
    </div>
  );
}
