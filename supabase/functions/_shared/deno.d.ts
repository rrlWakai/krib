/**
 * Minimal ambient declarations for the `Deno` global used by these Supabase
 * Edge Functions (`Deno.serve`, `Deno.env`).
 *
 * These functions run on the Deno runtime in production, but the rest of
 * this repository is a Vite/Node TypeScript project whose tsconfigs only
 * cover `src` and `vite.config.ts`. Without these declarations the plain
 * TypeScript language service (VS Code without the Deno extension, `tsc`)
 * reports `Cannot find name 'Deno'` for every function file. Together with
 * `supabase/functions/tsconfig.json` they let the standard TS toolchain
 * type-check the functions offline, with no extra dependencies.
 *
 * Only the subset of the Deno API this project uses is declared. If the
 * VS Code Deno extension is enabled for `supabase/functions`, its built-in
 * `lib.deno.d.ts` provides the full API surface instead.
 */

declare namespace Deno {
  interface Env {
    /** Read an environment variable; `undefined` when not set. */
    get(key: string): string | undefined
    has(key: string): boolean
    set(key: string, value: string): void
    delete(key: string): void
    toObject(): Record<string, string>
  }

  const env: Env

  interface ServeHandlerInfo {
    readonly remoteAddr: {
      transport: 'tcp' | 'udp'
      hostname: string
      port: number
    }
  }

  type ServeHandler = (
    request: Request,
    info: ServeHandlerInfo,
  ) => Response | Promise<Response>

  interface HttpServer {
    readonly addr: {
      transport: 'tcp' | 'udp'
      hostname: string
      port: number
    }
    finished: Promise<void>
    shutdown(): Promise<void>
  }

  interface ServeOptions {
    port?: number
    hostname?: string
    signal?: AbortSignal
    onError?: (error: unknown) => Response | Promise<Response>
    onListen?: (params: { hostname: string; port: number }) => void
  }

  function serve(handler: ServeHandler, options?: ServeOptions): HttpServer
}