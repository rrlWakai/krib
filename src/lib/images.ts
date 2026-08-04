import heroImage from '../assets/hero.png'
import krib1Portrait from '../assets/05.png'
import krib2Portrait from '../assets/bbx.png'
import aboutImage from '../assets/about.png'
import finalctaImage from '../assets/finalcta.png'
import socImage from '../assets/soc.png'

import krib1Pool from '../assets/Krib1/pool.jpg'
import krib1Living from '../assets/Krib1/living.jpg'
import krib1LivingAlt from '../assets/Krib1/kara.jpg'
import krib1Dining from '../assets/Krib1/dining1.jpg'
import krib1DiningAlt from '../assets/Krib1/diningg.jpg'
import krib1Kitchen from '../assets/Krib1/tab.jpg'
import krib1Balcony from '../assets/Krib1/balcon.jpg'
import krib1MasterBed from '../assets/Krib1/masterbed.jpg'
import krib1Bed from '../assets/Krib1/bed.jpg'
import krib1BedAlt from '../assets/Krib1/bedd.jpg'
import krib1Bed1 from '../assets/Krib1/bed1.jpg'

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

export const images = {
  hero: heroImage,
  krib1: krib1Portrait,
  krib1Pool,
  krib1Living,
  krib1LivingAlt,
  krib1Dining,
  krib1DiningAlt,
  krib1Kitchen,
  krib1Balcony,
  krib1MasterBed,
  krib1Bed,
  krib1BedAlt,
  krib1Bed1,
  krib2: krib2Portrait,
  krib2Exterior,
  krib2Pool,
  krib2Living,
  krib2Dining,
  krib2Balcony,
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
  about: aboutImage,
  cta: finalctaImage,
  social: socImage,
} as const

// ── Helper: Get villa image by name ──────────────────────────────────
// Used by reservationData.ts and BookingExperience
export function getVillaImageByName(villaName: string): string {
  if (villaName.includes('2')) return images.krib2Living
  return images.krib1Pool
}
 