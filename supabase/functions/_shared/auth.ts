import { getAdminClient } from './adminClient.ts'
import { unauthorized } from './errors.ts'

export interface AdminUser {
  id: string
  auth_user_id: string
  role: 'owner' | 'staff'
  full_name: string
}

export async function getAdminUser(
  req: Request,
): Promise<{ ok: true; admin: AdminUser } | { ok: false; response: Response }> {
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    return { ok: false, response: unauthorized('Authentication required') }
  }

  const admin = getAdminClient()

  const { data: authUser, error: authError } = await admin.auth.getUser(token)
  if (authError || !authUser.user) {
    return { ok: false, response: unauthorized('Invalid session') }
  }

  const { data: adminUser, error: adminError } = await admin
    .from('admin_users')
    .select('id, auth_user_id, role, full_name')
    .eq('auth_user_id', authUser.user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (adminError) throw adminError
  if (!adminUser) {
    return { ok: false, response: unauthorized('Admin access required') }
  }

  return {
    ok: true,
    admin: {
      id: adminUser.id as string,
      auth_user_id: adminUser.auth_user_id as string,
      role: adminUser.role as AdminUser['role'],
      full_name: adminUser.full_name as string,
    },
  }
}
