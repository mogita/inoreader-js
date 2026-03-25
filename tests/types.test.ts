import { describe, it, expect } from 'bun:test'
import type { EditSubscriptionParams } from '../src/types'

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
