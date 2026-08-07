import { invalidateAdminCache } from '../hooks/useAdminQuery'
import { invokeAdminFunction, type AdminFunctionError } from './edge'
import type { Reservation, SmsLog } from '../types'

function invalidateReservationData(id: string) {
  invalidateAdminCache('reservations', 'sms-logs', `reservation:${id}`)
}

export async function approveReservation(
  reservationId: string,
): Promise<{ data: Reservation | null; error: AdminFunctionError | null }> {
  const result = await invokeAdminFunction<{ reservation: Reservation }>('approve_reservation', {
    reservation_id: reservationId,
  })
  if (result.error) return { data: null, error: result.error }
  invalidateReservationData(reservationId)
  return { data: result.data?.reservation ?? null, error: null }
}

export async function declineReservation(
  reservationId: string,
  reason?: string,
): Promise<{ data: Reservation | null; error: AdminFunctionError | null }> {
  const result = await invokeAdminFunction<{ reservation: Reservation }>('decline_reservation', {
    reservation_id: reservationId,
    reason: reason ?? '',
  })
  if (result.error) return { data: null, error: result.error }
  invalidateReservationData(reservationId)
  return { data: result.data?.reservation ?? null, error: null }
}

export async function cancelReservation(
  reservationId: string,
): Promise<{ data: Reservation | null; error: AdminFunctionError | null }> {
  const result = await invokeAdminFunction<{ reservation: Reservation }>('cancel_reservation', {
    reservation_id: reservationId,
  })
  if (result.error) return { data: null, error: result.error }
  invalidateReservationData(reservationId)
  return { data: result.data?.reservation ?? null, error: null }
}

export async function sendReservationSms(
  reservationId: string,
  options: { type?: 'confirmation' | 'checkout' | 'cancellation'; message?: string },
): Promise<{ data: SmsLog | null; error: AdminFunctionError | null }> {
  const result = await invokeAdminFunction<{ sms: SmsLog }>('send_sms', {
    reservation_id: reservationId,
    ...(options.type ? { type: options.type } : {}),
    ...(options.message ? { message: options.message } : {}),
  })
  if (result.error) return { data: null, error: result.error }
  invalidateReservationData(reservationId)
  return { data: result.data?.sms ?? null, error: null }
}
