// Base types
export interface InoreaderConfig {
  // Effectively the App ID
  clientId?: string
  // Effectively the App key
  clientSecret?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  scope?: string
  redirectUri?: string
  baseUrl?: string
  userAgent?: string
}

export interface AuthCredentials {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  scope?: string
}

export interface ClientLoginCredentials {
  email: string
  password: string
}

// Rate limiting types
export interface RateLimitInfo {
  zone1Limit: number
  zone2Limit: number
  zone1Usage: number
  zone2Usage: number
  resetAfter: number
}

// OAuth types
export interface OAuthTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

export interface OAuthAuthorizationParams {
  clientId: string
  redirectUri: string
  scope?: 'read' | 'read write'
  state?: string
}

// User info types
export interface UserInfo {
  userId: string
  userName: string
  userProfileId: string
  userEmail: string
  isBloggerUser: boolean
  signupTimeSec: number
  isMultiLoginEnabled: boolean
}

// Subscription types
export interface Subscription {
  id: string
  title: string
  categories: Category[]
  sortid: string
  firstitemmsec: number
  url: string
  htmlUrl: string
  iconUrl?: string
}

export interface SubscriptionList {
  subscriptions: Subscription[]
}

// Category/Tag types
export interface Category {
  id: string
  label: string
}

export interface Tag {
  id: string
  sortid: string
  type?: string
}

export interface TagList {
  tags: Tag[]
}

// Stream types
export interface StreamContents {
  direction: 'ltr' | 'rtl'
  id: string
  title: string
  description: string
  self: {
    href: string
  }
  updated: number
  updatedUsec: string
  items: Article[]
  continuation?: string
}

export interface Article {
  crawlTimeMsec: string
  timestampUsec: string
  id: string
  categories: string[]
  title: string
  published: number
  updated?: number
  canonical: Array<{
    href: string
  }>
  alternate: Array<{
    href: string
    type: string
  }>
  summary: {
    direction: 'ltr' | 'rtl'
    content: string
  }
  author?: string
  likingUsers: any[]
  comments: any[]
  commentsNum: number
  annotations?: Annotation[]
  origin: {
    streamId: string
    title: string
    htmlUrl: string
  }
}

export interface Annotation {
  id: number
  start: number
  end: number
  added_on: number
  text: string
  note: string
  user_id: number
  user_name: string
  user_profile_picture: string
}

// Unread count types
export interface UnreadCount {
  max: number
  unreadcounts: Array<{
    id: string
    count: number
    newestItemTimestampUsec: string
  }>
}

// Stream parameters
export interface StreamParams {
  n?: number // Number of items (default 20, max 100)
  r?: 'o' | 'n' // Order: 'o' for oldest first, 'n' for newest first
  ot?: number // Start time (unix timestamp)
  xt?: string // Exclude target
  it?: string // Include target
  c?: string // Continuation token
  output?: 'json'
  includeAllDirectStreamIds?: boolean
  annotations?: boolean
}

// Preference types
export interface Preference {
  id: string
  value: string
}

export interface PreferenceList {
  prefs: Preference[]
}

// API method parameters
export interface AddSubscriptionParams {
  s: string // Stream URL
  ac?: string // Action (default: subscribe)
  t?: string // Title
}

export interface EditSubscriptionParams {
  s: string // Stream ID
  ac: 'subscribe' | 'unsubscribe' | 'edit'
  t?: string // Title
  a?: string // Add tag
  r?: string // Remove tag
}

export interface EditTagParams {
  s: string // Stream ID
  a?: string // Add tag
  r?: string // Remove tag
  ac?: string // Action
}

export interface MarkAllAsReadParams {
  s: string // Stream ID
  ts?: number // Timestamp
}

// Error types
export interface InoreaderError {
  message: string
  code?: string
  status?: number
  details?: any
}
