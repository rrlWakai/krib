import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth'
import type { ReactNode } from 'react'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, initialized } = useAuth()
  const location = useLocation()

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C9A227] border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
