import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Check, KeyRound, Mail, Save, UserRound } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../../hooks/auth/useAuth'
import { getSupabaseClient } from '../../lib/supabase/client'

type Notice = { section: 'profile' | 'email' | 'password'; type: 'success' | 'error'; message: string } | null

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_AVATAR_SIZE = 5 * 1024 * 1024

function profileNameFrom(userName: unknown, adminName: string | undefined) {
  return typeof userName === 'string' && userName.trim() ? userName : adminName ?? ''
}

function SaveButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-[#0A1F44] px-4 py-1.5 font-body text-[12px] font-medium text-[#0A1F44] transition-colors hover:bg-[#f0f2f7] disabled:opacity-50"
    >
      <Save size={13} />
      {loading ? 'Saving…' : children}
    </button>
  )
}

export default function ProfilePage() {
  const { user, admin } = useAuth()
  const supabase = getSupabaseClient()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [saving, setSaving] = useState<'profile' | 'email' | 'password' | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  const savedAvatar = typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : ''
  const activeAvatar = avatarPreview || savedAvatar

  useEffect(() => {
    setDisplayName(profileNameFrom(user?.user_metadata?.full_name, admin?.full_name))
    setEmail(user?.email ?? '')
  }, [user?.id, user?.email, user?.user_metadata?.full_name, admin?.full_name])

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
  }, [avatarPreview])

  function setFeedback(next: Notice) {
    setNotice(next)
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = displayName.trim()
    if (name.length < 2) {
      setFeedback({ section: 'profile', type: 'error', message: 'Display name must contain at least 2 characters.' })
      return
    }
    if (!user) return

    setSaving('profile')
    setFeedback(null)
    const { error } = await supabase.auth.updateUser({
      data: { ...user.user_metadata, full_name: name },
    })
    setSaving(null)
    setFeedback(error
      ? { section: 'profile', type: 'error', message: error.message }
      : { section: 'profile', type: 'success', message: 'Display name saved.' })
  }

  async function chooseAvatar(file: File | null) {
    if (!file) return
    if (!AVATAR_TYPES.includes(file.type) || file.size > MAX_AVATAR_SIZE) {
      setFeedback({ section: 'profile', type: 'error', message: 'Choose a JPG, PNG, WebP, or AVIF image smaller than 5 MB.' })
      return
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function uploadAvatar() {
    if (!user || !avatarFile) return
    setSaving('profile')
    setFeedback(null)
    const extension = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `admin-avatars/${user.id}/avatar-${Date.now()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from('villa-gallery')
      .upload(path, avatarFile, { contentType: avatarFile.type })

    if (uploadError) {
      setSaving(null)
      setFeedback({ section: 'profile', type: 'error', message: uploadError.message })
      return
    }

    const { data } = supabase.storage.from('villa-gallery').getPublicUrl(path)
    const { error: updateError } = await supabase.auth.updateUser({
      data: { ...user.user_metadata, avatar_url: data.publicUrl },
    })
    setSaving(null)
    setFeedback(updateError
      ? { section: 'profile', type: 'error', message: updateError.message }
      : { section: 'profile', type: 'success', message: 'Profile photo updated.' })
    if (!updateError) setAvatarFile(null)
  }

  async function saveEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextEmail = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(nextEmail)) {
      setFeedback({ section: 'email', type: 'error', message: 'Enter a valid email address.' })
      return
    }
    if (nextEmail === user?.email) {
      setFeedback({ section: 'email', type: 'error', message: 'Enter a different email address to update it.' })
      return
    }

    setSaving('email')
    setFeedback(null)
    const { error } = await supabase.auth.updateUser({ email: nextEmail })
    setSaving(null)
    setFeedback(error
      ? { section: 'email', type: 'error', message: error.message }
      : { section: 'email', type: 'success', message: 'Confirmation email sent. Your email changes after you confirm it.' })
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user?.email) return
    if (newPassword.length < 8 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setFeedback({ section: 'password', type: 'error', message: 'Use at least 8 characters with uppercase, lowercase, and a number.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ section: 'password', type: 'error', message: 'New password and confirmation do not match.' })
      return
    }

    setSaving('password')
    setFeedback(null)
    const { error: currentPasswordError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (currentPasswordError) {
      setSaving(null)
      setFeedback({ section: 'password', type: 'error', message: 'Current password is incorrect.' })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(null)
    if (error) {
      setFeedback({ section: 'password', type: 'error', message: error.message })
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setFeedback({ section: 'password', type: 'success', message: 'Password updated.' })
  }

  const initials = profileNameFrom(user?.user_metadata?.full_name, admin?.full_name || user?.email)
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Profile" subtitle="Manage your personal account details" />

      <div className="flex max-w-4xl flex-col gap-5">
        <section className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f7]">
              <UserRound size={16} className="text-[#0A1F44]" />
            </div>
            <div>
              <h2 className="font-display text-[16px] font-medium text-[#0A1F44]">Personal details</h2>
              <p className="font-body text-[12px] text-[#757575]">Your display name and profile photo.</p>
            </div>
          </div>

          {notice?.section === 'profile' && <Feedback notice={notice} />}

          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A1F44] font-body text-lg font-medium text-white">
              {activeAvatar ? <img src={activeAvatar} alt="Profile" className="h-full w-full object-cover" /> : initials}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#ECECEC] px-4 py-1.5 font-body text-[12px] font-medium text-[#0A1F44] transition-colors hover:bg-[#f0f2f7]">
                <Camera size={13} />
                Choose photo
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(event) => void chooseAvatar(event.target.files?.[0] ?? null)} />
              </label>
              {avatarFile && (
                <button type="button" onClick={() => void uploadAvatar()} disabled={saving === 'profile'} className="flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-[#0A1F44] px-4 py-1.5 font-body text-[12px] font-medium text-[#0A1F44] transition-colors hover:bg-[#f0f2f7] disabled:opacity-50">
                  <Camera size={13} /> {saving === 'profile' ? 'Uploading…' : 'Upload photo'}
                </button>
              )}
            </div>
          </div>

          <form onSubmit={saveProfile} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="block flex-1">
              <span className="mb-1.5 block font-body text-[12px] font-medium text-[#0A1F44]">Display name</span>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={100} className="w-full rounded-lg border border-[#ECECEC] bg-white px-3.5 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44]" />
            </label>
            <SaveButton loading={saving === 'profile'}>Save name</SaveButton>
          </form>
        </section>

        <section className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f7]">
              <Mail size={16} className="text-[#0A1F44]" />
            </div>
            <div>
              <h2 className="font-display text-[16px] font-medium text-[#0A1F44]">Email address</h2>
              <p className="font-body text-[12px] text-[#757575]">Changing your email requires confirmation from Supabase Auth.</p>
            </div>
          </div>
          {notice?.section === 'email' && <Feedback notice={notice} />}
          <form onSubmit={saveEmail} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="block flex-1">
              <span className="mb-1.5 block font-body text-[12px] font-medium text-[#0A1F44]">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-[#ECECEC] bg-white px-3.5 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44]" />
            </label>
            <SaveButton loading={saving === 'email'}>Save email</SaveButton>
          </form>
        </section>

        <section className="border border-[#ECECEC] rounded-lg bg-white p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2f7]">
              <KeyRound size={16} className="text-[#0A1F44]" />
            </div>
            <div>
              <h2 className="font-display text-[16px] font-medium text-[#0A1F44]">Password</h2>
              <p className="font-body text-[12px] text-[#757575]">Use at least 8 characters, including uppercase, lowercase, and a number.</p>
            </div>
          </div>
          {notice?.section === 'password' && <Feedback notice={notice} />}
          <form onSubmit={savePassword} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} />
            <PasswordField label="New password" value={newPassword} onChange={setNewPassword} />
            <PasswordField label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} />
            <div className="flex items-end"><SaveButton loading={saving === 'password'}>Update password</SaveButton></div>
          </form>
        </section>
      </div>
    </motion.div>
  )
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1.5 block font-body text-[12px] font-medium text-[#0A1F44]">{label}</span><input type="password" autoComplete={label === 'Current password' ? 'current-password' : 'new-password'} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-[#ECECEC] bg-white px-3.5 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44]" /></label>
}

function Feedback({ notice }: { notice: Exclude<Notice, null> }) {
  return <div className={`mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 font-body text-[13px] ${notice.type === 'success' ? 'border-[#B9D7BF] bg-[#F0F7F1] text-[#2F6B3B]' : 'border-red-200 bg-red-50 text-red-700'}`}>{notice.type === 'success' && <Check size={14} />} {notice.message}</div>
}
