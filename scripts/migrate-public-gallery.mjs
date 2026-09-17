// Single-source-of-truth migration for the KRiB gallery.
//
// The public villa pages fall back to STATIC bundled assets
// (src/lib/data.ts -> villa.images -> src/assets/Krib1|Krib2)
// whenever gallery_images has no visible rows for a villa. That
// means the Website Manager (which reads gallery_images) shows an
// empty gallery while the public site shows photos.
//
// This script ANNEXES the static public gallery into the existing
// authoritative system (gallery_images + Storage bucket
// villa-gallery) WITHOUT deleting, truncating, resetting, or
// overwriting anything:
//
//   1. Reads the exact ordered manifest below (mirrors data.ts).
//   2. Uploads each image to  legacy/{villa_id}/{nn}-{file}
//      (deterministic path -> the migration is idempotent).
//   3. Inserts one gallery_images row per image (insert-only,
//      no upsert, marked is_visible = true).
//
// Storage paths under legacy/ are publicly readable through the
// existing bucket policy and resolve through the same
// resolveStorageUrl() the public site already uses, so once rows
// exist the public site reads website-manager data automatically.
// Admin uploads continue to live under villas/... untouched.
//
// Uses the Supabase REST + Storage HTTP APIs directly with the
// server-side service-role key (never shipped to the browser).
//
// Run:  node scripts/migrate-public-gallery.mjs            (dry-run)
//       node scripts/migrate-public-gallery.mjs --apply    (writes)

import { readFileSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')

const BUCKET = 'villa-gallery'

// ──────────────────────────────────────────────
// Env (server-side only — never shipped to the client)
// ──────────────────────────────────────────────

function loadEnv() {
  const entries = new Map()
  try {
    const raw = readFileSync(resolve(ROOT, '.env'), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      entries.set(trimmed.slice(0, eq).trim(), trimmed.slice(eq + 1).trim())
    }
  } catch {
    // fall through — missing vars reported below
  }
  const url = entries.get('VITE_SUPABASE_URL') ?? entries.get('SUPABASE_URL')
  const serviceKey =
    entries.get('SUPABASE_SERVICE_ROLE_KEY') ?? entries.get('SUPABASE_SERVICE_KEY')
  if (!url || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_URL in .env (server-side only).',
    )
  }
  return { url: url.replace(/\/+$/, ''), serviceKey }
}

// ──────────────────────────────────────────────
// Manifest — mirrors src/lib/data.ts exactly
// ──────────────────────────────────────────────
// KRiB 1: data.ts lines 24-38 (13 entries; pool.jpg duplicated
// at indexes 1 and 12 — preserved 1:1 so the migrated public
// gallery matches what the site renders today).
// KRiB 2: data.ts lines 138-161 (22 entries).

const MANIFEST = {
  'krib-1': [
    '05.png',
    'Krib1/pool.jpg',
    'Krib1/living.jpg',
    'Krib1/balcon.jpg',
    'Krib1/dining1.jpg',
    'Krib1/masterbed.jpg',
    'Krib1/kara.jpg',
    'Krib1/diningg.jpg',
    'Krib1/tab.jpg',
    'Krib1/bed.jpg',
    'Krib1/bedd.jpg',
    'Krib1/bed1.jpg',
    'Krib1/pool.jpg',
  ],
  'krib-2': [
    'Krib2/exterior.jpg',
    'Krib2/pool.jpg',
    'Krib2/living.jpg',
    'Krib2/dining.avif',
    'Krib2/balcony.jpg',
    'Krib2/kit.avif',
    'Krib2/kitc.avif',
    'Krib2/gal.avif',
    'Krib2/gal2.avif',
    'Krib2/gal3.avif',
    'Krib2/gal4.avif',
    'Krib2/bed1.avif',
    'Krib2/bed2.avif',
    'Krib2/bed3.avif',
    'Krib2/bath.avif',
    'Krib2/bath2.avif',
    'Krib2/shower.avif',
    'Krib2/toil.avif',
    'Krib2/toil2.avif',
    'Krib2/toil3.avif',
    'Krib2/toil4.avif',
    'Krib2/toil5.avif',
  ],
}

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
}

function basename(file) {
  return file.slice(file.lastIndexOf('/') + 1)
}

function labelFrom(file, villaName) {
  const base = basename(file).replace(/\.[^.]+$/, '')
  const words = base
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  return `${villaName} ${(words.join(' ') || base).trim()}`
}

// ──────────────────────────────────────────────
// Thin HTTP client (REST + Storage)
// ──────────────────────────────────────────────

async function dbSelect(url, key, qs) {
  const res = await fetch(`${url}/rest/v1/gallery_images?${qs}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`gallery_images select failed (${res.status}): ${await res.text()}`)
  return res.json()
}

async function dbCountByVilla(url, key, villaId) {
  const rows = await dbSelect(url, key, `select=id&villa_id=eq.${villaId}&limit=1000`)
  return rows.length
}

async function dbInsert(url, key, row) {
  const res = await fetch(`${url}/rest/v1/gallery_images`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error(`gallery_images insert failed (${res.status}): ${await res.text()}`)
}

async function storageList(url, key, prefix) {
  const res = await fetch(`${url}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, offset: 0 }),
  })
  if (!res.ok) return { error: `(${res.status}) ${await res.text()}` }
  const data = await res.json()
  return { data }
}

async function storageUpload(url, key, path, body, contentType) {
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': contentType,
      'x-upsert': 'false',
    },
    body,
  })
  if (!res.ok) return { error: `(${res.status}) ${await res.text()}` }
  return { ok: true }
}

async function storageRemove(url, key, paths) {
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/remove`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: paths }),
  })
  if (!res.ok) throw new Error(`storage remove failed (${res.status}): ${await res.text()}`)
}

// ──────────────────────────────────────────────
// Runner
// ──────────────────────────────────────────────

async function main() {
  const { url, serviceKey } = loadEnv()

  console.log(`Mode     : ${APPLY ? 'APPLY (writes data)' : 'DRY-RUN (no writes)'}`)
  console.log(`Supabase : ${url}`)
  console.log('')

  const villasRes = await fetch(
    `${url}/rest/v1/villas?select=id,slug,name&slug=in.(krib-1,krib-2)&limit=100`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: 'application/json' } },
  )
  if (!villasRes.ok) throw new Error(`villas lookup failed (${villasRes.status}): ${await villasRes.text()}`)
  const villaRows = await villasRes.json()
  const villas = new Map(villaRows.map((v) => [v.slug, v]))
  for (const slug of Object.keys(MANIFEST)) {
    if (!villas.has(slug)) throw new Error(`Villa "${slug}" not found in live villas table.`)
  }

  const before = {}
  for (const [slug, villa] of villas) before[slug] = await dbCountByVilla(url, serviceKey, villa.id)

  console.log('Live BEFORE state (existing gallery_images rows — untouched):')
  for (const [slug, villa] of villas) console.log(`  ${slug} (${villa.id}) : ${before[slug]} rows`)
  console.log('')

  let planned = 0
  let uploaded = 0
  let inserted = 0
  let skipped = 0
  let healed = 0
  const errors = []

  for (const slug of Object.keys(MANIFEST)) {
    const villa = villas.get(slug)
    const children = MANIFEST[slug]
    const dir = `legacy/${villa.id}`
    planned += children.length

    let existingObjects = new Set()
    if (APPLY) {
      const list = await storageList(url, serviceKey, dir)
      if (!list.error) existingObjects = new Set(list.data.map((o) => o.name))
    }

    console.log(`\n=== ${villa.name} (${slug}) — ${children.length} images ===`)
    for (let index = 0; index < children.length; index++) {
      const file = children[index]
      const rel = `src/assets/${file}`
      const abs = resolve(ROOT, rel)
      let size = 0
      try {
        size = statSync(abs).size
      } catch {
        errors.push(`${rel}: file not found on disk`)
        console.log(`  [ERROR] ${rel} — source file missing on disk`)
        continue
      }

      const ext = '.' + basename(file).split('.').pop().toLowerCase()
      const contentType = MIME[ext] ?? 'application/octet-stream'
      const path = `${dir}/${String(index).padStart(2, '0')}-${basename(file)}`
      const publicUrl = `${url}/storage/v1/object/public/${BUCKET}/${path}`
      const name = path.split('/').pop()

      if (!APPLY) {
        console.log(`  [plan] ${name}  (${(size / 1024).toFixed(0)} KB) -> ${publicUrl}`)
        continue
      }

      const existingRow = await dbSelect(
        url, serviceKey, `select=id&storage_path=eq.${encodeURIComponent(path)}&limit=1`,
      ).catch((e) => {
        errors.push(`${path}: row check failed: ${e.message}`)
        return null
      })
      if (existingRow === null) continue

      if (existingRow.length > 0) {
        skipped += 1
        console.log(`  [skip] ${name} — already migrated (row exists)`)
        continue
      }

      if (existingObjects.has(name)) {
        healed += 1
        console.log(`  [heal] ${name} — object exists, inserting missing row`)
      } else {
        const body = readFileSync(abs)
        const upload = await storageUpload(url, serviceKey, path, body, contentType)
        if (upload.error) {
          errors.push(`${path}: upload failed: ${upload.error}`)
          console.log(`  [ERROR] upload ${name}: ${upload.error}`)
          continue
        }
        uploaded += 1
      }

      try {
        await dbInsert(url, serviceKey, {
          villa_id: villa.id,
          storage_path: path,
          alt_text: labelFrom(file, villa.name),
          caption: '',
          file_name: basename(file),
          sort_order: index,
          is_visible: true,
        })
        inserted += 1
        console.log(`  [ok]   ${name}  -> ${publicUrl}`)
      } catch (e) {
        errors.push(`${path}: row insert failed: ${e.message}`)
        try {
          await storageRemove(url, serviceKey, [path])
          console.log(`  [ERROR] ${name} — row insert failed; stored object rolled back: ${e.message}`)
        } catch (rollbackErr) {
          console.log(`  [ERROR] ${name} — row insert failed AND rollback failed: ${rollbackErr.message}`)
        }
      }
    }
  }

  if (!APPLY) {
    console.log('\n── DRY-RUN SUMMARY ──')
    console.log(`Planned        : ${planned} objects + rows (KRiB 1: ${MANIFEST['krib-1'].length}, KRiB 2: ${MANIFEST['krib-2'].length})`)
    console.log(`Existing rows  : ${Object.values(before).reduce((a, b) => a + b, 0)} (untouched)`)
    console.log(`Errors         : ${errors.length}`)
    console.log('\nRe-run with --apply to perform the additive migration.')
    if (errors.length > 0) process.exitCode = 1
    return
  }

  const after = {}
  for (const [slug, villa] of villas) after[slug] = await dbCountByVilla(url, serviceKey, villa.id)

  console.log('\n── APPLY SUMMARY ──')
  console.log(`Uploaded objects : ${uploaded}`)
  console.log(`Rows inserted    : ${inserted}`)
  console.log(`Skipped (exists) : ${skipped}`)
  console.log(`Healed           : ${healed}`)
  console.log(`Errors           : ${errors.length}`)
  for (const [slug, villa] of villas) {
    console.log(`  live rows ${before[slug]} -> ${after[slug]}  (${slug})`)
  }
  if (errors.length > 0) {
    console.log('Errors:')
    for (const e of errors) console.log(`  - ${e}`)
    process.exitCode = 1
  } else {
    console.log('Migration complete. The public villa pages now read website-manager data.')
  }
}

main().catch((err) => {
  console.error(`FATAL: ${err.message}`)
  process.exit(1)
})