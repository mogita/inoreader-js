import type {
  InoreaderConfig,
  AuthCredentials,
  ClientLoginCredentials,
  UserInfo,
  SubscriptionList,
  TagList,
  StreamContents,
  UnreadCount,
  UnreadCountResponse,
  PreferenceList,
  StreamPreferenceList,
  StreamParams,
  AddSubscriptionParams,
  EditSubscriptionParams,
  EditTagParams,
  MarkAllAsReadParams,
  GetTagsParams,
  RateLimitInfo,
} from './types'
import { InoreaderAuth } from './auth'
import {
  InoreaderError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  NotFoundError,
  ServerError,
  NetworkError,
} from './errors'
import { buildUrl, encodeStreamId, extractRateLimitInfo, encodeFormData, safeJsonParse } from './utils'
import { DEFAULT_CONFIG } from './config'

/**
 * Main Inoreader API client
 */
export class InoreaderClient {
  private auth: InoreaderAuth
  private config: InoreaderConfig
  private lastRateLimitInfo?: RateLimitInfo
  private customHeaders: Record<string, string> = {}
  private debug: boolean = false

  constructor(config: InoreaderConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    }
    this.auth = new InoreaderAuth(this.config)
  }

  // Authentication methods

  /**
   * Generate OAuth 2.0 authorization URL
   */
  generateAuthUrl(scope?: 'read' | 'read write', state?: string): string {
    return this.auth.generateAuthorizationUrl({ scope, state })
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state?: string): Promise<AuthCredentials> {
    return this.auth.exchangeCodeForToken(code, state)
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthCredentials> {
    return this.auth.refreshAccessToken()
  }

  /**
   * Authenticate using ClientLogin (legacy)
   */
  async clientLogin(credentials: ClientLoginCredentials): Promise<void> {
    await this.auth.clientLogin(credentials)
  }

  /**
   * Set credentials manually
   */
  setCredentials(credentials: AuthCredentials): void {
    this.auth.setCredentials(credentials)
  }

  /**
   * Get current credentials
   */
  getCredentials(): AuthCredentials {
    return this.auth.getCredentials()
  }

  // Operational methods

  /**
   * Get last rate limit information
   */
  getRateLimitInfo(): RateLimitInfo | undefined {
    return this.lastRateLimitInfo
  }

  /**
   * Get custom headers
   */
  getCustomHeaders(): Record<string, string> {
    return this.customHeaders
  }

  /**
   * Set custom headers for all requests. They will override any existing default headers.
   * If run into trouble, enable debug mode to see the headers being sent. See `setDebug` method.
   */
  setCustomHeaders(headers: Record<string, string>): void {
    this.customHeaders = headers
  }

  /**
   * Clear custom headers
   */
  clearCustomHeaders(): void {
    this.customHeaders = {}
  }

  /**
   * Enable or disable debug mode
   */
  setDebug(enabled: boolean): void {
    this.debug = enabled
  }

  // API methods

  /**
   * Get user information
   */
  async getUserInfo(): Promise<UserInfo> {
    return this.makeRequest<UserInfo>('/reader/api/0/user-info')
  }

  /**
   * Get subscription list
   */
  async getSubscriptions(): Promise<SubscriptionList> {
    return this.makeRequest<SubscriptionList>('/reader/api/0/subscription/list')
  }

  /**
   * Get tag list
   */
  async getTags(params?: GetTagsParams): Promise<TagList> {
    return this.makeRequest<TagList>('/reader/api/0/tag/list', 'GET', params)
  }

  /**
   * Get unread counts
   */
  async getUnreadCounts(): Promise<UnreadCount> {
    const data = await this.makeRequest<UnreadCountResponse>('/reader/api/0/unread-count')
    const parsed = Number(data.max)
    return { ...data, max: Number.isFinite(parsed) ? parsed : 1000 }
  }

  /**
   * Get stream contents
   */
  async getStreamContents(streamId: string, params?: StreamParams): Promise<StreamContents> {
    const encodedStreamId = encodeStreamId(streamId)
    const url = `/reader/api/0/stream/contents/${encodedStreamId}`
    return this.makeRequest<StreamContents>(url, 'GET', params)
  }

  /**
   * Get stream item IDs
   */
  async getStreamItemIds(streamId: string, params?: StreamParams): Promise<{ itemRefs: Array<{ id: string }> }> {
    return this.makeRequest<{ itemRefs: Array<{ id: string }> }>('/reader/api/0/stream/items/ids', 'GET', {
      ...params,
      s: streamId,
      output: 'json' as const,
    })
  }

  /**
   * Get preferences list
   */
  async getPreferences(): Promise<PreferenceList> {
    return this.makeRequest<PreferenceList>('/reader/api/0/preference/list')
  }

  /**
   * Get stream preferences
   */
  async getStreamPreferences(streamId: string): Promise<StreamPreferenceList> {
    const url = `/reader/api/0/preference/stream/list`
    return this.makeRequest<StreamPreferenceList>(url, 'GET', { s: streamId })
  }

  /**
   * Set stream preference
   */
  async setStreamPreference(streamId: string, key: string, value: string): Promise<void> {
    const url = `/reader/api/0/preference/stream/set`
    await this.makeRequest(url, 'POST', { s: streamId, k: key, v: value })
  }

  /**
   * Add subscription
   */
  async addSubscription(params: AddSubscriptionParams): Promise<void> {
    await this.makeRequest('/reader/api/0/subscription/quickadd', 'POST', params)
  }

  /**
   * Edit subscription
   */
  async editSubscription(params: EditSubscriptionParams): Promise<void> {
    await this.makeRequest('/reader/api/0/subscription/edit', 'POST', params)
  }

  /**
   * Edit tag
   */
  async editTag(params: EditTagParams): Promise<void> {
    await this.makeRequest('/reader/api/0/edit-tag', 'POST', params)
  }

  /**
   * Rename tag
   */
  async renameTag(oldTag: string, newTag: string): Promise<void> {
    await this.makeRequest('/reader/api/0/rename-tag', 'POST', {
      s: oldTag,
      dest: newTag,
    })
  }

  /**
   * Delete tag
   */
  async deleteTag(tag: string): Promise<void> {
    await this.makeRequest('/reader/api/0/disable-tag', 'POST', { s: tag })
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(params: MarkAllAsReadParams): Promise<void> {
    await this.makeRequest('/reader/api/0/mark-all-as-read', 'POST', params)
  }

  // Private methods

  /**
   * Make authenticated API request
   */
  private async makeRequest<T = any>(
    path: string,
    method: 'GET' | 'POST' = 'GET',
    params?: Record<string, any>,
  ): Promise<T> {
    await this.auth.ensureTokenRefreshed()

    let url = `${this.config.baseUrl}${path}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'User-Agent': this.config.userAgent || DEFAULT_CONFIG.userAgent!,
      AppId: this.config.clientId || '',
      AppKey: this.config.clientSecret || '',
    }

    const authHeader = this.auth.getAuthorizationHeader()
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Override with custom headers
    for (const [key, value] of Object.entries(this.customHeaders)) {
      headers[key] = value
    }

    let body: string | undefined
    if (method === 'POST') {
      url = buildUrl(this.config.baseUrl!, path)
      body = encodeFormData(params ?? {})
    } else {
      url = buildUrl(this.config.baseUrl!, path, params)
    }

    if (this.debug) {
      console.log(`[debug] ${method}: ${url}`)
      console.log('[debug] headers:', headers)
    }

    try {
      const response = await fetch(url, { method, headers, body })

      // Extract rate limit information
      this.lastRateLimitInfo = extractRateLimitInfo(response.headers)

      // Handle different response statuses
      if (response.status === 401) {
        throw new AuthenticationError('Authentication failed - invalid or expired token')
      }

      if (response.status === 403) {
        throw new AuthorizationError('Insufficient permissions for this operation')
      }

      if (response.status === 404) {
        throw new NotFoundError('Requested resource not found')
      }

      if (response.status === 429) {
        const rateLimitInfo = this.lastRateLimitInfo!
        throw new RateLimitError(
          'Rate limit exceeded',
          rateLimitInfo.resetAfter,
          rateLimitInfo.zone1Usage,
          rateLimitInfo.zone2Usage,
          rateLimitInfo.zone1Limit,
          rateLimitInfo.zone2Limit,
        )
      }

      if (response.status >= 500) {
        const errorText = await response.text()
        throw new ServerError(`Server error: ${response.status} ${response.statusText}`, response.status, {
          body: errorText,
        })
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new InoreaderError(
          `Request failed: ${response.status} ${response.statusText}`,
          'REQUEST_FAILED',
          response.status,
          { body: errorText },
        )
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return undefined as T
      }

      const responseText = await response.text()
      if (!responseText.trim()) {
        return undefined as T
      }

      const data = safeJsonParse<T>(responseText)
      if (data === null) {
        throw new InoreaderError('Invalid JSON response from server')
      }

      return data
    } catch (error) {
      if (error instanceof InoreaderError) {
        throw error
      }
      throw new NetworkError('Network request failed', error)
    }
  }
}
