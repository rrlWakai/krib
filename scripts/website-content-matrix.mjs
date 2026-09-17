// Logic matrix for src/lib/websiteContent.ts merge/resolve rules.
// Mirrors the shipped implementation verbatim so the matrix validates
// precedence + fallback behaviour without a test framework.
// Run: node scripts/website-content-matrix.mjs

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function mergeText(fallback, override) {
  return typeof override === 'string' && override.trim() !== '' ? override : fallback
}

export function mergeStringArray(fallback, override) {
  if (Array.isArray(override) && override.length > 0 && override.every((item) => typeof item === 'string')) {
    return override
  }
  return fallback
}

function resolveStorageUrl(path) {
  if (!path) return null
  return `https://x.supabase.co/storage/v1/object/public/villa-gallery/${path}`
}

const CTA_FALLBACK = {
  eyebrow: 'Your Perfect Villa Awaits',
  title: 'Ready to Find Your Perfect Villa?',
  description:
    'Whether you are planning a peaceful family getaway or a memorable celebration with loved ones, explore KRiB 1 and KRiB 2 to discover the stay that is right for you.',
  buttonLabel: 'Explore Villas',
}

const siteContent = {
  hero: { subtitle: 'S-DEFAULT', title: 'T-DEFAULT', description: 'D-DEFAULT' },
  about: { label: 'A-LABEL-DEFAULT', title: 'A-TITLE-DEFAULT', paragraphs: ['p1', 'p2', 'p3'] },
  aboutPage: {
    heroTitle: 'AH-DEFAULT',
    heroDescription: 'AD-DEFAULT',
    sections: [
      { title: 's1', paragraphs: ['sp1', 'sp2'] },
      { title: 's2', paragraphs: ['sp3'] },
    ],
    quote: 'Q-DEFAULT',
  },
  location: {
    heroTitle: 'LH-DEFAULT',
    heroDescription: 'LD-DEFAULT',
    address: 'ADR-DEFAULT',
    directions: [{ from: 'A-DEFAULT', via: 'x', travelTime: 't', description: 'd' }],
  },
}

function resolveHomeContent(page) {
  const hero = isRecord(page) && isRecord(page.hero) ? page.hero : {}
  const about = isRecord(page) && isRecord(page.about) ? page.about : {}
  const cta = isRecord(page) && isRecord(page.cta) ? page.cta : {}
  return {
    hero: {
      subtitle: mergeText(siteContent.hero.subtitle, hero.subtitle),
      title: mergeText(siteContent.hero.title, hero.title),
      description: mergeText(siteContent.hero.description, hero.description),
    },
    about: {
      label: mergeText(siteContent.about.label, about.label),
      title: mergeText(siteContent.about.title, about.title),
      paragraphs: mergeStringArray(siteContent.about.paragraphs, about.paragraphs),
    },
    cta: {
      eyebrow: mergeText(CTA_FALLBACK.eyebrow, cta.eyebrow),
      title: mergeText(CTA_FALLBACK.title, cta.title),
      description: mergeText(CTA_FALLBACK.description, cta.description),
      buttonLabel: mergeText(CTA_FALLBACK.buttonLabel, cta.buttonLabel),
    },
  }
}

function resolveAboutPageContent(page) {
  const fallback = siteContent.aboutPage
  const sectionsRaw = isRecord(page) ? page.sections : undefined
  let sections = fallback.sections
  if (Array.isArray(sectionsRaw)) {
    const sectionsFromCms = []
    for (const raw of sectionsRaw) {
      if (!isRecord(raw)) continue
      const paragraphs = mergeStringArray([], raw.paragraphs)
      if (paragraphs.length === 0) continue
      sectionsFromCms.push({ title: mergeText('', raw.title), paragraphs })
    }
    if (sectionsFromCms.length > 0) sections = sectionsFromCms
  }
  return {
    heroTitle: mergeText(fallback.heroTitle, isRecord(page) ? page.heroTitle : undefined),
    heroDescription: mergeText(fallback.heroDescription, isRecord(page) ? page.heroDescription : undefined),
    sections,
    quote: mergeText(
      'We are not a resort. We are not a hotel. We are a place where you can breathe, connect, and remember what matters most.',
      isRecord(page) ? page.quote : undefined,
    ),
  }
}

function resolveLocationContent(page) {
  const fallback = siteContent.location
  const directionsRaw = isRecord(page) ? page.directions : undefined
  let directions = fallback.directions
  if (Array.isArray(directionsRaw)) {
    const directionsFromCms = []
    for (const raw of directionsRaw) {
      if (!isRecord(raw)) continue
      directionsFromCms.push({
        from: mergeText('', raw.from),
        via: mergeText('', raw.via),
        travelTime: mergeText('', raw.travelTime),
        description: mergeText('', raw.description),
      })
    }
    if (directionsFromCms.length > 0) directions = directionsFromCms
  }
  return {
    heroTitle: mergeText(fallback.heroTitle, isRecord(page) ? page.heroTitle : undefined),
    heroDescription: mergeText(fallback.heroDescription, isRecord(page) ? page.heroDescription : undefined),
    address: mergeText(fallback.address, isRecord(page) ? page.address : undefined),
    directions,
  }
}

function resolveVillaMarketing(marketing, fallback, dbDescription) {
  const mark = isRecord(marketing) ? marketing : {}
  const cmsDescription = mergeText('', mark.description)
  const effectiveDbDescription =
    typeof dbDescription === 'string' && dbDescription.trim() !== '' && dbDescription !== fallback.tagline
      ? dbDescription
      : ''
  return {
    tagline: mergeText(fallback.tagline, mark.tagline),
    description:
      cmsDescription !== ''
        ? cmsDescription
        : effectiveDbDescription !== ''
          ? effectiveDbDescription
          : fallback.description,
    story: mergeText(fallback.story, mark.story),
    quickHighlights: mergeStringArray(fallback.quickHighlights, mark.quickHighlights),
  }
}

function resolveVillaGalleryImages(gallery, villaId, staticImages) {
  const cmsImages = (gallery ?? [])
    .filter((img) => img.villa_id === villaId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => resolveStorageUrl(img.storage_path))
    .filter((url) => url !== null)
  return cmsImages.length > 0 ? cmsImages : staticImages
}

// ──────────────────────────────────────────────

let pass = 0
let fail = 0
const failures = []

function ok(name, condition, detail = '') {
  if (condition) pass += 1
  else {
    fail += 1
    failures.push({ name, detail })
  }
}

// 1. HOME — everything defaults when empty
{
  const r = resolveHomeContent(undefined)
  ok('home: empty -> hero.subtitle fallback', r.hero.subtitle === 'S-DEFAULT')
  ok('home: empty -> cta.buttonLabel fallback', r.cta.buttonLabel === 'Explore Villas')
  ok('home: empty -> about.paragraphs fallback (3)', r.about.paragraphs.length === 3)
}

// 2. HOME — partial override + blank string + wrong types
{
  const r = resolveHomeContent({
    hero: { subtitle: 'NEW-S', title: '   ', description: 123 },
    about: { label: 'NEW-LABEL' },
  })
  ok('home: partial -> subtitle overridden', r.hero.subtitle === 'NEW-S')
  ok('home: partial -> whitespace title falls back', r.hero.title === 'T-DEFAULT')
  ok('home: partial -> non-string description falls back', r.hero.description === 'D-DEFAULT')
  ok('home: partial -> label overridden, paragraphs default', r.about.label === 'NEW-LABEL' && r.about.paragraphs.length === 3)
}

// 3. HOME — CTA fully overridden
{
  const r = resolveHomeContent({ cta: { eyebrow: 'E', title: 'CT', description: 'CD', buttonLabel: 'CB' } })
  ok('home: cta override all', r.cta.eyebrow === 'E' && r.cta.title === 'CT' && r.cta.description === 'CD' && r.cta.buttonLabel === 'CB')
}

// 4. ABOUT PAGE — sections replacement, empty CMS sections ignored
{
  const r = resolveAboutPageContent({
    heroTitle: 'NEW-AH',
    sections: [{ title: '', paragraphs: ['x1'] }, { title: 's2', paragraphs: [] }, 'garbage'],
  })
  ok('about: heroTitle overridden', r.heroTitle === 'NEW-AH')
  ok('about: blank-title 1 kept, blank-paragraphs 2 dropped, non-record dropped', r.sections.length === 1 && r.sections[0].paragraphs[0] === 'x1')
}
{
  const r = resolveAboutPageContent({ sections: [] })
  ok('about: empty CMS sections array keeps fallback sections', r.sections.length === 2)
}
{
  const r = resolveAboutPageContent({ quote: 'NEW-Q' })
  ok('about: quote overridden', r.quote === 'NEW-Q')
}

// 5. LOCATION — directions replaced when valid
{
  const r = resolveLocationContent({ address: 'NEW-ADDR', directions: [{ from: 'QC', via: 'NLEX', travelTime: '45 mins', description: 'go north' }] })
  ok('location: address + directions override', r.address === 'NEW-ADDR' && r.directions.length === 1 && r.directions[0].from === 'QC' && r.directions[0].via === 'NLEX')
}
{
  const r = resolveLocationContent({ directions: [] })
  ok('location: empty directions keeps fallback', r.directions.length === 1)
}

// 6. VILLA MARKETING — description precedence matrix
const mkFallback = { tagline: 'V-TAG', description: 'V-DESC', story: 'V-STORY', quickHighlights: ['h1', 'h2'] }
{
  const r = resolveVillaMarketing(undefined, mkFallback, null)
  ok('marketing: nothing -> all fallback', r.description === 'V-DESC' && r.tagline === 'V-TAG' && r.story === 'V-STORY')
}
{
  const r = resolveVillaMarketing({ description: 'CMS-DESC', tagline: 'CMS-TAG' }, mkFallback, 'DB-DESC')
  ok('marketing: CMS desc wins over DB desc', r.description === 'CMS-DESC')
  ok('marketing: CMS tagline wins', r.tagline === 'CMS-TAG')
}
{
  const r = resolveVillaMarketing({ description: '   ' }, mkFallback, 'DB-DESC')
  ok('marketing: blank CMS desc -> DB desc', r.description === 'DB-DESC')
}
{
  const r = resolveVillaMarketing({ description: '   ' }, mkFallback, mkFallback.tagline)
  ok('marketing: DB desc equal to tagline ignored -> static', r.description === 'V-DESC')
}
{
  const r = resolveVillaMarketing({ description: '   ' }, mkFallback, null)
  ok('marketing: no DB desc -> static desc', r.description === 'V-DESC')
}
{
  const r = resolveVillaMarketing({ quickHighlights: ['new'] }, mkFallback, null)
  ok('marketing: quickHighlights overridden', r.quickHighlights.length === 1 && r.quickHighlights[0] === 'new')
}
{
  const r = resolveVillaMarketing({ quickHighlights: [] }, mkFallback, null)
  ok('marketing: empty quickHighlights keeps fallback', r.quickHighlights.length === 2)
}

// 7. GALLERY — sorting, filtering, fallback
{
  const staticImg = ['/static/a.jpg', '/static/b.jpg']
  const r = resolveVillaGalleryImages([], 'v1', staticImg)
  ok('gallery: no cms -> static', JSON.stringify(r) === JSON.stringify(staticImg))
}
{
  const gallery = [
    { villa_id: 'v1', storage_path: 'a.png', sort_order: 2 },
    { villa_id: 'v2', storage_path: 'zz.png', sort_order: 0 },
    { villa_id: 'v1', storage_path: 'b.png', sort_order: 1 },
    { villa_id: 'v1', storage_path: '', sort_order: 0 },
  ]
  const r = resolveVillaGalleryImages(gallery, 'v1', ['/static/a.jpg'])
  ok('gallery: only this villa + order by sort_order + empty path dropped', JSON.stringify(r) === JSON.stringify([
    'https://x.supabase.co/storage/v1/object/public/villa-gallery/b.png',
    'https://x.supabase.co/storage/v1/object/public/villa-gallery/a.png',
  ]))
}
{
  const gallery = [{ villa_id: 'v2', storage_path: 'zz.png', sort_order: 0 }]
  const r = resolveVillaGalleryImages(gallery, 'v1', ['/static/a.jpg'])
  ok('gallery: only other villas -> static', r.length === 1 && r[0] === '/static/a.jpg')
}

// 8. mergeStringArray rejects partial strings / non-strings
{
  ok('mergeStringArray: non-string elements rejected', JSON.stringify(mergeStringArray(['a'], ['b', 1])) === '["a"]')
  ok('mergeStringArray: mixed ok when all strings', JSON.stringify(mergeStringArray(['a'], ['x', 'y'])) === '["x","y"]')
}

// ──────────────────────────────────────────────

console.log(`website-content-matrix: ${pass} passed, ${fail} failed`)
if (failures.length > 0) {
  for (const f of failures) console.log(`  FAIL ${f.name}${f.detail ? ' :: ' + f.detail : ''}`)
  process.exit(1)
}