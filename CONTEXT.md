# Project Context (For AI Assistants)

Questo documento fornisce il contesto tecnico e architetturale necessario per comprendere, modificare e implementare nuove funzionalità in questo progetto.

## Obiettivo del Progetto

Un'applicazione di gestione task avanzata con supporto per progetti, sprint, sottotask, commenti, priorità, stati, cestino e visualizzazione calendario.

## Stack Tecnologico

- **Framework:** React 19 (Functional Components, Hooks).
- **Build Tool:** Vite 8.
- **Linguaggio:** TypeScript (strict mode); type-check con `tsc -b` prima della build.
- **State Management:** Jotai 2. Atomi in `src/atoms/atoms.ts`.
- **Styling:** Tailwind CSS v4 via plugin `@tailwindcss/vite` — nessun `tailwind.config.js` né `postcss.config.js`. Dark mode configurata con `@custom-variant dark (&:where(.dark, .dark *))` in `src/index.css`.
- **Date:** moment.js con locale italiano impostato globalmente in `src/main.tsx` (`moment.locale('it')`).
- **Animazioni:** Framer Motion (usato in alcuni componenti UI come Select).
- **Grafici:** Recharts (usato in StatsView).
- **Markdown:** react-markdown con plugin remark-gfm.
- **Icone:** React Icons (libreria Hi2).
- **Testing:** Vitest + React Testing Library. Circa 378 test in `test/`.
- **Linting/Formatting:** Biome. Eseguire sempre `pnpm biome:check` e correggere con `pnpm biome:fix` prima di concludere un task.

## Architettura e Convenzioni

### 1. Gestione dello Stato (Jotai)

Tutti gli atomi sono in `src/atoms/atoms.ts`:

```ts
// Stato in memoria (non persistito)
export const todoListAtom = atom<Todo[]>([])
export const commentsAtom = atom<Comment[]>([])
export const toastsAtom = atom<ToastMessage[]>([]) // per notifiche toast

// Preferenze persistite in localStorage
export const languageAtom = atomWithStorage<Language>('language', 'it')
export const darkModeAtom = atomWithStorage<boolean>('darkMode', false)
export const tagsAtom = atomWithStorage<string[]>('tags', [])
export const dictAtom = atom<Dict>((get) => dicts[get(languageAtom)])  // derivato
export const projectLimitsAtom = atomWithStorage<ProjectLimits>('projectLimits', { urgent: 2, high: 2, medium: 4, low: 6 })
export const maxActiveSprintsAtom = atomWithStorage<number>('maxActiveSprints', 3)
export const pageSizeAtom = atomWithStorage<number>('pageSize', 20)

// Entità applicative persistite in localStorage
export const projectsAtom = atomWithStorage<Project[]>('projects', [])
export const sprintsAtom = atomWithStorage<Sprint[]>('sprints', [])
export const trashAtom = atomWithStorage<Todo[]>('trash', [])
export const deletedProjectsAtom = atomWithStorage<DeletedProject[]>('deletedProjects', [])
export const deletedSprintsAtom = atomWithStorage<DeletedSprint[]>('deletedSprints', [])

// Filtri e ordinamento persistiti
export const todoFiltersAtom = atomWithStorage<FilterState>('todoFilters', defaultFilters)
export const todoSortAtom = atomWithStorage<SortState>('todoSort', defaultSort)

// Navigazione persistita
export type ActiveView = 'tasks' | 'projects' | 'sprints' | 'trash' | 'calendar' | 'settings' | 'stats'
export const activeViewAtom = atomWithStorage<ActiveView>('activeView', 'tasks')
```

**Importante:** `todoListAtom`, `commentsAtom` e `toastsAtom` NON usano `atomWithStorage`. Il caricamento iniziale da localStorage avviene in `src/hooks/useTodos.ts` e `src/hooks/useComments.ts`.

### 2. Pattern localStorage per i Todo

I todo usano un pattern a **indice separato** per le performance:

- `localStorage.setItem('todos', JSON.stringify([id1, id2, ...]))` — array di ID (indice)
- `localStorage.setItem(id, JSON.stringify(todo))` — ogni todo serializzato singolarmente

Esistono due funzioni distinte in `src/utils/todo.ts`:

- **`addTodoStorage(todo, currentTodos)`**: aggiorna ENTRAMBI l'indice e l'entry individuale. Usare quando si aggiunge un nuovo todo (es. restore dal cestino).
- **`updateTodoStorage(todos)`**: aggiorna SOLO le entry individuali, NON l'indice. Usare per modifiche a todo già presenti nell'indice.

**Errore comune:** usare `updateTodoStorage` per aggiungere un todo causa la scomparsa del todo al ricaricamento (l'indice non viene aggiornato).

### 3. Pattern Soft-Delete (Cestino)

I todo non vengono eliminati direttamente ma spostati nel cestino:

1. Il todo viene rimosso da `todoListAtom` e dal localStorage tramite `removeTodoStorage(id)`.
2. Il todo con `deletedAt: new Date().toISOString()` viene aggiunto a `trashAtom` (persistito in localStorage come array JSON normale).
3. Dal cestino si può ripristinare con `addTodoStorage(restored, todos)` o eliminare definitivamente.

### 4. Modelli Dati (`src/types/global.d.ts`)

```ts
interface SubTask {
  id: string; title: string; completed: boolean; completedAt: string | null
  priority?: Priority; status?: Status
}

interface Todo {
  id: string; title: string; description: string
  completed: boolean; createdAt: string; updatedAt: string | null; completedAt: string | null
  dueDate: string | null; notify: boolean
  priority: Priority; status: Status
  subtasks: SubTask[]; tags: string[]
  projectId?: string | null   // associazione progetto (opzionale)
  sprintId?: string | null    // associazione sprint (opzionale)
  deletedAt?: string | null   // presenza = nel cestino
}

interface Project {
  id: string; name: string; description: string; color: string
  priority: Priority; status: ProjectStatus
  createdAt: string; updatedAt: string | null
}

interface Sprint {
  id: string; name: string; description: string; color: string
  startDate: string | null; dueDate: string | null
  status: SprintStatus
  projectId: string | null   // OBBLIGATORIO: uno sprint deve avere un progetto
  createdAt: string; updatedAt: string | null
}

interface Comment { id: string; todoId: string; text: string; createdAt: string }

type Priority = 'low' | 'medium' | 'high' | 'urgent'
type Status = 'backlog' | 'todo' | 'progress' | 'review' | 'testing' | 'blocked' | 'paused' | 'done' | 'archived'
type ProjectStatus = 'active' | 'completed' | 'archived' | 'paused'
type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled'

interface DeletedProject extends Project { deletedAt: string }
interface DeletedSprint extends Sprint { deletedAt: string }

interface FilterState {
  status: Status | ''; completion: 'all' | 'completed' | 'uncompleted'
  overdue: 'all' | 'overdue' | 'not_overdue'; tags: string[]; search: string
  dueDateFrom: string; dueDateTo: string; projectId?: string; sprintId?: string
}

interface SortState { field: 'priority' | 'status' | 'dueDate' | ''; dir: 'asc' | 'desc' }
```

### 5. Constraint Sprint → Progetto

Un sprint **deve** avere un `projectId`. Il controllo è applicato a tre livelli:

1. Il form mostra un `<select>` obbligatorio con bordo rosso se non selezionato.
2. Il pulsante Salva è `isDisabled={!form.projectId}`.
3. `handleSave` fa `if (!form.projectId) return` come guardia finale.

### 6. Navigazione (Tab)

La navigazione tra le viste è gestita da `activeViewAtom` (persistito). Il componente `Wrapper.tsx` legge questo atomo e renderizza la vista corretta: `tasks` → `TodoList`, `projects` → `ProjectsManager`, `sprints` → `SprintsManager`, `trash` → `TrashView`, `calendar` → `CalendarView`, `settings` → `SettingsView`, `stats` → `StatsView`.

### 7. Internazionalizzazione (i18n)

Tutte le stringhe UI sono in `src/utils/constants.ts` all'interno del dizionario `dicts` (chiavi `it` e `en`). Il dizionario corrente è accessibile tramite `dictAtom`. **Non scrivere mai stringhe hardcoded in italiano o inglese nei componenti.**

### 8. Formato CSV

Header: `id,title,description,completed,createdAt,updatedAt,completedAt,dueDate,notify,priority,status,subtasks,tags,projectId,sprintId,deletedAt`

I sottotask sono serializzati come JSON nell'apposita colonna. I campi `projectId`, `sprintId`, `deletedAt` sono inclusi dal refactor recente. Il vecchio formato (senza questi campi) è gestito per retrocompatibilità.

## Componenti Principali (`src/components`)

| Componente | Ruolo |
|---|---|
| `Wrapper.tsx` | Shell applicazione: tab di navigazione, caricamento dati iniziali |
| `Header.tsx` | Barra superiore: titolo, counter task/progetti/sprint, toggle tema/lingua |
| `TodoList.tsx` | Vista "Compiti": lista task con filtri avanzati, ordinamento e paginazione |
| `TodoItem.tsx` | Singola riga task con checkbox, priorità, badge, azioni |
| `TodoInput.tsx` | Form di creazione rapida task |
| `TaskFormModal.tsx` | Modal completo per creazione/modifica task (sottotask, tag, date, note Markdown) |
| `TaskDetailModal.tsx` | Modal di dettaglio/modifica task — riutilizzato da ProjectsManager, SprintsManager e CalendarView |
| `ProjectsManager.tsx` | Vista "Progetti": lista espandibile con task associati, CRUD progetti |
| `SprintsManager.tsx` | Vista "Sprint": lista espandibile con task associati, CRUD sprint |
| `TrashView.tsx` | Vista "Cestino": task, progetti e sprint eliminati con opzioni ripristino/eliminazione definitiva |
| `CalendarView.tsx` | Vista "Calendario": task con scadenza su griglia mensile in italiano; click apre TaskDetailModal |
| `SettingsView.tsx` | Vista "Impostazioni": lingua, tema, limiti priorità, limiti sprint, paginazione e import/export |
| `StatsView.tsx` | Vista "Statistiche": grafici e metriche su task, progetti e sprint (usa Recharts) |
| `Comments.tsx` | Sezione commenti nel dettaglio task |
| `DangerZone.tsx` | Sezione per reset dati (eliminazione permanente massiva) — integrata in `SettingsView` |
| `ConfirmModal.tsx` | Modal generico di conferma azione distruttiva |
| `MarkdownContent.tsx` | Renderer Markdown per le descrizioni task |

## Componenti UI (`src/components/UI`)

Componenti atomici da riutilizzare per consistenza visiva: `Button`, `ButtonGroup`, `Checkbox`, `Chip`, `DatePicker`, `Input`, `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter`, `ModalContent`, `Select`, `SelectItem`, `StatusDropdown`, `Switch`, `Textarea`, `Toast`, `Tooltip`.

## Workflow AI

1. **Rispetta Biome**: esegui `pnpm biome:check` alla fine; correggi con `pnpm biome:fix`. Biome può riformattare il file — rileggilo prima di applicare edit successivi.
2. **Scrivi/aggiorna i test**: ogni nuova funzionalità deve avere copertura in `test/`.
3. **Non scrivere stringhe UI hardcoded**: usa sempre `dictAtom` / `dict.*`.
5. **Usa i componenti UI esistenti**: Button, Input, Select, Modal ecc. invece di elementi HTML nativi.
6. **Aggiungi chiavi i18n** in `src/utils/constants.ts` (sia `it` e `en`) prima di usarle nei componenti.
7. **Aggiorna `CONTEXT.md` e `README.md`** quando aggiungi feature significative.

---

*Questo file è mantenuto per aiutare le AI a navigare il progetto in modo efficiente.*
