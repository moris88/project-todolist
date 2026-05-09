import type { Todo } from '@/types'

export const priorityItems = ['urgent', 'high', 'medium', 'low']

export function isTaskOverdue(dueDate: string | null): boolean {
	if (!dueDate) return false
	return new Date(dueDate) < new Date()
}

export function addTodoStorage(todo: Todo, todos: Todo[]): Todo[] {
	const saved = localStorage.getItem('todos')
	const ids: string[] = saved ? JSON.parse(saved) : []
	localStorage.setItem('todos', JSON.stringify([...ids, todo.id]))
	localStorage.setItem(todo.id, JSON.stringify(todo))
	return [...todos, todo]
}

export function getTodosStorage(): Todo[] {
	const saved = localStorage.getItem('todos')
	if (!saved) return []
	const ids: string[] = JSON.parse(saved)
	return ids
		.map((id) => {
			const raw = localStorage.getItem(id)
			if (!raw) return null
			const parsed = JSON.parse(raw)
			return { ...parsed, tags: parsed.tags ?? [] } as Todo
		})
		.filter((t): t is Todo => t !== null)
}

export function updateTodoStorage(todos: Todo[]): Todo[] {
	for (const todo of todos) {
		localStorage.setItem(todo.id, JSON.stringify(todo))
	}
	return todos
}

export function removeTodoStorage(todos: Todo[], idTodo: string): Todo[] {
	const updated = todos.filter((t) => t.id !== idTodo)
	localStorage.setItem('todos', JSON.stringify(updated.map((t) => t.id)))
	localStorage.removeItem(idTodo)
	return updated
}

export function clearTodosCompleted(todos: Todo[]): Todo[] {
	const remaining = todos.filter((todo) => {
		if (todo.completed) {
			localStorage.removeItem(todo.id)
			return false
		}
		return true
	})
	localStorage.setItem('todos', JSON.stringify(remaining.map((t) => t.id)))
	return remaining
}

export function clearTodosExpired(todos: Todo[]): Todo[] {
	const remaining = todos.filter((todo) => {
		if (isTaskOverdue(todo.dueDate)) {
			localStorage.removeItem(todo.id)
			return false
		}
		return true
	})
	localStorage.setItem('todos', JSON.stringify(remaining.map((t) => t.id)))
	return remaining
}

export function removeAllTodos(): Todo[] {
	localStorage.clear()
	localStorage.setItem('todos', JSON.stringify([]))
	return []
}
