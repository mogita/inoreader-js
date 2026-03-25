import { describe, it, expect } from 'bun:test'
import type { AddSubscriptionParams } from '../src/types'

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
