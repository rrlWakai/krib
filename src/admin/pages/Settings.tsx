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
import type { Settings, NotificationSettings } from '../types'
import { cn } from '../../lib/cn'

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
      <div className="min-w-0 flex-1 pr-4">
        <span className="font-body text-[14px] font-medium text-[#0A1F44]">{label}</span>
        <p className="font-body text-[12px] text-[#757575]">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled
        className={cn(
          'relative inline-flex h-7 w-11 shrink-0 cursor-not-allowed items-center rounded-full transition-colors duration-200',
          enabled ? 'bg-[#0A1F44]' : 'bg-[#ECECEC]'
        )}
        role="switch"
        aria-checked={enabled}
        aria-disabled="true"
      >
        <span className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
        )} />
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f2f7]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-body text-[11px] text-[#757575]">{label}</p>
        <p className="font-body text-[13px] text-[#0A1F44] truncate">{value}</p>
      </div>
      {onCopy && (
        <button onClick={onCopy} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7] hover:text-[#0A1F44]" title="Copy">
          <Copy size={13} />
        </button>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const defaultSettings: Settings = {
    businessInfo: {
      name: 'KRiB Beverly Place',
      tagline: 'Your luxury home away from home in Subic',
      address: 'Beverly Place, Phase 3',
      city: 'Subic',
      province: 'Zambales',
      zipCode: '2209',
    },
    contactDetails: {
      phone: '+63 917 123 4567',
      email: 'hello@kribbeverlyplace.com',
      facebook: 'facebook.com/kribbeverlyplace',
      instagram: 'instagram.com/kribbeverlyplace',
      website: 'kribbeverlyplace.com',
    },
    notifications: {
      emailOnReservation: true,
      emailOnPayment: true,
      emailOnCancellation: true,
      smsOnReservation: true,
      smsOnPayment: true,
      dailyReport: false,
    },
  }
  const [settingsData] = useState<Settings>(defaultSettings)
  const [copied, setCopied] = useState<string | null>(null)

  function toggleNotification(_key: keyof NotificationSettings) {
    // No settings table in the backend yet — toggles are read-only.
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader title="Settings" subtitle="Business configuration" />

      <div className="mb-6 rounded-lg border border-[#C9A227]/40 bg-[#C9A227]/10 px-4 py-3">
        <p className="font-body text-[13px] font-medium text-[#0A1F44]">Backend not implemented</p>
        <p className="mt-0.5 font-body text-[12px] text-[#757575]">
          There is no settings table in the database yet. These values are shown for reference only and cannot be saved.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f7]">
                <Building2 size={16} className="text-[#0A1F44]" />
              </div>
              <div>
                <h2 className="font-display text-[16px] font-medium text-[#0A1F44]">Business Information</h2>
                <p className="font-body text-[12px] text-[#757575]">Your business name, tagline, and address</p>
              </div>
            </div>
            <button disabled onClick={() => handleEdit('Business Information')} className="flex min-h-[40px] cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#ECECEC] px-4 py-1.5 font-body text-[12px] text-[#B0B0B0]">
              <Pencil size={13} /> Edit
            </button>
          </div>
          <div className="divide-y divide-[#ECECEC]">
            <InfoRow icon={<Building2 size={14} className="text-[#757575]" />} label="Business Name" value={businessInfo.name} onCopy={() => copyToClipboard(businessInfo.name, 'name')} />
            <InfoRow icon={<span className="font-display text-[13px] italic text-[#0A1F44]">K</span>} label="Tagline" value={`"${businessInfo.tagline}"`} />
            <InfoRow icon={<Globe size={14} className="text-[#757575]" />} label="Address" value={`${businessInfo.address}, ${businessInfo.city}, ${businessInfo.province} ${businessInfo.zipCode}`}
              onCopy={() => copyToClipboard(`${businessInfo.address}, ${businessInfo.city}, ${businessInfo.province} ${businessInfo.zipCode}`, 'address')} />
          </div>
          {copied && (
            <div className="mt-3 flex items-center gap-1.5 rounded-md bg-[#f0f2f7] px-3 py-2">
              <Check size={13} className="text-[#0A1F44]" />
              <span className="font-body text-[12px] text-[#0A1F44]">Copied to clipboard</span>
            </div>
          )}
        </div>

        <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f7]">
                <Phone size={16} className="text-[#0A1F44]" />
              </div>
              <div>
                <h2 className="font-display text-[16px] font-medium text-[#0A1F44]">Contact Details</h2>
                <p className="font-body text-[12px] text-[#757575]">Phone, email, and social media</p>
              </div>
            </div>
            <button disabled onClick={() => handleEdit('Contact Details')} className="flex min-h-[40px] cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#ECECEC] px-4 py-1.5 font-body text-[12px] text-[#B0B0B0]">
              <Pencil size={13} /> Edit
            </button>
          </div>
          <div className="divide-y divide-[#ECECEC]">
            <InfoRow icon={<Phone size={14} className="text-[#757575]" />} label="Phone" value={contactDetails.phone} onCopy={() => copyToClipboard(contactDetails.phone, 'phone')} />
            <InfoRow icon={<Mail size={14} className="text-[#757575]" />} label="Email" value={contactDetails.email} onCopy={() => copyToClipboard(contactDetails.email, 'email')} />
            <InfoRow icon={<Facebook size={14} className="text-[#757575]" />} label="Facebook" value={contactDetails.facebook} onCopy={() => copyToClipboard(`https://${contactDetails.facebook}`, 'facebook')} />
            <InfoRow icon={<Instagram size={14} className="text-[#757575]" />} label="Instagram" value={contactDetails.instagram} onCopy={() => copyToClipboard(`https://${contactDetails.instagram}`, 'instagram')} />
            <InfoRow icon={<Globe size={14} className="text-[#757575]" />} label="Website" value={contactDetails.website} onCopy={() => copyToClipboard(`https://${contactDetails.website}`, 'website')} />
          </div>
        </div>

        <div className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f7]">
              <Bell size={16} className="text-[#0A1F44]" />
            </div>
            <div>
              <h2 className="font-display text-[16px] font-medium text-[#0A1F44]">Notification Settings</h2>
              <p className="font-body text-[12px] text-[#757575]">Choose how you want to be notified</p>
            </div>
          </div>
          <div className="divide-y divide-[#ECECEC]">
            <Toggle enabled={notifications.emailOnReservation} onChange={() => toggleNotification('emailOnReservation')} label="Email on New Reservation" description="Receive an email when a new reservation request is submitted" />
            <Toggle enabled={notifications.emailOnPayment} onChange={() => toggleNotification('emailOnPayment')} label="Email on Payment" description="Get notified when a guest submits or completes payment" />
            <Toggle enabled={notifications.emailOnCancellation} onChange={() => toggleNotification('emailOnCancellation')} label="Email on Cancellation" description="Receive alerts when a reservation is cancelled" />
            <Toggle enabled={notifications.smsOnReservation} onChange={() => toggleNotification('smsOnReservation')} label="SMS on Reservation" description="Receive an SMS for new reservation requests" />
            <Toggle enabled={notifications.smsOnPayment} onChange={() => toggleNotification('smsOnPayment')} label="SMS on Payment" description="Get an SMS notification when payments are received" />
            <Toggle enabled={notifications.dailyReport} onChange={() => toggleNotification('dailyReport')} label="Daily Report" description="Receive a daily summary of bookings, revenue, and occupancy" />
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#FAFAFA] p-4">
            {Object.values(notifications).some((v) => v) ? (
              <Bell size={14} className="shrink-0 text-[#0A1F44]" />
            ) : (
              <BellOff size={14} className="shrink-0 text-[#757575]" />
            )}
            <p className="font-body text-[12px] text-[#757575]">
              {Object.values(notifications).filter(Boolean).length} of {Object.keys(notifications).length} notifications enabled
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
