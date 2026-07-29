import { motion } from 'framer-motion'

interface OccupancySummaryProps {
  data: {
    arrivals: number
    departures: number
    currentGuests: number
    pendingRequests: number
    occupiedVillas: number
    availableVillas: number
    upcomingCheckins: number
  }
}

const items = [
  { label: 'Arrivals', value: 'arrivals' as const },
  { label: 'Departures', value: 'departures' as const },
  { label: 'In House', value: 'currentGuests' as const },
  { label: 'Pending', value: 'pendingRequests' as const },
  { label: 'Occupied', value: 'occupiedVillas' as const },
  { label: 'Available', value: 'availableVillas' as const },
  { label: 'Upcoming', value: 'upcomingCheckins' as const },
]

export default function OccupancySummary({ data }: OccupancySummaryProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-x-10 gap-y-4 border-b border-[#ECECEC] pb-6">
      {items.map((item) => (
        <motion.div
          key={item.value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <p className="font-body text-[11px] uppercase tracking-[0.08em] text-[#757575]">
            {item.label}
          </p>
          <p className="mt-0.5 font-display text-[22px] leading-[28px] font-medium tracking-tight text-[#0A1F44]">
            {data[item.value]}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
