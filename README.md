# Project To-Do List

Applicazione web per la gestione di attività (todo list) con supporto a categorie, priorità, scadenze e visualizzazione Kanban. Le note dei task supportano la sintassi **Markdown**.

## Funzionalità principali

- Creazione, modifica ed eliminazione di task
- Priorità configurabile (Urgente, Alta, Media, Bassa)
- Categorie: *Da fare*, *In corso*, *Completato*
- Data di scadenza con notifiche di ritardo
- Visualizzazione Kanban e lista
- Descrizione dei task in Markdown con anteprima in-editor
- Import / Export CSV
- Persistenza locale via `localStorage`

## Tecnologie

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jotai](https://jotai.org/) — state management
- [Framer Motion](https://www.framer.com/motion/) — animazioni
- [dnd-kit](https://dndkit.com/) — drag & drop Kanban
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)

## Installazione

Assicurati di avere [Node.js](https://nodejs.org/) >= 18 e [pnpm](https://pnpm.io/) installati.

```bash
# Clona il repository
git clone https://github.com/moris88/project-todolist.git
cd project-todolist

# Installa le dipendenze
pnpm install
```

## Esecuzione in locale

```bash
pnpm dev
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000).

Altri comandi utili:

```bash
pnpm build      # Build di produzione
pnpm preview    # Anteprima del build
pnpm test       # Esecuzione dei test
pnpm lint       # Lint del codice
```

## Deploy su Vercel

Il progetto è deployato automaticamente su [Vercel](https://vercel.com/) ad ogni push sul branch `main`.

Per effettuare il deploy manuale:

1. Collega il repository GitHub al tuo account Vercel
2. Vercel rileva automaticamente il framework Vite
3. Impostazioni di build consigliate:
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`

---

By [Moris](https://github.com/moris88)
