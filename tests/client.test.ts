import { describe, it, expect, beforeEach, mock, afterEach } from 'bun:test'
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

    it('should enforce output=json even if caller tries to override', async () => {
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
      expect(capturedUrl).toContain('output=json')
      expect(capturedUrl).not.toContain('output=xml')
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

describe('getStreamItemIds URL format', () => {
  let client: InoreaderClient
  let capturedUrl: string | undefined
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    client = new InoreaderClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://example.com/callback',
    })
    client.setCredentials({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600000,
      scope: 'read write',
    })
    capturedUrl = undefined
    originalFetch = globalThis.fetch
    globalThis.fetch = mock(async (url: string | URL | Request) => {
      capturedUrl = url.toString()
      return new Response(JSON.stringify({ itemRefs: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }) as unknown as typeof globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should pass stream ID as s query param, not as a path segment', async () => {
    const streamId = 'user/-/state/com.google/reading-list'
    await client.getStreamItemIds(streamId)

    expect(capturedUrl).toBeDefined()
    const url = new URL(capturedUrl!)
    expect(url.pathname).toBe('/reader/api/0/stream/items/ids')
    expect(url.searchParams.get('s')).toBe(streamId)
    expect(url.pathname).not.toContain(streamId)
  })

  it('should merge additional params alongside s', async () => {
    const streamId = 'user/-/state/com.google/reading-list'
    await client.getStreamItemIds(streamId, { n: 20 })

    expect(capturedUrl).toBeDefined()
    const url = new URL(capturedUrl!)
    expect(url.searchParams.get('s')).toBe(streamId)
    expect(url.searchParams.get('n')).toBe('20')
  })
})

describe('Authorization header behavior', () => {
  let capturedHeaders: Headers | undefined
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    capturedHeaders = undefined
    originalFetch = globalThis.fetch
    globalThis.fetch = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
      capturedHeaders = new Headers(init?.headers as HeadersInit)
      return new Response(JSON.stringify({ userId: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as unknown as typeof globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should omit Authorization header when no credentials are set', async () => {
    const client = new InoreaderClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    })
    await client.getUserInfo()
    expect(capturedHeaders?.has('Authorization')).toBe(false)
  })

  it('should include Authorization header when credentials are set', async () => {
    const client = new InoreaderClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    })
    client.setCredentials({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600000,
      scope: 'read write',
    })
    await client.getUserInfo()
    expect(capturedHeaders?.has('Authorization')).toBe(true)
    expect(capturedHeaders?.get('Authorization')).toBe('Bearer mock-access-token')
  })
})

describe('stream preference URL format', () => {
  let client: InoreaderClient
  let capturedUrl: string
  let capturedBody: string | undefined
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    client = new InoreaderClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://example.com/callback',
    })

    client.setCredentials({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600000,
      scope: 'read write',
    })

    originalFetch = (globalThis as any).fetch
    ;(globalThis as any).fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url
      capturedBody = init?.body as string | undefined
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }
  })

  afterEach(() => {
    ;(globalThis as any).fetch = originalFetch
  })

  describe('getStreamPreferences', () => {
    it('should send s as a query parameter, not a path segment', async () => {
      const streamId = 'feed/https://example.com/rss'
      await client.getStreamPreferences(streamId)

      expect(capturedUrl).toContain('/reader/api/0/preference/stream/list')
      const url = new URL(capturedUrl)
      expect(url.searchParams.get('s')).toBe(streamId)
      expect(capturedUrl).not.toContain(`/preference/stream/list/${encodeURIComponent(streamId)}`)
    })
  })

  describe('setStreamPreference', () => {
    it('should send s, k, v in the POST body, not as a path segment', async () => {
      const streamId = 'feed/https://example.com/rss'
      await client.setStreamPreference(streamId, 'sort-id', '0')

      expect(capturedUrl).toContain('/reader/api/0/preference/stream/set')
      expect(capturedUrl).not.toContain(`/preference/stream/set/${encodeURIComponent(streamId)}`)
      const bodyParams = new URLSearchParams(capturedBody)
      expect(bodyParams.get('s')).toBe(streamId)
      expect(bodyParams.get('k')).toBe('sort-id')
      expect(bodyParams.get('v')).toBe('0')
    })
  })
})
