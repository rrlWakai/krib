import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_APP_TITLE: z.string().min(1).default('KRiB Beverly Place'),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((i) => i.path.join('.'))
    .join(', ')
  throw new Error(
    `Environment validation failed. Missing or invalid variables: ${missing}`,
  )
}

export const env = parsed.data
