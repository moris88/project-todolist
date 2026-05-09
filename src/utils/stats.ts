import type { Project, Sprint, Todo } from '@/types'

export interface ChartEntry {
	name: string
	value: number
	color: string
}

export interface TimeEntry {
	date: string
	created: number
	completed: number
}

export interface ProjectStatEntry {
	id: string
	name: string
	color: string
	total: number
	done: number
	completionRate: number
}

export interface SprintStatEntry {
	name: string
	completed: number
	total: number
}

export const STATUS_COLORS: Record<string, string> = {
	backlog: '#94a3b8',
	todo: '#60a5fa',
	progress: '#f59e0b',
	review: '#a78bfa',
	testing: '#34d399',
	blocked: '#f87171',
	paused: '#fb923c',
	done: '#22c55e',
	archived: '#6b7280',
}

export const PRIORITY_COLORS: Record<string, string> = {
	urgent: '#ef4444',
	high: '#f97316',
	medium: '#eab308',
	low: '#22c55e',
}

export const PROJECT_STATUS_COLORS: Record<string, string> = {
	active: '#22c55e',
	completed: '#60a5fa',
	paused: '#fb923c',
	archived: '#6b7280',
}

export const SPRINT_STATUS_COLORS: Record<string, string> = {
	planning: '#94a3b8',
	active: '#22c55e',
	completed: '#60a5fa',
	cancelled: '#f87171',
}

function getWeekStart(date: Date): Date {
	const d = new Date(date)
	d.setHours(0, 0, 0, 0)
	const day = d.getDay()
	const diff = d.getDate() - day + (day === 0 ? -6 : 1)
	d.setDate(diff)
	return d
}

function weekLabel(date: Date): string {
	const d = getWeekStart(date)
	const dd = d.getDate().toString().padStart(2, '0')
	const mm = (d.getMonth() + 1).toString().padStart(2, '0')
	return `${dd}/${mm}`
}

export function getActiveTodos(todos: Todo[]): Todo[] {
	return todos.filter((t) => !t.deletedAt)
}

export function getTasksByStatus(todos: Todo[]): ChartEntry[] {
	const counts = new Map<string, number>()
	for (const t of todos) {
		counts.set(t.status, (counts.get(t.status) ?? 0) + 1)
	}
	return Array.from(counts.entries())
		.filter(([, v]) => v > 0)
		.map(([name, value]) => ({
			name,
			value,
			color: STATUS_COLORS[name] ?? '#94a3b8',
		}))
}

export function getTasksByPriority(todos: Todo[]): ChartEntry[] {
	const order = ['urgent', 'high', 'medium', 'low']
	const counts = new Map<string, number>()
	for (const t of todos) {
		counts.set(t.priority, (counts.get(t.priority) ?? 0) + 1)
	}
	return order
		.filter((p) => (counts.get(p) ?? 0) > 0)
		.map((name) => ({
			name,
			value: counts.get(name) ?? 0,
			color: PRIORITY_COLORS[name] ?? '#94a3b8',
		}))
}

export function getTasksOverTime(todos: Todo[]): TimeEntry[] {
	const now = new Date()
	const entries = new Map<string, TimeEntry>()
	for (let i = 11; i >= 0; i--) {
		const d = new Date(now)
		d.setDate(d.getDate() - i * 7)
		const key = weekLabel(d)
		if (!entries.has(key)) {
			entries.set(key, { date: key, created: 0, completed: 0 })
		}
	}
	const windowStart = getWeekStart(
		new Date(now.getTime() - 11 * 7 * 24 * 60 * 60 * 1000),
	)
	for (const t of todos) {
		const createdDate = new Date(t.createdAt)
		if (createdDate >= windowStart) {
			const key = weekLabel(createdDate)
			const entry = entries.get(key)
			if (entry) entry.created++
		}
		if (t.completedAt) {
			const completedDate = new Date(t.completedAt)
			if (completedDate >= windowStart) {
				const key = weekLabel(completedDate)
				const entry = entries.get(key)
				if (entry) entry.completed++
			}
		}
	}
	return Array.from(entries.values())
}

export function getOverdueTasks(todos: Todo[]): number {
	const now = new Date()
	return todos.filter(
		(t) => !t.completed && t.dueDate && new Date(t.dueDate) < now,
	).length
}

export function getProjectStats(
	projects: Project[],
	todos: Todo[],
): ProjectStatEntry[] {
	return projects.map((p) => {
		const projectTodos = todos.filter((t) => t.projectId === p.id)
		const done = projectTodos.filter((t) => t.completed).length
		const total = projectTodos.length
		return {
			id: p.id,
			name: p.name,
			color: p.color,
			total,
			done,
			completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
		}
	})
}

export function getProjectsByStatus(projects: Project[]): ChartEntry[] {
	const order: Array<Project['status']> = [
		'active',
		'completed',
		'paused',
		'archived',
	]
	const counts = new Map<string, number>()
	for (const p of projects) {
		counts.set(p.status, (counts.get(p.status) ?? 0) + 1)
	}
	return order
		.filter((s) => (counts.get(s) ?? 0) > 0)
		.map((name) => ({
			name,
			value: counts.get(name) ?? 0,
			color: PROJECT_STATUS_COLORS[name] ?? '#94a3b8',
		}))
}

export function getSprintStats(
	sprints: Sprint[],
	todos: Todo[],
): SprintStatEntry[] {
	return sprints.map((s) => {
		const sprintTodos = todos.filter((t) => t.sprintId === s.id)
		return {
			name: s.name,
			completed: sprintTodos.filter((t) => t.completed).length,
			total: sprintTodos.length,
		}
	})
}

export function getSprintsByStatus(sprints: Sprint[]): ChartEntry[] {
	const order: Array<Sprint['status']> = [
		'active',
		'planning',
		'completed',
		'cancelled',
	]
	const counts = new Map<string, number>()
	for (const s of sprints) {
		counts.set(s.status, (counts.get(s.status) ?? 0) + 1)
	}
	return order
		.filter((s) => (counts.get(s) ?? 0) > 0)
		.map((name) => ({
			name,
			value: counts.get(name) ?? 0,
			color: SPRINT_STATUS_COLORS[name] ?? '#94a3b8',
		}))
}
