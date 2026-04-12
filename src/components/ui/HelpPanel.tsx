import { useState } from 'react';
import {
  HelpCircle,
  X,
  Bell,
  Volume2,
  Mic,
  Play,
  Pencil,
  Copy,
  Trash2,
  Upload,
  Download,
  SkipBack,
  SkipForward,
  Pause,
  Square,
  GripVertical,
} from 'lucide-react';

interface HelpItem {
  icon: React.ReactNode;
  label: string;
  description: string;
}

function Section({ title, items }: { title: string; items: HelpItem[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 text-slate-400">{item.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-200">{item.label}</p>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ICO = "h-4 w-4";

const HOME_SECTIONS: { title: string; items: HelpItem[] }[] = [
  {
    title: 'Gestion des séances',
    items: [
      { icon: <Play className={ICO} />, label: 'Lancer', description: 'Démarre le lecteur pour exécuter la séance' },
      { icon: <Pencil className={ICO} />, label: 'Éditer', description: 'Ouvre l\'éditeur de blocs pour modifier la séance' },
      { icon: <Copy className={ICO} />, label: 'Dupliquer', description: 'Crée une copie de la séance' },
      { icon: <Trash2 className={ICO} />, label: 'Supprimer', description: 'Supprime la séance (irréversible)' },
    ],
  },
  {
    title: 'Import / Export',
    items: [
      { icon: <Upload className={ICO} />, label: 'Importer', description: 'Charger une séance depuis un fichier JSON' },
      { icon: <Download className={ICO} />, label: 'Exporter', description: 'Disponible dans l\'éditeur — télécharge la séance en JSON' },
    ],
  },
  {
    title: 'Éditeur de séance',
    items: [
      { icon: <GripVertical className={ICO} />, label: 'Glisser-déposer', description: 'Maintenez et déplacez un bloc pour le réordonner' },
      { icon: <span className="flex h-4 w-4 items-center justify-center text-[10px] font-bold text-emerald-400">R</span>, label: 'Exercice (reps)', description: 'Bloc avec un nombre de répétitions — passage manuel au suivant' },
      { icon: <span className="flex h-4 w-4 items-center justify-center text-[10px] font-bold text-sky-400">C</span>, label: 'Exercice (chrono)', description: 'Bloc avec un compte à rebours automatique' },
      { icon: <span className="flex h-4 w-4 items-center justify-center text-[10px] font-bold text-amber-400">P</span>, label: 'Repos', description: 'Pause chronométrée entre les exercices' },
      { icon: <span className="flex h-4 w-4 items-center justify-center text-[10px] font-bold text-violet-400">×</span>, label: 'Répétition', description: 'Groupe de blocs répété N fois (1 niveau max)' },
    ],
  },
];

const PLAYER_SECTIONS: { title: string; items: HelpItem[] }[] = [
  {
    title: 'Contrôles',
    items: [
      { icon: <SkipBack className={ICO} />, label: 'Précédent', description: 'Revenir au bloc précédent' },
      { icon: <Pause className={ICO} />, label: 'Pause / Reprendre', description: 'Met en pause ou reprend le compte à rebours' },
      { icon: <SkipForward className={ICO} />, label: 'Suivant', description: 'Passer au bloc suivant' },
      { icon: <Square className={ICO} />, label: 'Stop', description: 'Arrêter la séance (confirmation demandée)' },
    ],
  },
  {
    title: 'Options audio',
    items: [
      { icon: <Bell className={ICO} />, label: 'Bips sonores', description: 'Bip à 3-2-1 secondes, double bip entre blocs, triple bip en fin de séance' },
      { icon: <Volume2 className={ICO} />, label: 'Synthèse vocale', description: 'Annonce le nom et la durée de chaque exercice à voix haute' },
      { icon: <Mic className={ICO} />, label: 'Commande vocale', description: 'Contrôler la séance à la voix (Chrome uniquement)' },
    ],
  },
  {
    title: 'Commandes vocales',
    items: [
      { icon: <SkipForward className={ICO} />, label: '"suivant" / "prochain" / "next" / "go"', description: 'Passe au bloc suivant' },
      { icon: <SkipBack className={ICO} />, label: '"précédent" / "retour"', description: 'Revient au bloc précédent' },
      { icon: <Pause className={ICO} />, label: '"pause" / "stop" / "reprendre" / "resume"', description: 'Met en pause ou reprend' },
    ],
  },
];

export function HelpButton({ variant }: { variant: 'home' | 'player' }) {
  const [open, setOpen] = useState(false);
  const sections = variant === 'home' ? HOME_SECTIONS : PLAYER_SECTIONS;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`rounded-xl p-2 transition-colors ${
          variant === 'player'
            ? 'bg-slate-700 text-slate-400 hover:text-slate-200'
            : 'flex items-center gap-2 bg-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-600'
        }`}
        aria-label="Aide"
        title="Aide"
      >
        <HelpCircle className={variant === 'player' ? 'h-5 w-5' : 'h-4 w-4'} />
        {variant === 'home' && <span>Aide</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-12 sm:items-center sm:pt-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="relative w-full max-w-md rounded-2xl bg-slate-800 p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Aide"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-50">
                {variant === 'home' ? 'Guide de l\'application' : 'Aide du lecteur'}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
              {sections.map((section) => (
                <Section key={section.title} title={section.title} items={section.items} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
