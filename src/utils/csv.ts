import type { ProjectLimits } from '@/atoms'
import type { Comment, Project, Sprint, Todo } from '@/types'
import type { Language } from './constants'

const TODO_HEADERS = [
	'id',
	'title',
	'description',
	'completed',
	'createdAt',
	'updatedAt',
	'completedAt',
	'dueDate',
	'notify',
	'priority',
	'status',
	'subtasks',
	'tags',
	'projectId',
	'sprintId',
	'deletedAt',
]

const PROJECT_HEADERS = [
	'id',
	'name',
	'description',
	'color',
	'priority',
	'status',
	'createdAt',
	'updatedAt',
]

const SPRINT_HEADERS = [
	'id',
	'name',
	'description',
	'color',
	'startDate',
	'dueDate',
	'status',
	'projectId',
	'createdAt',
	'updatedAt',
]

function escapeCSV(value: any): string {
	if (value === null || value === undefined) return ''
	const str = String(value)
	if (
		str.includes(',') ||
		str.includes('"') ||
		str.includes('\n') ||
		str.includes('\r')
	) {
		return `"${str.replace(/"/g, '""')}"`
	}
	return str
}

function downloadCSV(content: string, filename: string) {
	const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.setAttribute('href', url)
	link.setAttribute('download', filename)
	link.style.visibility = 'hidden'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

function downloadJSON(content: object, filename: string) {
	const blob = new Blob([JSON.stringify(content, null, 2)], {
		type: 'application/json;charset=utf-8;',
	})
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.setAttribute('href', url)
	link.setAttribute('download', filename)
	link.style.visibility = 'hidden'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

// ─── CSV Exports ──────────────────────────────────────────────────────────────

export function exportToCSV(todos: Todo[]) {
	const rows = [TODO_HEADERS.join(',')]
	for (const todo of todos) {
		rows.push(
			TODO_HEADERS.map((h) => {
				if (h === 'subtasks')
					return escapeCSV(JSON.stringify(todo.subtasks ?? []))
				if (h === 'tags') return escapeCSV(JSON.stringify(todo.tags ?? []))
				return escapeCSV((todo as any)[h])
			}).join(','),
		)
	}
	downloadCSV(rows.join('\n'), `tasks_${Date.now()}.csv`)
}

export function exportProjectsToCSV(projects: Project[]) {
	const rows = [PROJECT_HEADERS.join(',')]
	for (const p of projects) {
		rows.push(PROJECT_HEADERS.map((h) => escapeCSV((p as any)[h])).join(','))
	}
	downloadCSV(rows.join('\n'), `projects_${Date.now()}.csv`)
}

export function exportSprintsToCSV(sprints: Sprint[]) {
	const rows = [SPRINT_HEADERS.join(',')]
	for (const s of sprints) {
		rows.push(SPRINT_HEADERS.map((h) => escapeCSV((s as any)[h])).join(','))
	}
	downloadCSV(rows.join('\n'), `sprints_${Date.now()}.csv`)
}

// ─── JSON Export / Import ─────────────────────────────────────────────────────

export interface AppData {
	version: string
	exportedAt: string
	todos: Todo[]
	projects: Project[]
	sprints: Sprint[]
	comments: Comment[]
	settings: {
		language: Language
		darkMode: boolean
		tags: string[]
		projectLimits: ProjectLimits
		maxActiveSprints: number
	}
}

export function exportAllToJSON(data: Omit<AppData, 'version' | 'exportedAt'>) {
	const payload: AppData = {
		version: '1',
		exportedAt: new Date().toISOString(),
		...data,
	}
	downloadJSON(payload, `backup_${Date.now()}.json`)
}

export function parseAppJSON(jsonText: string): AppData {
	const parsed = JSON.parse(jsonText)
	if (!parsed || typeof parsed !== 'object' || parsed.version !== '1') {
		throw new Error('invalid')
	}
	return parsed as AppData
}
