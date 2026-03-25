import { describe, it, expect } from 'bun:test'
import { DEFAULT_CONFIG, DEVELOPMENT_CONFIG } from '../src/config'
import pkg from '../package.json'

describe('config version sync', () => {
  it('DEFAULT_CONFIG.userAgent contains the package version', () => {
    expect(DEFAULT_CONFIG.userAgent).toContain(pkg.version)
  })

  it('DEVELOPMENT_CONFIG.userAgent contains the package version', () => {
    expect(DEVELOPMENT_CONFIG.userAgent).toContain(pkg.version)
  })
})
