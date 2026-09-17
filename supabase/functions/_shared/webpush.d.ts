/**
 * Ambient stub for the JSR module used by `send_push_notifications`.
 *
 * The real implementation is fetched from JSR at deploy/runtime time by the
 * Deno toolchain, so there is nothing to resolve locally for plain `tsc`
 * (which would otherwise report `Cannot find module 'jsr:...'`). This stub
 * declares just the API surface that function uses; if the package API
 * evolves beyond it, extend this file (or prefer enabling the VS Code Deno
 * extension, which resolves the real types from JSR).
 */

declare module 'jsr:@negrel/webpush@0.5.0' {
  export interface VapidKeys {
    publicKey: unknown
    privateKey: unknown
  }

  export const Urgency: {
    readonly VeryLow: number
    readonly Low: number
    readonly Normal: number
    readonly High: number
  }

  export class PushMessageError extends Error {
    readonly response: Response
  }

  export interface Subscriber {
    pushTextMessage(
      message: string,
      options?: { urgency?: number; ttl?: number; topic?: string },
    ): Promise<void>
  }

  export class ApplicationServer {
    static new(options: {
      contactInformation: string
      vapidKeys: VapidKeys
    }): Promise<ApplicationServer>

    subscribe(options: {
      endpoint: string
      keys: { p256dh: string; auth: string }
    }): Subscriber
  }

  export function importVapidKeys(
    keys: { publicKey: unknown; privateKey: unknown },
    options?: { extractable?: boolean },
  ): Promise<VapidKeys>
}