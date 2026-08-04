import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const examplePath = join(root, '.env.example')
const envPath = join(root, '.env')

if (!existsSync(examplePath)) {
  console.error('ERROR: .env.example not found')
  process.exit(1)
}

const exampleContent = readFileSync(examplePath, 'utf-8')
const exampleVars = [...exampleContent.matchAll(/^\s*(\w+)=/gm)].map((m) => m[1])

const clientVars = exampleVars.filter((v) => v.startsWith('VITE_'))
const serverVars = exampleVars.filter((v) => !v.startsWith('VITE_'))

const frontendMissing = clientVars.filter(
  (v) => !envVarPresent(envPath, v) && !process.env[v],
)

if (frontendMissing.length > 0) {
  console.error(
    `ERROR: Missing required frontend environment variables:\n  ${frontendMissing.join('\n  ')}\n` +
    `Add them to .env or set them in your environment.`,
  )
  process.exit(1)
}

const serverMissing = serverVars.filter((v) => !process.env[v])
if (serverMissing.length > 0) {
  console.warn(
    `WARNING: Missing server-side environment variables (not required for frontend):\n  ${serverMissing.join('\n  ')}`,
  )
}

console.log('✓ Environment check passed')
process.exit(0)

function envVarPresent(envPath, name) {
  if (!existsSync(envPath)) return false
  const content = readFileSync(envPath, 'utf-8')
  const match = content.match(new RegExp(`^${name}=(.+)$`, 'm'))
  if (!match) return false
  return match[1].trim().length > 0
}
