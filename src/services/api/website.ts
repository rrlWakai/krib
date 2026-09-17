import { getSupabaseClient } from "../../lib/supabase/client";
import { env } from "../../config/env";

export interface HeroContent {
  subtitle: string;
  title: string;
  description: string;
}

export interface AboutContent {
  label: string;
  title: string;
  paragraphs: string[];
}

export interface CtaContent {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
}

export interface HomePageContent {
  hero: HeroContent;
  about: AboutContent;
  cta: CtaContent;
}

export interface AboutPageSection {
  title: string;
  paragraphs: string[];
}

export interface AboutPageContent {
  heroTitle: string;
  heroDescription: string;
  sections: AboutPageSection[];
  quote: string;
}

export interface Direction {
  from: string;
  via: string;
  travelTime: string;
  description: string;
}

export interface LocationContent {
  heroTitle: string;
  heroDescription: string;
  address: string;
  directions: Direction[];
}

export type PageContent = HomePageContent | AboutPageContent | LocationContent;

export interface VillaMarketingContent {
  tagline?: string;
  description?: string;
  story?: string;
  quickHighlights?: string[];
}

export interface PublishedGalleryImage {
  id: string;
  villa_id: string;
  storage_path: string;
  alt_text: string;
  caption: string;
  sort_order: number;
}

export interface WebsiteContent {
  pages: Record<string, PageContent | null>;
  villaMarketing: Record<string, VillaMarketingContent | null>;
  gallery: PublishedGalleryImage[];
}

const EMPTY: WebsiteContent = { pages: {}, villaMarketing: {}, gallery: [] };

export function resolveStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = env.VITE_SUPABASE_URL.replace(/\/+$/, "");
  return `${base}/storage/v1/object/public/villa-gallery/${path}`;
}

let cached: WebsiteContent | null = null;
let inflight: Promise<WebsiteContent> | null = null;

export async function fetchWebsiteContent(): Promise<WebsiteContent> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    const supabase = getSupabaseClient();

    const [pagesResult, marketingResult, galleryResult] = await Promise.all([
      supabase
        .from("website_pages")
        .select("slug, published_content")
        .eq("is_published", true)
        .returns<{ slug: string; published_content: unknown }[]>(),
      supabase
        .from("villa_marketing")
        .select("villa_id, published_content")
        .eq("is_published", true)
        .returns<{ villa_id: string; published_content: unknown }[]>(),
      supabase
        .from("gallery_images")
        .select("id, villa_id, storage_path, alt_text, caption, sort_order")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true })
        .returns<PublishedGalleryImage[]>(),
    ]);

    if (pagesResult.error || marketingResult.error || galleryResult.error) {
      console.error(
        "Failed to fetch website content:",
        pagesResult.error?.message ??
          marketingResult.error?.message ??
          galleryResult.error?.message,
      );
      return { ...EMPTY };
    }

    const pages: WebsiteContent["pages"] = {};
    for (const row of pagesResult.data ?? []) {
      if (row.published_content && typeof row.published_content === "object") {
        pages[row.slug] = row.published_content as PageContent;
      }
    }

    const villaMarketing: WebsiteContent["villaMarketing"] = {};
    for (const row of marketingResult.data ?? []) {
      if (row.published_content && typeof row.published_content === "object") {
        villaMarketing[row.villa_id] =
          row.published_content as VillaMarketingContent;
      }
    }

    cached = {
      pages,
      villaMarketing,
      gallery: (galleryResult.data ?? []) as PublishedGalleryImage[],
    };
    return cached;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function clearWebsiteContentCache(): void {
  cached = null;
}