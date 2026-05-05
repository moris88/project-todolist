import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { Comment } from '../src/types'
import {
  addCommentStorage,
  getCommentsStorage,
  mergeCommentsStorage,
  removeCommentsByTodoId,
  removeCommentStorage,
} from '../src/utils/comments'

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'c1',
    todoId: 'todo1',
    text: 'Hello',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('getCommentsStorage', () => {
  it('returns empty array when localStorage is empty', () => {
    expect(getCommentsStorage()).toEqual([])
  })

  it('returns saved comments', () => {
    const comment = makeComment()
    localStorage.setItem('comments', JSON.stringify([comment]))
    expect(getCommentsStorage()).toEqual([comment])
  })

  it('returns empty array on invalid JSON', () => {
    localStorage.setItem('comments', 'invalid-json')
    expect(getCommentsStorage()).toEqual([])
  })
})

describe('addCommentStorage', () => {
  it('adds a comment to the list', () => {
    const comment = makeComment()
    const result = addCommentStorage(comment, [])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('c1')
  })

  it('persists comments to localStorage', () => {
    const comment = makeComment()
    addCommentStorage(comment, [])
    expect(getCommentsStorage()).toHaveLength(1)
  })

  it('appends to existing comments', () => {
    const first = makeComment({ id: 'c1' })
    const second = makeComment({ id: 'c2' })
    addCommentStorage(first, [])
    const result = addCommentStorage(second, [first])
    expect(result).toHaveLength(2)
  })
})

describe('removeCommentStorage', () => {
  it('removes the comment by id', () => {
    const a = makeComment({ id: 'c1' })
    const b = makeComment({ id: 'c2' })
    const result = removeCommentStorage('c1', [a, b])
    expect(result.map((c) => c.id)).toEqual(['c2'])
  })

  it('persists the removal to localStorage', () => {
    const comment = makeComment({ id: 'del' })
    addCommentStorage(comment, [])
    removeCommentStorage('del', [comment])
    expect(getCommentsStorage()).toHaveLength(0)
  })
})

describe('removeCommentsByTodoId', () => {
  it('removes all comments for the given todoId', () => {
    const a = makeComment({ id: 'c1', todoId: 'todo1' })
    const b = makeComment({ id: 'c2', todoId: 'todo1' })
    const c = makeComment({ id: 'c3', todoId: 'todo2' })
    const result = removeCommentsByTodoId('todo1', [a, b, c])
    expect(result.map((x) => x.id)).toEqual(['c3'])
  })
})

describe('mergeCommentsStorage', () => {
  it('adds only comments not already present', () => {
    const existing = makeComment({ id: 'c1' })
    const incoming = [makeComment({ id: 'c1' }), makeComment({ id: 'c2' })]
    const result = mergeCommentsStorage(incoming, [existing])
    expect(result).toHaveLength(2)
    expect(result.map((c) => c.id)).toEqual(['c1', 'c2'])
  })

  it('returns all existing comments when incoming are all duplicates', () => {
    const existing = [makeComment({ id: 'c1' }), makeComment({ id: 'c2' })]
    const result = mergeCommentsStorage(existing, existing)
    expect(result).toHaveLength(2)
  })
})
