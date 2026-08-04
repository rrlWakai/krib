export type AppError = {
  code: string
  message: string
  status: number
  cause?: unknown
}

export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export class StorageError extends Error {
  constructor(
    message: string,
    public bucket?: string,
    public path?: string,
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

export class NetworkError extends Error {
  constructor(
    message: string = 'A network error occurred. Please check your connection.',
    public originalError?: unknown,
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class EdgeFunctionError extends Error {
  constructor(
    message: string,
    public functionName?: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'EdgeFunctionError'
  }
}

export function handleAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error

  const message = error instanceof Error ? error.message : 'An authentication error occurred'

  if (message.includes('Invalid login credentials')) {
    return new AuthError('Invalid email or password.', 'AUTH_INVALID_CREDENTIALS')
  }
  if (message.includes('Email not confirmed')) {
    return new AuthError('Please confirm your email address before logging in.', 'AUTH_EMAIL_NOT_CONFIRMED')
  }
  if (message.includes('rate limit')) {
    return new AuthError('Too many attempts. Please try again later.', 'AUTH_RATE_LIMITED')
  }

  return new AuthError(message, 'AUTH_UNKNOWN')
}

export function handleStorageError(error: unknown, bucket?: string, path?: string): StorageError {
  if (error instanceof StorageError) return error

  const message = error instanceof Error ? error.message : 'A storage error occurred'
  return new StorageError(message, bucket, path)
}

export function handleNetworkError(error: unknown): NetworkError {
  if (error instanceof NetworkError) return error
  return new NetworkError(undefined, error)
}

export function handleEdgeFunctionError(error: unknown, functionName?: string): EdgeFunctionError {
  if (error instanceof EdgeFunctionError) return error

  const message = error instanceof Error ? error.message : 'An edge function error occurred'
  let status: number | undefined

  if (error instanceof Response) {
    status = error.status
  }

  return new EdgeFunctionError(message, functionName, status)
}
