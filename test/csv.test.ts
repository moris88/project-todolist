import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { exportCommentsToCSV, exportToCSV, parseCommentsCSV, parseCSV } from '../src/utils/csv'
import { Comment, Todo } from '../src/types'

const TODO_HEADER =
  'id,title,description,completed,createdAt,updatedAt,completedAt,dueDate,notify,priority,status,subtasks,tags,projectId,sprintId,deletedAt'

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
    status: 'todo',
    subtasks: '[]',
    tags: '[]',
    projectId: '',
    sprintId: '',
    deletedAt: '',
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
    row.status,
    row.subtasks,
    row.tags,
    row.projectId,
    row.sprintId,
    row.deletedAt,
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
    expect(result[0].status).toBe('todo')
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

  it('sets default status when field is empty', () => {
    const csv = [TODO_HEADER, todoRow({ status: '' })].join('\n')
    expect(parseCSV(csv)[0].status).toBe('todo')
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
    const subtasks = JSON.stringify([
      { id: 's1', title: 'Sub 1', completed: false },
    ])
    const csv = [
      TODO_HEADER,
      todoRow({ subtasks: `"${subtasks.replace(/"/g, '""')}"` }),
    ].join('\n')
    const result = parseCSV(csv)
    expect(result[0].subtasks).toHaveLength(1)
    expect(result[0].subtasks[0].title).toBe('Sub 1')
    expect(result[0].subtasks[0].completed).toBe(false)
    // completedAt must be migrated to null for old CSV without the field
    expect(result[0].subtasks[0].completedAt).toBeNull()
  })

  it('preserves completedAt when present in subtask JSON', () => {
    const ts = '2024-06-01T12:00:00.000Z'
    const subtasks = JSON.stringify([
      { id: 's2', title: 'Done sub', completed: true, completedAt: ts },
    ])
    const csv = [
      TODO_HEADER,
      todoRow({ subtasks: `"${subtasks.replace(/"/g, '""')}"` }),
    ].join('\n')
    const result = parseCSV(csv)
    expect(result[0].subtasks[0].completedAt).toBe(ts)
  })

  it('defaults subtasks to empty array when column is missing', () => {
    const headerNoSubtasks =
      'id,title,description,completed,createdAt,updatedAt,completedAt,dueDate,notify,priority,status'
    const row = 'abc,My task,,false,2024-01-01T00:00:00.000Z,,,,,medium,todo'
    const result = parseCSV([headerNoSubtasks, row].join('\n'))
    expect(result[0].subtasks).toEqual([])
  })

  it('defaults subtasks to empty array on invalid JSON', () => {
    const csv = [TODO_HEADER, todoRow({ subtasks: 'not-json' })].join('\n')
    expect(parseCSV(csv)[0].subtasks).toEqual([])
  })

  it('parses tags from JSON column', () => {
    const tags = JSON.stringify(['frontend', 'bug'])
    const csv = [TODO_HEADER, todoRow({ tags: `"${tags.replace(/"/g, '""')}"` })].join('\n')
    const result = parseCSV(csv)
    expect(result[0].tags).toEqual(['frontend', 'bug'])
  })

  it('defaults tags to empty array when column is missing', () => {
    const headerNoTags =
      'id,title,description,completed,createdAt,updatedAt,completedAt,dueDate,notify,priority,status,subtasks'
    const row = 'abc,My task,,false,2024-01-01T00:00:00.000Z,,,,,medium,todo,[]'
    const result = parseCSV([headerNoTags, row].join('\n'))
    expect(result[0].tags).toEqual([])
  })

  it('defaults tags to empty array on invalid JSON', () => {
    const csv = [TODO_HEADER, todoRow({ tags: 'not-json' })].join('\n')
    expect(parseCSV(csv)[0].tags).toEqual([])
  })

  it('parses projectId when present', () => {
    const csv = [TODO_HEADER, todoRow({ projectId: 'proj-abc' })].join('\n')
    expect(parseCSV(csv)[0].projectId).toBe('proj-abc')
  })

  it('sets projectId to null when column is empty', () => {
    const csv = [TODO_HEADER, todoRow({ projectId: '' })].join('\n')
    expect(parseCSV(csv)[0].projectId).toBeNull()
  })

  it('parses sprintId when present', () => {
    const csv = [TODO_HEADER, todoRow({ sprintId: 'sprint-xyz' })].join('\n')
    expect(parseCSV(csv)[0].sprintId).toBe('sprint-xyz')
  })

  it('sets sprintId to null when column is empty', () => {
    const csv = [TODO_HEADER, todoRow({ sprintId: '' })].join('\n')
    expect(parseCSV(csv)[0].sprintId).toBeNull()
  })

  it('parses deletedAt when present', () => {
    const ts = '2024-06-01T12:00:00.000Z'
    const csv = [TODO_HEADER, todoRow({ deletedAt: ts })].join('\n')
    expect(parseCSV(csv)[0].deletedAt).toBe(ts)
  })

  it('sets deletedAt to null when column is empty', () => {
    const csv = [TODO_HEADER, todoRow({ deletedAt: '' })].join('\n')
    expect(parseCSV(csv)[0].deletedAt).toBeNull()
  })

  it('defaults projectId/sprintId/deletedAt to null when columns are missing (old CSV)', () => {
    const oldHeader =
      'id,title,description,completed,createdAt,updatedAt,completedAt,dueDate,notify,priority,status,subtasks,tags'
    const row = 'abc,Old task,,false,2024-01-01T00:00:00.000Z,,,,,medium,todo,[],[]'
    const result = parseCSV([oldHeader, row].join('\n'))
    expect(result[0].projectId).toBeNull()
    expect(result[0].sprintId).toBeNull()
    expect(result[0].deletedAt).toBeNull()
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

// ─── Helpers for export tests ─────────────────────────────────────────────────

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'test-id',
    title: 'Test task',
    description: '',
    completed: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
    completedAt: null,
    dueDate: null,
    notify: false,
    priority: 'medium',
    status: 'todo',
    subtasks: [],
    tags: [],
    projectId: null,
    sprintId: null,
    deletedAt: null,
    ...overrides,
  }
}

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'comment-id',
    todoId: 'test-id',
    text: 'A comment',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ─── Shared mock setup ────────────────────────────────────────────────────────

function setupDownloadMocks() {
  let capturedContent = ''

  vi.stubGlobal(
    'Blob',
    class MockBlob {
      constructor(parts: BlobPart[]) {
        capturedContent = parts.join('')
      }
    }
  )
  vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:mock') })

  const mockLink = {
    setAttribute: vi.fn(),
    click: vi.fn(),
    style: {} as CSSStyleDeclaration,
  }
  vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
  vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
  vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)

  return {
    mockLink,
    getContent: () => capturedContent,
  }
}

// ─── exportToCSV ──────────────────────────────────────────────────────────────

describe('exportToCSV', () => {
  let mocks: ReturnType<typeof setupDownloadMocks>

  beforeEach(() => {
    mocks = setupDownloadMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('triggers a download click', () => {
    exportToCSV([makeTodo()])
    expect(mocks.mockLink.click).toHaveBeenCalledOnce()
  })

  it('CSV starts with correct headers', () => {
    exportToCSV([makeTodo()])
    expect(mocks.getContent()).toMatch(/^id,title,description/)
  })

  it('includes todo data in the CSV', () => {
    exportToCSV([makeTodo({ id: 'x1', title: 'My Task' })])
    const content = mocks.getContent()
    expect(content).toContain('x1')
    expect(content).toContain('My Task')
  })

  it('quotes fields that contain commas', () => {
    exportToCSV([makeTodo({ title: 'Task, One' })])
    expect(mocks.getContent()).toContain('"Task, One"')
  })

  it('escapes double-quotes in title', () => {
    exportToCSV([makeTodo({ title: 'Say "hello"' })])
    expect(mocks.getContent()).toContain('"Say ""hello"""')
  })

  it('quotes fields that contain a newline', () => {
    exportToCSV([makeTodo({ title: 'line1\nline2' })])
    expect(mocks.getContent()).toContain('"line1\nline2"')
  })

  it('includes tags column in the header', () => {
    exportToCSV([makeTodo()])
    expect(mocks.getContent()).toContain('tags')
  })

  it('exports tags as a JSON array', () => {
    exportToCSV([makeTodo({ tags: ['frontend', 'bug'] })])
    expect(mocks.getContent()).toContain('frontend')
    expect(mocks.getContent()).toContain('bug')
  })

  it('exports empty tags as []', () => {
    exportToCSV([makeTodo({ tags: [] })])
    expect(mocks.getContent()).toContain('[]')
  })
})

// ─── exportCommentsToCSV ──────────────────────────────────────────────────────

describe('exportCommentsToCSV', () => {
  let mocks: ReturnType<typeof setupDownloadMocks>

  beforeEach(() => {
    mocks = setupDownloadMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('triggers a download click', () => {
    exportCommentsToCSV([makeComment()])
    expect(mocks.mockLink.click).toHaveBeenCalledOnce()
  })

  it('CSV starts with comment headers', () => {
    exportCommentsToCSV([makeComment()])
    expect(mocks.getContent()).toMatch(/^id,todoId,text,createdAt/)
  })

  it('includes comment data', () => {
    exportCommentsToCSV([makeComment({ id: 'cmt-42', text: 'Hello World' })])
    const content = mocks.getContent()
    expect(content).toContain('cmt-42')
    expect(content).toContain('Hello World')
  })
})
