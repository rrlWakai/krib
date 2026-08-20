import {
  FunctionsFetchError,
  FunctionsHttpError,
} from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase/client";

export interface CreateReservationPayload {
  villa_id: string;
  arrival_datetime: string;
  full_name: string;
  email: string;
  phone: string;
  special_requests?: string;
  adults: number;
  children: number;
  infants?: number;
  pets?: number;
  is_party?: boolean;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

export interface CreateReservationResult {
  reservation: {
    id: string;
    reference_code: string;
    status: "pending";
    guest_count: number;
    arrival_datetime: string;
    checkout_datetime: string;
    created_at: string;
    special_requests: string;
    is_party: boolean;
    additional_guest_fee: number;
    party_fee: number;
    total_amount: number;
    guest: {
      id: string;
      full_name: string;
      email: string;
      phone: string;
    };
    villa: {
      slug: string;
      name: string;
    };
  };
}

export interface CreateReservationError {
  code: string;
  message: string;
}

export async function createReservation(
  payload: CreateReservationPayload,
): Promise<{
  data: CreateReservationResult | null;
  error: CreateReservationError | null;
}> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.functions.invoke<CreateReservationResult>(
    "create_reservation",
    { body: payload },
  );

  if (error) {
    let code = "UNKNOWN";
    let message = "Unable to submit your reservation. Please try again.";

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
