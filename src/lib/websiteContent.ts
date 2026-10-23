import { siteContent, experiences as experienceFallback } from "./data";
import { resolveStorageUrl } from "../services/api/website";
import type { PublishedGalleryImage } from "../services/api/website";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeText(fallback: string, override: unknown): string {
  return typeof override === "string" && override.trim() !== ""
    ? override
    : fallback;
}

export function mergeStringArray(fallback: string[], override: unknown): string[] {
  if (
    Array.isArray(override) &&
    override.length > 0 &&
    override.every((item) => typeof item === "string")
  ) {
    return override as string[];
  }
  return fallback;
}

// ──────────────────────────────────────────────
// HOME — hero / about / cta
// ──────────────────────────────────────────────

const CTA_FALLBACK = {
  eyebrow: "Your Perfect Villa Awaits",
  title: "Ready to Find Your Perfect Villa?",
  description:
    "Whether you are planning a peaceful family getaway or a memorable celebration with loved ones, explore KRiB 1 and KRiB 2 to discover the stay that is right for you.",
  buttonLabel: "Explore Villas",
};

const HOME_SECTION_FALLBACKS = {
  experiences: {
    label: "The Experience",
    title: "Weekends at KRiB are built around what matters most.",
    items: experienceFallback,
  },
  villas: {
    label: "Choose Your Villa",
    title: "Two Villas. One unforgettable experience.",
    description:
      "Whether you are planning an intimate family getaway or a grand celebration, each villa offers its own personality. The question is not which is better — but which feels like yours.",
  },
  amenities: {
    label: "Featured Amenities",
    title: "Designed for comfort, built for connection.",
    description:
      "Every villa is thoughtfully equipped so you can focus on what matters — spending time with the people you love.",
  },
  faq: {
    label: "Guidance",
    title: "Everything you need to know before you arrive.",
    description:
      "We have gathered the questions guests ask most when planning their stay.",
  },
  connect: {
    label: "Let's Connect",
    title: "Have questions about your stay, availability, or celebrations?",
    lead: "We're just a message away.",
    description:
      "Connect with us on Facebook or Instagram and we'll be happy to help you plan your perfect getaway.",
  },
};

export interface ResolvedHomeContent {
  hero: {
    subtitle: string;
    title: string;
    description: string;
  };
  about: {
    label: string;
    title: string;
    paragraphs: string[];
  };
  cta: {
    eyebrow: string;
    title: string;
    description: string;
    buttonLabel: string;
  };
  experiences: { label: string; title: string; items: { id: string; title: string; description: string; image: string }[] };
  villas: { label: string; title: string; description: string };
  amenities: { label: string; title: string; description: string };
  faq: { label: string; title: string; description: string };
  connect: { label: string; title: string; lead: string; description: string };
}

export function resolveHomeContent(page: unknown): ResolvedHomeContent {
  const hero = isRecord(page) && isRecord(page.hero) ? page.hero : {};
  const about = isRecord(page) && isRecord(page.about) ? page.about : {};
  const cta = isRecord(page) && isRecord(page.cta) ? page.cta : {};
  const experiences = isRecord(page) && isRecord(page.experiences) ? page.experiences : {};
  const villas = isRecord(page) && isRecord(page.villas) ? page.villas : {};
  const amenities = isRecord(page) && isRecord(page.amenities) ? page.amenities : {};
  const faq = isRecord(page) && isRecord(page.faq) ? page.faq : {};
  const connect = isRecord(page) && isRecord(page.connect) ? page.connect : {};
  const experienceItems = Array.isArray(experiences.items)
    ? experiences.items
        .filter(isRecord)
        .map((item, index) => ({
          id: mergeText(experienceFallback[index]?.id ?? `experience-${index + 1}`, item.id),
          title: mergeText(experienceFallback[index]?.title ?? "", item.title),
          description: mergeText(experienceFallback[index]?.description ?? "", item.description),
          image: mergeText(experienceFallback[index]?.image ?? "", item.image),
        }))
        .filter((item) => item.title && item.description && item.image)
    : [];

  return {
    hero: {
      subtitle: mergeText(siteContent.hero.subtitle, hero.subtitle),
      title: mergeText(siteContent.hero.title, hero.title),
      description: mergeText(siteContent.hero.description, hero.description),
    },
    about: {
      label: mergeText(siteContent.about.label, about.label),
      title: mergeText(siteContent.about.title, about.title),
      paragraphs: mergeStringArray(siteContent.about.paragraphs, about.paragraphs),
    },
    cta: {
      eyebrow: mergeText(CTA_FALLBACK.eyebrow, cta.eyebrow),
      title: mergeText(CTA_FALLBACK.title, cta.title),
      description: mergeText(CTA_FALLBACK.description, cta.description),
      buttonLabel: mergeText(CTA_FALLBACK.buttonLabel, cta.buttonLabel),
    },
    experiences: {
      label: mergeText(HOME_SECTION_FALLBACKS.experiences.label, experiences.label),
      title: mergeText(HOME_SECTION_FALLBACKS.experiences.title, experiences.title),
      items: experienceItems.length > 0 ? experienceItems : HOME_SECTION_FALLBACKS.experiences.items,
    },
    villas: {
      label: mergeText(HOME_SECTION_FALLBACKS.villas.label, villas.label),
      title: mergeText(HOME_SECTION_FALLBACKS.villas.title, villas.title),
      description: mergeText(HOME_SECTION_FALLBACKS.villas.description, villas.description),
    },
    amenities: {
      label: mergeText(HOME_SECTION_FALLBACKS.amenities.label, amenities.label),
      title: mergeText(HOME_SECTION_FALLBACKS.amenities.title, amenities.title),
      description: mergeText(HOME_SECTION_FALLBACKS.amenities.description, amenities.description),
    },
    faq: {
      label: mergeText(HOME_SECTION_FALLBACKS.faq.label, faq.label),
      title: mergeText(HOME_SECTION_FALLBACKS.faq.title, faq.title),
      description: mergeText(HOME_SECTION_FALLBACKS.faq.description, faq.description),
    },
    connect: {
      label: mergeText(HOME_SECTION_FALLBACKS.connect.label, connect.label),
      title: mergeText(HOME_SECTION_FALLBACKS.connect.title, connect.title),
      lead: mergeText(HOME_SECTION_FALLBACKS.connect.lead, connect.lead),
      description: mergeText(HOME_SECTION_FALLBACKS.connect.description, connect.description),
    },
  };
}

// ──────────────────────────────────────────────
// ABOUT PAGE
// ──────────────────────────────────────────────

export interface ResolvedAboutPageSection {
  title: string;
  paragraphs: string[];
}

export interface ResolvedAboutPageContent {
  heroTitle: string;
  heroDescription: string;
  sections: ResolvedAboutPageSection[];
  quote: string;
}

export function resolveAboutPageContent(page: unknown): ResolvedAboutPageContent {
  const fallback = siteContent.aboutPage;
  const sectionsRaw = isRecord(page) ? page.sections : undefined;
  let sections = fallback.sections;

  if (Array.isArray(sectionsRaw)) {
    const sectionsFromCms: ResolvedAboutPageSection[] = [];
    for (const raw of sectionsRaw) {
      if (!isRecord(raw)) continue;
      const paragraphs = mergeStringArray([], raw.paragraphs);
      if (paragraphs.length === 0) continue;
      sectionsFromCms.push({
        title: mergeText("", raw.title),
        paragraphs,
      });
    }
    if (sectionsFromCms.length > 0) sections = sectionsFromCms;
  }

  return {
    heroTitle: mergeText(fallback.heroTitle, isRecord(page) ? page.heroTitle : undefined),
    heroDescription: mergeText(
      fallback.heroDescription,
      isRecord(page) ? page.heroDescription : undefined,
    ),
    sections,
    quote: mergeText(
      "We are not a resort. We are not a hotel. We are a place where you can breathe, connect, and remember what matters most.",
      isRecord(page) ? page.quote : undefined,
    ),
  };
}

// ──────────────────────────────────────────────
// LOCATION PAGE
// ──────────────────────────────────────────────

export interface ResolvedDirection {
  from: string;
  via: string;
  travelTime: string;
  description: string;
}

export interface ResolvedLocationContent {
  heroTitle: string;
  heroDescription: string;
  address: string;
  directions: ResolvedDirection[];
}

export function resolveLocationContent(page: unknown): ResolvedLocationContent {
  const fallback = siteContent.location;
  const directionsRaw = isRecord(page) ? page.directions : undefined;
  let directions = fallback.directions;

  if (Array.isArray(directionsRaw)) {
    const directionsFromCms: ResolvedDirection[] = [];
    for (const raw of directionsRaw) {
      if (!isRecord(raw)) continue;
      directionsFromCms.push({
        from: mergeText("", raw.from),
        via: mergeText("", raw.via),
        travelTime: mergeText("", raw.travelTime),
        description: mergeText("", raw.description),
      });
    }
    if (directionsFromCms.length > 0) directions = directionsFromCms;
  }

  return {
    heroTitle: mergeText(fallback.heroTitle, isRecord(page) ? page.heroTitle : undefined),
    heroDescription: mergeText(
      fallback.heroDescription,
      isRecord(page) ? page.heroDescription : undefined,
    ),
    address: mergeText(fallback.address, isRecord(page) ? page.address : undefined),
    directions,
  };
}

// ──────────────────────────────────────────────
// VILLA MARKETING
// ──────────────────────────────────────────────

export interface ResolvedVillaMarketing {
  tagline: string;
  description: string;
  story: string;
  quickHighlights: string[];
}

/**
 * Resolves the effective villa marketing copy.
 * Precedence for `description`:
 *   1. Published CMS description (when non-empty)
 *   2. Existing `villas.description` from the database
 *      (the current live behaviour, guarded against the
 *      seeded tagline placeholder)
 *   3. Static built-in copy
 * Other fields: published CMS value wins, else static.
 */
export function resolveVillaMarketing(
  marketing: unknown,
  fallback: {
    tagline: string;
    description: string;
    story: string;
    quickHighlights: string[];
  },
  dbDescription: string | null | undefined,
): ResolvedVillaMarketing {
  const mark = isRecord(marketing) ? marketing : {};

  const cmsDescription = mergeText("", mark.description);
  const effectiveDbDescription =
    typeof dbDescription === "string" &&
    dbDescription.trim() !== "" &&
    dbDescription !== fallback.tagline
      ? dbDescription
      : "";

  return {
    tagline: mergeText(fallback.tagline, mark.tagline),
    description:
      cmsDescription !== ""
        ? cmsDescription
        : effectiveDbDescription !== ""
          ? effectiveDbDescription
          : fallback.description,
    story: mergeText(fallback.story, mark.story),
    quickHighlights: mergeStringArray(fallback.quickHighlights, mark.quickHighlights),
  };
}

// ──────────────────────────────────────────────
// VILLA GALLERY
// ──────────────────────────────────────────────

/**
 * Returns the published, visible gallery for a villa
 * (public storage URLs, already ordered). Falls back to
 * the static image list when no CMS images are
 * published for that villa.
 */
export function resolveVillaGalleryImages(
  gallery: PublishedGalleryImage[] | undefined,
  villaId: string,
  staticImages: string[],
): string[] {
  const cmsImages = (gallery ?? [])
    .filter((img) => img.villa_id === villaId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => resolveStorageUrl(img.storage_path))
    .filter((url): url is string => url !== null);

  return cmsImages.length > 0 ? cmsImages : staticImages;
}
