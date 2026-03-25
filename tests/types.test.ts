import { describe, it, expect } from 'bun:test'
import type { StreamPreferenceList, Preference } from '../src/index'

describe('StreamPreferenceList', () => {
  it('should have streamprefs as a Record of string to Preference arrays', () => {
    const pref: Preference = { id: 'subscription-ordering', value: 'ALPHABETICAL' }
    const list: StreamPreferenceList = {
      streamprefs: {
        'user/-/state/com.google/reading-list': [pref],
      },
    }
    expect(typeof list.streamprefs).toBe('object')
    expect(Array.isArray(list.streamprefs['user/-/state/com.google/reading-list'])).toBe(true)
    expect(list.streamprefs['user/-/state/com.google/reading-list'][0].id).toBe('subscription-ordering')
    expect(list.streamprefs['user/-/state/com.google/reading-list'][0].value).toBe('ALPHABETICAL')
  })

  it('should allow empty streamprefs record', () => {
    const list: StreamPreferenceList = { streamprefs: {} }
    expect(Object.keys(list.streamprefs)).toHaveLength(0)
  })
})
