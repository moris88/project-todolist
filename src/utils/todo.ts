import moment from 'moment'

import { Todo } from '@/types'

export const priorityItems = ['urgent', 'high', 'medium', 'low']

export function isTaskOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return moment().isAfter(dueDate)
}

export function addTodoStorage(todo: Todo, todos: Todo[]): Todo[] {
  const savedTodos = localStorage.getItem('todos')
  if (savedTodos) {
    const temp: string[] = JSON.parse(savedTodos) satisfies string[]
    localStorage.setItem('todos', JSON.stringify([...temp, todo.id]))
  } else {
    localStorage.setItem('todos', JSON.stringify([todo.id]))
  }
  localStorage.setItem(todo.id, JSON.stringify(todo))
  return [...todos, todo]
}

export function getTodosStorage(): Todo[] {
  const savedTodos = localStorage.getItem('todos')
  if (savedTodos) {
    const temp: string[] = JSON.parse(savedTodos) satisfies string[]
    const newTodos: Todo[] = temp
      .map((todoString) => {
        const todo = localStorage.getItem(todoString)
        if (todo) {
          return JSON.parse(todo) satisfies Todo
        }
        return null
      })
      .filter((todo) => todo !== null)
    return newTodos
  }
  return []
}

export function updateTodoStorage(todos: Todo[]): Todo[] {
  for (const todo of todos) {
    localStorage.setItem(todo.id, JSON.stringify(todo))
  }
  return todos
}

export function removeTodoStorage(todos: Todo[], idTodo: string): Todo[] {
  const updatedTodos = todos.filter((t) => t.id !== idTodo)
  localStorage.setItem('todos', JSON.stringify(updatedTodos.map((t) => t.id)))
  localStorage.removeItem(idTodo)
  return updatedTodos
}

export function clearTodosCompleted(todos: Todo[]): Todo[] {
  todos
    .filter((todo) => todo.completed)
    .forEach((todo) => {
      localStorage.removeItem(todo.id)
    })
  const newTodos = todos.filter((todo) => !todo.completed)
  localStorage.setItem('todos', JSON.stringify(newTodos.map((t) => t.id)))
  return newTodos
}

export function clearTodosExpired(todos: Todo[]): Todo[] {
  todos
    .filter((todo) => isTaskOverdue(todo.dueDate))
    .forEach((todo) => {
      localStorage.removeItem(todo.id)
    })
  const newTodos = todos.filter((todo) => !isTaskOverdue(todo.dueDate))
  localStorage.setItem('todos', JSON.stringify(newTodos.map((t) => t.id)))
  return newTodos
}

export function removeAllTodos(): Todo[] {
  localStorage.clear()
  localStorage.setItem('todos', JSON.stringify([]))
  return []
}
