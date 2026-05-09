import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  exportAllToJSON,
  exportProjectsToCSV,
  exportSprintsToCSV,
  exportToCSV,
  parseAppJSON,
} from '../src/utils/csv'
import type { Comment, Project, Sprint, Todo } from '../src/types'
import type { ProjectLimits } from '../src/atoms'

// ─── Factory helpers ──────────────────────────────────────────────────────────

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

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    name: 'My Project',
    description: 'A project',
    color: '#3b82f6',
    priority: 'medium',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
    ...overrides,
  }
}

function makeSprint(overrides: Partial<Sprint> = {}): Sprint {
  return {
    id: 'sprint-1',
    name: 'Sprint 1',
    description: 'First sprint',
    color: '#3b82f6',
    startDate: null,
    dueDate: null,
    status: 'planning',
    projectId: 'proj-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
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

// ─── Shared download mock ─────────────────────────────────────────────────────

function setupDownloadMocks() {
  let capturedContent = ''
  let capturedType = ''

  vi.stubGlobal(
    'Blob',
    class MockBlob {
      constructor(parts: BlobPart[], opts?: BlobPropertyBag) {
        capturedContent = parts.join('')
        capturedType = opts?.type ?? ''
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
    getType: () => capturedType,
  }
}

// ─── exportToCSV ──────────────────────────────────────────────────────────────

describe('exportToCSV', () => {
  let mocks: ReturnType<typeof setupDownloadMocks>

  beforeEach(() => { mocks = setupDownloadMocks() })
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

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

  it('exports tags as a JSON array', () => {
    exportToCSV([makeTodo({ tags: ['frontend', 'bug'] })])
    expect(mocks.getContent()).toContain('frontend')
  })

  it('exports empty tags as []', () => {
    exportToCSV([makeTodo({ tags: [] })])
    expect(mocks.getContent()).toContain('[]')
  })

  it('exports projectId and sprintId', () => {
    exportToCSV([makeTodo({ projectId: 'p1', sprintId: 's1' })])
    const content = mocks.getContent()
    expect(content).toContain('p1')
    expect(content).toContain('s1')
  })

  it('exports multiple todos', () => {
    exportToCSV([makeTodo({ id: 'a' }), makeTodo({ id: 'b' })])
    const lines = mocks.getContent().split('\n')
    expect(lines).toHaveLength(3) // header + 2 rows
  })

  it('uses text/csv MIME type', () => {
    exportToCSV([makeTodo()])
    expect(mocks.getType()).toContain('text/csv')
  })
})

// ─── exportProjectsToCSV ──────────────────────────────────────────────────────

describe('exportProjectsToCSV', () => {
  let mocks: ReturnType<typeof setupDownloadMocks>

  beforeEach(() => { mocks = setupDownloadMocks() })
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

  it('triggers a download click', () => {
    exportProjectsToCSV([makeProject()])
    expect(mocks.mockLink.click).toHaveBeenCalledOnce()
  })

  it('CSV starts with project headers', () => {
    exportProjectsToCSV([makeProject()])
    expect(mocks.getContent()).toMatch(/^id,name,description,color,priority,status,createdAt,updatedAt/)
  })

  it('includes project data', () => {
    exportProjectsToCSV([makeProject({ id: 'proj-42', name: 'My Project' })])
    const content = mocks.getContent()
    expect(content).toContain('proj-42')
    expect(content).toContain('My Project')
  })

  it('exports multiple projects', () => {
    exportProjectsToCSV([makeProject({ id: 'p1' }), makeProject({ id: 'p2' })])
    const lines = mocks.getContent().split('\n')
    expect(lines).toHaveLength(3)
  })

  it('quotes project names with commas', () => {
    exportProjectsToCSV([makeProject({ name: 'Project, Alpha' })])
    expect(mocks.getContent()).toContain('"Project, Alpha"')
  })

  it('handles empty project list', () => {
    exportProjectsToCSV([])
    const content = mocks.getContent()
    expect(content.split('\n')).toHaveLength(1) // only header
  })
})

// ─── exportSprintsToCSV ───────────────────────────────────────────────────────

describe('exportSprintsToCSV', () => {
  let mocks: ReturnType<typeof setupDownloadMocks>

  beforeEach(() => { mocks = setupDownloadMocks() })
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

  it('triggers a download click', () => {
    exportSprintsToCSV([makeSprint()])
    expect(mocks.mockLink.click).toHaveBeenCalledOnce()
  })

  it('CSV starts with sprint headers', () => {
    exportSprintsToCSV([makeSprint()])
    expect(mocks.getContent()).toMatch(/^id,name,description,color/)
  })

  it('includes sprint data', () => {
    exportSprintsToCSV([makeSprint({ id: 'sp-99', name: 'Sprint 99' })])
    const content = mocks.getContent()
    expect(content).toContain('sp-99')
    expect(content).toContain('Sprint 99')
  })

  it('includes projectId column', () => {
    exportSprintsToCSV([makeSprint({ projectId: 'p-abc' })])
    expect(mocks.getContent()).toContain('p-abc')
  })

  it('exports multiple sprints', () => {
    exportSprintsToCSV([makeSprint({ id: 's1' }), makeSprint({ id: 's2' })])
    const lines = mocks.getContent().split('\n')
    expect(lines).toHaveLength(3)
  })

  it('handles empty sprint list', () => {
    exportSprintsToCSV([])
    expect(mocks.getContent().split('\n')).toHaveLength(1)
  })
})

// ─── exportAllToJSON ──────────────────────────────────────────────────────────

describe('exportAllToJSON', () => {
  let mocks: ReturnType<typeof setupDownloadMocks>

  const settings = {
    language: 'it' as const,
    darkMode: false,
    tags: ['tag1'],
    projectLimits: { urgent: 2, high: 2, medium: 4, low: 6 } as ProjectLimits,
    maxActiveSprints: 3,
  }

  beforeEach(() => { mocks = setupDownloadMocks() })
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

  it('triggers a download click', () => {
    exportAllToJSON({ todos: [], projects: [], sprints: [], comments: [], settings })
    expect(mocks.mockLink.click).toHaveBeenCalledOnce()
  })

  it('uses application/json MIME type', () => {
    exportAllToJSON({ todos: [], projects: [], sprints: [], comments: [], settings })
    expect(mocks.getType()).toContain('application/json')
  })

  it('exported JSON has version 1', () => {
    exportAllToJSON({ todos: [], projects: [], sprints: [], comments: [], settings })
    const parsed = JSON.parse(mocks.getContent())
    expect(parsed.version).toBe('1')
  })

  it('exported JSON includes exportedAt timestamp', () => {
    exportAllToJSON({ todos: [], projects: [], sprints: [], comments: [], settings })
    const parsed = JSON.parse(mocks.getContent())
    expect(parsed.exportedAt).toBeTruthy()
  })

  it('exported JSON includes todos', () => {
    exportAllToJSON({ todos: [makeTodo({ id: 'td-1' })], projects: [], sprints: [], comments: [], settings })
    const parsed = JSON.parse(mocks.getContent())
    expect(parsed.todos).toHaveLength(1)
    expect(parsed.todos[0].id).toBe('td-1')
  })

  it('exported JSON includes projects', () => {
    exportAllToJSON({ todos: [], projects: [makeProject({ id: 'pj-1' })], sprints: [], comments: [], settings })
    const parsed = JSON.parse(mocks.getContent())
    expect(parsed.projects[0].id).toBe('pj-1')
  })

  it('exported JSON includes sprints', () => {
    exportAllToJSON({ todos: [], projects: [], sprints: [makeSprint({ id: 'sp-1' })], comments: [], settings })
    const parsed = JSON.parse(mocks.getContent())
    expect(parsed.sprints[0].id).toBe('sp-1')
  })

  it('exported JSON includes comments', () => {
    exportAllToJSON({ todos: [], projects: [], sprints: [], comments: [makeComment({ id: 'cm-1' })], settings })
    const parsed = JSON.parse(mocks.getContent())
    expect(parsed.comments[0].id).toBe('cm-1')
  })

  it('exported JSON includes settings', () => {
    exportAllToJSON({ todos: [], projects: [], sprints: [], comments: [], settings })
    const parsed = JSON.parse(mocks.getContent())
    expect(parsed.settings.language).toBe('it')
    expect(parsed.settings.maxActiveSprints).toBe(3)
  })
})

// ─── parseAppJSON ─────────────────────────────────────────────────────────────

describe('parseAppJSON', () => {
  const validPayload = {
    version: '1',
    exportedAt: '2026-01-01T00:00:00.000Z',
    todos: [makeTodo()],
    projects: [makeProject()],
    sprints: [makeSprint()],
    comments: [makeComment()],
    settings: {
      language: 'it',
      darkMode: false,
      tags: [],
      projectLimits: { urgent: 2, high: 2, medium: 4, low: 6 },
      maxActiveSprints: 3,
    },
  }

  it('parses a valid JSON payload', () => {
    const result = parseAppJSON(JSON.stringify(validPayload))
    expect(result.version).toBe('1')
  })

  it('returns todos array', () => {
    const result = parseAppJSON(JSON.stringify(validPayload))
    expect(result.todos).toHaveLength(1)
  })

  it('returns projects array', () => {
    const result = parseAppJSON(JSON.stringify(validPayload))
    expect(result.projects).toHaveLength(1)
  })

  it('returns sprints array', () => {
    const result = parseAppJSON(JSON.stringify(validPayload))
    expect(result.sprints).toHaveLength(1)
  })

  it('returns comments array', () => {
    const result = parseAppJSON(JSON.stringify(validPayload))
    expect(result.comments).toHaveLength(1)
  })

  it('returns settings', () => {
    const result = parseAppJSON(JSON.stringify(validPayload))
    expect(result.settings.language).toBe('it')
  })

  it('throws on invalid JSON string', () => {
    expect(() => parseAppJSON('not json')).toThrow()
  })

  it('throws when version is missing', () => {
    const bad = { ...validPayload, version: undefined }
    expect(() => parseAppJSON(JSON.stringify(bad))).toThrow()
  })

  it('throws when version is wrong', () => {
    const bad = { ...validPayload, version: '2' }
    expect(() => parseAppJSON(JSON.stringify(bad))).toThrow()
  })

  it('throws for non-object JSON', () => {
    expect(() => parseAppJSON('"just a string"')).toThrow()
  })

  it('throws for null JSON', () => {
    expect(() => parseAppJSON('null')).toThrow()
  })
})
