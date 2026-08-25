import { invalidateAdminCache } from '../hooks/useAdminQuery'
import { invokeAdminFunction, type AdminFunctionError } from './edge'
import type { Reservation, SmsLog } from '../types'
import { getSupabaseClient } from '../../lib/supabase/client'
import type { Database } from '../../types/generated/database'
import type {
  BusinessSettings,
  LegalSettings,
  SiteSettings,
  SmsSettings,
} from '../../services/api/settings'

export async function updateSiteSettings(
  payload: {
    business?: Partial<BusinessSettings>
    sms?: Partial<SmsSettings>
    legal?: Partial<LegalSettings>
  },
): Promise<{ data: SiteSettings | null; error: AdminFunctionError | null }> {
  const supabase = getSupabaseClient()
  const updatePayload = payload as unknown as Database['public']['Tables']['settings']['Update']
  const { data, error } = await supabase
    .from('settings')
    .update(updatePayload)
    .eq('id', 1)
    .select('id, business, sms, legal, updated_at')
    .single()

  if (error) {
    return { data: null, error: { code: error.code ?? 'DB', message: error.message } }
  }
  return { data: (data ?? null) as SiteSettings | null, error: null }
}

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

export async function completeReservation(
  reservationId: string,
): Promise<{ data: Reservation | null; error: AdminFunctionError | null }> {
  const result = await invokeAdminFunction<{ reservation: Reservation }>('complete_reservation', {
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

export async function deleteReservation(
  reservationId: string,
): Promise<{ data: { success: boolean; reference_code: string } | null; error: AdminFunctionError | null }> {
  const result = await invokeAdminFunction<{ success: boolean; reference_code: string }>('delete_reservation', {
    reservation_id: reservationId,
  })
  if (result.error) return { data: null, error: result.error }
  invalidateAdminCache('reservations', 'sms-logs', 'guests', `reservation:${reservationId}`)
  return { data: result.data ?? null, error: null }
}
