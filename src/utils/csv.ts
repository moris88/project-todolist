import { Category, Priority, Todo } from '@/types'

import { generateUniqueId } from './utils'

const CSV_HEADERS = [
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
  'category',
]

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCSV(todos: Todo[]) {
  const csvRows = []
  csvRows.push(CSV_HEADERS.join(','))

  for (const todo of todos) {
    const values = CSV_HEADERS.map((header) => {
      const val = (todo as any)[header]
      return escapeCSV(val)
    })
    csvRows.push(values.join(','))
  }

  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `tasks_${new Date().getTime()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function parseCSV(csvText: string): Todo[] {
  const lines = csvText.split(/\r?\n/)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim())
  const todos: Todo[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"'
          j++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current)
        current = ''
      } else {
        current += char
      }
    }
    values.push(current)

    const todo: any = {}
    headers.forEach((header, index) => {
      let val = values[index]
      if (val === undefined) return

      val = val.trim()

      if (header === 'completed' || header === 'notify') {
        todo[header] = val.toLowerCase() === 'true'
      } else if (
        header === 'updatedAt' ||
        header === 'completedAt' ||
        header === 'dueDate'
      ) {
        todo[header] = val === '' ? null : val
      } else {
        todo[header] = val
      }
    })

    if (!todo.id) todo.id = generateUniqueId()
    if (!todo.title) todo.title = 'Imported Task'
    if (!todo.priority) todo.priority = 'medium' as Priority
    if (!todo.category) todo.category = 'todo' as Category
    if (todo.completed === undefined) todo.completed = false
    if (!todo.createdAt) todo.createdAt = new Date().toISOString()

    todos.push(todo as Todo)
  }

  return todos
}
