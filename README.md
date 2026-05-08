# Project To-Do List

Applicazione web moderna per la gestione di attività con supporto a progetti, sprint, priorità, scadenze, cestino e visualizzazione calendario. Le note dei task supportano la sintassi **Markdown**.

## Funzionalità principali

- **Gestione Task:** Creazione, modifica ed eliminazione con supporto a sottotask (con priorità e stato propri).
- **Priorità & Stati:** Livelli configurabili (Urgente, Alta, Media, Bassa) e vari stati di avanzamento (Backlog, Todo, In Progress, Review, Testing, Blocked, Paused, Done, Archived).
- **Markdown:** Descrizione dei task in Markdown con anteprima in-editor.
- **Progetti:** Associazione dei task a progetti con colore, priorità e stato (Attivo, In pausa, Completato, Archiviato).
- **Sprint:** Associazione dei task a sprint collegati obbligatoriamente a un progetto, con date di inizio/fine e stato (Planning, Attivo, Completato, Annullato).
- **Filtri:** Filtro task per progetto e/o sprint dalla vista compiti.
- **Cestino:** Eliminazione soft con possibilità di ripristino; eliminazione definitiva dalla sezione Cestino.
- **Vista Calendario:** Visualizzazione dei task con data di scadenza su un calendario in italiano; click su task per aprire il dettaglio/modifica.
- **Import/Export CSV:** Portabilità completa dei dati (include projectId, sprintId, deletedAt, priority/status dei sottotask).
- **Notifiche:** Avviso in-app per task in scadenza o scaduti.
- **Persistenza:** Salvataggio locale via `localStorage` con pattern a indice separato per le ottimizzazioni di lettura.
- **Internazionalizzazione:** Supporto italiano e inglese con cambio lingua live.
- **Dark Mode:** Tema chiaro/scuro con persistenza.
- **UI/UX:** Design moderno con Tailwind CSS v4, animazioni con Framer Motion e layout responsive.

## Tecnologie

- **Core:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Linguaggio:** [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Stato:** [Jotai](https://jotai.org/) (Atomic state management)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`, senza PostCSS)
- **Date:** [moment.js](https://momentjs.com/) con locale italiano
- **Animazioni:** [Framer Motion](https://www.framer.com/motion/)
- **Qualità del Codice:** [Biome](https://biomejs.dev/) (Linting & Formatting)
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Struttura del Progetto

- `src/atoms`: Atomi Jotai per lo stato globale (todo, progetti, sprint, cestino, navigazione, preferenze).
- `src/components`: Componenti React (viste, modali, header, form).
- `src/components/UI`: Componenti UI atomici riutilizzabili (Button, Input, Select, Modal, DatePicker, ecc.).
- `src/hooks`: Hook personalizzati (es. notifiche scadenze).
- `src/types`: Definizioni dei tipi TypeScript (Todo, Project, Sprint, Comment, Priority, Status, ecc.).
- `src/utils`: Funzioni pure, costanti, logica CSV e localStorage.
- `test`: Suite di test per componenti e utilità.

## Per Sviluppatori & AI

- **`TODO.md`**: Elenco delle feature e dei refactor da implementare. Punto di ingresso per i task.
- **`CONTEXT.md`**: Guida dettagliata sull'architettura e sulle convenzioni del progetto.

## Installazione ed Esecuzione

Richiede [Node.js](https://nodejs.org/) >= 24 e [pnpm](https://pnpm.io/).

```bash
# Installa le dipendenze
pnpm install

# Avvia il server di sviluppo
pnpm dev

# Esegui i test
pnpm test

# Controlla il linting/formatting
pnpm biome:check

# Correggi automaticamente linting/formatting
pnpm biome:fix

# Build di produzione
pnpm build
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000).

---

By [Moris](https://github.com/mauriziotolomeo)
