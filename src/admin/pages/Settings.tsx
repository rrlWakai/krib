import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Globe,
  Bell,
  BellOff,
  Save,
  Smartphone,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { LoadingBlock, ErrorBlock } from '../components/AdminState'
import { useAdminQuery, useAdminMutation } from '../hooks/useAdminQuery'
import { fetchSiteSettingsAdmin } from '../services/api'
import { updateSiteSettings } from '../services/mutations'
import { clearSiteSettingsCache } from '../../services/api/settings'
import type { SiteSettings, BusinessSettings, SmsSettings, LegalSettings } from '../../services/api/settings'
import { cn } from '../../lib/cn'

function Field({
  label,
  value,
  onChange,
  type = 'text',
  textarea,
  placeholder,
}: {
  label: string
  value: string | number
  onChange: (value: string | number) => void
  type?: string
  textarea?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-[12px] font-medium text-[#0A1F44]">{label}</span>
      {textarea ? (
        <textarea
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={8}
          className="w-full resize-y rounded-lg border border-[#ECECEC] bg-white px-3.5 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44]"
        />
      ) : (
        <input
          type={type}
          value={String(value)}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#ECECEC] bg-white px-3.5 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44]"
        />
      )}
    </label>
  )
}

export default function SettingsPage() {
  const settingsQuery = useAdminQuery('site-settings', fetchSiteSettingsAdmin, { ttlMs: 5_000 })

  const [business, setBusiness] = useState<Partial<BusinessSettings>>({})
  const [sms, setSms] = useState<Partial<SmsSettings>>({})
  const [legal, setLegal] = useState<Partial<LegalSettings>>({})
  const [savedSection, setSavedSection] = useState<string | null>(null)

  useEffect(() => {
    if (settingsQuery.data) {
      setBusiness(settingsQuery.data.business ?? {})
      setSms(settingsQuery.data.sms ?? {})
      setLegal(settingsQuery.data.legal ?? {})
    }
  }, [settingsQuery.data])

  const businessMutation = useAdminMutation<Partial<BusinessSettings>, SiteSettings>(async (payload) =>
    updateSiteSettings({ business: payload }),
  )
  const smsMutation = useAdminMutation<Partial<SmsSettings>, SiteSettings>(async (payload) =>
    updateSiteSettings({ sms: payload }),
  )
  const legalMutation = useAdminMutation<Partial<LegalSettings>, SiteSettings>(async (payload) =>
    updateSiteSettings({ legal: payload }),
  )

  async function saveSection(section: 'business' | 'sms' | 'legal') {
    setSavedSection(null)
    let result
    if (section === 'business') result = await businessMutation.mutate(business)
    if (section === 'sms') result = await smsMutation.mutate(sms)
    if (section === 'legal') result = await legalMutation.mutate(legal)
    if (result?.data) {
      clearSiteSettingsCache()
      setSavedSection(section)
      setTimeout(() => setSavedSection(null), 2000)
    }
  }

  if (settingsQuery.loading && !settingsQuery.data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Settings" subtitle="Business configuration" />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (settingsQuery.error && !settingsQuery.data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Settings" subtitle="Business configuration" />
        <ErrorBlock message={settingsQuery.error} onRetry={settingsQuery.refetch} />
      </motion.div>
    )
  }

  const sectionSaving = {
    business: businessMutation.loading,
    sms: smsMutation.loading,
    legal: legalMutation.loading,
  }
  const sectionError =
    businessMutation.error ?? smsMutation.error ?? legalMutation.error

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Settings" subtitle="Business configuration" />

      {sectionError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="font-body text-[13px] text-red-700">{sectionError}</p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Business Information */}
        <section className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f7]">
              <Building2 size={16} className="text-[#0A1F44]" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-[16px] font-medium text-[#0A1F44]">Business Information</h2>
              <p className="font-body text-[12px] text-[#757575]">
                Name, contact details, and stay times. Shown across the public website.
              </p>
            </div>
            <SaveButton
              saving={sectionSaving.business}
              saved={savedSection === 'business'}
              onClick={() => saveSection('business')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Business Name" value={business.business_name ?? ''} onChange={(v) => setBusiness({ ...business, business_name: String(v) })} />
            <Field label="Tagline" value={business.tagline ?? ''} onChange={(v) => setBusiness({ ...business, tagline: String(v) })} />
            <Field label="Phone" value={business.phone ?? ''} onChange={(v) => setBusiness({ ...business, phone: String(v) })} />
            <Field label="Email" type="email" value={business.email ?? ''} onChange={(v) => setBusiness({ ...business, email: String(v) })} />
            <Field label="Facebook URL" value={business.facebook ?? ''} onChange={(v) => setBusiness({ ...business, facebook: String(v) })} />
            <Field label="Instagram URL" value={business.instagram ?? ''} onChange={(v) => setBusiness({ ...business, instagram: String(v) })} />
            <Field label="Website" value={business.website ?? ''} onChange={(v) => setBusiness({ ...business, website: String(v) })} />
            <Field label="Address" value={business.address ?? ''} onChange={(v) => setBusiness({ ...business, address: String(v) })} />
            <Field label="Map URL" value={business.map_url ?? ''} onChange={(v) => setBusiness({ ...business, map_url: String(v) })} />
            <Field label="Check-in Time" value={business.check_in_time ?? ''} onChange={(v) => setBusiness({ ...business, check_in_time: String(v) })} />
            <Field label="Check-out Time" value={business.check_out_time ?? ''} onChange={(v) => setBusiness({ ...business, check_out_time: String(v) })} />
            <Field label="Party Fee (₱)" type="number" value={business.party_fee ?? 0} onChange={(v) => setBusiness({ ...business, party_fee: Number(v) })} />
          </div>
        </section>

        {/* SMS */}
        <section className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f7]">
              <Smartphone size={16} className="text-[#0A1F44]" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-[16px] font-medium text-[#0A1F44]">SMS Notifications</h2>
              <p className="font-body text-[12px] text-[#757575]">
                Automatic SMS to you and your guests on reservation events.
              </p>
            </div>
            <SaveButton
              saving={sectionSaving.sms}
              saved={savedSection === 'sms'}
              onClick={() => saveSection('sms')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Owner Mobile (receiver)" value={sms.owner_mobile ?? ''} onChange={(v) => setSms({ ...sms, owner_mobile: String(v) })} />
            <Field label="Sender Name" value={sms.sender_name ?? ''} onChange={(v) => setSms({ ...sms, sender_name: String(v) })} />
            <div className="flex items-center justify-between gap-3 self-end rounded-lg border border-[#ECECEC] px-4 py-2.5">
              <div>
                <p className="font-body text-[13px] font-medium text-[#0A1F44]">Automatic SMS enabled</p>
                <p className="font-body text-[11px] text-[#757575]">Send owner &amp; guest SMS on transitions</p>
              </div>
              <button
                onClick={() => setSms({ ...sms, enabled: sms.enabled !== false })}
                className={cn(
                  'relative inline-flex h-7 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
                  sms.enabled !== false ? 'bg-[#0A1F44]' : 'bg-[#ECECEC]',
                )}
                role="switch"
                aria-checked={sms.enabled !== false}
              >
                <span className={cn(
                  'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  sms.enabled !== false ? 'translate-x-[22px]' : 'translate-x-[2px]',
                )} />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#FAFAFA] p-4">
            {sms.enabled !== false ? (
              <Bell size={14} className="shrink-0 text-[#0A1F44]" />
            ) : (
              <BellOff size={14} className="shrink-0 text-[#757575]" />
            )}
            <p className="font-body text-[12px] text-[#757575]">
              {sms.enabled !== false
                ? 'Guests will receive SMS on approval, decline, and cancellation. You will receive SMS for new reservations and guest cancellations.'
                : 'Automatic SMS is turned off. Manual SMS from the reservation page still works.'}
            </p>
          </div>
        </section>

        {/* Legal */}
        <section className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f7]">
              <Globe size={16} className="text-[#0A1F44]" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-[16px] font-medium text-[#0A1F44]">Legal Documents</h2>
              <p className="font-body text-[12px] text-[#757575]">
                Privacy notice and terms shown in the booking flow. Markdown supported.
              </p>
            </div>
            <SaveButton
              saving={sectionSaving.legal}
              saved={savedSection === 'legal'}
              onClick={() => saveSection('legal')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field
              label="Privacy Policy"
              textarea
              value={legal.privacy_policy ?? ''}
              onChange={(v) => setLegal({ ...legal, privacy_policy: String(v) })}
            />
            <Field
              label="Terms & Conditions"
              textarea
              value={legal.terms_conditions ?? ''}
              onChange={(v) => setLegal({ ...legal, terms_conditions: String(v) })}
            />
          </div>
        </section>
      </div>
    </motion.div>
  )
}

function SaveButton({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={cn(
        'flex min-h-[40px] items-center justify-center gap-2 rounded-lg border px-4 py-1.5 font-body text-[12px] font-medium transition-colors disabled:opacity-50',
        saved
          ? 'border-[#7FAE87] bg-[#F0F7F1] text-[#2F6B3B]'
          : 'border-[#0A1F44] text-[#0A1F44] hover:bg-[#f0f2f7]',
      )}
    >
      <Save size={13} />
      {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
    </button>
  )
}
