/**
 * Base error class for all Inoreader API errors
 */
export class InoreaderError extends Error {
  public readonly code?: string
  public readonly status?: number
  public readonly details?: any

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message)
    this.name = 'InoreaderError'
    this.code = code
    this.status = status
    this.details = details

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InoreaderError)
    }
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends InoreaderError {
  constructor(message: string, details?: any) {
    super(message, 'AUTHENTICATION_ERROR', 401, details)
    this.name = 'AuthenticationError'
  }
}

/**
 * Error thrown when authorization fails (insufficient permissions)
 */
export class AuthorizationError extends InoreaderError {
  constructor(message: string, details?: any) {
    super(message, 'AUTHORIZATION_ERROR', 403, details)
    this.name = 'AuthorizationError'
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RateLimitError extends InoreaderError {
  public readonly resetAfter: number
  public readonly zone1Usage: number
  public readonly zone2Usage: number
  public readonly zone1Limit: number
  public readonly zone2Limit: number

  constructor(
    message: string,
    resetAfter: number,
    zone1Usage: number,
    zone2Usage: number,
    zone1Limit: number,
    zone2Limit: number,
    details?: any,
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, details)
    this.name = 'RateLimitError'
    this.resetAfter = resetAfter
    this.zone1Usage = zone1Usage
    this.zone2Usage = zone2Usage
    this.zone1Limit = zone1Limit
    this.zone2Limit = zone2Limit
  }
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends InoreaderError {
  constructor(message: string, details?: any) {
    super(message, 'NOT_FOUND_ERROR', 404, details)
    this.name = 'NotFoundError'
  }
}

/**
 * Error thrown when request validation fails
 */
export class ValidationError extends InoreaderError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

/**
 * Error thrown when the server returns an unexpected error
 */
export class ServerError extends InoreaderError {
  constructor(message: string, status: number, details?: any) {
    super(message, 'SERVER_ERROR', status, details)
    this.name = 'ServerError'
  }
}

/**
 * Error thrown when network requests fail
 */
export class NetworkError extends InoreaderError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', undefined, details)
    this.name = 'NetworkError'
  }
}

/**
 * Error thrown when OAuth token is expired or invalid
 */
export class TokenError extends InoreaderError {
  constructor(message: string, details?: any) {
    super(message, 'TOKEN_ERROR', 401, details)
    this.name = 'TokenError'
  }
}
