import { describe, expect, it } from 'vitest'

import { parseCommentsCSV, parseCSV } from '../src/utils/csv'

const TODO_HEADER =
  'id,title,description,completed,createdAt,updatedAt,completedAt,dueDate,notify,priority,category,subtasks'

const COMMENT_HEADER = 'id,todoId,text,createdAt'

function todoRow(overrides: Record<string, string> = {}): string {
  const defaults: Record<string, string> = {
    id: 'abc',
    title: 'My task',
    description: '',
    completed: 'false',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '',
    completedAt: '',
    dueDate: '',
    notify: 'false',
    priority: 'medium',
    category: 'todo',
    subtasks: '[]',
  }
  const row = { ...defaults, ...overrides }
  return [
    row.id,
    row.title,
    row.description,
    row.completed,
    row.createdAt,
    row.updatedAt,
    row.completedAt,
    row.dueDate,
    row.notify,
    row.priority,
    row.category,
    row.subtasks,
  ].join(',')
}

describe('parseCSV', () => {
  it('returns empty array for header-only CSV', () => {
    expect(parseCSV(TODO_HEADER)).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(parseCSV('')).toEqual([])
  })

  it('parses a simple todo row', () => {
    const csv = [TODO_HEADER, todoRow()].join('\n')
    const result = parseCSV(csv)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('abc')
    expect(result[0].title).toBe('My task')
    expect(result[0].priority).toBe('medium')
    expect(result[0].category).toBe('todo')
  })

  it('parses boolean fields correctly', () => {
    const csv = [
      TODO_HEADER,
      todoRow({ completed: 'true', notify: 'true' }),
    ].join('\n')
    const result = parseCSV(csv)
    expect(result[0].completed).toBe(true)
    expect(result[0].notify).toBe(true)
  })

  it('sets null for empty date fields', () => {
    const csv = [
      TODO_HEADER,
      todoRow({ dueDate: '', updatedAt: '', completedAt: '' }),
    ].join('\n')
    const result = parseCSV(csv)
    expect(result[0].dueDate).toBeNull()
    expect(result[0].updatedAt).toBeNull()
    expect(result[0].completedAt).toBeNull()
  })

  it('preserves non-null date fields', () => {
    const date = '2024-06-01T12:00:00.000Z'
    const csv = [TODO_HEADER, todoRow({ dueDate: date })].join('\n')
    expect(parseCSV(csv)[0].dueDate).toBe(date)
  })

  it('handles quoted fields containing commas', () => {
    const csv = [TODO_HEADER, todoRow({ title: '"Task, with comma"' })].join(
      '\n'
    )
    const result = parseCSV(csv)
    expect(result[0].title).toBe('Task, with comma')
  })

  it('handles quoted fields containing newlines', () => {
    const csv = [TODO_HEADER, todoRow({ description: '"line1\nline2"' })].join(
      '\n'
    )
    const result = parseCSV(csv)
    expect(result[0].description).toBe('line1\nline2')
  })

  it('generates an id when the field is empty', () => {
    const csv = [TODO_HEADER, todoRow({ id: '' })].join('\n')
    expect(parseCSV(csv)[0].id).toBeTruthy()
  })

  it('sets default title when field is empty', () => {
    const csv = [TODO_HEADER, todoRow({ title: '' })].join('\n')
    expect(parseCSV(csv)[0].title).toBe('Imported Task')
  })

  it('sets default priority when field is empty', () => {
    const csv = [TODO_HEADER, todoRow({ priority: '' })].join('\n')
    expect(parseCSV(csv)[0].priority).toBe('medium')
  })

  it('sets default category when field is empty', () => {
    const csv = [TODO_HEADER, todoRow({ category: '' })].join('\n')
    expect(parseCSV(csv)[0].category).toBe('todo')
  })

  it('parses multiple rows', () => {
    const csv = [TODO_HEADER, todoRow({ id: '1' }), todoRow({ id: '2' })].join(
      '\n'
    )
    expect(parseCSV(csv)).toHaveLength(2)
  })

  it('handles CRLF line endings', () => {
    const csv = [TODO_HEADER, todoRow()].join('\r\n')
    expect(parseCSV(csv)).toHaveLength(1)
  })

  it('parses subtasks from JSON column', () => {
    const subtasks = JSON.stringify([{ id: 's1', title: 'Sub 1', completed: false }])
    const csv = [TODO_HEADER, todoRow({ subtasks: `"${subtasks.replace(/"/g, '""')}"` })].join('\n')
    const result = parseCSV(csv)
    expect(result[0].subtasks).toHaveLength(1)
    expect(result[0].subtasks[0].title).toBe('Sub 1')
    expect(result[0].subtasks[0].completed).toBe(false)
  })

  it('defaults subtasks to empty array when column is missing', () => {
    const headerNoSubtasks = 'id,title,description,completed,createdAt,updatedAt,completedAt,dueDate,notify,priority,category'
    const row = 'abc,My task,,false,2024-01-01T00:00:00.000Z,,,,,medium,todo'
    const result = parseCSV([headerNoSubtasks, row].join('\n'))
    expect(result[0].subtasks).toEqual([])
  })

  it('defaults subtasks to empty array on invalid JSON', () => {
    const csv = [TODO_HEADER, todoRow({ subtasks: 'not-json' })].join('\n')
    expect(parseCSV(csv)[0].subtasks).toEqual([])
  })
})

describe('parseCommentsCSV', () => {
  const now = '2024-01-01T00:00:00.000Z'

  it('returns empty array for header-only CSV', () => {
    expect(parseCommentsCSV(COMMENT_HEADER)).toEqual([])
  })

  it('parses a valid comment row', () => {
    const csv = [COMMENT_HEADER, `c1,todo1,Hello,${now}`].join('\n')
    const result = parseCommentsCSV(csv)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
    expect(result[0].todoId).toBe('todo1')
    expect(result[0].text).toBe('Hello')
  })

  it('skips rows with missing required fields', () => {
    const csv = [COMMENT_HEADER, 'c1,,Hello,2024-01-01T00:00:00.000Z'].join(
      '\n'
    )
    expect(parseCommentsCSV(csv)).toHaveLength(0)
  })

  it('preserves whitespace in text field', () => {
    const csv = [COMMENT_HEADER, `c1,todo1,"  spaced  ",${now}`].join('\n')
    expect(parseCommentsCSV(csv)[0].text).toBe('  spaced  ')
  })

  it('parses multiple rows', () => {
    const csv = [
      COMMENT_HEADER,
      `c1,todo1,First,${now}`,
      `c2,todo1,Second,${now}`,
    ].join('\n')
    expect(parseCommentsCSV(csv)).toHaveLength(2)
  })
})
