import type { Comment, Status, Todo } from '@/types'

import { isTaskOverdue } from './todo'

const TAG_COLORS = [
	'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
	'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
	'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
	'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
	'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
	'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
	'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
	'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
	'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
]

export function tagColor(tag: string): string {
	let hash = 0
	for (let i = 0; i < tag.length; i++) {
		hash = tag.charCodeAt(i) + ((hash << 5) - hash)
	}
	return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

export function generateUniqueId() {
	const timestamp = Date.now().toString(36)
	const random = Math.random().toString(36).slice(2, 7)
	return `${timestamp}-${random}`
}

const PRIORITY_RANK: Record<string, number> = {
	urgent: 0,
	high: 1,
	medium: 2,
	low: 3,
}

export function orderTodos(a: Todo, b: Todo): number {
	if (a.completed !== b.completed) return a.completed ? 1 : -1
	const aOverdue = isTaskOverdue(a.dueDate)
	const bOverdue = isTaskOverdue(b.dueDate)
	if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
	return (PRIORITY_RANK[a.priority] ?? 4) - (PRIORITY_RANK[b.priority] ?? 4)
}

export interface FilterState {
	status: Status | ''
	completion: 'all' | 'completed' | 'uncompleted'
	overdue: 'all' | 'overdue' | 'not_overdue'
	tags: string[]
	search: string
	dueDateFrom: string
	dueDateTo: string
	projectId?: string
	sprintId?: string
}

export function applyFilters(
	todo: Todo,
	filters: FilterState,
	comments: Comment[] = [],
): boolean {
	if (filters.status && todo.status !== filters.status) return false
	if (filters.completion === 'completed' && !todo.completed) return false
	if (filters.completion === 'uncompleted' && todo.completed) return false
	if (filters.overdue === 'overdue' && !isTaskOverdue(todo.dueDate))
		return false
	if (filters.overdue === 'not_overdue' && isTaskOverdue(todo.dueDate))
		return false
	if (filters.tags.length > 0) {
		const todoTags = todo.tags ?? []
		if (!filters.tags.some((t) => todoTags.includes(t))) return false
	}
	if (filters.projectId) {
		if (filters.projectId === '__none__') {
			if (todo.projectId) return false
		} else if (todo.projectId !== filters.projectId) return false
	}
	if (filters.sprintId) {
		if (filters.sprintId === '__none__') {
			if (todo.sprintId) return false
		} else if (todo.sprintId !== filters.sprintId) return false
	}
	if (filters.search) {
		const q = filters.search.toLowerCase()
		const matchesTitle = todo.title.toLowerCase().includes(q)
		const matchesSubtask =
			todo.subtasks?.some((s) => s.title.toLowerCase().includes(q)) ?? false
		const matchesComment = comments
			.filter((c) => c.todoId === todo.id)
			.some((c) => c.text.toLowerCase().includes(q))
		if (!matchesTitle && !matchesSubtask && !matchesComment) return false
	}
	if (filters.dueDateFrom || filters.dueDateTo) {
		if (!todo.dueDate) return false
		const due = new Date(todo.dueDate)
		if (filters.dueDateFrom && due < new Date(filters.dueDateFrom)) return false
		if (filters.dueDateTo) {
			const toDate = new Date(filters.dueDateTo)
			toDate.setHours(23, 59, 59, 999)
			if (due > toDate) return false
		}
	}
	return true
}
