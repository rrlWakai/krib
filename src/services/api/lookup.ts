import {
  FunctionsFetchError,
  FunctionsHttpError,
} from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase/client";
import type { Reservation, ReservationStatus } from "../../lib/reservationData";

interface LookupReservationResponse {
  reservation: {
    id: string;
    reference_code: string;
    status: string;
    guest_count: number;
    arrival_datetime: string;
    checkout_datetime: string;
    special_requests: string | null;
    created_at: string;
    approved_at: string | null;
    cancelled_at: string | null;
    guest: {
      id: string;
      full_name: string;
      email: string;
      phone: string;
    };
    villa: {
      slug: string;
      name: string;
      base_price: number;
      max_guests: number;
    };
  };
}

export interface LookupResult {
  reservation: Reservation | null;
  reservations: Reservation[] | null;
  error?: { code: string; message: string } | null;
}

function mapRawReservation(
  raw: LookupReservationResponse["reservation"],
): Reservation {
  return {
    id: raw.id,
    referenceCode: raw.reference_code,
    email: raw.guest.email,
    guestName: raw.guest.full_name,
    villaId: raw.villa.slug,
    villaName: raw.villa.name,
    maxGuests: raw.villa.max_guests,
    checkIn: raw.arrival_datetime,
    checkOut: raw.checkout_datetime,
    arrivalDatetime: raw.arrival_datetime,
    checkoutDatetime: raw.checkout_datetime,
    guests: {
      adults: raw.guest_count,
      children: 0,
      infants: 0,
      pets: 0,
    },
    createdAt: raw.created_at,
    status: raw.status as ReservationStatus,
    baseRate: raw.villa.base_price,
    totalAmount: raw.villa.base_price,
    approvalDate: raw.approved_at ?? undefined,
    confirmationNumber: raw.reference_code,
    message: raw.special_requests ?? undefined,
  };
}

async function invoke(
  functionName: string,
  body: Record<string, unknown>,
): Promise<{ data: unknown; error: { code: string; message: string } | null }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
  });

  if (error) {
    let code = "UNKNOWN";
    let message = "Unable to complete the request. Please try again.";

    if (error instanceof FunctionsHttpError) {
      const body = (await error.context.json().catch(() => null)) as {
        code?: string;
        message?: string;
      } | null;
      code = body?.code ?? code;
      message = body?.message ?? message;
    } else if (error instanceof FunctionsFetchError) {
      message = "Network error. Please check your connection and try again.";
    }

    return { data: null, error: { code, message } };
  }

  return { data, error: null };
}

export async function lookupByReference(
  referenceCode: string,
  email?: string,
): Promise<LookupResult> {
  const { data, error } = await invoke("lookup_reservation", {
    reference_code: referenceCode,
    email: email || undefined,
  });
  if (error) return { reservation: null, reservations: null, error };
  const raw = (data as LookupReservationResponse | null)?.reservation;
  return { reservation: raw ? mapRawReservation(raw) : null, reservations: null };
}

export async function lookupById(
  id: string,
  email?: string,
): Promise<LookupResult> {
  const { data, error } = await invoke("lookup_reservation", {
    id,
    email: email || undefined,
  });
  if (error) return { reservation: null, reservations: null, error };
  const raw = (data as LookupReservationResponse | null)?.reservation;
  return { reservation: raw ? mapRawReservation(raw) : null, reservations: null };
}

export async function cancelReservation(
  referenceCode: string,
  email: string,
): Promise<{ reservation: Reservation | null; error: { code: string; message: string } | null }> {
  const { data, error } = await invoke("cancel_reservation", {
    reference_code: referenceCode,
    email,
  });
  if (error) return { reservation: null, error };
  const raw = (data as LookupReservationResponse | null)?.reservation;
  return { reservation: raw ? mapRawReservation(raw) : null, error: null };
}
