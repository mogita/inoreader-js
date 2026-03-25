import { describe, it, expect } from 'bun:test'
import { STREAM_PARAMS } from '../src/config'

describe('STREAM_PARAMS', () => {
  describe('LATEST', () => {
    it('should not have an r property', () => {
      expect('r' in STREAM_PARAMS.LATEST).toBe(false)
    })

    it('should have n set to 20', () => {
      expect(STREAM_PARAMS.LATEST.n).toBe(20)
    })
  })
})
