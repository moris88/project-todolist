# Project To-Do List

Applicazione web moderna per la gestione di attività (todo list) con supporto a categorie, priorità, scadenze e visualizzazione Kanban. Le note dei task supportano la sintassi **Markdown**.

## 🚀 Funzionalità principali

- **Gestione Task:** Creazione, modifica ed eliminazione con supporto a sottotask.
- **Priorità & Stati:** Livelli configurabili (Urgente, Alta, Media, Bassa) e vari stati di avanzamento.
- **Markdown:** Descrizione dei task in Markdown con anteprima in-editor.
- **Kanban & Lista:** Doppia visualizzazione per un monitoraggio ottimale.
- **Notifiche:** Supporto per scadenze e avvisi di ritardo.
- **Import/Export:** Supporto CSV per la portabilità dei dati.
- **Persistenza:** Salvataggio locale via `localStorage`.
- **UI/UX:** Design moderno con Tailwind CSS, animazioni con Framer Motion e supporto Dark Mode.

## 🛠️ Tecnologie

- **Core:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Linguaggio:** [TypeScript](https://www.typescriptlang.org/)
- **Stato:** [Jotai](https://jotai.org/) (Atomic state management)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animazioni:** [Framer Motion](https://www.framer.com/motion/)
- **Qualità del Codice:** [Biome](https://biomejs.dev/) (Linting & Formatting)
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 📂 Struttura del Progetto

- `src/atoms`: Definizione degli atomi Jotai per la gestione globale dello stato.
- `src/components`: Componenti React riutilizzabili e componenti UI di base.
- `src/hooks`: Hook personalizzati (es. notifiche).
- `src/types`: Definizioni dei tipi TypeScript.
- `src/utils`: Funzioni di utilità, costanti e logica di business (CSV, Todo logic).
- `test`: Suite di test per componenti e utilità.

## 🤖 Per Sviluppatori & AI

Questo repository è ottimizzato per la collaborazione con assistenti AI:

- **`TODO.md`**: Elenco delle feature e dei refactor da implementare. Consulta questo file per sapere cosa fare.
- **`CONTEXT.md`**: Guida dettagliata sull'architettura e sulle convenzioni del progetto per facilitare l'onboarding di nuove AI.

## ⚙️ Installazione ed Esecuzione

Assicurati di avere [Node.js](https://nodejs.org/) >= 24 e [pnpm](https://pnpm.io/) installati.

```bash
# Installa le dipendenze
pnpm install

# Avvia il server di sviluppo
pnpm dev

# Esegui i test
pnpm test

# Controlla il linting/formatting
pnpm biome:check
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000).

---

By [Moris](https://github.com/mauriziotolomeo)
