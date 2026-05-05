import { Todo } from '@/types'

import { isTaskOverdue } from './todo'

export function generateUniqueId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 7)
  return `${timestamp}-${random}`
}

export function orderTodos(a: Todo, b: Todo): number {
  if (a.completed && !b.completed) return 1
  if (!a.completed && b.completed) return -1
  if (isTaskOverdue(a.dueDate) && !isTaskOverdue(b.dueDate)) return -1
  if (!isTaskOverdue(a.dueDate) && isTaskOverdue(b.dueDate)) return 1
  if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
  if (a.priority !== 'urgent' && b.priority === 'urgent') return 1
  if (a.priority === 'high' && b.priority !== 'high') return -1
  if (a.priority !== 'high' && b.priority === 'high') return 1
  if (a.priority === 'medium' && b.priority === 'medium') return -1
  if (a.priority !== 'medium' && b.priority === 'medium') return 1
  if (a.priority === 'low' && b.priority === 'low') return -1
  if (a.priority !== 'low' && b.priority === 'low') return 1
  return 0
}

export function filterTodoByStatus(todo: Todo, filter: string): boolean {
  switch (filter) {
    case '0':
      return true
    case '1':
      return todo.status === 'todo'
    case '2':
      return todo.status === 'progress'
    case '3':
      return todo.status === 'review'
    case '4':
      return todo.status === 'testing'
    case '5':
      return todo.status === 'blocked'
    case '6':
      return todo.status === 'paused'
    case '7':
      return todo.completed
    case '8':
      return !todo.completed
    case '9':
      return isTaskOverdue(todo.dueDate)
    case '10':
      return !isTaskOverdue(todo.dueDate)
    default:
      return false
  }
}
