export interface VillaRate {
  label: string
  amount: string
  description?: string
}

export interface VillaPolicy {
  icon: string
  label: string
  value: string
}

export interface AmenityCategory {
  category: string
  items: { icon: string; label: string; description?: string }[]
}

export interface VillaDetail {
  id: string
  slug: string
  number: string
  name: string
  tagline: string
  subtitle: string
  description: string
  story: string
  image: string
  images: string[]
  capacity: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  highlights: string[]
  quickHighlights: string[]
  features: { icon: string; label: string }[]
  price: string
  priceDetails: {
    perNight: string
    rateType: string
  }
  location: string
  amenities: AmenityCategory[]
  rates: VillaRate[]
  policies: VillaPolicy[]
  mapLink?: string
  mapEmbed?: string
}

export interface Experience {
  id: string
  title: string
  description: string
  image: string
}

export interface Testimonial {
  id: string
  quote: string
  author: string
  location: string
  rating: number
  date?: string
  avatar?: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface FAQCategory {
  id: string
  category: string
  items: FAQItem[]
}

export interface NearbyAttraction {
  id: string
  name: string
  description: string
  travelTime: string
  icon: string
}

export interface Amenity {
  icon: string
  label: string
  description?: string
}


