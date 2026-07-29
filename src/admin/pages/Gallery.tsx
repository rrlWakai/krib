import { motion } from 'framer-motion'
import { Image } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

export default function AdminGallery() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Gallery"
        subtitle="Manage property photos and media assets"
      />
      <div className="flex flex-col items-center justify-center rounded-lg border border-[#ECECEC] py-20">
        <Image size={40} className="mb-4 text-[#ECECEC]" />
        <p className="font-body text-[14px] text-[#757575]">
          Gallery management coming soon.
        </p>
      </div>
    </motion.div>
  )
}
