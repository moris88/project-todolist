import { describe, expect, it } from 'vitest'

import { isTaskOverdue } from '../src/utils/todo'
import { generateUniqueId } from '../src/utils/utils'

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
