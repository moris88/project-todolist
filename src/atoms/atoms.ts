import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import type {
	Comment,
	DeletedProject,
	DeletedSprint,
	FilterState,
	Project,
	SortState,
	Sprint,
	Todo,
} from '@/types'
import { type Dict, dicts, type Language } from '@/utils/constants'

export const todoListAtom = atom<Todo[]>([])
export const commentsAtom = atom<Comment[]>([])
export const languageAtom = atomWithStorage<Language>('language', 'it')
export const darkModeAtom = atomWithStorage<boolean>('darkMode', false)
export const tagsAtom = atomWithStorage<string[]>('tags', [])
export const dictAtom = atom<Dict>((get) => dicts[get(languageAtom)])
export const projectsAtom = atomWithStorage<Project[]>('projects', [])
export const sprintsAtom = atomWithStorage<Sprint[]>('sprints', [])
export const trashAtom = atomWithStorage<Todo[]>('trash', [])
export const deletedProjectsAtom = atomWithStorage<DeletedProject[]>(
	'deletedProjects',
	[],
)
export const deletedSprintsAtom = atomWithStorage<DeletedSprint[]>(
	'deletedSprints',
	[],
)
export type ActiveView =
	| 'tasks'
	| 'projects'
	| 'sprints'
	| 'trash'
	| 'calendar'
	| 'settings'
	| 'stats'
export const activeViewAtom = atomWithStorage<ActiveView>('activeView', 'tasks')

export interface ProjectLimits {
	urgent: number
	high: number
	medium: number
	low: number
}

export const projectLimitsAtom = atomWithStorage<ProjectLimits>(
	'projectLimits',
	{
		urgent: 2,
		high: 2,
		medium: 4,
		low: 6,
	},
)

export const maxActiveSprintsAtom = atomWithStorage<number>(
	'maxActiveSprints',
	3,
)

export const pageSizeAtom = atomWithStorage<number>('pageSize', 20)

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export interface ToastMessage {
	id: string
	message: string
	type: ToastType
}
export const toastsAtom = atom<ToastMessage[]>([])

export const defaultFilters: FilterState = {
	status: '',
	completion: 'all',
	overdue: 'all',
	tags: [],
	search: '',
	dueDateFrom: '',
	dueDateTo: '',
	projectId: '',
	sprintId: '',
}

export const defaultSort: SortState = { field: '', dir: 'asc' }

export const todoFiltersAtom = atomWithStorage<FilterState>(
	'todoFilters',
	defaultFilters,
)

export const todoSortAtom = atomWithStorage<SortState>('todoSort', defaultSort)
