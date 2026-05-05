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
