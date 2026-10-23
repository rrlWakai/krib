import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Eye, Save, Send } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { LoadingBlock, ErrorBlock } from '../../components/AdminState'
import { useAdminQuery } from '../../hooks/useAdminQuery'
import {
  fetchVillaMarketingAdmin,
  saveVillaMarketingDraft,
  publishVillaMarketing,
  unpublishVillaMarketing,
  logAudit,
} from '../../services/website'
import type { AdminVillaMarketing } from '../../types'
import { Field, TextAreaField, Card, PrimaryButton, GhostButton } from './fields'
import { PreviewModal } from './PreviewModal'
import { resolveVillaMarketing, type ResolvedVillaMarketing } from '../../../lib/websiteContent'
import { villas as staticVillas } from '../../../lib/data'
import { cn } from '../../../lib/cn'

type Draft = Record<string, unknown>

function VillaEditorDraft({
  marketing,
  onChange,
}: {
  marketing: AdminVillaMarketing
  onChange: (next: Draft) => void
}) {
  const draft = marketing.draft_content as Draft

  return (
    <div className="space-y-5">
      <Card title="Header">
        <Field
          label="Tagline"
          value={(draft.tagline as string) ?? ''}
          onChange={(v) => onChange({ ...draft, tagline: v })}
          hint="Shown under the villa number on the villa page."
        />
      </Card>

      <Card title="Description">
        <TextAreaField
          label="Description"
          value={(draft.description as string) ?? ''}
          onChange={(v) => onChange({ ...draft, description: v })}
          rows={5}
          hint="Replaces the current villa description on the public page."
        />
      </Card>

      <Card title="Story">
        <TextAreaField
          label="Story"
          value={(draft.story as string) ?? ''}
          onChange={(v) => onChange({ ...draft, story: v })}
          rows={7}
        />
        <TextAreaField
          label="Story supplemental paragraph"
          value={(draft.storySupplemental as string) ?? ''}
          onChange={(v) => onChange({ ...draft, storySupplemental: v })}
          rows={4}
        />
      </Card>

      <Card title="Quick Highlights">
        <TextAreaField
          label="Highlights (one per line)"
          value={((draft.quickHighlights as string[]) ?? []).join('\n')}
          onChange={(v) =>
            onChange({
              ...draft,
              quickHighlights: v
                .split('\n')
                .map((line) => line.replace(/^[\s•\-–]+/, '').trim())
                .filter(Boolean),
            })
          }
          rows={4}
          placeholder="• 20 guests, air-conditioned\n• Private pool\n• Grill area"
          hint="Shown as chips on the villa page."
        />
      </Card>

      <Card title="Availability section">
        <Field
          label="Heading"
          value={(draft.availabilityHeading as string) ?? ''}
          onChange={(v) => onChange({ ...draft, availabilityHeading: v })}
        />
        <TextAreaField
          label="Description"
          value={(draft.availabilityDescription as string) ?? ''}
          onChange={(v) => onChange({ ...draft, availabilityDescription: v })}
          rows={4}
        />
      </Card>

      <Card title="House policies">
        {((draft.policies as { icon: string; label: string; value: string }[]) ?? []).map((p, idx) => (
          <div key={idx} className="mb-4 rounded border border-[#ECECEC] p-3 space-y-2">
            <Field
              label="Icon"
              value={p.icon}
              onChange={(v) => {
                const next = [...((draft.policies as any[]) ?? [])]
                next[idx] = { ...next[idx], icon: v }
                onChange({ ...draft, policies: next })
              }}
            />
            <Field
              label="Label"
              value={p.label}
              onChange={(v) => {
                const next = [...((draft.policies as any[]) ?? [])]
                next[idx] = { ...next[idx], label: v }
                onChange({ ...draft, policies: next })
              }}
            />
            <Field
              label="Value"
              value={p.value}
              onChange={(v) => {
                const next = [...((draft.policies as any[]) ?? [])]
                next[idx] = { ...next[idx], value: v }
                onChange({ ...draft, policies: next })
              }}
            />
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() => {
                const next = [...((draft.policies as any[]) ?? [])]
                next.splice(idx, 1)
                onChange({ ...draft, policies: next })
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs text-[#0A1F44]"
          onClick={() => {
            const next = [...((draft.policies as any[]) ?? [])]
            next.push({ icon: 'info', label: '', value: '' })
            onChange({ ...draft, policies: next })
          }}
        >
          + Add policy
        </button>
      </Card>

      <Card title="Location">
        <TextAreaField
          label="Location description"
          value={(draft.locationDescription as string) ?? ''}
          onChange={(v) => onChange({ ...draft, locationDescription: v })}
          rows={4}
          hint="Shown on the villa page under the location heading."
        />
      </Card>

      <Card title="Nearby attractions">
        {((draft.attractions as { id: string; icon: string; name: string; description: string; travelTime: string }[]) ?? []).map(
          (a, idx) => {
            const save = (next: { id: string; icon: string; name: string; description: string; travelTime: string }[]) =>
              onChange({ ...draft, attractions: next })
            return (
              <div
                key={a.id ?? `attr-${idx}`}
                className="mb-4 rounded border border-[#ECECEC] p-3 space-y-2"
              >
                <Field
                  label="Name"
                  value={a.name}
                  onChange={(v) => {
                    const next = [...((draft.attractions as any[]) ?? [])]
                    next[idx] = { ...next[idx], name: v }
                    save(next)
                  }}
                />
                <Field
                  label="Description"
                  value={a.description}
                  onChange={(v) => {
                    const next = [...((draft.attractions as any[]) ?? [])]
                    next[idx] = { ...next[idx], description: v }
                    save(next)
                  }}
                />
                <Field
                  label="Travel time"
                  value={a.travelTime}
                  onChange={(v) => {
                    const next = [...((draft.attractions as any[]) ?? [])]
                    next[idx] = { ...next[idx], travelTime: v }
                    save(next)
                  }}
                />
                <Field
                  label="Icon key"
                  value={a.icon}
                  onChange={(v) => {
                    const next = [...((draft.attractions as any[]) ?? [])]
                    next[idx] = { ...next[idx], icon: v }
                    save(next)
                  }}
                  hint="e.g. store, directions_car"
                />
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() => {
                    const next = [...((draft.attractions as any[]) ?? [])]
                    next.splice(idx, 1)
                    save(next)
                  }}
                >
                  Remove
                </button>
              </div>
            )
          },
        )}
        <button
          type="button"
          className="text-xs text-[#0A1F44]"
          onClick={() => {
            const next = [...((draft.attractions as any[]) ?? [])]
            next.push({
              id: `attr-${Date.now()}`,
              icon: 'store',
              name: '',
              description: '',
              travelTime: '',
            })
            onChange({ ...draft, attractions: next })
          }}
        >
          + Add attraction
        </button>
      </Card>

      <Card title="Amenities">
        {((draft.amenities as { category: string; items: { icon: string; label: string }[] }[]) ?? []).map(
          (c, cIdx) => {
            const save = (next: { category: string; items: { icon: string; label: string }[] }[]) =>
              onChange({ ...draft, amenities: next })
            return (
              <div
                key={`cat-${cIdx}`}
                className="mb-4 rounded border border-[#ECECEC] p-3 space-y-2"
              >
                <Field
                  label="Category"
                  value={c.category}
                  onChange={(v) => {
                    const next = [...((draft.amenities as any[]) ?? [])]
                    next[cIdx] = { ...next[cIdx], category: v }
                    save(next)
                  }}
                />
                {((c.items as { icon: string; label: string }[]) ?? []).map(
                  (it, iIdx) => {
                    return (
                      <div key={iIdx} className="flex items-end gap-2">
                        <Field
                          label="Icon"
                          value={it.icon}
                          onChange={(v) => {
                            const next = [...((draft.amenities as any[]) ?? [])]
                            const items = [...((next[cIdx] as any).items ?? [])]
                            items[iIdx] = { ...items[iIdx], icon: v }
                            next[cIdx] = { ...next[cIdx], items }
                            save(next)
                          }}
                        />
                        <Field
                          label="Label"
                          value={it.label}
                          onChange={(v) => {
                            const next = [...((draft.amenities as any[]) ?? [])]
                            const items = [...((next[cIdx] as any).items ?? [])]
                            items[iIdx] = { ...items[iIdx], label: v }
                            next[cIdx] = { ...next[cIdx], items }
                            save(next)
                          }}
                        />
                        <button
                          type="button"
                          className="text-xs text-red-600 ml-2"
                          onClick={() => {
                            const next = [...((draft.amenities as any[]) ?? [])]
                            const items = [...((next[cIdx] as any).items ?? [])]
                            items.splice(iIdx, 1)
                            next[cIdx] = { ...next[cIdx], items }
                            save(next)
                          }}
                        >
                          Remove item
                        </button>
                      </div>
                    )
                  },
                )}
                <button
                  type="button"
                  className="text-xs text-[#0A1F44] mt-2"
                  onClick={() => {
                    const next = [...((draft.amenities as any[]) ?? [])]
                    const items = [...((next[cIdx] as any).items ?? [])]
                    items.push({ icon: 'store', label: '' })
                    next[cIdx] = { ...next[cIdx], items }
                    save(next)
                  }}
                >
                  + Add item
                </button>
                <button
                  type="button"
                  className="text-xs text-red-600 mt-2"
                  onClick={() => {
                    const next = [...((draft.amenities as any[]) ?? [])]
                    next.splice(cIdx, 1)
                    save(next)
                  }}
                >
                  Remove category
                </button>
              </div>
            )
          },
        )}
        <button
          type="button"
          className="text-xs text-[#0A1F44]"
          onClick={() => {
            const next = [...((draft.amenities as any[]) ?? [])]
            next.push({ category: '', items: [{ icon: 'store', label: '' }] })
            onChange({ ...draft, amenities: next })
          }}
        >
          + Add category
        </button>
      </Card>
    </div>
  )
}

function VillaPreview({ marketing }: { marketing: AdminVillaMarketing }) {
  const staticVilla = staticVillas.find((v) => v.slug === marketing.villa?.slug)
  const fallback = staticVilla
    ? {
        tagline: staticVilla.tagline,
        description: staticVilla.description,
        story: staticVilla.story,
        quickHighlights: staticVilla.quickHighlights,
      }
    : { tagline: '', description: '', story: '', quickHighlights: [] as string[] }

  const resolved: ResolvedVillaMarketing = resolveVillaMarketing(
    marketing.draft_content,
    fallback,
    null,
  )

  return (
    <div className="divide-y divide-[#ECECEC]">
      <section className="bg-[#0f172a] px-8 py-10 text-white">
        <p className="mb-2 font-body text-[11px] uppercase tracking-[0.3em] text-white/70">
          The {marketing.villa?.name ?? 'Villa'}
        </p>
        <h1 className="font-display text-3xl">{resolved.tagline}</h1>
      </section>
      <section className="px-8 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {resolved.quickHighlights.map((h, i) => (
            <span
              key={i}
              className="rounded-full border border-[#ECECEC] px-4 py-1.5 font-body text-[11px] text-[#0A1F44]"
            >
              {h}
            </span>
          ))}
        </div>
        <p className="mb-6 font-body text-[14px] leading-relaxed text-[#757575]">
          {resolved.description}
        </p>
        <div>
          <p className="mb-3 font-body text-[11px] uppercase tracking-[0.25em] text-[#C9A227]">
            The Story
          </p>
          <p className="whitespace-pre-line font-body text-[14px] leading-relaxed text-[#757575]">
            {resolved.story}
          </p>
        </div>
      </section>
    </div>
  )
}

export function VillasTab() {
  const query = useAdminQuery('website-villas-marketing', fetchVillaMarketingAdmin)
  const [openId, setOpenId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [preview, setPreview] = useState<AdminVillaMarketing | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Record<string, { type: 'success' | 'error'; message: string }>>(
    {},
  )

  const sorted = useMemo(() => {
    if (!query.data) return []
    return [...query.data].sort((a, b) =>
      (a.villa?.name ?? '').localeCompare(b.villa?.name ?? ''),
    )
  }, [query.data])

  useEffect(() => {
    if (!query.data) return
    const rows = query.data
    setDrafts((prev) => {
      const next = { ...prev }
      for (const row of rows) {
        if (!next[row.id]) next[row.id] = { ...(row.draft_content as Draft) }
      }
      return next
    })
  }, [query.data])

  if (query.loading && !query.data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader
          title="Villa Content"
          subtitle="Marketing copy for each villa — tagline, description, story, highlights"
        />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (query.error && !query.data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader
          title="Villa Content"
          subtitle="Marketing copy for each villa — tagline, description, story, highlights"
        />
        <ErrorBlock message={query.error} onRetry={query.refetch} />
      </motion.div>
    )
  }

  async function handleSave(marketing: AdminVillaMarketing) {
    setBusyId(marketing.id)
    setNotice((prev) => {
      const next = { ...prev }
      delete next[marketing.id]
      return next
    })
    const { error } = await saveVillaMarketingDraft(marketing.id, drafts[marketing.id])
    setBusyId(null)
    if (error) {
      setNotice((prev) => ({
        ...prev,
        [marketing.id]: { type: 'error', message: error.message },
      }))
      return
    }
    void logAudit('villa_marketing.save_draft', 'villa_marketing', marketing.id, {
      villa_id: marketing.villa_id,
    })
    setNotice((prev) => ({
      ...prev,
      [marketing.id]: { type: 'success', message: 'Draft saved.' },
    }))
  }

  async function handlePublish(marketing: AdminVillaMarketing) {
    setBusyId(marketing.id)
    setNotice((prev) => {
      const next = { ...prev }
      delete next[marketing.id]
      return next
    })
    const { error } = await publishVillaMarketing(marketing.id, drafts[marketing.id])
    setBusyId(null)
    if (error) {
      setNotice((prev) => ({
        ...prev,
        [marketing.id]: { type: 'error', message: error.message },
      }))
      return
    }
    void logAudit('villa_marketing.publish', 'villa_marketing', marketing.id, {
      villa_id: marketing.villa_id,
    })
    setNotice((prev) => ({
      ...prev,
      [marketing.id]: {
        type: 'success',
        message: 'Published. The villa page now shows this content.',
      },
    }))
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Villa Content"
        subtitle="Edit each villa's marketing copy. Drafts become live only after publishing — the website keeps its current copy until then."
      />

      <div className="flex flex-col gap-4">
        {sorted.map((marketing) => {
          const isOpen = openId === marketing.id
          const draft = drafts[marketing.id] ?? (marketing.draft_content as Draft)
          const noticeEntry = notice[marketing.id]
          return (
            <section key={marketing.id} className="rounded-lg border border-[#ECECEC] bg-white">
              <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : marketing.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <ChevronDown
                    size={15}
                    className={cn('text-[#757575] transition-transform', isOpen && 'rotate-180')}
                  />
                  <div className="flex-1">
                    <p className="font-body text-[14px] font-medium text-[#0A1F44]">
                      {marketing.villa?.name ?? 'Villa'}
                    </p>
                    <p className="font-body text-[11px] text-[#757575]">
                      {marketing.is_published ? 'Published' : 'Draft only'} · Last updated{' '}
                      {new Date(marketing.updated_at).toLocaleString()}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <GhostButton onClick={() => setPreview(marketing)}>
                    <Eye size={12} /> Preview
                  </GhostButton>
                  {marketing.is_published && (
                    <GhostButton
                      disabled={busyId === marketing.id}
                      onClick={() => {
                        void unpublishVillaMarketing(marketing.id).then((result) => {
                          if (!result.error) {
                            void logAudit(
                              'villa_marketing.unpublish',
                              'villa_marketing',
                              marketing.id,
                              { villa_id: marketing.villa_id },
                            )
                          }
                        })
                      }}
                    >
                      Unpublish
                    </GhostButton>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-[#ECECEC] p-5">
                  {noticeEntry && (
                    <div
                      className={cn(
                        'mb-4 rounded-lg border px-4 py-3 font-body text-[13px]',
                        noticeEntry.type === 'success'
                          ? 'border-[#B9D7BF] bg-[#F0F7F1] text-[#2F6B3B]'
                          : 'border-red-200 bg-red-50 text-red-700',
                      )}
                    >
                      {noticeEntry.message}
                    </div>
                  )}
                  <VillaEditorDraft
                    marketing={{ ...marketing, draft_content: draft }}
                    onChange={(next) =>
                      setDrafts((prev) => ({ ...prev, [marketing.id]: next }))
                    }
                  />
                  <div className="flex flex-wrap items-center gap-2 border-t border-[#ECECEC] pt-4">
                    <PrimaryButton
                      onClick={() => void handleSave(marketing)}
                      disabled={busyId === marketing.id}
                    >
                      <Save size={13} /> {busyId === marketing.id ? 'Saving…' : 'Save draft'}
                    </PrimaryButton>
                    <PrimaryButton
                      onClick={() => void handlePublish(marketing)}
                      disabled={busyId === marketing.id}
                    >
                      <Send size={13} /> Publish
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </section>
          )
        })}
      </div>

      <PreviewModal
        isOpen={preview !== null}
        title={preview ? `${preview.villa?.name ?? 'Villa'} preview` : ''}
        onClose={() => setPreview(null)}
      >
        {preview && <VillaPreview marketing={preview} />}
      </PreviewModal>
    </motion.div>
  )
}