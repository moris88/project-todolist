# Project Context (For AI Assistants)

Questo documento fornisce il contesto tecnico e architetturale necessario per un assistente AI per comprendere, modificare e implementare nuove funzionalità in questo progetto.

## 🎯 Obiettivo del Progetto

Un'applicazione di gestione task (Todo List) avanzata, con supporto per sottotask, commenti, priorità, stati e visualizzazione Kanban/Lista.

## 🛠️ Stack Tecnologico

- **Framework:** React 19 (Functional Components, Hooks).
- **Build Tool:** Vite.
- **Linguaggio:** TypeScript (Strict mode).
- **State Management:** Jotai (Atomic state). Gli atomi sono definiti in `src/atoms/atoms.ts`.
- **Styling:** Tailwind CSS.
- **Animazioni:** Framer Motion.
- **Testing:** Vitest + React Testing Library.
- **Linting/Formatting:** Biome.

## 🏗️ Architettura e Convenzioni

### 1. Gestione dello Stato (Jotai)

Lo stato globale è gestito tramite atomi Jotai.

- `todoListAtom`: Array di oggetti `Todo`.
- `commentsAtom`: Array di commenti associati ai task.
- `languageAtom`, `darkModeAtom`, `tagsAtom`: Preferenze persistite tramite `localStorage`.

### 2. Modelli Dati (`src/types/global.d.ts`)

- **Todo:** L'entità principale. Contiene metadati, priorità, stato, sottotask e tag.
- **SubTask:** Task annidati all'interno di un Todo.
- **Comment:** Commenti associati a un `todoId`.
- **Priority:** `low`, `medium`, `high`, `urgent`.
- **Status:** `backlog`, `todo`, `progress`, `review`, `testing`, `blocked`, `paused`, `done`, `archived`.

### 3. Logica di Business (`src/utils`)

- `todo.ts`: Funzioni pure per la manipolazione dei task (add, remove, toggle).
- `csv.ts`: Logica di importazione ed esportazione dei dati.
- `constants.ts`: Contiene le traduzioni (i18n) e le configurazioni di base.

### 4. Componenti UI (`src/components/UI`)

Esiste una libreria di componenti UI atomici (Button, Input, Select, Modal, ecc.) che devono essere riutilizzati per mantenere la coerenza visiva.

## 📝 Come contribuire (AI Workflow)

1. **Consulta `TODO.md`**: Questo è il punto di ingresso per i task. L'utente aggiungerà qui le richieste di nuove feature o bug fix.
2. **Rispetta Biome**: Il progetto usa Biome per il linting. Prima di terminare un task, assicurati che il codice sia formattato correttamente eseguendo `pnpm biome:check`.
3. **Scrivi Test**: Ogni nuova funzionalità o fix deve essere accompagnata da un test nella cartella `test/`.
4. **Mantieni l'Atomicità**: Quando aggiungi stati globali, usa nuovi atomi Jotai in `src/atoms`.

## 📂 Struttura delle Directory

- `src/atoms`: Stato globale.
- `src/components`: Componenti dell'applicazione.
- `src/components/UI`: Componenti di base riutilizzabili.
- `src/hooks`: Hook personalizzati.
- `src/utils`: Logica pura e utilità.
- `test`: Test suite.

---

*Nota: Questo file è mantenuto per aiutare le AI a navigare il progetto in modo efficiente.*
