import { describe, it, expect, beforeEach } from 'bun:test'
import { InoreaderClient, AuthenticationError, ValidationError, TokenError } from '../src/index'

describe('InoreaderClient', () => {
  let client: InoreaderClient

  beforeEach(() => {
    client = new InoreaderClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://example.com/callback',
    })
  })

  describe('constructor', () => {
    it('should create client with default config', () => {
      const defaultClient = new InoreaderClient()
      expect(defaultClient).toBeInstanceOf(InoreaderClient)
    })

    it('should create client with custom config', () => {
      const customClient = new InoreaderClient({
        baseUrl: 'https://custom.inoreader.com',
        userAgent: 'CustomApp/1.0.0',
      })
      expect(customClient).toBeInstanceOf(InoreaderClient)
    })
  })

  describe('generateAuthUrl', () => {
    it('should generate OAuth authorization URL', () => {
      const url = client.generateAuthUrl('read', 'test-state')
      expect(url).toContain('https://www.inoreader.com/oauth2/auth')
      expect(url).toContain('client_id=test-client-id')
      expect(url).toContain('scope=read')
      expect(url).toContain('state=test-state')
    })

    it('should generate URL with default scope', () => {
      const url = client.generateAuthUrl('read')
      expect(url).toContain('scope=read')
    })
  })

  describe('setCredentials', () => {
    it('should set credentials', () => {
      const credentials = {
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() + 3600000,
        scope: 'read',
      }

      client.setCredentials(credentials)
      const storedCredentials = client.getCredentials()

      expect(storedCredentials.accessToken).toBe(credentials.accessToken)
      expect(storedCredentials.refreshToken).toBe(credentials.refreshToken)
      expect(storedCredentials.scope).toBe(credentials.scope)
    })
  })
})

describe('InoreaderClient with mock authentication', () => {
  let client: InoreaderClient

  beforeEach(() => {
    client = new InoreaderClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://example.com/callback',
    })

    // Set mock credentials
    client.setCredentials({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600000,
      scope: 'read write',
    })
  })

  // Note: These tests would require mocking fetch or using a test server
  // For now, they serve as examples of how the API would be used

  describe('getUserInfo', () => {
    it('should be callable with valid credentials', () => {
      // This would make an actual API call in a real test
      // For now, we just test that the method exists and is callable
      expect(typeof client.getUserInfo).toBe('function')
    })
  })

  describe('getSubscriptions', () => {
    it('should be callable with valid credentials', () => {
      expect(typeof client.getSubscriptions).toBe('function')
    })
  })

  describe('getStreamContents', () => {
    it('should be callable with valid stream ID', () => {
      expect(typeof client.getStreamContents).toBe('function')
    })
  })
})
