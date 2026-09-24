import { mkdirSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname, basename, extname, resolve } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const defaultAssetDir = join(root, 'src', 'assets')
const assetDir = resolve(process.argv[2] ?? defaultAssetDir)
const force = process.argv.includes('--force')

const WEBP_QUALITY = 80
const CODE_OK = 0
const CODE_ERROR = 1

const SKIP_EXT = new Set(['.svg', '.avif', '.webp', '.gif', '.ico'])
const SOURCE_EXT = new Set(['.png', '.jpg', '.jpeg'])

function walk(dir) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walk(full))
    } else if (SOURCE_EXT.has(extname(full).toLowerCase())) {
      results.push(full)
    }
  }
  return results
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function pct(reduction) {
  return `${reduction.toFixed(1)}%`
}

async function run() {
  if (!existsSync(assetDir)) {
    console.error(`ERROR: asset directory not found: ${assetDir}`)
    process.exit(CODE_ERROR)
  }

  const files = walk(assetDir).sort((a, b) => statSync(b).size - statSync(a).size)
  if (files.length === 0) {
    console.log('No PNG/JPG/JPEG files found to convert.')
    process.exit(CODE_OK)
  }

  let converted = 0
  let skipped = 0
  let errors = 0
  let totalBefore = 0
  let totalAfter = 0

  console.log(`Scanning: ${assetDir}`)
  console.log(`Found ${files.length} PNG/JPG/JPEG candidate(s). Quality: ${WEBP_QUALITY}\n`)

  for (const file of files) {
    const out = file.replace(/\.[^.]+$/, '.webp')
    const before = statSync(file).size
    totalBefore += before

    try {
      if (!force && existsSync(out)) {
        const srcMtime = statSync(file).mtimeMs
        const outMtime = statSync(out).mtimeMs
        if (outMtime >= srcMtime) {
          const after = statSync(out).size
          totalAfter += after
          skipped += 1
          console.log(`SKIP  ${rel(out)} (already exists, ${formatSize(after)})`)
          continue
        }
      }

      const metadata = await sharp(file, { failOn: 'none' }).metadata()
      const width = metadata.width ?? 0
      const height = metadata.height ?? 0

      await sharp(file, { failOn: 'none' }).webp({ quality: WEBP_QUALITY }).toFile(out)

      const after = statSync(out).size
      totalAfter += after
      converted += 1

      const reduction = before - after
      const pctDrop = before > 0 ? (reduction / before) * 100 : 0

      console.log(
        `${after < before ? 'OK   ' : 'WARN '} ${rel(file)} (${width}x${height})  ${formatSize(before)} -> ${formatSize(after)}  (-${formatSize(Math.abs(reduction))}, ${pct(pctDrop)})`,
      )

      if (after >= before) {
        console.log(`      Note: webp is not smaller for this image; keeping ${rel(out)} anyway (originals preserved).`)
      }
    } catch (err) {
      errors += 1
      console.error(`ERROR ${rel(file)}: ${err.message}`)
    }
  }

  console.log('\n── Summary ──')
  console.log(`Converted: ${converted}`)
  console.log(`Skipped (already up to date): ${skipped}`)
  console.log(`Errors: ${errors}`)
  if (totalBefore > 0) {
    const saved = totalBefore - totalAfter
    const pctSaved = (saved / totalBefore) * 100
    console.log(`Total before: ${formatSize(totalBefore)}`)
    console.log(`Total after:  ${formatSize(totalAfter)}`)
    console.log(`Total saved:  ${formatSize(saved)}  (${pct(pctSaved)})`)
  }

  process.exit(errors > 0 ? CODE_ERROR : CODE_OK)
}

function rel(file) {
  return file.slice(assetDir.length + 1).replace(/\\/g, '/')
}

run()