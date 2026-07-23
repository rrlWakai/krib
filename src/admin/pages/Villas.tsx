import { motion } from 'framer-motion'
import {
  Building2,
  Users,
  Eye,
  Pencil,
  MapPin,
  Wifi,
  Car,
  Wind,
  Waves,
  UtensilsCrossed,
  Tv,
  PartyPopper,
  Home,
  Bed,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { villas, formatCurrency } from '../data/mockData'
import { cn } from '../../lib/cn'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const amenityIconMap: Record<string, React.ReactNode> = {
  Pool: <Waves size={12} />,
  'Infinity Pool': <Waves size={12} />,
  'BBQ Area': <PartyPopper size={12} />,
  'Full Kitchen': <UtensilsCrossed size={12} />,
  WiFi: <Wifi size={12} />,
  Parking: <Car size={12} />,
  'Air Conditioning': <Wind size={12} />,
  'Rooftop Deck': <Home size={12} />,
  'Home Theater': <Tv size={12} />,
}

const villaGradients = [
  'from-primary/20 via-primary/10 to-tertiary/10',
  'from-tertiary/20 via-primary/10 to-primary/5',
]

const statusConfig: Record<string, { gradient: string }> = {
  active: { gradient: '' },
  maintenance: { gradient: 'grayscale-[30%]' },
  inactive: { gradient: 'grayscale-[60%] opacity-70' },
}

export default function Villas() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Villas"
          subtitle="Manage your properties"
          breadcrumbs={[
            { label: 'Dashboard', path: '/admin' },
            { label: 'Villas' },
          ]}
        />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {villas.map((villa, i) => (
          <motion.div
            key={villa.id}
            variants={fadeIn}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group overflow-hidden rounded-[16px] bg-white shadow-card transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
          >
            <div
              className={cn(
                'relative flex h-44 items-center justify-center bg-gradient-to-br sm:h-56',
                villaGradients[i % villaGradients.length],
                statusConfig[villa.status]?.gradient
              )}
            >
              <Building2
                size={64}
                className="text-primary/30 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute left-4 top-4">
                <StatusBadge status={villa.status} size="sm" />
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 font-body text-body-sm font-medium text-on-surface backdrop-blur-sm">
                {villa.capacity} pax
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-headline-sm text-on-surface">
                    {villa.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 font-body text-body-sm text-on-surface-variant">
                    <MapPin size={12} />
                    Beverly Place, Subic
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-title-md font-semibold text-primary sm:text-title-lg">
                    {formatCurrency(villa.baseRate)}
                  </p>
                  <p className="font-body text-body-xs text-on-surface-variant">per night</p>
                </div>
              </div>

              <p className="mb-4 line-clamp-2 font-body text-body-sm text-on-surface-variant">
                {villa.description}
              </p>

              <div className="mb-4 flex flex-wrap gap-1.5">
                {villa.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 font-body text-body-xs text-on-surface-variant transition-colors group-hover:bg-surface-container-high"
                  >
                    {amenityIconMap[amenity] ?? <span className="h-1 w-1 rounded-full bg-primary" />}
                    {amenity}
                  </span>
                ))}
              </div>

              {villa.bedrooms && villa.bedrooms.length > 0 && (
                <div className="mb-4 rounded-[12px] bg-surface-container-low p-3">
                  <p className="mb-2 font-body text-body-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Bedroom Configuration
                  </p>
                  <div className="space-y-1.5">
                    {villa.bedrooms.map((bedroom) => (
                      <div key={bedroom.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bed size={12} className="text-primary/60" />
                          <span className="font-body text-body-sm text-on-surface">
                            {bedroom.name}
                          </span>
                        </div>
                        <span className="font-body text-body-sm font-medium text-on-surface">
                          {bedroom.capacity} Guests
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 border-t border-outline-variant/50 pt-4">
                <button className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[12px] border border-outline-variant bg-white py-2.5 font-body text-body-sm font-medium text-on-surface transition-all duration-200 hover:border-primary hover:text-primary">
                  <Eye size={16} />
                  View Details
                </button>
                <button className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[12px] bg-surface-container-low py-2.5 font-body text-body-sm font-medium text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high hover:text-on-surface">
                  <Pencil size={16} />
                  Edit
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeIn} className="mt-8">
        <div className="flex items-center gap-3 rounded-[16px] bg-surface-container-low p-4 sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container">
            <Users size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-body text-body-sm font-medium text-on-surface sm:text-body-md">
              {villas.length} Properties · {villas.filter((v) => v.status === 'active').length} Active
            </p>
            <p className="font-body text-body-xs text-on-surface-variant sm:text-body-sm">
              Total combined capacity:{' '}
              {villas.reduce((sum, v) => sum + v.capacity, 0)} guests
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
