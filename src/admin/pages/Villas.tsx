import { motion } from 'framer-motion'
import { MapPin, Bed, Image as ImageIcon } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingBlock, ErrorBlock } from '../components/AdminState'
import { useAdminQuery } from '../hooks/useAdminQuery'
import { formatCurrency } from '../data/constants'
import { computeVillaAdmins } from '../services/api'
import type { VillaAdmin } from '../types'
import { villas as villaContent } from '../../lib/data'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Villas() {
  const villasQuery = useAdminQuery('villas', async () => {
    const { fetchVillas } = await import('../services/api')
    return fetchVillas()
  })

  const amenitiesQuery = useAdminQuery('villa-amenities', async () => {
    const { fetchVillaAmenities } = await import('../services/api')
    return fetchVillaAmenities()
  })

  const galleryQuery = useAdminQuery('gallery-images', async () => {
    const { fetchGalleryImages } = await import('../services/api')
    return fetchGalleryImages()
  })

  const reservationsQuery = useAdminQuery('reservations', async () => {
    const { fetchAllReservations } = await import('../services/api')
    return fetchAllReservations()
  })

  const loading =
    villasQuery.loading || amenitiesQuery.loading || galleryQuery.loading || reservationsQuery.loading

  const error =
    villasQuery.error ?? amenitiesQuery.error ?? galleryQuery.error ?? reservationsQuery.error

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Villas" subtitle="Loading villas..." />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Villas" subtitle="Something went wrong." />
        <ErrorBlock message={error} onRetry={villasQuery.refetch} />
      </motion.div>
    )
  }

  const villaAdmins: VillaAdmin[] = computeVillaAdmins(
    villasQuery.data ?? [],
    amenitiesQuery.data ?? [],
    galleryQuery.data ?? [],
    reservationsQuery.data ?? [],
  )

  const activeCount = villaAdmins.filter((v) => v.is_active).length
  const totalCapacity = villaAdmins.reduce((sum, v) => sum + Number(v.max_guests), 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Villas"
        subtitle={`${villaAdmins.length} propert${villaAdmins.length !== 1 ? 'ies' : 'y'} · ${activeCount} active`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {villaAdmins.map((villa) => (
          <div
            key={villa.id}
            className="border border-[#ECECEC] rounded-lg bg-white overflow-hidden"
          >
            <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A1F44] via-[#0A1F44]/80 to-[#C9A227]/60">
              <span className="font-display text-[64px] font-semibold text-white/20">
                {villa.name.charAt(0)}
              </span>
              <div className="absolute left-4 top-4">
                <StatusBadge status={villa.is_active ? 'active' : 'inactive'} size="sm" />
              </div>
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1 font-body text-[12px] font-medium text-[#0A1F44] backdrop-blur-sm">
                <ImageIcon size={12} /> {villa.galleryCount}
              </div>
              <div className="absolute right-4 bottom-4 rounded-md bg-white/90 px-2.5 py-1 font-body text-[12px] font-medium text-[#0A1F44] backdrop-blur-sm">
                {villa.max_guests} guests max
              </div>
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-[22px] leading-[28px] font-medium text-[#0A1F44]">
                    {villa.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 font-body text-[12px] text-[#757575]">
                    <MapPin size={12} /> {villaContent.find((v) => v.slug === villa.slug)?.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-[20px] font-medium text-[#0A1F44]">
                    {formatCurrency(Number(villa.base_price))}
                  </p>
                  <p className="font-body text-[11px] text-[#757575]">per night</p>
                </div>
              </div>

              <p className="mb-4 line-clamp-2 font-body text-[13px] leading-relaxed text-[#757575]">
                {villa.description}
              </p>

              <div className="mb-4 flex flex-wrap gap-1.5">
                {villa.amenities.slice(0, 4).map((amenity) => (
                  <span
                    key={amenity.id}
                    className="inline-flex items-center rounded-md bg-[#FAFAFA] px-2.5 py-1 font-body text-[11px] text-[#757575]"
                  >
                    {amenity.label}
                  </span>
                ))}
                {villa.amenities.length > 4 && (
                  <span className="inline-flex items-center rounded-md bg-[#FAFAFA] px-2.5 py-1 font-body text-[11px] text-[#757575]">
                    +{villa.amenities.length - 4}
                  </span>
                )}
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2 border-t border-[#ECECEC] pt-4">
                <div className="rounded-lg bg-[#FAFAFA] p-3">
                  <p className="flex items-center gap-1 font-body text-[11px] text-[#757575]">
                    <Bed size={12} /> Capacity
                  </p>
                  <p className="mt-0.5 font-display text-[18px] font-medium text-[#0A1F44]">{villa.max_guests}</p>
                </div>
                <div className="rounded-lg bg-[#FAFAFA] p-3">
                  <p className="font-body text-[11px] text-[#757575]">30-day Occupancy</p>
                  <p className="mt-0.5 font-display text-[18px] font-medium text-[#0A1F44]">{villa.occupancyNext30Days}%</p>
                </div>
                <div className="rounded-lg bg-[#FAFAFA] p-3">
                  <p className="font-body text-[11px] text-[#757575]">Upcoming</p>
                  <p className="mt-0.5 font-display text-[18px] font-medium text-[#0A1F44]">{villa.upcomingReservations}</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-[#ECECEC] px-4 py-2.5">
                <div className="flex items-center gap-2 font-body text-[12px]">
                  <span className={villa.availableToday ? 'text-[#0A1F44]' : 'text-[#C9A227]'}>
                    {villa.availableToday ? 'Available today' : 'Occupied today'}
                  </span>
                </div>
                {villa.nextArrival && (
                  <span className="font-body text-[12px] text-[#757575]">
                    Next arrival {formatDate(villa.nextArrival)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-[#ECECEC] pt-6">
        <p className="font-body text-[13px] text-[#757575]">
          {villaAdmins.length} Properties · {activeCount} Active · Total capacity: {totalCapacity} guests
        </p>
      </div>
    </motion.div>
  )
}
