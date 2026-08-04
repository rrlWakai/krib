import { getSupabaseClient } from '../../lib/supabase/client'
import { SupabaseClient, type PostgrestError } from '@supabase/supabase-js'

const supabase = getSupabaseClient() as unknown as SupabaseClient

export async function query<T = unknown>(
  table: string,
  options?: {
    select?: string
    eq?: [string, unknown]
    order?: [string, { ascending?: boolean }]
    limit?: number
    single?: boolean
  }
): Promise<{ data: T | null; error: PostgrestError | null }> {
  let builder = supabase.from(table).select(options?.select ?? '*')

  if (options?.eq) {
    builder = builder.eq(options.eq[0], options.eq[1])
  }

  if (options?.order) {
    builder = builder.order(options.order[0], options.order[1])
  }

  if (options?.limit) {
    builder = builder.limit(options.limit)
  }

  if (options?.single) {
    const result = await builder.single()
    return result as { data: T | null; error: PostgrestError | null }
  }

  const result = await builder
  return result as { data: T | null; error: PostgrestError | null }
}

export async function insert<T = unknown>(
  table: string,
  values: Record<string, unknown>,
  options?: { select?: string }
): Promise<{ data: T | null; error: PostgrestError | null }> {
  const result = await supabase
    .from(table)
    .insert(values)
    .select(options?.select ?? '*')
    .single()

  return result as { data: T | null; error: PostgrestError | null }
}

export async function update<T = unknown>(
  table: string,
  values: Record<string, unknown>,
  match: [string, unknown],
  options?: { select?: string }
): Promise<{ data: T | null; error: PostgrestError | null }> {
  const result = await supabase
    .from(table)
    .update(values)
    .eq(match[0], match[1])
    .select(options?.select ?? '*')
    .single()

  return result as { data: T | null; error: PostgrestError | null }
}

export async function remove(
  table: string,
  match: [string, unknown]
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq(match[0], match[1])

  return { error }
}
