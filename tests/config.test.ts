import { describe, it, expect } from 'bun:test'
import { STREAM_PARAMS } from '../src/config'

describe('STREAM_PARAMS', () => {
  describe('LATEST', () => {
    it('should only contain the n property with value 20', () => {
      expect(STREAM_PARAMS.LATEST).toEqual({ n: 20 })
    })
  })
})
