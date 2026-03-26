import { describe, it, expect } from 'bun:test'
import type { UnreadCount } from '../src/index'

describe('UnreadCount', () => {
  it('should accept a string for max', () => {
    const count: UnreadCount = {
      max: '1000',
      unreadcounts: [
        {
          id: 'user/-/state/com.google/reading-list',
          count: 42,
          newestItemTimestampUsec: '1234567890000000',
        },
      ],
    }
    expect(count.max).toBe('1000')
    expect(typeof count.max).toBe('string')
  })
})
