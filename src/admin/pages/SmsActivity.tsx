import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

export default function AdminSmsActivity() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="SMS Activity"
        subtitle="View and manage SMS communications with guests"
      />
      <div className="flex flex-col items-center justify-center rounded-lg border border-[#ECECEC] py-20">
        <MessageSquare size={40} className="mb-4 text-[#ECECEC]" />
        <p className="font-body text-[14px] text-[#757575]">
          SMS activity coming soon.
        </p>
      </div>
    </motion.div>
  )
}
