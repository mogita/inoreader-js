import { describe, it, expect } from 'bun:test'
import { InoreaderAuth } from '../src/index'

describe('InoreaderAuth', () => {
  describe('getAuthorizationHeader', () => {
    it('should return Bearer header when authType is not set', () => {
      const auth = new InoreaderAuth({})
      auth.setCredentials({ accessToken: 'tok' })
      expect(auth.getAuthorizationHeader()).toBe('Bearer tok')
    })

    it('should return GoogleLogin header when authType is googlelogin', () => {
      const auth = new InoreaderAuth({})
      auth.setCredentials({ accessToken: 'tok', authType: 'googlelogin' })
      expect(auth.getAuthorizationHeader()).toBe('GoogleLogin auth=tok')
    })

    it('should return null when no access token is set', () => {
      const auth = new InoreaderAuth({})
      expect(auth.getAuthorizationHeader()).toBeNull()
    })
  })
})
