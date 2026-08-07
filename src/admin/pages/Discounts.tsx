import { motion } from 'framer-motion'
import { Tag } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

export default function Discounts() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader title="Discounts" subtitle="Promotional codes and special offers" />
      <div className="flex flex-col items-center justify-center rounded-lg border border-[#ECECEC] py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FAFAFA]">
          <Tag size={28} className="text-[#ECECEC]" />
        </div>
        <p className="font-body text-[14px] font-medium text-[#0A1F44]">
          Discounts are not available yet
        </p>
        <p className="mt-1 max-w-sm text-center font-body text-[13px] text-[#757575]">
          There is no discounts table in the database yet. Discount codes will be managed here once the backend module is implemented.
        </p>
      </div>
    </motion.div>
  )
}
