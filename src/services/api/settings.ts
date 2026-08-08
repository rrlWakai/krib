import { getSupabaseClient } from "../../lib/supabase/client";

export interface BusinessSettings {
  business_name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  website: string;
  check_in_time: string;
  check_out_time: string;
  party_fee: number;
  map_url: string;
}

export interface SmsSettings {
  enabled: boolean;
  owner_mobile: string;
  sender_name: string;
}

export interface LegalSettings {
  privacy_policy: string;
  terms_conditions: string;
}

export interface SiteSettings {
  id: number;
  business: Partial<BusinessSettings>;
  sms: Partial<SmsSettings>;
  legal: Partial<LegalSettings>;
  updated_at: string;
}

let cached: SiteSettings | null = null;
let inflight: Promise<SiteSettings | null> | null = null;

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("settings")
      .select("id, business, sms, legal, updated_at")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch site settings:", error.message);
      return null;
    }

    cached = data as SiteSettings;
    return cached;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function clearSiteSettingsCache(): void {
  cached = null;
}
