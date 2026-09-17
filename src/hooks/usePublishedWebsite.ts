import { useEffect, useState } from "react";
import {
  fetchWebsiteContent,
  type WebsiteContent,
} from "../services/api/website";

export function usePublishedWebsite(): {
  content: WebsiteContent | null;
  loading: boolean;
} {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchWebsiteContent().then((result) => {
      if (!active) return;
      setContent(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { content, loading };
}