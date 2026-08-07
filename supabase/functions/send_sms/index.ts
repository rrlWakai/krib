import { handleCors, corsHeaders } from '../_shared/cors.ts'
import { badRequest, methodNotAllowed, internalError } from '../_shared/errors.ts'
import { requireBody } from '../_shared/validate.ts'
import { getAdminClient } from '../_shared/adminClient.ts'
import { getAdminUser } from '../_shared/auth.ts'
import { isUuid, writeAudit } from '../_shared/reservations.ts'

interface SendSmsInput {
  reservation_id: string
  message?: string
  type?: 'confirmation' | 'checkout' | 'cancellation'
}

const SEMAPHORE_DEFAULT_URL = 'https://api.semaphore.co/api/v4/messages'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('63') && digits.length === 12) return digits
  if (digits.startsWith('0') && digits.length === 11) return '63' + digits.slice(1)
  return digits
}

function buildTemplate(
  type: NonNullable<SendSmsInput['type']>,
  r: {
    reference_code: string
    arrival_datetime: string
    villa_name: string
    guest_name: string
  },
): string {
  const arrival = new Date(r.arrival_datetime)
  const arrivalLabel = arrival.toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const firstName = r.guest_name.trim().split(/\s+/)[0] ?? r.guest_name

  switch (type) {
    case 'confirmation':
      return `Hi ${firstName}! Your reservation ${r.reference_code} at ${r.villa_name} is confirmed. Arrival: ${arrivalLabel}. See you soon! - KRiB Beverly Place`
    case 'checkout':
      return `Hi ${firstName}! This is a reminder that your stay at ${r.villa_name} (${r.reference_code}) is coming to an end. Thank you for choosing KRiB Beverly Place!`
    case 'cancellation':
      return `Hi ${firstName}! Your reservation ${r.reference_code} at ${r.villa_name} has been cancelled as requested. We hope to host you another time. - KRiB Beverly Place`
  }
}

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== 'POST') return methodNotAllowed(req.method)

  try {
    const auth = await getAdminUser(req)
    if (!auth.ok) return auth.response
    const adminUser = auth.admin

    const parsed = await req.json().catch(() => null)
    const check = requireBody<SendSmsInput>(parsed, ['reservation_id'])
    if (!check.ok) return check.response

    const reservationId = String(check.data.reservation_id).trim()
    if (!isUuid(reservationId)) {
      return badRequest('reservation_id must be a valid UUID')
    }

    const type = check.data.type
    let message = (check.data.message ?? '').trim()

    if (type && !['confirmation', 'checkout', 'cancellation'].includes(type)) {
      return badRequest('type must be confirmation, checkout, or cancellation')
    }
    if (!message && !type) {
      return badRequest('Either message or type is required')
    }

    const admin = getAdminClient()

    const { data: reservation, error: fetchError } = await admin
      .from('reservations')
      .select(
        'id, reference_code, status, arrival_datetime, villa:villas(name), guest:guests(full_name, phone)',
      )
      .eq('id', reservationId)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!reservation) {
      return new Response(
        JSON.stringify({ code: 'NOT_FOUND', message: 'Reservation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const villa = reservation.villa as unknown as { name?: string } | null
    const guest = reservation.guest as unknown as { full_name?: string; phone?: string } | null

    if (!guest || !guest.phone) {
      return badRequest('Reservation has no guest phone number on file')
    }

    if (type) {
      message = buildTemplate(type, {
        reference_code: reservation.reference_code,
        arrival_datetime: reservation.arrival_datetime,
        villa_name: villa?.name ?? 'KRiB Beverly Place',
        guest_name: guest.full_name ?? '',
      })
    }

    const recipient = normalizePhone(guest.phone)
    if (recipient.length < 10) {
      return badRequest('Guest phone number is not a valid mobile number')
    }

    const apiToken = Deno.env.get('SEMAPHORE_API_KEY')
    const senderName = Deno.env.get('SEMAPHORE_SENDER_NAME')
    const apiUrl = Deno.env.get('SEMAPHORE_API_URL') ?? SEMAPHORE_DEFAULT_URL

    let status: 'sent' | 'failed' = 'failed'
    let providerMessageId = ''
    let errorMessage = ''

    if (!apiToken) {
      errorMessage = 'SMS provider not configured (SEMAPHORE_API_KEY missing)'
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
          status = 'sent'
          providerMessageId = body[0].message_id
        } else {
          errorMessage = `SMS provider returned ${provider.status}: ${JSON.stringify(body ?? provider.statusText)}`
        }
      } catch (err) {
        errorMessage = `SMS provider request failed: ${err instanceof Error ? err.message : String(err)}`
      }
    }

    const { data: smsLog, error: logError } = await admin
      .from('sms_logs')
      .insert({
        reservation_id: reservationId,
        recipient: guest.phone,
        message,
        direction: 'outbound_manual',
        status,
        provider_message_id: providerMessageId,
        error_message: errorMessage,
      })
      .select(
        'id, reservation_id, recipient, message, direction, status, provider_message_id, error_message, created_at',
      )
      .single()

    if (logError) throw logError

    await writeAudit(admin, adminUser.id, 'send_sms', 'reservation', reservationId, {
      sms_log_id: smsLog.id,
      status,
      reference_code: reservation.reference_code,
    })

    return new Response(
      JSON.stringify({ sms: smsLog }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return internalError(err)
  }
})
