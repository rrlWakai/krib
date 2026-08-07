import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js'
import { getSupabaseClient } from '../../lib/supabase/client'

export interface AdminFunctionError {
  code: string
  message: string
}

export async function invokeAdminFunction<T>(
  fn: string,
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: AdminFunctionError | null }> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.functions.invoke<T>(fn, { body })

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context
        .json()
        .catch(() => null)) as { code?: string; message?: string } | null
      return {
        data: null,
        error: {
          code: payload?.code ?? 'REQUEST_FAILED',
          message: payload?.message ?? 'Request failed',
        },
      }
    }
    if (error instanceof FunctionsFetchError) {
      return {
        data: null,
        error: { code: 'NETWORK', message: 'Network error. Please check your connection and try again.' },
      }
    }
    return {
      data: null,
      error: { code: 'UNKNOWN', message: error.message || 'Request failed' },
    }
  }

  return { data, error: null }
}
