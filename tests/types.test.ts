import { describe, it, expect } from 'bun:test'
import type { AddSubscriptionParams, EditSubscriptionParams } from '../src/types'

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
