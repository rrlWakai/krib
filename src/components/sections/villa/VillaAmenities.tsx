import { motion } from 'framer-motion'
import {
  Mountain, Waves, Snowflake, Bed, Sun, ShowerHead, Droplets, Flame,
  UtensilsCrossed, Refrigerator, Microwave, Coffee, CookingPot,
  Tv, Music, Speaker, Gamepad2, Car, PawPrint, LogIn, Users, ChefHat,
  ParkingCircle, TreePine, ShieldCheck
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface AmenityItem {
  icon: LucideIcon
  label: string
}

interface AmenityCategoryData {
  id: string
  icon: LucideIcon
  title: string
  items: AmenityItem[]
  note?: string
}

const categories: AmenityCategoryData[] = [
  {
    id: 'views',
    icon: Mountain,
    title: 'Scenic Views',
    items: [
      { icon: Mountain, label: 'Golf Course View' },
      { icon: Waves, label: 'Pool View' },
      { icon: Mountain, label: 'Mountain View' },
    ],
  },
  {
    id: 'bedroom',
    icon: Bed,
    title: 'Bedroom & Comfort',
    items: [
      { icon: Snowflake, label: 'All Air-conditioned Rooms' },
      { icon: Bed, label: 'Comfortable Beds' },
      { icon: Bed, label: 'Cotton Linens' },
      { icon: Bed, label: 'Bed Linens' },
      { icon: Bed, label: 'Extra Pillows & Blankets' },
      { icon: Sun, label: 'Room-darkening Shades' },
    ],
  },
  {
    id: 'bathroom',
    icon: ShowerHead,
    title: 'Bathroom',
    items: [
      { icon: Flame, label: 'Hot Water' },
      { icon: Droplets, label: 'Bidet' },
      { icon: ShowerHead, label: 'Outdoor Shower' },
    ],
  },
  {
    id: 'kitchen',
    icon: UtensilsCrossed,
    title: 'Kitchen & Dining',
    items: [
      { icon: UtensilsCrossed, label: 'Complete Kitchen' },
      { icon: Refrigerator, label: 'Refrigerator' },
      { icon: Microwave, label: 'Microwave' },
      { icon: Flame, label: 'Gas Stove' },
      { icon: UtensilsCrossed, label: 'Cooking Basics' },
      { icon: CookingPot, label: 'Pots & Pans' },
      { icon: UtensilsCrossed, label: 'Plates & Utensils' },
      { icon: Flame, label: 'Hot Water Kettle' },
      { icon: Coffee, label: 'Coffee Maker' },
      { icon: Microwave, label: 'Toaster' },
      { icon: CookingPot, label: 'Rice Cooker' },
      { icon: UtensilsCrossed, label: 'Dining Table' },
    ],
  },
  {
    id: 'entertainment',
    icon: Tv,
    title: 'Entertainment',
    items: [
      { icon: Tv, label: '60" Smart TV with Netflix' },
      { icon: Music, label: 'Unlimited Videoke' },
      { icon: Speaker, label: 'Sound System with AUX' },
      { icon: Gamepad2, label: 'Board Games' },
    ],
  },
  {
    id: 'outdoor',
    icon: Sun,
    title: 'Outdoor',
    items: [
      { icon: Waves, label: 'Private Swimming Pool' },
      { icon: Sun, label: 'Private Patio' },
      { icon: TreePine, label: 'Backyard' },
      { icon: ChefHat, label: 'Outdoor Dining Area' },
      { icon: Sun, label: 'Outdoor Furniture' },
      { icon: Flame, label: 'BBQ Grill' },
    ],
  },
  {
    id: 'parking',
    icon: ParkingCircle,
    title: 'Parking',
    items: [
      { icon: Car, label: 'Free Private Parking' },
      { icon: Car, label: 'Free Street Parking' },
    ],
  },
  {
    id: 'services',
    icon: Users,
    title: 'Services',
    items: [
      { icon: LogIn, label: 'Self Check-in' },
      { icon: Users, label: 'Building Staff Available' },
      { icon: PawPrint, label: 'Pets Allowed' },
    ],
    note: 'Service animals are always welcome.',
  },
  {
    id: 'safety',
    icon: ShieldCheck,
    title: 'Home Safety',
    items: [
      { icon: Flame, label: 'Fire Extinguisher' },
    ],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function VillaAmenities({ villaName = 'KRiB 2' }: { villaName?: string }) {
  return (
    <section className="relative">
      <motion.div
        variants={sectionTitleVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="mb-16 md:mb-20"
      >
        <div className="flex items-center gap-4 mb-5">
          <span className="w-8 h-px bg-primary/40" />
          <span className="font-body text-label-caps text-primary uppercase tracking-[0.28em] text-sm font-medium">
            AMENITIES
          </span>
        </div>
        <h2 className="font-display text-headline-xl max-md:text-headline-xl-mobile text-on-surface mb-4 leading-tight">
          What This Villa Offers
        </h2>
        <p className="font-body text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Everything you need for a comfortable, relaxing, and memorable stay at {villaName}.
        </p>
      </motion.div>

      <div className="space-y-16 md:space-y-20">
        {categories.map((cat, catIdx) => (
          <motion.div
            key={cat.id}
            custom={catIdx}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <div className="flex items-center gap-4 mb-8 md:mb-10">
              <span className="flex items-center justify-center w-11 h-11 rounded-full border border-outline-variant/35 text-primary/70">
                <cat.icon size={20} strokeWidth={1.5} />
              </span>
              <h3 className="font-display text-headline-md text-on-surface font-medium">
                {cat.title}
              </h3>
              <span className="flex-1 h-px bg-gradient-to-r from-outline-variant/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 md:gap-y-6">
              {cat.items.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 group/item"
                  >
                    <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-outline-variant/30 text-on-surface-variant/50 transition-all duration-300 group-hover/item:border-[#4F91B8]/30 group-hover/item:text-[#4F91B8]">
                      <Icon size={18} strokeWidth={1.5} />
                    </span>
                    <span className="font-body text-body-md text-on-surface leading-tight">
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {cat.note && (
              <p className="mt-6 font-body text-body-md text-on-surface-variant/60 italic text-sm leading-relaxed">
                {cat.note}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
