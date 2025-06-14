import { describe, it, expect } from 'bun:test'
import {
  encodeStreamId,
  decodeStreamId,
  buildQueryString,
  buildUrl,
  isValidEmail,
  isValidUrl,
  generateState,
  isValidStreamId,
  formatTimestamp,
  parseTimestamp,
  safeJsonParse,
} from '../src/utils'

describe('Utils', () => {
  describe('encodeStreamId and decodeStreamId', () => {
    it('should encode and decode stream IDs correctly', () => {
      const streamId = 'feed/http://example.com/feed.xml'
      const encoded = encodeStreamId(streamId)
      const decoded = decodeStreamId(encoded)

      expect(encoded).toBe(encodeURIComponent(streamId))
      expect(decoded).toBe(streamId)
    })
  })

  describe('buildQueryString', () => {
    it('should build query string from parameters', () => {
      const params = {
        n: 20,
        r: 'o',
        xt: 'user/-/state/com.google/read',
      }

      const queryString = buildQueryString(params)
      expect(queryString).toContain('n=20')
      expect(queryString).toContain('r=o')
      expect(queryString).toContain('xt=')
    })

    it('should handle empty parameters', () => {
      const queryString = buildQueryString({})
      expect(queryString).toBe('')
    })

    it('should skip undefined and null values', () => {
      const params = {
        a: 'value',
        b: undefined,
        c: null,
        d: 'another',
      }

      const queryString = buildQueryString(params)
      expect(queryString).toContain('a=value')
      expect(queryString).toContain('d=another')
      expect(queryString).not.toContain('b=')
      expect(queryString).not.toContain('c=')
    })
  })

  describe('buildUrl', () => {
    it('should build URL with parameters', () => {
      const url = buildUrl('https://example.com', '/api/test', { param: 'value' })
      expect(url).toBe('https://example.com/api/test?param=value')
    })

    it('should build URL without parameters', () => {
      const url = buildUrl('https://example.com', '/api/test')
      expect(url).toBe('https://example.com/api/test')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('ftp://files.example.com')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('http://')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('generateState', () => {
    it('should generate state string of correct length', () => {
      const state = generateState(32)
      expect(state).toHaveLength(32)
    })

    it('should generate different states each time', () => {
      const state1 = generateState()
      const state2 = generateState()
      expect(state1).not.toBe(state2)
    })

    it('should use default length when not specified', () => {
      const state = generateState()
      expect(state).toHaveLength(32)
    })
  })

  describe('isValidStreamId', () => {
    it('should validate correct stream IDs', () => {
      expect(isValidStreamId('feed/http://example.com/feed.xml')).toBe(true)
      expect(isValidStreamId('user/-/state/com.google/read')).toBe(true)
      expect(isValidStreamId('tag:google.com,2005:reader/item/12345')).toBe(true)
    })

    it('should reject invalid stream IDs', () => {
      expect(isValidStreamId('invalid-stream-id')).toBe(false)
      expect(isValidStreamId('http://example.com')).toBe(false)
      expect(isValidStreamId('')).toBe(false)
    })
  })

  describe('formatTimestamp', () => {
    it('should format timestamp to ISO string', () => {
      const timestamp = 1640995200 // 2022-01-01 00:00:00 UTC
      const formatted = formatTimestamp(timestamp)
      expect(formatted).toBe('2022-01-01T00:00:00.000Z')
    })
  })

  describe('parseTimestamp', () => {
    it('should parse numeric timestamp', () => {
      const timestamp = parseTimestamp(1640995200)
      expect(timestamp).toBe(1640995200)
    })

    it('should parse string timestamp', () => {
      const timestamp = parseTimestamp('1640995200')
      expect(timestamp).toBe(1640995200)
    })

    it('should throw error for invalid timestamp', () => {
      expect(() => parseTimestamp('invalid')).toThrow('Invalid timestamp')
    })
  })

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const json = '{"key": "value"}'
      const parsed = safeJsonParse(json)
      expect(parsed).toEqual({ key: 'value' })
    })

    it('should return null for invalid JSON', () => {
      const json = 'invalid json'
      const parsed = safeJsonParse(json)
      expect(parsed).toBeNull()
    })

    it('should return null for empty string', () => {
      const parsed = safeJsonParse('')
      expect(parsed).toBeNull()
    })
  })
})
