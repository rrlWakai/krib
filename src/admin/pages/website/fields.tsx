import type { ReactNode } from 'react'

const inputClass =
  'w-full rounded-lg border border-[#ECECEC] bg-white px-3.5 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none transition-colors focus:border-[#0A1F44]'

export function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-[12px] font-medium text-[#0A1F44]">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
      {hint && <span className="mt-1 block font-body text-[11px] text-[#757575]">{hint}</span>}
    </label>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-[12px] font-medium text-[#0A1F44]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass} resize-y`}
      />
      {hint && <span className="mt-1 block font-body text-[11px] text-[#757575]">{hint}</span>}
    </label>
  )
}

export function Card({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="rounded-lg border border-[#ECECEC] bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1">
          <h2 className="font-display text-[16px] font-medium text-[#0A1F44]">{title}</h2>
          {subtitle && <p className="font-body text-[12px] text-[#757575]">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? 'Toggle'}
      onClick={() => onChange(!checked)}
      className={checked ? 'bg-[#0A1F44]' : 'bg-[#ECECEC]'}
      style={{
        position: 'relative',
        display: 'inline-flex',
        height: 28,
        width: 44,
        alignItems: 'center',
        borderRadius: 9999,
        transition: 'background-color 0.2s',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          height: 20,
          width: 20,
          borderRadius: 9999,
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transform: checked ? 'translateX(20px)' : 'translateX(2px)',
          transition: 'transform 0.2s',
        }}
      />
    </button>
  )
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[36px] items-center justify-center gap-2 rounded-lg bg-[#0A1F44] px-4 font-body text-[12px] font-medium text-white transition-opacity disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[36px] items-center justify-center gap-2 rounded-lg border px-4 font-body text-[12px] font-medium transition-colors disabled:opacity-50 ${
        danger
          ? 'border-[#ECECEC] text-red-600 hover:bg-red-50'
          : 'border-[#ECECEC] text-[#757575] hover:bg-[#FAFAFA]'
      }`}
    >
      {children}
    </button>
  )
}

export function SmallButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[32px] items-center justify-center gap-1.5 rounded-lg border border-[#ECECEC] px-3 font-body text-[11px] font-medium text-[#0A1F44] transition-colors hover:bg-[#f0f2f7] disabled:opacity-50"
    >
      {children}
    </button>
  )
}