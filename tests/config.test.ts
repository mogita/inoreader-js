import { describe, it, expect } from 'bun:test'
import { DEFAULT_CONFIG, DEVELOPMENT_CONFIG, STREAM_PARAMS } from '../src/config'
import pkg from '../package.json'

describe('config version sync', () => {
  it('DEFAULT_CONFIG.userAgent contains the package version', () => {
    expect(DEFAULT_CONFIG.userAgent).toContain(pkg.version)
  })

  it('DEVELOPMENT_CONFIG.userAgent contains the package version', () => {
    expect(DEVELOPMENT_CONFIG.userAgent).toContain(pkg.version)
  })
})

describe('STREAM_PARAMS', () => {
  describe('LATEST', () => {
    it('should only contain the n property with value 20', () => {
      expect(STREAM_PARAMS.LATEST).toEqual({ n: 20 })
    })
  })
})
