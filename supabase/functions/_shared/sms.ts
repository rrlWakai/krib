import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type AdminClient = ReturnType<typeof createClient>

const SEMAPHORE_DEFAULT_URL = 'https://api.semaphore.co/api/v4/messages'

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('63') && digits.length === 12) return digits
  if (digits.startsWith('0') && digits.length === 11) return '63' + digits.slice(1)
  return digits
}

export interface SmsSettings {
  enabled: boolean
  ownerMobile: string
  senderName: string
}

export async function readSmsSettings(client: AdminClient): Promise<SmsSettings> {
  const { data } = await client
    .from('settings')
    .select('business, sms')
    .eq('id', 1)
    .maybeSingle()

  const sms = (data?.sms ?? {}) as Record<string, unknown>
  const business = (data?.business ?? {}) as Record<string, unknown>

  return {
    enabled: sms.enabled !== false,
    ownerMobile: String(sms.owner_mobile ?? '').trim() || String(business.phone ?? '').trim(),
    senderName: String(sms.sender_name ?? 'KRiB').trim() || 'KRiB',
  }
}

export interface SmsResult {
  status: 'sent' | 'failed' | 'queued'
  providerMessageId: string
  errorMessage: string
}

const PROVIDER_ERROR_LIMIT = 300

function pickMessage(record: Record<string, unknown>): string {
  for (const key of ['message', 'detail', 'error', 'description']) {
    const value = record[key]
    if (typeof value === 'string' && value) return value
  }
  return ''
}

/**
 * Builds a sanitized, single-line provider diagnostic. Extracts only the
 * provider's short `message`/`detail`/`error` text and strips anything that
 * could echo credentials (apikey=..., long hex blobs). The request body,
 * headers, and secrets are never included.
 */
export function sanitizeProviderError(
  provider: string,
  httpStatus: number,
  body: unknown,
  fallback: string,
): string {
  let message = ''
  if (typeof body === 'string') {
    message = body
  } else if (Array.isArray(body)) {
    const first = body[0]
    if (first && typeof first === 'object') {
      message = pickMessage(first as Record<string, unknown>)
    }
  } else if (body && typeof body === 'object') {
    message = pickMessage(body as Record<string, unknown>)
  }
  message = message
    .replace(/apikey=([^&\s]+)/gi, 'apikey=[REDACTED]')
    .replace(/[0-9a-f]{32,}/gi, '[REDACTED]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, PROVIDER_ERROR_LIMIT)
  return `${provider} returned HTTP ${httpStatus}: ${message || fallback}`
}

/**
 * Maps a provider acceptance to the locked sms_status enum. 'sent' is only set
 * when the provider reports the message as dispatched; the provider's
 * queued/pending state maps to 'queued'. Actual delivery is only confirmed by a
 * later provider status/webhook and is UNKNOWN from this call.
 */
export function classifyProviderStatus(
  raw: unknown,
  hasMessageId: boolean,
): 'sent' | 'failed' | 'queued' {
  if (!hasMessageId) return 'failed'
  const status = String(raw ?? '').toLowerCase()
  if (status === 'queued' || status === 'pending' || status === 'accepted') return 'queued'
  return 'sent'
}

/**
 * Best-effort send. Never throws; failures are recorded in sms_logs
 * so the Control Center can retry / review them.
 */
export async function sendSms(
  client: AdminClient,
  reservationId: string,
  recipientPhone: string,
  message: string,
  direction: 'outbound_auto' | 'outbound_manual' = 'outbound_auto',
): Promise<SmsResult> {
  const recipient = normalizePhone(recipientPhone)
  if (recipient.length < 10) {
    const result = {
      status: 'failed' as const,
      providerMessageId: '',
      errorMessage: 'Invalid recipient mobile number',
    }
    await logSms(client, reservationId, recipientPhone, message, direction, result)
    return result
  }

  const apiToken = Deno.env.get('SEMAPHORE_API_KEY')
  const senderName = Deno.env.get('SEMAPHORE_SENDER_NAME')
  const apiUrl = Deno.env.get('SEMAPHORE_API_URL') ?? SEMAPHORE_DEFAULT_URL

  const result: SmsResult = {
    status: 'failed',
    providerMessageId: '',
    errorMessage: '',
  }

  if (!apiToken) {
    result.errorMessage = 'SMS provider not configured (SEMAPHORE_API_KEY missing)'
  } else {
    try {
      const params = new URLSearchParams()
      params.set('apikey', apiToken)
      params.set('number', recipient)
      params.set('message', message)
      if (senderName) params.set('sendername', senderName)

      const provider = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
      const body = await provider.json().catch(() => null)
      if (provider.ok && Array.isArray(body) && body[0]?.message_id) {
        result.status = classifyProviderStatus(body[0]?.status, true)
        result.providerMessageId = String(body[0].message_id)
      } else {
        result.errorMessage = sanitizeProviderError(
          'Semaphore',
          provider.status,
          body ?? provider.statusText,
          `request rejected (HTTP ${provider.status})`,
        )
        console.warn('[send_sms] provider rejected request', {
          provider: 'semaphore',
          http_status: provider.status,
          provider_error: result.errorMessage,
        })
      }
    } catch (err) {
      result.errorMessage =
        `SMS provider request failed: ${err instanceof Error ? err.message : String(err)}`
    }
  }

  await logSms(client, reservationId, recipientPhone, message, direction, result)
  return result
}

async function logSms(
  client: AdminClient,
  reservationId: string,
  recipientPhone: string,
  message: string,
  direction: 'outbound_auto' | 'outbound_manual',
  result: SmsResult,
): Promise<void> {
  const { error } = await client.from('sms_logs').insert({
    reservation_id: reservationId,
    recipient: recipientPhone,
    message,
    direction,
    status: result.status,
    provider_message_id: result.providerMessageId,
    error_message: result.errorMessage,
  })
  if (error) console.error('Failed to write sms_logs row:', error.message)
}

// ── Templates ──────────────────────────────────

export function arrivalLabel(datetime: string): string {
  const d = new Date(datetime)
  return d.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
}

function firstName(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts[0] || name
}

export interface ReservationContext {
  reference_code: string
  villa_name: string
  guest_name: string
  guest_phone: string
  arrival_datetime: string
}

export function ownerNewReservationMessage(r: ReservationContext, guests: number): string {
  return (
    `New reservation request ${r.reference_code} at ${r.villa_name}. ` +
    `Arrival: ${arrivalLabel(r.arrival_datetime)}. Guests: ${guests}. ` +
    `Guest: ${r.guest_name} (${r.guest_phone}). ` +
    `Please review in the KRiB Control Center.`
  )
}

export function guestApprovedMessage(r: ReservationContext): string {
  const first = firstName(r.guest_name)
  return (
    `Hi ${first}! Your reservation ${r.reference_code} at ${r.villa_name} is confirmed. ` +
    `Arrival: ${arrivalLabel(r.arrival_datetime)}. See you soon! - KRiB Beverly Place`
  )
}

export function guestDeclinedMessage(r: ReservationContext): string {
  const first = firstName(r.guest_name)
  return (
    `Hi ${first}! Unfortunately, we couldn't accommodate reservation ${r.reference_code} ` +
    `at ${r.villa_name} — your requested dates aren't available. We'd love to host you another time. - KRiB Beverly Place`
  )
}

export function guestCancelledMessage(r: ReservationContext): string {
  const first = firstName(r.guest_name)
  return (
    `Hi ${first}! Your reservation ${r.reference_code} at ${r.villa_name} has been cancelled as requested. ` +
    `We hope to host you another time. - KRiB Beverly Place`
  )
}

export function ownerGuestCancelledMessage(r: ReservationContext): string {
  return (
    `Reservation ${r.reference_code} for ${r.guest_name} at ${r.villa_name} was cancelled by the guest. - KRiB Beverly Place`
  )
}
