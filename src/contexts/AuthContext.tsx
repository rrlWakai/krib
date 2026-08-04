import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '../lib/supabase/client'
import { handleAuthError } from '../lib/errors'

interface AuthState {
  user: User | null
  session: Session | null
  role: string | null
  loading: boolean
  initialized: boolean
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
    initialized: false,
  })

  const supabase = getSupabaseClient()

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setState({
        user: session?.user ?? null,
        session,
        role: null,
        loading: false,
        initialized: true,
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setState({
        user: session?.user ?? null,
        session,
        role: null,
        loading: false,
        initialized: true,
      })
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: handleAuthError(error) }
    }
    return { error: null }
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({ user: null, session: null, role: null, loading: false, initialized: true })
  }, [supabase])

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
