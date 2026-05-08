import { Todo } from '@/types'

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
