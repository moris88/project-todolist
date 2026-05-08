import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { Todo } from '../src/types'
import {
  addTodoStorage,
  clearTodosCompleted,
  clearTodosExpired,
  getTodosStorage,
  removeAllTodos,
  removeTodoStorage,
  updateTodoStorage,
} from '../src/utils/todo'

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'test-id',
    title: 'Test task',
    description: '',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    completedAt: null,
    dueDate: null,
    notify: false,
    priority: 'medium',
    status: 'todo',
    subtasks: [],
    tags: [],
    ...overrides,
  }
}

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('addTodoStorage', () => {
  it('adds the todo to the returned list', () => {
    const todo = makeTodo()
    const result = addTodoStorage(todo, [])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(todo.id)
  })

  it('persists the todo in localStorage', () => {
    const todo = makeTodo()
    addTodoStorage(todo, [])
    expect(localStorage.getItem(todo.id)).toBeTruthy()
    expect(JSON.parse(localStorage.getItem(todo.id)!).title).toBe(todo.title)
  })

  it('appends to existing todos in localStorage', () => {
    const first = makeTodo({ id: 'first' })
    const second = makeTodo({ id: 'second' })
    addTodoStorage(first, [])
    addTodoStorage(second, [first])
    const ids = JSON.parse(localStorage.getItem('todos')!)
    expect(ids).toContain('first')
    expect(ids).toContain('second')
  })
})

describe('getTodosStorage', () => {
  it('returns an empty array when localStorage is empty', () => {
    expect(getTodosStorage()).toEqual([])
  })

  it('returns saved todos', () => {
    const todo = makeTodo({ id: 'abc' })
    addTodoStorage(todo, [])
    const result = getTodosStorage()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('abc')
  })

  it('skips missing entries without throwing', () => {
    localStorage.setItem('todos', JSON.stringify(['missing-id']))
    expect(getTodosStorage()).toEqual([])
  })
})

describe('updateTodoStorage', () => {
  it('updates existing todos in localStorage', () => {
    const todo = makeTodo({ id: 'upd' })
    addTodoStorage(todo, [])
    const updated = { ...todo, title: 'Updated' }
    updateTodoStorage([updated])
    expect(JSON.parse(localStorage.getItem('upd')!).title).toBe('Updated')
  })

  it('returns the same todo list', () => {
    const todos = [makeTodo({ id: 'r1' }), makeTodo({ id: 'r2' })]
    expect(updateTodoStorage(todos)).toEqual(todos)
  })
})

describe('removeTodoStorage', () => {
  it('removes the todo from the returned list', () => {
    const todo = makeTodo({ id: 'del' })
    addTodoStorage(todo, [])
    const result = removeTodoStorage([todo], 'del')
    expect(result).toHaveLength(0)
  })

  it('removes the todo entry from localStorage', () => {
    const todo = makeTodo({ id: 'del2' })
    addTodoStorage(todo, [])
    removeTodoStorage([todo], 'del2')
    expect(localStorage.getItem('del2')).toBeNull()
  })

  it('keeps other todos untouched', () => {
    const a = makeTodo({ id: 'keep' })
    const b = makeTodo({ id: 'remove' })
    addTodoStorage(a, [])
    addTodoStorage(b, [a])
    const result = removeTodoStorage([a, b], 'remove')
    expect(result.map((t) => t.id)).toEqual(['keep'])
  })
})

describe('clearTodosCompleted', () => {
  it('removes completed todos from the list', () => {
    const done = makeTodo({ id: 'done', completed: true })
    const pending = makeTodo({ id: 'pending', completed: false })
    const result = clearTodosCompleted([done, pending])
    expect(result.map((t) => t.id)).toEqual(['pending'])
  })

  it('removes completed todos from localStorage', () => {
    const done = makeTodo({ id: 'done2', completed: true })
    addTodoStorage(done, [])
    clearTodosCompleted([done])
    expect(localStorage.getItem('done2')).toBeNull()
  })
})

describe('clearTodosExpired', () => {
  it('removes overdue todos', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString()
    const expired = makeTodo({ id: 'exp', dueDate: past })
    const fresh = makeTodo({ id: 'fresh', dueDate: null })
    const result = clearTodosExpired([expired, fresh])
    expect(result.map((t) => t.id)).toEqual(['fresh'])
  })
})

describe('removeAllTodos', () => {
  it('returns an empty array', () => {
    const todo = makeTodo()
    addTodoStorage(todo, [])
    expect(removeAllTodos()).toEqual([])
  })

  it('clears localStorage', () => {
    addTodoStorage(makeTodo({ id: 'x' }), [])
    removeAllTodos()
    expect(JSON.parse(localStorage.getItem('todos')!)).toEqual([])
  })
})

describe('getTodosStorage backward compat', () => {
  it('migrates a todo stored without tags to tags: []', () => {
    const id = 'legacy-id'
    const legacy = {
      id,
      title: 'Old task',
      description: '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      completedAt: null,
      dueDate: null,
      notify: false,
      priority: 'medium',
      status: 'todo',
      subtasks: [],
      // no tags field
    }
    localStorage.setItem('todos', JSON.stringify([id]))
    localStorage.setItem(id, JSON.stringify(legacy))

    const result = getTodosStorage()
    expect(result).toHaveLength(1)
    expect(result[0].tags).toEqual([])
  })

  it('preserves existing tags when loading', () => {
    const id = 'tagged-id'
    const todo = makeTodo({ id, tags: ['bug', 'frontend'] })
    addTodoStorage(todo, [])

    const result = getTodosStorage()
    expect(result[0].tags).toEqual(['bug', 'frontend'])
  })
})
