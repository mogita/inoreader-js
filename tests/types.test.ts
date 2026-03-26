import { describe, it, expect } from 'bun:test'
import type { StreamPreferenceList, Preference } from '../src/index'

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
