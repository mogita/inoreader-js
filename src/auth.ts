import type {
  InoreaderConfig,
  AuthCredentials,
  ClientLoginCredentials,
  OAuthTokenResponse,
  OAuthAuthorizationParams,
} from './types'
import { AuthenticationError, TokenError, ValidationError, NetworkError } from './errors'
import {
  buildUrl,
  encodeFormData,
  generateState,
  isValidEmail,
  isValidUrl,
  isTokenExpired,
  calculateExpirationTime,
} from './utils'
import { DEFAULT_CONFIG } from './config'

/**
 * Handles OAuth 2.0 and ClientLogin authentication for Inoreader API
 */
export class InoreaderAuth {
  private config: InoreaderConfig
  private credentials: AuthCredentials = {}

  constructor(config: InoreaderConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    }
  }

  /**
   * Generates OAuth 2.0 authorization URL
   */
  generateAuthorizationUrl(params?: Partial<OAuthAuthorizationParams>): string {
    if (!this.config.clientId) {
      throw new ValidationError('Client ID is required for OAuth authorization')
    }

    if (!this.config.redirectUri) {
      throw new ValidationError('Redirect URI is required for OAuth authorization')
    }

    if (!isValidUrl(this.config.redirectUri)) {
      throw new ValidationError('Invalid redirect URI format')
    }

    const authParams = {
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: params?.scope || 'read',
      state: params?.state || generateState(),
      ...params,
    }

    return buildUrl(this.config.baseUrl!, '/oauth2/auth', authParams)
  }

  /**
   * Exchanges authorization code for access token
   */
  async exchangeCodeForToken(code: string, state?: string): Promise<AuthCredentials> {
    if (!this.config.clientId || !this.config.clientSecret || !this.config.redirectUri) {
      throw new ValidationError('Client ID, client secret, and redirect URI are required')
    }

    const tokenData = {
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'authorization_code',
      scope: '',
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.config.userAgent!,
        },
        body: encodeFormData(tokenData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new AuthenticationError(`Token exchange failed: ${response.status} ${response.statusText}`, {
          status: response.status,
          body: errorText,
        })
      }

      const tokenResponse = (await response.json()) as OAuthTokenResponse

      this.credentials = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: calculateExpirationTime(tokenResponse.expires_in),
        scope: tokenResponse.scope,
      }

      return this.credentials
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }
      throw new NetworkError('Failed to exchange authorization code for token', error)
    }
  }

  /**
   * Refreshes an expired access token
   */
  async refreshAccessToken(): Promise<AuthCredentials> {
    if (!this.credentials.refreshToken) {
      throw new TokenError('No refresh token available')
    }

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new ValidationError('Client ID and client secret are required for token refresh')
    }

    const refreshData = {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: this.credentials.refreshToken,
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.config.userAgent!,
        },
        body: encodeFormData(refreshData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new TokenError(`Token refresh failed: ${response.status} ${response.statusText}`, {
          status: response.status,
          body: errorText,
        })
      }

      const tokenResponse = (await response.json()) as OAuthTokenResponse

      this.credentials = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: calculateExpirationTime(tokenResponse.expires_in),
        scope: tokenResponse.scope,
      }

      return this.credentials
    } catch (error) {
      if (error instanceof TokenError) {
        throw error
      }
      throw new NetworkError('Failed to refresh access token', error)
    }
  }

  /**
   * Authenticates using ClientLogin (legacy method)
   */
  async clientLogin(credentials: ClientLoginCredentials): Promise<string> {
    if (!isValidEmail(credentials.email)) {
      throw new ValidationError('Invalid email format')
    }

    if (!credentials.password) {
      throw new ValidationError('Password is required')
    }

    const loginData = {
      Email: credentials.email,
      Passwd: credentials.password,
      service: 'reader',
      accountType: 'GOOGLE',
      source: this.config.userAgent || DEFAULT_CONFIG.userAgent || 'InoreaderJS',
    }

    try {
      const response = await fetch('https://www.inoreader.com/accounts/ClientLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.config.userAgent!,
        },
        body: encodeFormData(loginData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new AuthenticationError(`ClientLogin failed: ${response.status} ${response.statusText}`, {
          status: response.status,
          body: errorText,
        })
      }

      const responseText = await response.text()
      const authMatch = responseText.match(/Auth=(.+)/)

      if (!authMatch || !authMatch[1]) {
        throw new AuthenticationError('No auth token found in ClientLogin response')
      }

      return authMatch[1]
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }
      throw new NetworkError('ClientLogin request failed', error)
    }
  }

  /**
   * Sets credentials manually
   */
  setCredentials(credentials: AuthCredentials): void {
    this.credentials = { ...credentials }
  }

  /**
   * Gets current credentials
   */
  getCredentials(): AuthCredentials {
    return { ...this.credentials }
  }

  /**
   * Checks if current token is valid and not expired
   */
  isTokenValid(): boolean {
    return !!(this.credentials.accessToken && !isTokenExpired(this.credentials.expiresAt))
  }

  /**
   * Gets authorization header value
   */
  getAuthorizationHeader(): string | null {
    if (!this.credentials.accessToken) {
      return null
    }
    return `Bearer ${this.credentials.accessToken}`
  }

  /**
   * Ensures token is valid, refreshing if necessary
   */
  async ensureTokenRefreshed(): Promise<AuthCredentials> {
    if (!this.credentials.accessToken && !this.credentials.refreshToken) {
      return this.credentials
    }

    if (isTokenExpired(this.credentials.expiresAt)) {
      return this.refreshAccessToken()
    }

    return this.credentials
  }

  /**
   * Clears stored credentials
   */
  clearCredentials(): void {
    this.credentials = {}
  }
}
