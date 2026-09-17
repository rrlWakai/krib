import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Eye, Plus, Save, Send, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { LoadingBlock, ErrorBlock } from '../../components/AdminState'
import { useAdminQuery } from '../../hooks/useAdminQuery'
import {
  fetchWebsitePagesAdmin,
  savePageDraft,
  publishPage,
  unpublishPage,
  logAudit,
} from '../../services/website'
import type { AdminWebsitePage } from '../../types'
import { Field, TextAreaField, Card, PrimaryButton, GhostButton } from './fields'
import { PreviewModal } from './PreviewModal'
import {
  resolveHomeContent,
  resolveAboutPageContent,
  resolveLocationContent,
  type ResolvedHomeContent,
  type ResolvedAboutPageContent,
  type ResolvedLocationContent,
} from '../../../lib/websiteContent'
import { cn } from '../../../lib/cn'

type Draft = Record<string, unknown>

function paragraphsToText(paragraphs: string[]): string {
  return paragraphs.join('\n')
}

function textToParagraphs(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function SectionEditor({
  title,
  paragraphs,
  onChange,
  onRemove,
}: {
  title: string
  paragraphs: string[]
  onChange: (patch: { title?: string; paragraphs?: string[] }) => void
  onRemove?: () => void
}) {
  return (
    <div className="rounded-lg border border-[#ECECEC] bg-[#FAFAFA] p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          <Field label="Section title" value={title} onChange={(v) => onChange({ title: v })} />
          <TextAreaField
            label="Paragraphs (one per line)"
            value={paragraphsToText(paragraphs)}
            onChange={(v) => onChange({ paragraphs: textToParagraphs(v) })}
            rows={4}
          />
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#757575] transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Remove section"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

function HomeForm({
  draft,
  onChange,
}: {
  draft: Draft
  onChange: (next: Draft) => void
}) {
  const hero = (draft.hero ?? {}) as Record<string, string>
  const about = (draft.about ?? {}) as Record<string, unknown>
  const cta = (draft.cta ?? {}) as Record<string, string>

  return (
    <div className="space-y-5">
      <Card title="Hero">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Subtitle"
            value={hero.subtitle ?? ''}
            onChange={(v) =>
              onChange({ ...draft, hero: { ...hero, subtitle: v } })
            }
          />
          <Field
            label="Title"
            value={hero.title ?? ''}
            onChange={(v) => onChange({ ...draft, hero: { ...hero, title: v } })}
          />
        </div>
        <div className="mt-4">
          <TextAreaField
            label="Description"
            value={hero.description ?? ''}
            onChange={(v) =>
              onChange({ ...draft, hero: { ...hero, description: v } })
            }
            rows={3}
          />
        </div>
      </Card>

      <Card title="About (Our Story)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Label"
            value={(about.label as string) ?? ''}
            onChange={(v) =>
              onChange({ ...draft, about: { ...about, label: v } })
            }
          />
          <Field
            label="Title"
            value={(about.title as string) ?? ''}
            onChange={(v) => onChange({ ...draft, about: { ...about, title: v } })}
          />
        </div>
        <div className="mt-4">
          <TextAreaField
            label="Paragraphs (one per line)"
            value={paragraphsToText((about.paragraphs as string[]) ?? [])}
            onChange={(v) =>
              onChange({ ...draft, about: { ...about, paragraphs: textToParagraphs(v) } })
            }
            rows={8}
          />
        </div>
      </Card>

      <Card title="Call to Action">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Eyebrow"
            value={cta.eyebrow ?? ''}
            onChange={(v) => onChange({ ...draft, cta: { ...cta, eyebrow: v } })}
          />
          <Field
            label="Button label"
            value={cta.buttonLabel ?? ''}
            onChange={(v) => onChange({ ...draft, cta: { ...cta, buttonLabel: v } })}
          />
        </div>
        <div className="mt-4">
          <Field
            label="Title"
            value={cta.title ?? ''}
            onChange={(v) => onChange({ ...draft, cta: { ...cta, title: v } })}
          />
        </div>
        <div className="mt-4">
          <TextAreaField
            label="Description"
            value={cta.description ?? ''}
            onChange={(v) =>
              onChange({ ...draft, cta: { ...cta, description: v } })
            }
            rows={3}
          />
        </div>
      </Card>
    </div>
  )
}

function AboutPageForm({
  draft,
  onChange,
}: {
  draft: Draft
  onChange: (next: Draft) => void
}) {
  const sections = (Array.isArray(draft.sections) ? draft.sections : []) as {
    title: string
    paragraphs: string[]
  }[]

  return (
    <div className="space-y-5">
      <Card title="Hero">
        <div className="grid grid-cols-1 gap-4">
          <Field
            label="Title"
            value={(draft.heroTitle as string) ?? ''}
            onChange={(v) => onChange({ ...draft, heroTitle: v })}
          />
          <TextAreaField
            label="Description"
            value={(draft.heroDescription as string) ?? ''}
            onChange={(v) => onChange({ ...draft, heroDescription: v })}
            rows={3}
          />
        </div>
      </Card>

      <Card
        title="Story Sections"
        subtitle="Each section appears as the numbered stories on the About page."
        actions={
          <GhostButton
            onClick={() =>
              onChange({
                ...draft,
                sections: [...sections, { title: '', paragraphs: [''] }],
              })
            }
          >
            <Plus size={12} /> Add section
          </GhostButton>
        }
      >
        <div className="space-y-3">
          {sections.map((section, i) => (
            <SectionEditor
              key={i}
              title={section.title ?? ''}
              paragraphs={section.paragraphs ?? []}
              onChange={(patch) => {
                const next = [...sections]
                next[i] = { ...next[i], ...patch }
                onChange({ ...draft, sections: next })
              }}
              onRemove={() => {
                const next = [...sections]
                next.splice(i, 1)
                onChange({ ...draft, sections: next })
              }}
            />
          ))}
          {sections.length === 0 && (
            <p className="font-body text-[12px] text-[#757575]">
              No sections yet. Add one to start.
            </p>
          )}
        </div>
      </Card>

      <Card title="Closing Quote">
        <TextAreaField
          label="Quote"
          value={(draft.quote as string) ?? ''}
          onChange={(v) => onChange({ ...draft, quote: v })}
          rows={3}
        />
      </Card>
    </div>
  )
}

function LocationForm({
  draft,
  onChange,
}: {
  draft: Draft
  onChange: (next: Draft) => void
}) {
  const directions = (Array.isArray(draft.directions) ? draft.directions : []) as {
    from: string
    via: string
    travelTime: string
    description: string
  }[]

  return (
    <div className="space-y-5">
      <Card title="Hero">
        <div className="grid grid-cols-1 gap-4">
          <Field
            label="Title"
            value={(draft.heroTitle as string) ?? ''}
            onChange={(v) => onChange({ ...draft, heroTitle: v })}
          />
          <TextAreaField
            label="Description"
            value={(draft.heroDescription as string) ?? ''}
            onChange={(v) => onChange({ ...draft, heroDescription: v })}
            rows={3}
          />
          <Field
            label="Address"
            value={(draft.address as string) ?? ''}
            onChange={(v) => onChange({ ...draft, address: v })}
          />
        </div>
      </Card>

      <Card
        title="Directions"
        actions={
          <GhostButton
            onClick={() =>
              onChange({
                ...draft,
                directions: [
                  ...directions,
                  { from: '', via: '', travelTime: '', description: '' },
                ],
              })
            }
          >
            <Plus size={12} /> Add direction
          </GhostButton>
        }
      >
        <div className="space-y-3">
          {directions.map((direction, i) => (
            <div key={i} className="rounded-lg border border-[#ECECEC] bg-[#FAFAFA] p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field
                      label="From"
                      value={direction.from ?? ''}
                      onChange={(v) => {
                        const next = [...directions]
                        next[i] = { ...next[i], from: v }
                        onChange({ ...draft, directions: next })
                      }}
                    />
                    <Field
                      label="Via"
                      value={direction.via ?? ''}
                      onChange={(v) => {
                        const next = [...directions]
                        next[i] = { ...next[i], via: v }
                        onChange({ ...draft, directions: next })
                      }}
                    />
                    <Field
                      label="Travel time"
                      value={direction.travelTime ?? ''}
                      onChange={(v) => {
                        const next = [...directions]
                        next[i] = { ...next[i], travelTime: v }
                        onChange({ ...draft, directions: next })
                      }}
                    />
                  </div>
                  <TextAreaField
                    label="Description"
                    value={direction.description ?? ''}
                    onChange={(v) => {
                      const next = [...directions]
                      next[i] = { ...next[i], description: v }
                      onChange({ ...draft, directions: next })
                    }}
                    rows={2}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = [...directions]
                    next.splice(i, 1)
                    onChange({ ...draft, directions: next })
                  }}
                  className="mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#757575] transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove direction"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {directions.length === 0 && (
            <p className="font-body text-[12px] text-[#757575]">
              No directions yet. Add one to start.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

function PageEditor({
  page,
  fields,
}: {
  page: AdminWebsitePage
  fields: (
    draft: Draft,
    onChange: (next: Draft) => void,
  ) => ReactElement
}) {
  const [draft, setDraft] = useState<Draft>(() => ({ ...(page.draft_content as Draft) }))
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    setDraft({ ...(page.draft_content as Draft) })
  }, [page.draft_content])

  async function handleSave() {
    setSaving(true)
    setNotice(null)
    const { data, error } = await savePageDraft(page.id, {
      title: page.title,
      draft_content: draft,
    })
    setSaving(false)
    if (error || !data) {
      setNotice({ type: 'error', message: error?.message ?? 'Failed to save draft.' })
      return
    }
    void logAudit('website_page.save_draft', 'website_page', page.id, { slug: page.slug })
    setNotice({ type: 'success', message: 'Draft saved.' })
  }

  async function handlePublish() {
    setSaving(true)
    setNotice(null)
    const { error } = await publishPage(page.id, draft)
    setSaving(false)
    if (error) {
      setNotice({ type: 'error', message: error.message })
      return
    }
    void logAudit('website_page.publish', 'website_page', page.id, { slug: page.slug })
    setNotice({ type: 'success', message: 'Published. The public website now shows this content.' })
  }

  return (
    <div className="space-y-4">
      {fields(draft, setDraft)}
      {notice && (
        <div
          className={cn(
            'rounded-lg border px-4 py-3 font-body text-[13px]',
            notice.type === 'success'
              ? 'border-[#B9D7BF] bg-[#F0F7F1] text-[#2F6B3B]'
              : 'border-red-200 bg-red-50 text-red-700',
          )}
        >
          {notice.message}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t border-[#ECECEC] pt-4">
        <PrimaryButton onClick={() => void handleSave()} disabled={saving}>
          <Save size={13} /> {saving ? 'Saving…' : 'Save draft'}
        </PrimaryButton>
        <PrimaryButton onClick={() => void handlePublish()} disabled={saving}>
          <Send size={13} /> Publish
        </PrimaryButton>
      </div>
    </div>
  )
}

function HomePreview({ draft }: { draft: Draft }) {
  const resolved: ResolvedHomeContent = resolveHomeContent(draft)
  return (
    <div className="divide-y divide-[#ECECEC]">
      <section className="bg-[#0f172a] px-8 py-14 text-white">
        <p className="mb-3 font-body text-[11px] uppercase tracking-[0.3em] text-white/70">
          {resolved.hero.subtitle}
        </p>
        <h1 className="mb-4 font-display text-3xl leading-tight">{resolved.hero.title}</h1>
        <p className="max-w-xl font-body text-[14px] leading-relaxed text-white/85">
          {resolved.hero.description}
        </p>
      </section>
      <section className="px-8 py-12">
        <p className="mb-3 font-body text-[11px] uppercase tracking-[0.25em] text-[#C9A227]">
          {resolved.about.label}
        </p>
        <h2 className="mb-5 font-display text-2xl text-[#0A1F44]">{resolved.about.title}</h2>
        <div className="space-y-4">
          {resolved.about.paragraphs.map((p, i) => (
            <p key={i} className="font-body text-[14px] leading-relaxed text-[#757575]">
              {p}
            </p>
          ))}
        </div>
      </section>
      <section className="bg-[#0f172a] px-8 py-12 text-center text-white">
        <p className="mb-3 font-body text-[10px] uppercase tracking-[0.24em] text-white/70">
          {resolved.cta.eyebrow}
        </p>
        <h2 className="mb-4 font-display text-2xl">{resolved.cta.title}</h2>
        <p className="mx-auto mb-6 max-w-2xl font-body text-[14px] leading-relaxed text-white/85">
          {resolved.cta.description}
        </p>
        <span className="inline-block rounded-full bg-white px-8 py-3 font-body text-[11px] uppercase tracking-[0.2em] text-[#0A1F44]">
          {resolved.cta.buttonLabel}
        </span>
      </section>
    </div>
  )
}

function AboutPreview({ draft }: { draft: Draft }) {
  const resolved: ResolvedAboutPageContent = resolveAboutPageContent(draft)
  return (
    <div className="divide-y divide-[#ECECEC]">
      <section className="bg-[#0f172a] px-8 py-14 text-white">
        <h1 className="mb-3 font-display text-3xl">{resolved.heroTitle}</h1>
        <p className="max-w-xl font-body text-[14px] leading-relaxed text-white/85">
          {resolved.heroDescription}
        </p>
      </section>
      {resolved.sections.map((section, i) => (
        <section key={i} className="px-8 py-10">
          <p className="mb-2 font-body text-[11px] uppercase tracking-[0.25em] text-[#C9A227]">
            0{i + 1}
          </p>
          <h2 className="mb-4 font-display text-2xl text-[#0A1F44]">{section.title}</h2>
          <div className="space-y-3">
            {section.paragraphs.map((p, j) => (
              <p key={j} className="font-body text-[14px] leading-relaxed text-[#757575]">
                {p}
              </p>
            ))}
          </div>
        </section>
      ))}
      <section className="px-8 py-12 text-center">
        <p className="font-display text-2xl italic leading-relaxed text-[#757575]">
          &ldquo;{resolved.quote}&rdquo;
        </p>
      </section>
    </div>
  )
}

function LocationPreview({ draft }: { draft: Draft }) {
  const resolved: ResolvedLocationContent = resolveLocationContent(draft)
  return (
    <div className="divide-y divide-[#ECECEC]">
      <section className="bg-[#0f172a] px-8 py-14 text-white">
        <h1 className="mb-3 font-display text-3xl">{resolved.heroTitle}</h1>
        <p className="max-w-xl font-body text-[14px] leading-relaxed text-white/85">
          {resolved.heroDescription}
        </p>
      </section>
      <section className="px-8 py-10">
        <p className="mb-3 font-body text-[11px] uppercase tracking-[0.25em] text-[#C9A227]">
          Getting here
        </p>
        <div className="space-y-5">
          {resolved.directions.map((d, i) => (
            <div key={i} className="border-l-2 border-[#C9A227] pl-4">
              <p className="mb-1 font-body text-[13px] font-medium text-[#0A1F44]">
                From {d.from} <span className="text-[#757575]">| {d.via} | {d.travelTime}</span>
              </p>
              <p className="font-body text-[13px] leading-relaxed text-[#757575]">
                {d.description}
              </p>
            </div>
          ))}
          <p className="font-body text-[13px] text-[#757575]">{resolved.address}</p>
        </div>
      </section>
    </div>
  )
}

export function PagesTab() {
  const query = useAdminQuery('website-pages', fetchWebsitePagesAdmin)
  const [openId, setOpenId] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ page: AdminWebsitePage; draft: Draft } | null>(null)

  const pageOrder = useMemo(() => ['home', 'about', 'location'], [])
  const pages = useMemo(() => {
    if (!query.data) return []
    return [...query.data].sort((a, b) => {
      const ai = pageOrder.indexOf(a.slug)
      const bi = pageOrder.indexOf(b.slug)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  }, [query.data, pageOrder])

  if (query.loading && !query.data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Pages" subtitle="Edit the copy shown across the public website" />
        <LoadingBlock />
      </motion.div>
    )
  }

  if (query.error && !query.data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader title="Pages" subtitle="Edit the copy shown across the public website" />
        <ErrorBlock message={query.error} onRetry={query.refetch} />
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Pages"
        subtitle="Edit public website copy. Changes are saved as drafts and appear live only after you publish. Until then the website keeps its current content."
      />

      <div className="flex flex-col gap-4">
        {pages.map((page) => {
          const isOpen = openId === page.id
          const schema = page.slug as 'home' | 'about' | 'location'
          return (
            <section key={page.id} className="rounded-lg border border-[#ECECEC] bg-white">
              <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : page.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <ChevronDown
                    size={15}
                    className={cn('text-[#757575] transition-transform', isOpen && 'rotate-180')}
                  />
                  <div className="flex-1">
                    <p className="font-body text-[14px] font-medium text-[#0A1F44]">
                      {page.title} page
                    </p>
                    <p className="font-body text-[11px] text-[#757575]">
                      {page.is_published ? 'Published' : 'Draft only'} · Last updated{' '}
                      {new Date(page.updated_at).toLocaleString()}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <GhostButton onClick={() => setPreview({ page, draft: { ...(page.draft_content as Draft) } })}>
                    <Eye size={12} /> Preview
                  </GhostButton>
                  {page.is_published && (
                    <GhostButton
                      onClick={() => {
                        void unpublishPage(page.id).then((result) => {
                          if (!result.error) {
                            void logAudit('website_page.unpublish', 'website_page', page.id, {
                              slug: page.slug,
                            })
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
                  <PageEditor
                    key={page.id}
                    page={page}
                    fields={(draft, setDraft) =>
                      schema === 'home' ? (
                        <HomeForm draft={draft} onChange={setDraft} />
                      ) : schema === 'about' ? (
                        <AboutPageForm draft={draft} onChange={setDraft} />
                      ) : (
                        <LocationForm draft={draft} onChange={setDraft} />
                      )
                    }
                  />
                </div>
              )}
            </section>
          )
        })}
      </div>

      <PreviewModal
        isOpen={preview !== null}
        title={preview ? `${preview.page.title} preview (${preview.page.slug} page)` : ''}
        onClose={() => setPreview(null)}
      >
        {preview?.page.slug === 'home' ? (
          <HomePreview draft={preview.draft} />
        ) : preview?.page.slug === 'about' ? (
          <AboutPreview draft={preview.draft} />
        ) : (
          preview && <LocationPreview draft={preview.draft} />
        )}
      </PreviewModal>
    </motion.div>
  )
}