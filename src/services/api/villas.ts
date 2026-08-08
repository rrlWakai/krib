import { getSupabaseClient } from "../../lib/supabase/client";

export interface LiveVilla {
  id: string;
  slug: string;
  name: string;
  description: string;
  base_price: number;
  max_guests: number;
  is_active: boolean;
}

export function formatPeso(value: number): string {
  return `₱${new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(value)}`;
}

export function parsePesoAmount(amount: string): number {
  const parsed = Number(String(amount).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

let cached: LiveVilla[] | null = null;
let inflight: Promise<LiveVilla[]> | null = null;

export async function fetchLiveVillas(): Promise<LiveVilla[]> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("villas")
      .select("id, slug, name, description, base_price, max_guests, is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch live villas:", error.message);
      return [];
    }

    cached = (data ?? []) as LiveVilla[];
    return cached;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function clearLiveVillasCache(): void {
  cached = null;
}
