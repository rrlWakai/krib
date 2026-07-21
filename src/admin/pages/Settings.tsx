import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Pencil,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Bell,
  BellOff,
  Check,
  Copy,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { settings as initialSettings } from '../data/mockData'
import type { Settings, NotificationSettings } from '../types'
import { cn } from '../../lib/cn'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

function Toggle({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean
  onChange: () => void
  label: string
  description: string
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-col gap-0.5">
        <span className="font-body text-body-md font-medium text-on-surface">
          {label}
        </span>
        <span className="font-body text-body-sm text-on-surface-variant">
          {description}
        </span>
      </div>
      <button
        onClick={onChange}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
          enabled ? 'bg-primary' : 'bg-outline-variant'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            enabled ? 'translate-x-[22px]' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  onCopy,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onCopy?: () => void
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-low">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-body text-body-xs text-on-surface-variant">{label}</p>
        <p className="font-body text-body-md text-on-surface">{value}</p>
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
          title="Copy"
        >
          <Copy size={14} />
        </button>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [settingsData, setSettingsData] = useState<Settings>(initialSettings)
  const [copied, setCopied] = useState<string | null>(null)

  function toggleNotification(key: keyof NotificationSettings) {
    setSettingsData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }))
  }

  function handleEdit(section: string) {
    alert(`Edit ${section} - Feature coming soon!`)
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const { businessInfo, contactDetails, notifications } = settingsData

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Settings"
          subtitle="Manage your business configuration"
          breadcrumbs={[
            { label: 'Dashboard', path: '/admin' },
            { label: 'Settings' },
          ]}
        />
      </motion.div>

      <div className="flex flex-col gap-6">
        <motion.div
          variants={fadeIn}
          className="rounded-[16px] bg-white p-6 shadow-card"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container">
                <Building2 size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display text-title-md text-on-surface">
                  Business Information
                </h2>
                <p className="font-body text-body-sm text-on-surface-variant">
                  Your business name, tagline, and address
                </p>
              </div>
            </div>
            <button
              onClick={() => handleEdit('Business Information')}
              className="flex items-center gap-2 rounded-[12px] border border-outline-variant bg-white px-4 py-2 font-body text-body-sm font-medium text-on-surface transition-all duration-200 hover:border-primary hover:text-primary"
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>

          <div className="divide-y divide-outline-variant/50">
            <InfoRow
              icon={<Building2 size={16} className="text-on-surface-variant" />}
              label="Business Name"
              value={businessInfo.name}
              onCopy={() => copyToClipboard(businessInfo.name, 'name')}
            />
            <div className="py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-low">
                  <span className="font-display text-body-sm italic text-primary">
                    K
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-body-xs text-on-surface-variant">
                    Tagline
                  </p>
                  <p className="font-body text-body-md italic text-on-surface">
                    "{businessInfo.tagline}"
                  </p>
                </div>
              </div>
            </div>
            <InfoRow
              icon={<Globe size={16} className="text-on-surface-variant" />}
              label="Address"
              value={`${businessInfo.address}, ${businessInfo.city}, ${businessInfo.province} ${businessInfo.zipCode}`}
              onCopy={() =>
                copyToClipboard(
                  `${businessInfo.address}, ${businessInfo.city}, ${businessInfo.province} ${businessInfo.zipCode}`,
                  'address'
                )
              }
            />
          </div>

          {copied && (
            <div className="mt-3 flex items-center gap-1.5 rounded-[8px] bg-tertiary-container px-3 py-2">
              <Check size={14} className="text-tertiary" />
              <span className="font-body text-body-sm text-on-tertiary-container">
                Copied to clipboard
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="rounded-[16px] bg-white p-6 shadow-card"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container">
                <Phone size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display text-title-md text-on-surface">
                  Contact Details
                </h2>
                <p className="font-body text-body-sm text-on-surface-variant">
                  Phone, email, and social media links
                </p>
              </div>
            </div>
            <button
              onClick={() => handleEdit('Contact Details')}
              className="flex items-center gap-2 rounded-[12px] border border-outline-variant bg-white px-4 py-2 font-body text-body-sm font-medium text-on-surface transition-all duration-200 hover:border-primary hover:text-primary"
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>

          <div className="divide-y divide-outline-variant/50">
            <InfoRow
              icon={<Phone size={16} className="text-on-surface-variant" />}
              label="Phone"
              value={contactDetails.phone}
              onCopy={() =>
                copyToClipboard(contactDetails.phone, 'phone')
              }
            />
            <InfoRow
              icon={<Mail size={16} className="text-on-surface-variant" />}
              label="Email"
              value={contactDetails.email}
              onCopy={() =>
                copyToClipboard(contactDetails.email, 'email')
              }
            />
            <InfoRow
              icon={<Facebook size={16} className="text-[#1877F2]" />}
              label="Facebook"
              value={contactDetails.facebook}
              onCopy={() =>
                copyToClipboard(
                  `https://${contactDetails.facebook}`,
                  'facebook'
                )
              }
            />
            <InfoRow
              icon={<Instagram size={16} className="text-[#E4405F]" />}
              label="Instagram"
              value={contactDetails.instagram}
              onCopy={() =>
                copyToClipboard(
                  `https://${contactDetails.instagram}`,
                  'instagram'
                )
              }
            />
            <InfoRow
              icon={<Globe size={16} className="text-on-surface-variant" />}
              label="Website"
              value={contactDetails.website}
              onCopy={() =>
                copyToClipboard(
                  `https://${contactDetails.website}`,
                  'website'
                )
              }
            />
          </div>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="rounded-[16px] bg-white p-6 shadow-card"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container">
                <Bell size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display text-title-md text-on-surface">
                  Notification Settings
                </h2>
                <p className="font-body text-body-sm text-on-surface-variant">
                  Choose how you want to be notified
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-outline-variant/50">
            <Toggle
              enabled={notifications.emailOnReservation}
              onChange={() => toggleNotification('emailOnReservation')}
              label="Email on New Reservation"
              description="Receive an email when a new reservation request is submitted"
            />
            <Toggle
              enabled={notifications.emailOnPayment}
              onChange={() => toggleNotification('emailOnPayment')}
              label="Email on Payment"
              description="Get notified when a guest submits or completes payment"
            />
            <Toggle
              enabled={notifications.emailOnCancellation}
              onChange={() => toggleNotification('emailOnCancellation')}
              label="Email on Cancellation"
              description="Receive alerts when a reservation is cancelled"
            />
            <Toggle
              enabled={notifications.smsOnReservation}
              onChange={() => toggleNotification('smsOnReservation')}
              label="SMS on Reservation"
              description="Receive an SMS for new reservation requests"
            />
            <Toggle
              enabled={notifications.smsOnPayment}
              onChange={() => toggleNotification('smsOnPayment')}
              label="SMS on Payment"
              description="Get an SMS notification when payments are received"
            />
            <Toggle
              enabled={notifications.dailyReport}
              onChange={() => toggleNotification('dailyReport')}
              label="Daily Report"
              description="Receive a daily summary of bookings, revenue, and occupancy"
            />
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[12px] bg-surface-container-low p-4">
            {Object.values(notifications).some((v) => v) ? (
              <Bell size={16} className="shrink-0 text-primary" />
            ) : (
              <BellOff size={16} className="shrink-0 text-on-surface-variant" />
            )}
            <p className="font-body text-body-sm text-on-surface-variant">
              {Object.values(notifications).filter(Boolean).length} of{' '}
              {Object.keys(notifications).length} notifications enabled
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
