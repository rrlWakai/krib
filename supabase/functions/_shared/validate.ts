import { badRequest } from './errors.ts'

export function requireBody<T extends Record<string, unknown>>(
  body: unknown,
  requiredFields: (keyof T)[],
): { ok: true; data: T } | { ok: false; response: Response } {
  if (!body || typeof body !== 'object') {
    return { ok: false, response: badRequest('Request body is required') }
  }

  const data = body as T
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      return {
        ok: false,
        response: badRequest(`Missing required field: ${String(field)}`),
      }
    }
  }

  return { ok: true, data }
}

export function requireQuery(
  url: URL,
  requiredParams: string[],
): { ok: true; values: Record<string, string> } | { ok: false; response: Response } {
  const values: Record<string, string> = {}
  for (const param of requiredParams) {
    const value = url.searchParams.get(param)
    if (!value) {
      return { ok: false, response: badRequest(`Missing required query parameter: ${param}`) }
    }
    values[param] = value
  }
  return { ok: true, values }
}
