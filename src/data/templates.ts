import type { Block } from '../types/workout';
import { uid } from '../utils/uid';

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number; // seconds
  blocks: () => Block[]; // factory to generate fresh IDs each time
}

function reps(name: string, count: number, notes?: string): Block {
  return { id: uid(), type: 'exercise-reps', name, reps: count, notes };
}

function timed(name: string, duration: number, notes?: string): Block {
  return { id: uid(), type: 'exercise-timed', name, duration, notes };
}

function rest(duration: number): Block {
  return { id: uid(), type: 'rest', duration };
}

function repeat(times: number, children: Block[]): Block {
  return { id: uid(), type: 'repeat', times, children };
}

export const TEMPLATES: SessionTemplate[] = [
  {
    id: 'tabata',
    name: 'Tabata classique',
    description: '8 rounds de 20s d\'effort / 10s de repos. Intense et rapide.',
    difficulty: 'hard',
    estimatedDuration: 240,
    blocks: () => [
      repeat(8, [
        timed('Exercice intense', 20, 'Burpees, squats sautés, mountain climbers...'),
        rest(10),
      ]),
    ],
  },
  {
    id: 'hiit-full-body',
    name: 'HIIT Full Body',
    description: '10 exercices enchaînés avec repos courts. Travail complet du corps.',
    difficulty: 'hard',
    estimatedDuration: 600,
    blocks: () => [
      timed('Jumping Jacks', 40),
      rest(20),
      timed('Squats', 40),
      rest(20),
      timed('Pompes', 40),
      rest(20),
      timed('Fentes alternées', 40),
      rest(20),
      timed('Mountain Climbers', 40),
      rest(20),
      timed('Burpees', 40),
      rest(20),
      timed('Planche', 40),
      rest(20),
      timed('Squats sautés', 40),
      rest(20),
      timed('Dips sur chaise', 40),
      rest(20),
      timed('Gainage latéral', 40),
    ],
  },
  {
    id: 'upper-body',
    name: 'Haut du corps',
    description: 'Pompes, dips et épaules. Renforcement du buste sans matériel.',
    difficulty: 'medium',
    estimatedDuration: 900,
    blocks: () => [
      repeat(3, [
        reps('Pompes classiques', 12),
        rest(45),
        reps('Pompes diamant', 10, 'Mains rapprochées, coudes le long du corps'),
        rest(45),
        reps('Dips sur chaise', 12, 'Dos face à la chaise, descendre jusqu\'à 90°'),
        rest(45),
        reps('Pike Push-ups', 10, 'Position V inversé, travaille les épaules'),
        rest(60),
      ]),
    ],
  },
  {
    id: 'lower-body',
    name: 'Bas du corps',
    description: 'Squats, fentes et isométrie. Cuisses et fessiers au programme.',
    difficulty: 'medium',
    estimatedDuration: 840,
    blocks: () => [
      repeat(3, [
        reps('Squats', 15),
        rest(40),
        reps('Fentes avant alternées', 12, '12 par jambe'),
        rest(40),
        timed('Chaise (wall sit)', 40, 'Dos plaqué au mur, cuisses parallèles au sol'),
        rest(40),
        reps('Squats sumo', 15, 'Pieds écartés, pointes vers l\'extérieur'),
        rest(60),
      ]),
    ],
  },
  {
    id: 'stretching',
    name: 'Stretching / Récup',
    description: 'Étirements doux pour la récupération. Respiration lente.',
    difficulty: 'easy',
    estimatedDuration: 600,
    blocks: () => [
      timed('Étirement quadriceps debout', 30, 'Tenir le pied derrière, 30s par jambe'),
      rest(10),
      timed('Étirement ischio-jambiers', 30, 'Jambe tendue sur un support, pencher le buste'),
      rest(10),
      timed('Étirement mollets', 30, 'Appui contre le mur, jambe arrière tendue'),
      rest(10),
      timed('Étirement pectoraux', 30, 'Bras contre le mur, tourner le buste'),
      rest(10),
      timed('Étirement épaules', 30, 'Bras tendu devant, tirer avec l\'autre main'),
      rest(10),
      timed('Étirement dos (chat/vache)', 45, 'À quatre pattes, alterner dos rond et dos creux'),
      rest(10),
      timed('Posture de l\'enfant', 45, 'Genoux au sol, bras tendus devant, relâcher'),
      rest(10),
      timed('Étirement hanches (pigeon)', 40, '40s par côté, descendre progressivement'),
    ],
  },
  {
    id: 'core-abs',
    name: 'Core / Abdos',
    description: 'Gainage et exercices abdominaux. Renforcement de la sangle abdominale.',
    difficulty: 'medium',
    estimatedDuration: 720,
    blocks: () => [
      repeat(3, [
        timed('Planche frontale', 30, 'Coudes au sol, corps aligné'),
        rest(15),
        reps('Crunchs', 20, 'Regard vers le plafond, décoller les épaules'),
        rest(15),
        timed('Mountain Climbers', 30, 'Ramener les genoux rapidement vers la poitrine'),
        rest(15),
        timed('Gainage latéral droit', 25),
        rest(10),
        timed('Gainage latéral gauche', 25),
        rest(30),
      ]),
    ],
  },
];
