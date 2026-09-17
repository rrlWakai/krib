import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '../../components/PageHeader'
import { PagesTab } from './PagesTab'
import { VillasTab } from './VillasTab'
import { GalleryTab } from './GalleryTab'
import { cn } from '../../../lib/cn'

type TabId = 'pages' | 'villas' | 'gallery'

const TABS: { id: TabId; label: string; description: string }[] = [
  { id: 'pages', label: 'Pages', description: 'Home, About, Location copy' },
  { id: 'villas', label: 'Village Content', description: 'Villa marketing copy' },
  { id: 'gallery', label: 'Gallery', description: 'Villa photos & captions' },
]

export default function WebsiteManager() {
  const [active, setActive] = useState<TabId>('pages')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Website Manager"
        subtitle="Edit the public website. Everything is saved as a draft first and only goes live when you publish."
        breadcrumbs={[{ label: 'Control Center', path: '/admin' }, { label: 'Website Manager' }]}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2 font-body text-[12px] font-medium transition-colors',
              active === tab.id
                ? 'border-[#0A1F44] bg-[#0A1F44] text-white'
                : 'border-[#ECECEC] bg-white text-[#757575] hover:border-[#d5d8e0] hover:text-[#0A1F44]',
            )}
            title={tab.description}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'pages' && <PagesTab />}
      {active === 'villas' && <VillasTab />}
      {active === 'gallery' && <GalleryTab />}
    </motion.div>
  )
}