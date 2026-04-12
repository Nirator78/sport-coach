# Home Workout

Application web pour construire et exécuter des séances de sport a la maison.
Editeur visuel par blocs, lecteur avec compte a rebours et signaux sonores, commande vocale.

100% local, aucun backend, donnees stockees en localStorage.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Web Speech API (commande vocale, Chrome uniquement)
- Web Audio API (signaux sonores)

## Installation

```bash
npm install
```

## Lancer en dev

```bash
npm run dev
```

Ouvrir http://localhost:5173

## Build production

```bash
npm run build
npm run preview
```

## Commande vocale

La reconnaissance vocale necessite **Chrome**. Commandes supportees :

- "suivant" / "prochain" / "next" / "go"
- "precedent" / "retour"
- "pause" / "stop" / "reprendre" / "resume"
