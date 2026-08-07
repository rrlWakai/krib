import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '../lib/supabase/client'
import { handleAuthError } from '../lib/errors'

export interface AdminProfile {
  id: string
  auth_user_id: string
  full_name: string
  role: 'owner' | 'staff'
  is_active: boolean
  email: string
}

interface AuthState {
  user: User | null
  session: Session | null
  admin: AdminProfile | null
  role: string | null
  loading: boolean
  initialized: boolean
  adminLoading: boolean
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshAdmin: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const INITIAL_STATE: AuthState = {
  user: null,
  session: null,
  admin: null,
  role: null,
  loading: true,
  initialized: false,
  adminLoading: false,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL_STATE)

  const supabase = getSupabaseClient()

  const loadAdmin = useCallback(
    async (userId: string, email: string): Promise<AdminProfile | null> => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, auth_user_id, full_name, role, is_active')
        .eq('auth_user_id', userId)
        .maybeSingle()

      if (error || !data || !data.is_active) return null

      return {
        id: data.id,
        auth_user_id: data.auth_user_id,
        full_name: data.full_name,
        role: data.role,
        is_active: data.is_active,
        email,
      }
    },
    [supabase],
  )

  const resolveAdmin = useCallback(
    async (user: User | null) => {
      if (!user) {
        setState({
          user: null,
          session: null,
          admin: null,
          role: null,
          loading: false,
          initialized: true,
          adminLoading: false,
        })
        return
      }

      setState((prev) => ({
        ...prev,
        user,
        loading: false,
        initialized: true,
        adminLoading: true,
      }))

      const profile = await loadAdmin(user.id, user.email ?? '')

      setState((prev) => ({
        ...prev,
        user,
        admin: profile,
        role: profile?.role ?? null,
        adminLoading: false,
      }))
    },
    [loadAdmin],
  )

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      void resolveAdmin(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      void resolveAdmin(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, resolveAdmin])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return { error: handleAuthError(error) }
      }
      return { error: null }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({
      user: null,
      session: null,
      admin: null,
      role: null,
      loading: false,
      initialized: true,
      adminLoading: false,
    })
  }, [supabase])

  const refreshAdmin = useCallback(async () => {
    if (!state.user) return
    const profile = await loadAdmin(state.user.id, state.user.email ?? '')
    setState((prev) => ({ ...prev, admin: profile, role: profile?.role ?? null, adminLoading: false }))
  }, [state.user, loadAdmin])

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, refreshAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}
