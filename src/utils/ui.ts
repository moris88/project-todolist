import type { Priority, Status } from '@/types'

export const ALL_STATUSES: Status[] = [
	'backlog',
	'todo',
	'progress',
	'review',
	'testing',
	'paused',
	'done',
	'blocked',
	'archived',
]

export const DATE_FORMAT = 'DD/MM/YYYY HH:mm'

export function statusDotColor(s: Status): string {
	if (s === 'done') return 'bg-green-500'
	if (s === 'todo' || s === 'backlog') return 'bg-gray-400'
	if (s === 'archived' || s === 'blocked') return 'bg-red-500'
	return 'bg-yellow-500'
}

export function statusChipColor(
	s: Status,
): 'default' | 'success' | 'warning' | 'danger' {
	if (s === 'done') return 'success'
	if (s === 'todo' || s === 'backlog') return 'default'
	if (s === 'archived' || s === 'blocked') return 'danger'
	return 'warning'
}

export const PRIORITY_CHIP_COLOR: Record<
	Priority,
	'default' | 'success' | 'warning' | 'danger'
> = {
	urgent: 'danger',
	high: 'warning',
	medium: 'default',
	low: 'success',
}

export const PROJECT_COLORS = [
	{ value: '#3b82f6', label: 'Blu' },
	{ value: '#10b981', label: 'Verde' },
	{ value: '#f59e0b', label: 'Giallo' },
	{ value: '#ef4444', label: 'Rosso' },
	{ value: '#8b5cf6', label: 'Viola' },
	{ value: '#ec4899', label: 'Rosa' },
	{ value: '#06b6d4', label: 'Ciano' },
	{ value: '#f97316', label: 'Arancio' },
]

export const SPRINT_COLORS = [
	{ value: '#3b82f6', label: 'Blu' },
	{ value: '#10b981', label: 'Verde' },
	{ value: '#f59e0b', label: 'Giallo' },
	{ value: '#ef4444', label: 'Rosso' },
	{ value: '#8b5cf6', label: 'Viola' },
	{ value: '#ec4899', label: 'Rosa' },
	{ value: '#06b6d4', label: 'Ciano' },
	{ value: '#f97316', label: 'Arancio' },
]
