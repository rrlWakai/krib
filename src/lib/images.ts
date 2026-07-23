import heroImage from '../assets/hero.png'
import krib1Portrait from '../assets/05.png'
import k2Image from '../assets/k2.webp'

// ── KRiB 2 Production Images ────────────────────────────────────────
import krib2Exterior from '../assets/Krib2/exterior.jpg'
import krib2Pool from '../assets/Krib2/pool.jpg'
import krib2Living from '../assets/Krib2/living.jpg'
import krib2Balcony from '../assets/Krib2/balcony.jpg'
import krib2Dining from '../assets/Krib2/dining.avif'
import krib2Kitchen from '../assets/Krib2/kit.avif'
import krib2KitchenAlt from '../assets/Krib2/kitc.avif'
import krib2Gal from '../assets/Krib2/gal.avif'
import krib2Gal2 from '../assets/Krib2/gal2.avif'
import krib2Gal3 from '../assets/Krib2/gal3.avif'
import krib2Gal4 from '../assets/Krib2/gal4.avif'
import krib2Bed1 from '../assets/Krib2/bed1.avif'
import krib2Bed2 from '../assets/Krib2/bed2.avif'
import krib2Bed3 from '../assets/Krib2/bed3.avif'
import krib2Bath from '../assets/Krib2/bath.avif'
import krib2Bath2 from '../assets/Krib2/bath2.avif'
import krib2Shower from '../assets/Krib2/shower.avif'
import krib2Toil from '../assets/Krib2/toil.avif'
import krib2Toil2 from '../assets/Krib2/toil2.avif'
import krib2Toil3 from '../assets/Krib2/toil3.avif'
import krib2Toil4 from '../assets/Krib2/toil4.avif'
import krib2Toil5 from '../assets/Krib2/toil5.avif'

// ─── PREMIUM HOSPITALITY PLACEHOLDERS ────────────────────────────────
// KRiB 2 images have been replaced with production assets.
// KRiB 1 and shared images still use Unsplash placeholders.
// Replace remaining URLs with the owner's real images.
// ──────────────────────────────────────────────────────────────────────

const UNSPLASH = 'https://images.unsplash.com'

export const images = {
  // ── Hero ──────────────────────────────────────────────────────────
  hero: heroImage,

  // ── KRiB 1 ────────────────────────────────────────────────────────
  krib1: krib1Portrait,
  krib1Bedroom: `${UNSPLASH}/photo-1618773928121-c32242e63f39?w=1200&q=80&auto=format&fit=crop`,
  krib1Pool: `${UNSPLASH}/photo-1572331165267-854da2b021b1?w=1200&q=80&auto=format&fit=crop`,

  // ── KRiB 2 (Production) ───────────────────────────────────────────
  krib2: krib2Exterior,
  krib2Living: krib2Living,
  krib2Pool: krib2Pool,
  k2: k2Image,
  krib2Exterior,
  krib2Balcony,
  krib2Dining,
  krib2Kitchen,
  krib2KitchenAlt,
  krib2Gal,
  krib2Gal2,
  krib2Gal3,
  krib2Gal4,
  krib2Bed1,
  krib2Bed2,
  krib2Bed3,
  krib2Bath,
  krib2Bath2,
  krib2Shower,
  krib2Toil,
  krib2Toil2,
  krib2Toil3,
  krib2Toil4,
  krib2Toil5,

  // ── Experiences ────────────────────────────────────────────────────
  morningCoffee: `${UNSPLASH}/photo-1495474472287-4d71bcdd2085?w=1200&q=80&auto=format&fit=crop`,
  familyBbq: `${UNSPLASH}/photo-1529543544282-ea99407407c1?w=1200&q=80&auto=format&fit=crop`,
  sunsetGatherings: `${UNSPLASH}/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop`,

  // ── Gallery ────────────────────────────────────────────────────────
  galleryBathroom: `${UNSPLASH}/photo-1552321554-5fefe8c9ef14?w=1200&q=80&auto=format&fit=crop`,
  galleryStairs: `${UNSPLASH}/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop`,
  galleryBreakfast: `${UNSPLASH}/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop`,
  galleryTextile: `${UNSPLASH}/photo-1616137466211-f73a09f13e16?w=1200&q=80&auto=format&fit=crop`,
  galleryEstateNight: `${UNSPLASH}/photo-1564013799919-ab600027ffc6?w=1200&q=80&auto=format&fit=crop`,

  // ── Map ────────────────────────────────────────────────────────────
  map: `${UNSPLASH}/photo-1524661135-423995f22d0b?w=1200&q=80&auto=format&fit=crop`,

  // ── Food / Lifestyle ──────────────────────────────────────────────
  alFresco: `${UNSPLASH}/photo-1414235077428-338989a2e8c0?w=1200&q=80&auto=format&fit=crop`,
  yogaTerrace: `${UNSPLASH}/photo-1506126613408-eca07ce68773?w=1200&q=80&auto=format&fit=crop`,

  // ── About / Story ──────────────────────────────────────────────────
  about: `${UNSPLASH}/photo-1469854523086-cc02fe5d8800?w=1200&q=80&auto=format&fit=crop`,

  // ── CTA Background ─────────────────────────────────────────────────
  cta: `${UNSPLASH}/photo-1540541338287-41700207dee6?w=1920&q=85&auto=format&fit=crop`,

  // ── Social / Connect ───────────────────────────────────────────────
  social: `${UNSPLASH}/photo-1510798831971-661eb04b3739?w=1200&q=80&auto=format&fit=crop`,

  // ── Location ───────────────────────────────────────────────────────
  locationHero: `${UNSPLASH}/photo-1500382017468-9049fed747ef?w=1920&q=85&auto=format&fit=crop`,
} as const

// ── Helper: Get villa image by name ──────────────────────────────────
// Used by reservationData.ts and BookingExperience
export function getVillaImageByName(villaName: string): string {
  if (villaName.includes('2')) return images.krib2Exterior
  return images.hero
}
