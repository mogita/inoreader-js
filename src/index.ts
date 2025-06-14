// Main exports
export { InoreaderClient } from './client'
export { InoreaderAuth } from './auth'

// Helper exports
export {
  fetchAllArticles,
  fetchUnreadArticles,
  fetchStarredArticles,
  fetchFeedArticles,
  fetchTaggedArticles,
} from './helpers'

// Configuration exports
export {
  DEFAULT_CONFIG,
  DEVELOPMENT_CONFIG,
  STREAM_IDS,
  TAG_PREFIXES,
  RATE_LIMITS,
  STREAM_PARAMS,
  ConfigBuilder,
  EnvironmentConfig,
  StreamIdUtils,
  ConfigValidator,
} from './config'

// Type exports
export type {
  InoreaderConfig,
  AuthCredentials,
  ClientLoginCredentials,
  RateLimitInfo,
  OAuthTokenResponse,
  OAuthAuthorizationParams,
  UserInfo,
  Subscription,
  SubscriptionList,
  Category,
  Tag,
  TagList,
  StreamContents,
  Article,
  Annotation,
  UnreadCount,
  StreamParams,
  Preference,
  PreferenceList,
  AddSubscriptionParams,
  EditSubscriptionParams,
  EditTagParams,
  MarkAllAsReadParams,
  InoreaderError as InoreaderErrorType,
} from './types'

// Error exports
export {
  InoreaderError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  NotFoundError,
  ValidationError,
  ServerError,
  NetworkError,
  TokenError,
} from './errors'

// Utility exports
export {
  encodeStreamId,
  decodeStreamId,
  buildQueryString,
  buildUrl,
  extractRateLimitInfo,
  isTokenExpired,
  calculateExpirationTime,
  isValidEmail,
  isValidUrl,
  generateState,
  delay,
  encodeFormData,
  safeJsonParse,
  createUserAgent,
  isValidStreamId,
  formatTimestamp,
  parseTimestamp,
} from './utils'

// Default export
import { InoreaderClient } from './client'
export default InoreaderClient
