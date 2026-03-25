import { describe, it, expect } from 'bun:test'
import type { Tag, GetTagsParams } from '../src/index'

describe('Tag interface', () => {
  it('should accept a minimal tag without optional count fields', () => {
    const tag: Tag = { id: 'user/-/label/foo', sortid: 'abc123' }
    expect(tag.id).toBe('user/-/label/foo')
    expect(tag.unread_count).toBeUndefined()
    expect(tag.unseen_count).toBeUndefined()
  })

  it('should accept unread_count and unseen_count as optional numbers', () => {
    const tag: Tag = { id: 'user/-/label/foo', sortid: 'abc123', unread_count: 5, unseen_count: 2 }
    expect(tag.unread_count).toBe(5)
    expect(tag.unseen_count).toBe(2)
  })

  it('should accept type field alongside count fields', () => {
    const tag: Tag = { id: 'user/-/label/foo', sortid: 'abc123', type: 'folder', unread_count: 10, unseen_count: 3 }
    expect(tag.type).toBe('folder')
    expect(tag.unread_count).toBe(10)
    expect(tag.unseen_count).toBe(3)
  })
})

describe('GetTagsParams interface', () => {
  it('should accept empty params', () => {
    const params: GetTagsParams = {}
    expect(params.types).toBeUndefined()
    expect(params.counts).toBeUndefined()
  })

  it('should accept types=0', () => {
    const params: GetTagsParams = { types: 0 }
    expect(params.types).toBe(0)
  })

  it('should accept types=1', () => {
    const params: GetTagsParams = { types: 1 }
    expect(params.types).toBe(1)
  })

  it('should accept counts=0', () => {
    const params: GetTagsParams = { counts: 0 }
    expect(params.counts).toBe(0)
  })

  it('should accept counts=1', () => {
    const params: GetTagsParams = { counts: 1 }
    expect(params.counts).toBe(1)
  })

  it('should accept both types and counts together', () => {
    const params: GetTagsParams = { types: 1, counts: 1 }
    expect(params.types).toBe(1)
    expect(params.counts).toBe(1)
  })
})
