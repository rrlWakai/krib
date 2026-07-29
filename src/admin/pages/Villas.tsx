import { motion } from 'framer-motion'
import { Eye, MapPin, Bed } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { villas, formatCurrency } from '../data/mockData'

export default function Villas() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Villas"
        subtitle={`${villas.length} properties · ${villas.filter((v) => v.status === 'active').length} active`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {villas.map((villa) => (
          <div
            key={villa.id}
            className="border border-[#ECECEC] rounded-lg bg-white overflow-hidden"
          >
            <div className="aspect-[16/9] bg-[#f0f2f7] relative overflow-hidden">
              <img
                src={villa.image}
                alt={villa.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-4 top-4">
                <StatusBadge status={villa.status} size="sm" />
              </div>
              <div className="absolute right-4 top-4 rounded-md bg-white/90 px-2.5 py-1 font-body text-[12px] font-medium text-[#0A1F44] backdrop-blur-sm">
                {villa.capacity} guests
              </div>
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-[22px] leading-[28px] font-medium text-[#0A1F44]">
                    {villa.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 font-body text-[12px] text-[#757575]">
                    <MapPin size={12} /> Beverly Place, Subic
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-[20px] font-medium text-[#0A1F44]">
                    {formatCurrency(villa.baseRate)}
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
                    key={amenity}
                    className="inline-flex items-center rounded-md bg-[#FAFAFA] px-2.5 py-1 font-body text-[11px] text-[#757575]"
                  >
                    {amenity}
                  </span>
                ))}
                {villa.amenities.length > 4 && (
                  <span className="inline-flex items-center rounded-md bg-[#FAFAFA] px-2.5 py-1 font-body text-[11px] text-[#757575]">
                    +{villa.amenities.length - 4}
                  </span>
                )}
              </div>

              {villa.bedrooms && villa.bedrooms.length > 0 && (
                <div className="mb-4 border-t border-[#ECECEC] pt-4">
                  <p className="mb-2 font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
                    Bedrooms
                  </p>
                  <div className="space-y-1.5">
                    {villa.bedrooms.map((bedroom) => (
                      <div key={bedroom.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bed size={13} className="text-[#757575]" />
                          <span className="font-body text-[13px] text-[#0A1F44]">{bedroom.name}</span>
                        </div>
                        <span className="font-body text-[12px] text-[#757575]">{bedroom.capacity} Guests</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 border-t border-[#ECECEC] pt-4">
                <button className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#ECECEC] py-2.5 font-body text-[13px] font-medium text-[#0A1F44] transition-all hover:border-[#0A1F44]/30">
                  <Eye size={15} /> View Details
                </button>
                <button className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#0A1F44] py-2.5 font-body text-[13px] font-medium text-white transition-all hover:bg-[#0A1F44]/90">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-[#ECECEC] pt-6">
        <p className="font-body text-[13px] text-[#757575]">
          {villas.length} Properties · {villas.filter((v) => v.status === 'active').length} Active · Total capacity: {villas.reduce((sum, v) => sum + v.capacity, 0)} guests
        </p>
      </div>
    </motion.div>
  )
}
