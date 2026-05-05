import { describe, expect, it } from 'vitest'

import { isTaskOverdue } from '../src/utils/todo'
import { filterTodoByStatus, generateUniqueId, orderTodos } from '../src/utils/utils'
import { Todo } from '../src/types'

describe('generateUniqueId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateUniqueId()).toBe('string')
    expect(generateUniqueId().length).toBeGreaterThan(0)
  })

  it('generates unique values across multiple calls', () => {
    const ids = Array.from({ length: 100 }, () => generateUniqueId())
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('isTaskOverdue', () => {
  it('returns false when dueDate is null', () => {
    expect(isTaskOverdue(null)).toBe(false)
  })

  it('returns true when dueDate is in the past', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString()
    expect(isTaskOverdue(past)).toBe(true)
  })

  it('returns false when dueDate is in the future', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60).toISOString()
    expect(isTaskOverdue(future)).toBe(false)
  })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
    ...overrides,
  }
}

// ─── orderTodos ───────────────────────────────────────────────────────────────

describe('orderTodos', () => {
  it('sorts completed task after incomplete (a=done, b=pending → > 0)', () => {
    const a = makeTodo({ completed: true })
    const b = makeTodo({ completed: false })
    expect(orderTodos(a, b)).toBeGreaterThan(0)
  })

  it('sorts incomplete task before completed (a=pending, b=done → < 0)', () => {
    const a = makeTodo({ completed: false })
    const b = makeTodo({ completed: true })
    expect(orderTodos(a, b)).toBeLessThan(0)
  })

  it('sorts overdue incomplete before non-overdue incomplete (→ < 0)', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString()
    const a = makeTodo({ dueDate: past, completed: false })
    const b = makeTodo({ dueDate: null, completed: false })
    expect(orderTodos(a, b)).toBeLessThan(0)
  })

  it('sorts non-overdue after overdue (→ > 0)', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString()
    const a = makeTodo({ dueDate: null, completed: false })
    const b = makeTodo({ dueDate: past, completed: false })
    expect(orderTodos(a, b)).toBeGreaterThan(0)
  })

  it('sorts urgent before high (both not-completed, not-overdue)', () => {
    const a = makeTodo({ priority: 'urgent' })
    const b = makeTodo({ priority: 'high' })
    expect(orderTodos(a, b)).toBeLessThan(0)
  })

  it('sorts high before low (a=high, b=low → -1)', () => {
    const a = makeTodo({ priority: 'high' })
    const b = makeTodo({ priority: 'low' })
    expect(orderTodos(a, b)).toBe(-1)
  })

  it('returns a number for identical todos with same priority', () => {
    const a = makeTodo({ priority: 'medium' })
    const b = makeTodo({ priority: 'medium' })
    expect(typeof orderTodos(a, b)).toBe('number')
  })
})

// ─── filterTodoByStatus ───────────────────────────────────────────────────────

describe('filterTodoByStatus', () => {
  it("filter '0' always returns true regardless of status", () => {
    expect(filterTodoByStatus(makeTodo({ status: 'todo' }), '0')).toBe(true)
    expect(filterTodoByStatus(makeTodo({ status: 'progress', completed: true }), '0')).toBe(true)
  })

  it("filter '1' returns true for status=todo, false for progress", () => {
    expect(filterTodoByStatus(makeTodo({ status: 'todo' }), '1')).toBe(true)
    expect(filterTodoByStatus(makeTodo({ status: 'progress' }), '1')).toBe(false)
  })

  it("filter '2' returns true for status=progress, false for todo", () => {
    expect(filterTodoByStatus(makeTodo({ status: 'progress' }), '2')).toBe(true)
    expect(filterTodoByStatus(makeTodo({ status: 'todo' }), '2')).toBe(false)
  })

  it("filter '3' returns true for status=review", () => {
    expect(filterTodoByStatus(makeTodo({ status: 'review' }), '3')).toBe(true)
    expect(filterTodoByStatus(makeTodo({ status: 'todo' }), '3')).toBe(false)
  })

  it("filter '4' returns true for status=testing", () => {
    expect(filterTodoByStatus(makeTodo({ status: 'testing' }), '4')).toBe(true)
    expect(filterTodoByStatus(makeTodo({ status: 'todo' }), '4')).toBe(false)
  })

  it("filter '5' returns true for status=blocked", () => {
    expect(filterTodoByStatus(makeTodo({ status: 'blocked' }), '5')).toBe(true)
    expect(filterTodoByStatus(makeTodo({ status: 'todo' }), '5')).toBe(false)
  })

  it("filter '6' returns true for status=paused", () => {
    expect(filterTodoByStatus(makeTodo({ status: 'paused' }), '6')).toBe(true)
    expect(filterTodoByStatus(makeTodo({ status: 'todo' }), '6')).toBe(false)
  })

  it("filter '7' returns true for completed=true, false for completed=false", () => {
    expect(filterTodoByStatus(makeTodo({ completed: true }), '7')).toBe(true)
    expect(filterTodoByStatus(makeTodo({ completed: false }), '7')).toBe(false)
  })

  it("filter '8' returns true for completed=false, false for completed=true", () => {
    expect(filterTodoByStatus(makeTodo({ completed: false }), '8')).toBe(true)
    expect(filterTodoByStatus(makeTodo({ completed: true }), '8')).toBe(false)
  })

  it("filter '9' returns true for past dueDate, false for null", () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString()
    expect(filterTodoByStatus(makeTodo({ dueDate: past }), '9')).toBe(true)
    expect(filterTodoByStatus(makeTodo({ dueDate: null }), '9')).toBe(false)
  })

  it("filter '10' returns true for null dueDate, false for past dueDate", () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString()
    expect(filterTodoByStatus(makeTodo({ dueDate: null }), '10')).toBe(true)
    expect(filterTodoByStatus(makeTodo({ dueDate: past }), '10')).toBe(false)
  })

  it("default unknown filter returns false", () => {
    expect(filterTodoByStatus(makeTodo(), 'unknown')).toBe(false)
  })
})
