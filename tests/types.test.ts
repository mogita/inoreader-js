import { describe, it, expect } from 'bun:test'
import type { AddSubscriptionParams, EditSubscriptionParams } from '../src/types'
import type { StreamPreferenceList, Preference, Tag, GetTagsParams, UnreadCount } from '../src/index'

describe('AddSubscriptionParams', () => {
  it('requires quickadd field', () => {
    const params: AddSubscriptionParams = {
      quickadd: 'https://example.com/feed.xml',
    }
    expect(params.quickadd).toBe('https://example.com/feed.xml')
  })

  it('accepts a stream ID as quickadd value', () => {
    const params: AddSubscriptionParams = {
      quickadd: 'feed/https://example.com/feed.xml',
    }
    expect(params.quickadd).toBe('feed/https://example.com/feed.xml')
  })
})

describe('EditSubscriptionParams', () => {
  it('accepts follow as a valid ac value', () => {
    const params: EditSubscriptionParams = { s: 'feed/https://example.com/rss', ac: 'follow' }
    expect(params.ac).toBe('follow')
  })

  it('accepts unfollow as a valid ac value', () => {
    const params: EditSubscriptionParams = { s: 'feed/https://example.com/rss', ac: 'unfollow' }
    expect(params.ac).toBe('unfollow')
  })

  it('accepts edit as a valid ac value', () => {
    const params: EditSubscriptionParams = { s: 'feed/https://example.com/rss', ac: 'edit', t: 'New Title' }
    expect(params.ac).toBe('edit')
  })
})

describe('StreamPreferenceList', () => {
  it('should have streamprefs as a Record of string to Preference arrays', () => {
    const pref: Preference = { id: 'subscription-ordering', value: 'ALPHABETICAL' }
    const streamId = 'user/-/state/com.google/reading-list'
    const list: StreamPreferenceList = {
      streamprefs: {
        [streamId]: [pref],
      },
    }
    expect(list.streamprefs).toEqual({
      [streamId]: [pref],
    })
  })

  it('should allow empty streamprefs record', () => {
    const list: StreamPreferenceList = { streamprefs: {} }
    expect(list.streamprefs).toEqual({})
  })
})

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

describe('UnreadCount', () => {
  it('should accept a number for max', () => {
    const count: UnreadCount = {
      max: 1000,
      unreadcounts: [
        {
          id: 'user/-/state/com.google/reading-list',
          count: 42,
          newestItemTimestampUsec: '1234567890000000',
        },
      ],
    }
    expect(count.max).toBe(1000)
    expect(typeof count.max).toBe('number')
  })
})
