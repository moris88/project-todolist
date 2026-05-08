import type { Comment, Priority, Status, Todo } from '@/types'

import { generateUniqueId } from './utils'

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
]

const COMMENT_HEADERS = ['id', 'todoId', 'text', 'createdAt']

// Fields whose content must NOT be trimmed (markdown, free text)
const PRESERVE_WHITESPACE = new Set(['description', 'text', 'title'])

function escapeCSV(value: any): string {
	if (value === null || value === undefined) return ''
	const str = String(value)
	// Quote if contains comma, double-quote, newline or carriage-return
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

/**
 * RFC 4180-compliant CSV parser.
 * Reads character-by-character so quoted fields containing newlines
 * are handled correctly and never split into separate rows.
 */
function parseCSVRows(csvText: string): string[][] {
	const rows: string[][] = []
	let row: string[] = []
	let current = ''
	let inQuotes = false

	for (let i = 0; i < csvText.length; i++) {
		const char = csvText[i]
		const next = csvText[i + 1]

		if (inQuotes) {
			if (char === '"' && next === '"') {
				// Escaped double-quote inside a quoted field
				current += '"'
				i++
			} else if (char === '"') {
				// Closing quote
				inQuotes = false
			} else {
				// Any character (including \n, \r) inside a quoted field is literal content
				current += char
			}
		} else {
			if (char === '"') {
				inQuotes = true
			} else if (char === ',') {
				row.push(current)
				current = ''
			} else if (char === '\r' && next === '\n') {
				// CRLF row terminator
				row.push(current)
				current = ''
				rows.push(row)
				row = []
				i++ // skip the \n
			} else if (char === '\n' || char === '\r') {
				// LF or lone CR row terminator
				row.push(current)
				current = ''
				rows.push(row)
				row = []
			} else {
				current += char
			}
		}
	}

	// Flush the last field and row
	row.push(current)
	if (row.some((f) => f.trim() !== '')) rows.push(row)

	return rows
}

// ─── Export ───────────────────────────────────────────────────────────────────

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

export function exportCommentsToCSV(comments: Comment[]) {
	const rows = [COMMENT_HEADERS.join(',')]
	for (const c of comments) {
		rows.push(COMMENT_HEADERS.map((h) => escapeCSV((c as any)[h])).join(','))
	}
	downloadCSV(rows.join('\n'), `comments_${Date.now()}.csv`)
}

// ─── Import ───────────────────────────────────────────────────────────────────

export function parseCSV(csvText: string): Todo[] {
	const rows = parseCSVRows(csvText)
	if (rows.length < 2) return []

	const headers = rows[0].map((h) => h.trim())
	const todos: Todo[] = []

	for (let i = 1; i < rows.length; i++) {
		const values = rows[i]
		if (values.every((v) => v.trim() === '')) continue

		const todo: any = {}

		headers.forEach((header, index) => {
			const raw = values[index] ?? ''
			// Preserve whitespace for content fields; trim metadata fields
			const val = PRESERVE_WHITESPACE.has(header) ? raw : raw.trim()

			if (header === 'completed' || header === 'notify') {
				todo[header] = val.toLowerCase() === 'true'
			} else if (['updatedAt', 'completedAt', 'dueDate'].includes(header)) {
				todo[header] = val.trim() === '' ? null : val.trim()
			} else if (header === 'subtasks' || header === 'tags') {
				try {
					todo[header] = val.trim() ? JSON.parse(val) : []
				} catch {
					todo[header] = []
				}
			} else {
				todo[header] = val
			}
		})

		if (!todo.id) todo.id = generateUniqueId()
		if (!todo.title) todo.title = 'Imported Task'
		if (!todo.priority) todo.priority = 'medium' as Priority
		if (!todo.status) todo.status = 'todo' as Status
		if (todo.completed === undefined) todo.completed = false
		if (!todo.createdAt) todo.createdAt = new Date().toISOString()
		if (!Array.isArray(todo.subtasks)) todo.subtasks = []
		if (!Array.isArray(todo.tags)) todo.tags = []
		// Migrate subtasks exported before completedAt was added
		todo.subtasks = todo.subtasks.map((s: any) => ({
			...s,
			completedAt: s.completedAt !== undefined ? s.completedAt : null,
		}))

		todos.push(todo as Todo)
	}

	return todos
}

export function parseCommentsCSV(csvText: string): Comment[] {
	const rows = parseCSVRows(csvText)
	if (rows.length < 2) return []

	const headers = rows[0].map((h) => h.trim())
	const comments: Comment[] = []

	for (let i = 1; i < rows.length; i++) {
		const values = rows[i]
		if (values.every((v) => v.trim() === '')) continue

		const comment: any = {}

		headers.forEach((header, index) => {
			const raw = values[index] ?? ''
			comment[header] = PRESERVE_WHITESPACE.has(header) ? raw : raw.trim()
		})

		if (!comment.id || !comment.todoId || !comment.text || !comment.createdAt)
			continue

		comments.push(comment as Comment)
	}

	return comments
}
