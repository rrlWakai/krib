import { useEffect, useState } from "react";
import { fetchSiteSettings, type SiteSettings } from "../services/api/settings";

export function useSiteSettings(): {
  settings: SiteSettings | null;
  loading: boolean;
} {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchSiteSettings().then((result) => {
      if (!active) return;
      setSettings(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading };
}
