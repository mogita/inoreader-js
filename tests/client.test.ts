import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
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

  describe('getStreamItemIds', () => {
    it('should include output=json in request URL by default', async () => {
      let capturedUrl: string | undefined
      const originalFetch = globalThis.fetch
      globalThis.fetch = async (input: RequestInfo | URL, _init?: RequestInit) => {
        capturedUrl = input.toString()
        return new Response(JSON.stringify({ itemRefs: [] }), { status: 200 })
      }

      try {
        await client.getStreamItemIds('user/-/state/com.google/reading-list')
      } finally {
        globalThis.fetch = originalFetch
      }

      expect(capturedUrl).toBeDefined()
      expect(capturedUrl).toContain('output=json')
    })

    it('should allow caller to override output param', async () => {
      let capturedUrl: string | undefined
      const originalFetch = globalThis.fetch
      globalThis.fetch = async (input: RequestInfo | URL, _init?: RequestInit) => {
        capturedUrl = input.toString()
        return new Response(JSON.stringify({ itemRefs: [] }), { status: 200 })
      }

      try {
        await client.getStreamItemIds('user/-/state/com.google/reading-list', { output: 'xml' as any })
      } finally {
        globalThis.fetch = originalFetch
      }

      expect(capturedUrl).toBeDefined()
      expect(capturedUrl).toContain('output=xml')
      expect(capturedUrl).not.toContain('output=json')
    })
  })
})

describe('makeRequest routing', () => {
  let client: InoreaderClient
  let capturedRequests: Array<{ url: string; init: RequestInit }>

  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    capturedRequests = []
    originalFetch = globalThis.fetch
    client = new InoreaderClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      baseUrl: 'https://www.inoreader.com',
    })
    client.setCredentials({
      accessToken: 'mock-access-token',
      expiresAt: Date.now() + 3600000,
    })

    ;(globalThis as any).fetch = async (input: string | URL | Request, init?: RequestInit) => {
      capturedRequests.push({ url: input.toString(), init: init ?? {} })
      return new Response(JSON.stringify({ userId: 'u1', userName: 'test', userProfileId: 'p1', userEmail: 'test@example.com', isBloggerUser: false, signupTimeSec: 0, isMultiLoginEnabled: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('GET appends params to URL and sends no body', async () => {
    await client.getStreamContents('user/-/state/com.google/reading-list', { n: 10, r: 'o' })
    expect(capturedRequests).toHaveLength(1)
    const req = capturedRequests[0]!
    expect(req.url).toContain('n=10')
    expect(req.url).toContain('r=o')
    expect(req.init.body).toBeUndefined()
  })

  it('POST sends params as URL-encoded body and no query string', async () => {
    await client.deleteTag('user/-/label/test')
    expect(capturedRequests).toHaveLength(1)
    const req = capturedRequests[0]!
    const url = new URL(req.url)
    expect(url.search).toBe('')
    expect(req.init.body).toBe('s=user%2F-%2Flabel%2Ftest')
  })

  it('POST with array param encodes all values in body', async () => {
    await client.editTag({ i: ['item1', 'item2'], a: 'user/-/state/com.google/starred' })
    expect(capturedRequests).toHaveLength(1)
    const req = capturedRequests[0]!
    const url = new URL(req.url)
    expect(url.search).toBe('')
    const body = req.init.body as string
    const parsed = new URLSearchParams(body)
    expect(parsed.getAll('i')).toEqual(['item1', 'item2'])
    expect(parsed.get('a')).toBe('user/-/state/com.google/starred')
  })
})
