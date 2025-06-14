import type { RateLimitInfo } from './types'

/**
 * Encodes a stream ID for use in URLs
 */
export function encodeStreamId(streamId: string): string {
  return encodeURIComponent(streamId)
}

/**
 * Decodes a stream ID from a URL
 */
export function decodeStreamId(encodedStreamId: string): string {
  return decodeURIComponent(encodedStreamId)
}

/**
 * Builds a query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Builds a URL with query parameters
 */
export function buildUrl(baseUrl: string, path: string, params?: Record<string, any>): string {
  const url = new URL(path, baseUrl)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    }
  }

  return url.toString()
}

/**
 * Extracts rate limit information from response headers
 */
export function extractRateLimitInfo(headers: Headers): RateLimitInfo {
  return {
    zone1Limit: parseInt(headers.get('X-Reader-Zone1-Limit') || '0', 10),
    zone2Limit: parseInt(headers.get('X-Reader-Zone2-Limit') || '0', 10),
    zone1Usage: parseInt(headers.get('X-Reader-Zone1-Usage') || '0', 10),
    zone2Usage: parseInt(headers.get('X-Reader-Zone2-Usage') || '0', 10),
    resetAfter: parseInt(headers.get('X-Reader-Limits-Reset-After') || '0', 10),
  }
}

/**
 * Checks if a token is expired
 */
export function isTokenExpired(expiresAt?: number): boolean {
  if (!expiresAt) return false
  return Date.now() >= expiresAt
}

/**
 * Calculates token expiration time
 */
export function calculateExpirationTime(expiresIn: number): number {
  return Date.now() + expiresIn * 1000
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Generates a random state string for OAuth CSRF protection
 */
export function generateState(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  // Use crypto.getRandomValues if available (browser/modern Node.js)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i]! % chars.length]
    }
  } else {
    // Fallback for older environments
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }

  return result
}

/**
 * Delays execution for the specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Converts form data to URL-encoded string
 */
export function encodeFormData(data: Record<string, string>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(data)) {
    params.append(key, value)
  }
  return params.toString()
}

/**
 * Safely parses JSON, returning null if parsing fails
 */
export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

/**
 * Creates a user agent string
 */
export function createUserAgent(appName: string, version: string): string {
  return `${appName}/${version} (Inoreader API Client)`
}

/**
 * Validates stream ID format
 */
export function isValidStreamId(streamId: string): boolean {
  // Stream IDs should start with specific prefixes
  const validPrefixes = ['feed/', 'user/', 'tag:google.com,2005:reader/item/']

  return validPrefixes.some((prefix) => streamId.startsWith(prefix))
}

/**
 * Formats a timestamp to ISO string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString()
}

/**
 * Parses a timestamp from various formats
 */
export function parseTimestamp(timestamp: string | number): number {
  if (typeof timestamp === 'number') {
    return timestamp
  }

  const parsed = parseInt(timestamp, 10)
  if (isNaN(parsed)) {
    throw new Error(`Invalid timestamp: ${timestamp}`)
  }

  return parsed
}
