import { describe, expect, it } from 'vitest'

import { isTaskOverdue } from '../src/utils/todo'
import {
  FilterState,
  applyFilters,
  filterTodoByStatus,
  generateUniqueId,
  orderTodos,
  tagColor,
} from '../src/utils/utils'
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
    tags: [],
    ...overrides,
  }
}

function makeFilters(overrides: Partial<FilterState> = {}): FilterState {
  return {
    status: '',
    completion: 'all',
    overdue: 'all',
    tags: [],
    search: '',
    dueDateFrom: '',
    dueDateTo: '',
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

// ─── tagColor ─────────────────────────────────────────────────────────────────

describe('tagColor', () => {
  it('returns a non-empty string', () => {
    expect(typeof tagColor('frontend')).toBe('string')
    expect(tagColor('frontend').length).toBeGreaterThan(0)
  })

  it('is deterministic — same input always returns the same color', () => {
    expect(tagColor('bug')).toBe(tagColor('bug'))
    expect(tagColor('urgent')).toBe(tagColor('urgent'))
  })

  it('contains bg- and text- Tailwind classes', () => {
    const color = tagColor('feature')
    expect(color).toMatch(/bg-/)
    expect(color).toMatch(/text-/)
  })

  it('handles empty string without throwing', () => {
    expect(() => tagColor('')).not.toThrow()
    expect(typeof tagColor('')).toBe('string')
  })

  it('returns different colors for different inputs', () => {
    const tags = ['a', 'bb', 'ccc', 'dddd', 'eeeee', 'ffffff', 'ggggggg', 'hhhhhhhh', 'iiiiiiiii']
    const colors = tags.map(tagColor)
    expect(new Set(colors).size).toBeGreaterThan(1)
  })
})

// ─── applyFilters ─────────────────────────────────────────────────────────────

describe('applyFilters', () => {
  it('shows all todos when no filter is active', () => {
    expect(applyFilters(makeTodo(), makeFilters())).toBe(true)
  })

  // — status —
  it('hides todo with wrong status when status filter is set', () => {
    expect(applyFilters(makeTodo({ status: 'todo' }), makeFilters({ status: 'progress' }))).toBe(false)
  })

  it('shows todo with matching status', () => {
    expect(applyFilters(makeTodo({ status: 'progress' }), makeFilters({ status: 'progress' }))).toBe(true)
  })

  it('shows any status when status filter is empty string', () => {
    expect(applyFilters(makeTodo({ status: 'archived' }), makeFilters({ status: '' }))).toBe(true)
  })

  it('deselecting a status (click same pill) resets to show all', () => {
    const filters = makeFilters({ status: 'done' })
    expect(applyFilters(makeTodo({ status: 'todo' }), filters)).toBe(false)
    expect(applyFilters(makeTodo({ status: 'todo' }), makeFilters({ status: '' }))).toBe(true)
  })

  // — completion —
  it('hides uncompleted when completion=completed', () => {
    expect(applyFilters(makeTodo({ completed: false }), makeFilters({ completion: 'completed' }))).toBe(false)
  })

  it('shows completed when completion=completed', () => {
    expect(applyFilters(makeTodo({ completed: true }), makeFilters({ completion: 'completed' }))).toBe(true)
  })

  it('hides completed when completion=uncompleted', () => {
    expect(applyFilters(makeTodo({ completed: true }), makeFilters({ completion: 'uncompleted' }))).toBe(false)
  })

  it('shows uncompleted when completion=uncompleted', () => {
    expect(applyFilters(makeTodo({ completed: false }), makeFilters({ completion: 'uncompleted' }))).toBe(true)
  })

  it('shows both when completion=all', () => {
    expect(applyFilters(makeTodo({ completed: true }), makeFilters({ completion: 'all' }))).toBe(true)
    expect(applyFilters(makeTodo({ completed: false }), makeFilters({ completion: 'all' }))).toBe(true)
  })

  // — overdue —
  it('hides non-overdue when overdue=overdue', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60).toISOString()
    expect(applyFilters(makeTodo({ dueDate: future }), makeFilters({ overdue: 'overdue' }))).toBe(false)
  })

  it('shows overdue todo when overdue=overdue', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString()
    expect(applyFilters(makeTodo({ dueDate: past }), makeFilters({ overdue: 'overdue' }))).toBe(true)
  })

  it('hides overdue todo when overdue=not_overdue', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString()
    expect(applyFilters(makeTodo({ dueDate: past }), makeFilters({ overdue: 'not_overdue' }))).toBe(false)
  })

  it('shows non-overdue todo when overdue=not_overdue', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60).toISOString()
    expect(applyFilters(makeTodo({ dueDate: future }), makeFilters({ overdue: 'not_overdue' }))).toBe(true)
  })

  it('shows null-dueDate todo when overdue=not_overdue', () => {
    expect(applyFilters(makeTodo({ dueDate: null }), makeFilters({ overdue: 'not_overdue' }))).toBe(true)
  })

  // — tags —
  it('shows all todos when tags filter is empty', () => {
    expect(applyFilters(makeTodo({ tags: ['frontend'] }), makeFilters({ tags: [] }))).toBe(true)
  })

  it('shows todo that has at least one matching tag (OR logic)', () => {
    expect(applyFilters(makeTodo({ tags: ['frontend', 'bug'] }), makeFilters({ tags: ['bug'] }))).toBe(true)
  })

  it('hides todo that has none of the selected tags', () => {
    expect(applyFilters(makeTodo({ tags: ['frontend'] }), makeFilters({ tags: ['backend'] }))).toBe(false)
  })

  it('hides todo with no tags when tag filter is active', () => {
    expect(applyFilters(makeTodo({ tags: [] }), makeFilters({ tags: ['frontend'] }))).toBe(false)
  })

  it('handles undefined tags on todo gracefully', () => {
    const todo = { ...makeTodo(), tags: undefined as unknown as string[] }
    expect(applyFilters(todo, makeFilters({ tags: ['bug'] }))).toBe(false)
    expect(applyFilters(todo, makeFilters({ tags: [] }))).toBe(true)
  })

  // — search —
  it('shows todo whose title matches search string (case-insensitive)', () => {
    expect(applyFilters(makeTodo({ title: 'Fix Bug #42' }), makeFilters({ search: 'bug' }))).toBe(true)
  })

  it('hides todo whose title does not match search', () => {
    expect(applyFilters(makeTodo({ title: 'Fix Bug' }), makeFilters({ search: 'feature' }))).toBe(false)
  })

  it('shows all todos when search is empty', () => {
    expect(applyFilters(makeTodo({ title: 'Anything' }), makeFilters({ search: '' }))).toBe(true)
  })

  it('search is case-insensitive', () => {
    expect(applyFilters(makeTodo({ title: 'Deploy API' }), makeFilters({ search: 'deploy api' }))).toBe(true)
    expect(applyFilters(makeTodo({ title: 'deploy api' }), makeFilters({ search: 'DEPLOY' }))).toBe(true)
  })

  // — date range —
  it('hides todo without dueDate when dueDateFrom is set', () => {
    expect(applyFilters(makeTodo({ dueDate: null }), makeFilters({ dueDateFrom: '2024-01-01' }))).toBe(false)
  })

  it('hides todo without dueDate when dueDateTo is set', () => {
    expect(applyFilters(makeTodo({ dueDate: null }), makeFilters({ dueDateTo: '2024-12-31' }))).toBe(false)
  })

  it('shows todo with dueDate within range [from, to]', () => {
    const todo = makeTodo({ dueDate: '2024-06-15T12:00:00.000Z' })
    expect(applyFilters(todo, makeFilters({ dueDateFrom: '2024-06-01', dueDateTo: '2024-06-30' }))).toBe(true)
  })

  it('hides todo with dueDate before the from date', () => {
    const todo = makeTodo({ dueDate: '2024-05-01T12:00:00.000Z' })
    expect(applyFilters(todo, makeFilters({ dueDateFrom: '2024-06-01' }))).toBe(false)
  })

  it('hides todo with dueDate after the to date', () => {
    const todo = makeTodo({ dueDate: '2024-07-01T00:00:00.000Z' })
    expect(applyFilters(todo, makeFilters({ dueDateTo: '2024-06-30' }))).toBe(false)
  })

  it('includes todo with dueDate on the same day as the to date', () => {
    const todo = makeTodo({ dueDate: '2024-06-30T10:00:00.000Z' })
    expect(applyFilters(todo, makeFilters({ dueDateTo: '2024-06-30' }))).toBe(true)
  })

  it('shows todo with dueDate when no range filter is set', () => {
    const todo = makeTodo({ dueDate: '2024-06-01T12:00:00.000Z' })
    expect(applyFilters(todo, makeFilters())).toBe(true)
  })

  // — combined filters (AND logic) —
  it('all filters pass simultaneously', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString()
    const todo = makeTodo({
      status: 'progress',
      completed: false,
      dueDate: past,
      tags: ['bug'],
      title: 'Fix it',
    })
    expect(applyFilters(todo, makeFilters({
      status: 'progress',
      completion: 'uncompleted',
      overdue: 'overdue',
      tags: ['bug'],
      search: 'fix',
    }))).toBe(true)
  })

  it('one failing filter rejects the todo', () => {
    const todo = makeTodo({ status: 'progress', completed: false, tags: ['bug'] })
    expect(applyFilters(todo, makeFilters({
      status: 'progress',
      completion: 'completed',
    }))).toBe(false)
  })
})
