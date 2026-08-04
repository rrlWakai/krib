export interface AppError {
  code: string
  message: string
  status: number
  cause?: unknown
}

export function errorResponse(error: AppError): Response {
  return new Response(
    JSON.stringify({ code: error.code, message: error.message }),
    {
      status: error.status,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export function methodNotAllowed(method: string): Response {
  return new Response(
    JSON.stringify({
      code: 'METHOD_NOT_ALLOWED',
      message: `Method ${method} not allowed`,
    }),
    {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

export function notImplemented(name: string): Response {
  return new Response(
    JSON.stringify({
      code: 'NOT_IMPLEMENTED',
      message: `${name} not implemented`,
    }),
    {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

export function badRequest(message: string): Response {
  return new Response(
    JSON.stringify({ code: 'BAD_REQUEST', message }),
    { status: 400, headers: { 'Content-Type': 'application/json' } },
  )
}

export function unauthorized(message = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({ code: 'UNAUTHORIZED', message }),
    { status: 401, headers: { 'Content-Type': 'application/json' } },
  )
}

export function internalError(cause?: unknown): Response {
  console.error(cause)
  return new Response(
    JSON.stringify({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    }),
    { status: 500, headers: { 'Content-Type': 'application/json' } },
  )
}
