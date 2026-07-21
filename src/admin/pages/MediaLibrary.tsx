import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Camera,
  FileImage,
  HardDrive,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { cn } from '../../lib/cn'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

interface MediaItem {
  id: string
  filename: string
  category: string
  size: string
  date: string
  gradient: string
}

const mediaItems: MediaItem[] = [
  { id: 'm1', filename: 'krib-1-hero.jpg', category: 'KRiB 1', size: '2.4 MB', date: '2026-06-15', gradient: 'from-primary/30 via-primary/15 to-tertiary/10' },
  { id: 'm2', filename: 'krib-1-pool.jpg', category: 'KRiB 1', size: '3.1 MB', date: '2026-06-15', gradient: 'from-tertiary/30 via-primary/15 to-primary/10' },
  { id: 'm3', filename: 'krib-1-living.jpg', category: 'KRiB 1', size: '1.8 MB', date: '2026-06-15', gradient: 'from-primary/25 via-tertiary/15 to-primary/5' },
  { id: 'm4', filename: 'krib-1-bedroom.jpg', category: 'KRiB 1', size: '2.0 MB', date: '2026-06-16', gradient: 'from-tertiary/25 via-primary/10 to-primary/5' },
  { id: 'm5', filename: 'krib-2-hero.jpg', category: 'KRiB 2', size: '2.8 MB', date: '2026-06-18', gradient: 'from-primary/35 via-tertiary/20 to-primary/10' },
  { id: 'm6', filename: 'krib-2-infinity-pool.jpg', category: 'KRiB 2', size: '3.5 MB', date: '2026-06-18', gradient: 'from-tertiary/35 via-primary/20 to-primary/10' },
  { id: 'm7', filename: 'krib-2-rooftop.jpg', category: 'KRiB 2', size: '2.2 MB', date: '2026-06-18', gradient: 'from-primary/30 via-primary/20 to-tertiary/15' },
  { id: 'm8', filename: 'krib-2-theater.jpg', category: 'KRiB 2', size: '1.6 MB', date: '2026-06-19', gradient: 'from-tertiary/30 via-primary/15 to-primary/5' },
  { id: 'm9', filename: 'krib-2-kitchen.jpg', category: 'KRiB 2', size: '2.1 MB', date: '2026-06-19', gradient: 'from-primary/20 via-tertiary/20 to-primary/10' },
  { id: 'm10', filename: 'event-birthday-setup.jpg', category: 'Events', size: '2.6 MB', date: '2026-07-05', gradient: 'from-primary/40 via-primary/20 to-tertiary/15' },
  { id: 'm11', filename: 'event-reunion.jpg', category: 'Events', size: '3.0 MB', date: '2026-07-10', gradient: 'from-tertiary/40 via-primary/20 to-primary/10' },
  { id: 'm12', filename: 'amenity-bbq.jpg', category: 'Amenities', size: '1.4 MB', date: '2026-06-20', gradient: 'from-primary/20 via-primary/15 to-tertiary/10' },
  { id: 'm13', filename: 'amenity-kitchen.jpg', category: 'Amenities', size: '1.9 MB', date: '2026-06-20', gradient: 'from-tertiary/20 via-primary/15 to-primary/5' },
  { id: 'm14', filename: 'amenity-parking.jpg', category: 'Amenities', size: '1.2 MB', date: '2026-06-20', gradient: 'from-primary/15 via-tertiary/10 to-primary/5' },
  { id: 'm15', filename: 'krib-1-exterior.jpg', category: 'KRiB 1', size: '2.7 MB', date: '2026-07-01', gradient: 'from-primary/30 via-primary/20 to-tertiary/20' },
  { id: 'm16', filename: 'event-corporate.jpg', category: 'Events', size: '2.3 MB', date: '2026-07-12', gradient: 'from-tertiary/30 via-primary/15 to-primary/10' },
]

const categories = ['All', 'KRiB 1', 'KRiB 2', 'Events', 'Amenities']

const categoryColors: Record<string, string> = {
  'KRiB 1': 'bg-primary-container text-on-primary-container',
  'KRiB 2': 'bg-tertiary-container text-on-tertiary-container',
  Events: 'bg-[#f3e8ff] text-[#6b21a8]',
  Amenities: 'bg-[#fef3c7] text-[#92400e]',
}

export default function MediaLibrary() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredItems = mediaItems.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory
    const matchesSearch = item.filename
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const totalSize = mediaItems.reduce((sum, item) => {
    const num = parseFloat(item.size)
    return sum + num
  }, 0)

  function handleUpload() {
    alert('Upload feature coming soon! This will open a file picker dialog.')
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Media Library"
          subtitle={`${mediaItems.length} files · ${totalSize.toFixed(1)} MB total`}
          breadcrumbs={[
            { label: 'Dashboard', path: '/admin' },
            { label: 'Media Library' },
          ]}
          action={
            <button
              onClick={handleUpload}
              className="flex items-center gap-2 rounded-[12px] bg-primary px-5 py-2.5 font-body text-body-md font-medium text-on-primary transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
            >
              <Upload size={18} />
              Upload
            </button>
          }
        />
      </motion.div>

      <motion.div
        variants={fadeIn}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'rounded-full px-4 py-1.5 font-body text-body-sm font-medium transition-all duration-200',
                activeCategory === cat
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-[12px] border border-outline-variant bg-white py-2 pl-9 pr-4 font-body text-body-sm text-on-surface placeholder:text-on-surface-variant/50 transition-colors focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex rounded-[12px] border border-outline-variant">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-l-[11px] transition-colors',
                viewMode === 'grid'
                  ? 'bg-primary text-on-primary'
                  : 'bg-white text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-r-[11px] transition-colors',
                viewMode === 'list'
                  ? 'bg-primary text-on-primary'
                  : 'bg-white text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + viewMode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'
              : 'flex flex-col gap-2'
          )}
        >
          {filteredItems.map((item, i) =>
            viewMode === 'grid' ? (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative overflow-hidden rounded-[16px] bg-white shadow-card transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
              >
                <div
                  className={cn(
                    'relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br',
                    item.gradient
                  )}
                >
                  <Camera
                    size={32}
                    className="text-primary/25 transition-transform duration-300 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/40">
                    <div className="translate-y-4 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="font-body text-body-sm font-medium text-white">
                        {item.filename}
                      </p>
                      <p className="mt-0.5 text-center font-body text-body-xs text-white/70">
                        {item.size}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <p className="truncate font-body text-body-sm font-medium text-on-surface">
                    {item.filename}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 font-body text-[11px] font-medium',
                        categoryColors[item.category] ??
                          'bg-surface-container-high text-on-surface-variant'
                      )}
                    >
                      {item.category}
                    </span>
                    <span className="font-body text-body-xs text-on-surface-variant">
                      {new Date(item.date).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex items-center gap-4 rounded-[12px] bg-white px-4 py-3 shadow-card transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br',
                    item.gradient
                  )}
                >
                  <Camera size={18} className="text-primary/30" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-body-sm font-medium text-on-surface">
                    {item.filename}
                  </p>
                  <p className="font-body text-body-xs text-on-surface-variant">
                    {item.category} · {item.size}
                  </p>
                </div>
                <span className="shrink-0 font-body text-body-xs text-on-surface-variant">
                  {new Date(item.date).toLocaleDateString('en-PH', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </motion.div>
            )
          )}

          {filteredItems.length === 0 && (
            <div className="col-span-full flex flex-col items-center py-16">
              <FileImage size={40} className="mb-3 text-outline-variant" />
              <p className="font-body text-body-md text-on-surface-variant">
                No media files found
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div variants={fadeIn} className="mt-8">
        <div className="flex items-center gap-3 rounded-[16px] bg-surface-container-low p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container">
            <HardDrive size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-body text-body-md font-medium text-on-surface">
              Storage Usage
            </p>
            <p className="font-body text-body-sm text-on-surface-variant">
              {mediaItems.length} files · {totalSize.toFixed(1)} MB of 500 MB used
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-outline-variant sm:w-32">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(totalSize / 500) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
