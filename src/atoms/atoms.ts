import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import type { Comment, Project, Sprint, Todo } from '@/types'
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
export type ActiveView =
	| 'tasks'
	| 'projects'
	| 'sprints'
	| 'trash'
	| 'calendar'
	| 'settings'
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
