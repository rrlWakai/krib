import { useEffect, useState } from "react";
import { fetchLiveVillas, type LiveVilla } from "../services/api/villas";

export function useLiveVillas(): {
  liveVillas: Record<string, LiveVilla>;
  loading: boolean;
} {
  const [liveVillas, setLiveVillas] = useState<Record<string, LiveVilla>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchLiveVillas().then((result) => {
      if (!active) return;
      const bySlug: Record<string, LiveVilla> = {};
      for (const villa of result) bySlug[villa.slug] = villa;
      setLiveVillas(bySlug);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { liveVillas, loading };
}
