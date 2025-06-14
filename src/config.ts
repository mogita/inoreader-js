import type { InoreaderConfig } from './types'

/**
 * Configuration presets and helpers
 */

/**
 * Default configuration for production use
 */
export const DEFAULT_CONFIG: Partial<InoreaderConfig> = {
  baseUrl: 'https://www.inoreader.com',
  userAgent: 'InoreaderJS/1.0.0',
}

/**
 * Configuration for development/testing
 */
export const DEVELOPMENT_CONFIG: Partial<InoreaderConfig> = {
  ...DEFAULT_CONFIG,
  userAgent: 'InoreaderJS-Dev/1.0.0',
}

/**
 * Stream ID constants for common streams
 * Based on official Inoreader API documentation
 */
export const STREAM_IDS = {
  ALL_ITEMS: 'user/-/state/com.google/reading-list',
  READ_ITEMS: 'user/-/state/com.google/read',
  STARRED_ITEMS: 'user/-/state/com.google/starred',
  BROADCAST_ITEMS: 'user/-/state/com.google/broadcast',
  ANNOTATED_ITEMS: 'user/-/state/com.google/annotated',
  LIKED_ITEMS: 'user/-/state/com.google/like',
  SAVED_WEB_PAGES: 'user/-/state/com.google/saved-web-pages',
} as const

/**
 * Common tag/label prefixes
 */
export const TAG_PREFIXES = {
  USER_LABEL: 'user/-/label/',
  USER_STATE: 'user/-/state/',
  GOOGLE_STATE: 'user/-/state/com.google/',
  FEED: 'feed/',
  ITEM: 'tag:google.com,2005:reader/item/',
} as const

/**
 * API rate limit constants
 */
export const RATE_LIMITS = {
  ZONE_1_DEFAULT: 100, // requests per day
  ZONE_2_DEFAULT: 100, // requests per day
  RESET_INTERVAL: 24 * 60 * 60, // 24 hours in seconds
} as const

/**
 * Common stream parameters presets
 */
export const STREAM_PARAMS = {
  // Get latest articles
  LATEST: {
    r: 'n' as const,
    n: 20,
  },

  // Get oldest articles
  OLDEST: {
    r: 'o' as const,
    n: 20,
  },

  // Get unread articles only
  UNREAD_ONLY: {
    xt: 'user/-/state/com.google/read',
    n: 20,
  },

  // Get starred articles only
  STARRED_ONLY: {
    it: 'user/-/state/com.google/starred',
    n: 20,
  },

  // Get articles with annotations
  WITH_ANNOTATIONS: {
    annotations: true,
    n: 20,
  },

  // Large batch for bulk operations
  BULK: {
    n: 100,
  },
} as const

/**
 * Configuration builder for different environments
 */
export class ConfigBuilder {
  private config: Partial<InoreaderConfig> = {}

  constructor(baseConfig?: Partial<InoreaderConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...baseConfig }
  }

  /**
   * Set OAuth credentials
   */
  withOAuth(clientId: string, clientSecret: string, redirectUri: string): this {
    this.config.clientId = clientId
    this.config.clientSecret = clientSecret
    this.config.redirectUri = redirectUri
    return this
  }

  /**
   * Set custom base URL (for testing or custom instances)
   */
  withBaseUrl(baseUrl: string): this {
    this.config.baseUrl = baseUrl
    return this
  }

  /**
   * Set custom user agent
   */
  withUserAgent(userAgent: string): this {
    this.config.userAgent = userAgent
    return this
  }

  /**
   * Configure for development environment
   */
  forDevelopment(): this {
    this.config = { ...this.config, ...DEVELOPMENT_CONFIG }
    return this
  }

  /**
   * Configure for production environment
   */
  forProduction(): this {
    this.config = { ...this.config, ...DEFAULT_CONFIG }
    return this
  }

  /**
   * Build the final configuration
   */
  build(): InoreaderConfig {
    return this.config as InoreaderConfig
  }
}

/**
 * Environment-based configuration loader
 */
export class EnvironmentConfig {
  /**
   * Load configuration from environment variables
   */
  static fromEnvironment(): Partial<InoreaderConfig> {
    const config: Partial<InoreaderConfig> = {}

    // Check for Node.js environment variables
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.INOREADER_CLIENT_ID) {
        config.clientId = process.env.INOREADER_CLIENT_ID
      }
      if (process.env.INOREADER_CLIENT_SECRET) {
        config.clientSecret = process.env.INOREADER_CLIENT_SECRET
      }
      if (process.env.INOREADER_REDIRECT_URI) {
        config.redirectUri = process.env.INOREADER_REDIRECT_URI
      }
      if (process.env.INOREADER_BASE_URL) {
        config.baseUrl = process.env.INOREADER_BASE_URL
      }
      if (process.env.INOREADER_USER_AGENT) {
        config.userAgent = process.env.INOREADER_USER_AGENT
      }
    }

    return config
  }

  /**
   * Create a configuration builder with environment variables
   */
  static createBuilder(): ConfigBuilder {
    return new ConfigBuilder(this.fromEnvironment())
  }
}

/**
 * Utility functions for working with stream IDs
 */
export class StreamIdUtils {
  /**
   * Create a feed stream ID from URL
   */
  static feedId(feedUrl: string): string {
    return `${TAG_PREFIXES.FEED}${feedUrl}`
  }

  /**
   * Create a user label stream ID
   */
  static labelId(labelName: string): string {
    return `${TAG_PREFIXES.USER_LABEL}${labelName}`
  }

  /**
   * Create an article item ID
   */
  static itemId(itemId: string): string {
    return `${TAG_PREFIXES.ITEM}${itemId}`
  }

  /**
   * Check if a stream ID is a feed
   */
  static isFeed(streamId: string): boolean {
    return streamId.startsWith(TAG_PREFIXES.FEED)
  }

  /**
   * Check if a stream ID is a user label
   */
  static isLabel(streamId: string): boolean {
    return streamId.startsWith(TAG_PREFIXES.USER_LABEL)
  }

  /**
   * Check if a stream ID is a user state
   */
  static isUserState(streamId: string): boolean {
    return streamId.startsWith(TAG_PREFIXES.USER_STATE)
  }

  /**
   * Extract the feed URL from a feed stream ID
   */
  static extractFeedUrl(feedStreamId: string): string | null {
    if (!this.isFeed(feedStreamId)) {
      return null
    }
    return feedStreamId.substring(TAG_PREFIXES.FEED.length)
  }

  /**
   * Extract the label name from a label stream ID
   */
  static extractLabelName(labelStreamId: string): string | null {
    if (!this.isLabel(labelStreamId)) {
      return null
    }
    return labelStreamId.substring(TAG_PREFIXES.USER_LABEL.length)
  }
}

/**
 * Validation helpers
 */
export class ConfigValidator {
  /**
   * Validate OAuth configuration
   */
  static validateOAuth(config: Partial<InoreaderConfig>): string[] {
    const errors: string[] = []

    if (!config.clientId) {
      errors.push('Client ID is required for OAuth')
    }
    if (!config.clientSecret) {
      errors.push('Client secret is required for OAuth')
    }
    if (!config.redirectUri) {
      errors.push('Redirect URI is required for OAuth')
    } else {
      try {
        new URL(config.redirectUri)
      } catch {
        errors.push('Redirect URI must be a valid URL')
      }
    }

    return errors
  }

  /**
   * Validate base configuration
   */
  static validateBase(config: Partial<InoreaderConfig>): string[] {
    const errors: string[] = []

    if (config.baseUrl) {
      try {
        new URL(config.baseUrl)
      } catch {
        errors.push('Base URL must be a valid URL')
      }
    }

    if (config.userAgent && config.userAgent.length === 0) {
      errors.push('User agent cannot be empty')
    }

    return errors
  }

  /**
   * Validate complete configuration
   */
  static validate(config: Partial<InoreaderConfig>): string[] {
    return [...this.validateBase(config), ...this.validateOAuth(config)]
  }
}
