import { describe, it, expect } from 'bun:test'
import type { AddSubscriptionParams, EditSubscriptionParams } from '../src/types'
import type { StreamPreferenceList, Preference } from '../src/index'

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
