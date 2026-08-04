/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_TITLE: string
  readonly SUPABASE_SERVICE_ROLE_KEY: string
  readonly SEMAPHORE_API_KEY: string
  readonly SEMAPHORE_SENDER_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
