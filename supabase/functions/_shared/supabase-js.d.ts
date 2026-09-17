/**
 * Ambient stub for the remote supabase-js module used by `_shared/*`.
 *
 * The real module is fetched from esm.sh by the Deno runtime at deploy
 * time. Locally, plain `tsc` cannot resolve the URL specifier, and mapping
 * it to the installed npm package pulls in schema generics that cascade
 * `never` types through every untyped query in these functions. This stub
 * keeps local type-checking aligned with how the code is written (loose
 * result typing, `.from().select()` chains) without new diagnostics.
 *
 * When the VS Code Deno extension is enabled for `supabase/functions`, it
 * resolves the real types from esm.sh instead and this stub is unused.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export interface PostgrestError {
    code: string
    message: string
    details?: string | null
    hint?: string | null
  }

  export interface PostgrestResult<T = any> {
    data: T
    error: PostgrestError | null
    count?: number | null
  }

  // Query builders are intentionally `any`-typed: these functions treat
  // results as loose records and the real types come from the remote
  // module resolved by the Deno toolchain at deploy time.
  export interface PostgrestFilterBuilder extends PromiseLike<PostgrestResult> {
    select(columns?: string, options?: Record<string, unknown>): PostgrestFilterBuilder
    eq(column: string, value: unknown): PostgrestFilterBuilder
    neq(column: string, value: unknown): PostgrestFilterBuilder
    gt(column: string, value: unknown): PostgrestFilterBuilder
    gte(column: string, value: unknown): PostgrestFilterBuilder
    lt(column: string, value: unknown): PostgrestFilterBuilder
    lte(column: string, value: unknown): PostgrestFilterBuilder
    like(column: string, value: string): PostgrestFilterBuilder
    ilike(column: string, value: string): PostgrestFilterBuilder
    is(column: string, value: unknown): PostgrestFilterBuilder
    in(column: string, values: unknown[]): PostgrestFilterBuilder
    contains(column: string, value: unknown): PostgrestFilterBuilder
    or(filters: string): PostgrestFilterBuilder
    not(column: string, operator: string, value: unknown): PostgrestFilterBuilder
    order(
      column: string,
      options?: { ascending?: boolean; nullsFirst?: boolean; referencedTable?: string },
    ): PostgrestFilterBuilder
    limit(count: number, options?: { referencedTable?: string }): PostgrestFilterBuilder
    range(from: number, to: number): PostgrestFilterBuilder
    single(): PostgrestBuilder
    maybeSingle(): PostgrestBuilder
  }

  export interface PostgrestBuilder extends PromiseLike<PostgrestResult> {
    select(columns?: string, options?: Record<string, unknown>): PostgrestFilterBuilder
  }

  export interface SupabaseQueryBuilder {
    insert(
      values: any,
      options?: { onConflict?: string; ignoreDuplicates?: boolean; defaultToNull?: boolean },
    ): PostgrestBuilder & PostgrestFilterBuilder
    update(values: any, options?: Record<string, unknown>): PostgrestBuilder & PostgrestFilterBuilder
    upsert(
      values: any,
      options?: { onConflict?: string; ignoreDuplicates?: boolean; defaultToNull?: boolean },
    ): PostgrestBuilder & PostgrestFilterBuilder
    delete(options?: Record<string, unknown>): PostgrestFilterBuilder
  }

  export interface SupabaseClient {
    from(table: string): SupabaseQueryBuilder & PostgrestFilterBuilder
    rpc(fn: string, args?: Record<string, unknown>, options?: Record<string, unknown>): PostgrestBuilder
    auth: {
      getUser(jwt: string, options?: { jwt?: string }): Promise<{ data: { user: any }; error: PostgrestError | null }>
    }
  }

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: Record<string, unknown>,
  ): SupabaseClient
}