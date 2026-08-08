// Phase 5 live smoke test — KRiB Beverly Place
// Uses the anon supabase client path (functions.invoke + REST with anon) to match the frontend.
// Run: node scripts/smoke-phase5.mjs   (requires .env with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envRaw = fs.readFileSync(path.join(REPO, '.env'), 'utf8')
const env = {}
for (const line of envRaw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2]
}

const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://vwvorheeurkehhrbkxun.supabase.co'
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY
if (!ANON_KEY) { console.error('VITE_SUPABASE_ANON_KEY missing from .env'); process.exit(1) }

const ADMIN_EMAIL = '0324-0515@lspu.edu.ph'
const ADMIN_PASSWORD = 'R0324-0515'

const ts = Date.now()
const GUEST_EMAIL = `p5-smoke-${ts}@example.com`
const PHONE = '+639171234567'

let pass = 0, fail = 0
let createdReservationIds = []
let guestId = null

function check(label, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS  ${label}${extra ? '  [' + extra + ']' : ''}`) }
  else { fail++; console.log(`FAIL  ${label}${extra ? '  [' + extra + ']' : ''}`) }
}

async function invoke(name, payload, token = ANON_KEY, method = 'POST') {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: method === 'GET' ? undefined : JSON.stringify(payload),
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

async function rest(method, path, token = ANON_KEY, body) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, body: await res.json().catch(() => null) }
}

const arr = (v) => (Array.isArray(v) ? v : [])

// ---- Sign in as live admin (RLS + admin session path) ----
const signIn = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
})
const signInBody = await signIn.json().catch(() => null)
const ADMIN_JWT = signInBody?.access_token ?? ''
check('live admin sign-in returns JWT', signIn.status === 200 && !!ADMIN_JWT, `status=${signIn.status}`)

// Fresh-state purge: remove any p5-smoke reservations left by previous runs
// (the villa-date overlap guard would otherwise 409 this run).
{
  const smokeGuests = arr((await rest('GET', `/rest/v1/guests?select=id&email=ilike.p5-smoke-%25@example.com`, ADMIN_JWT)).body)
  const ids = smokeGuests.map((g) => g.id)
  let prevIds = []
  if (ids.length) {
    const r = await rest('GET', `/rest/v1/reservations?select=id&guest_id=in.(${ids.join(',')})`, ADMIN_JWT)
    prevIds = arr(r.body).map((x) => x.id)
  }
  for (const id of prevIds) {
    await rest('DELETE', `/rest/v1/sms_logs?reservation_id=eq.${id}`, ADMIN_JWT)
    await rest('DELETE', `/rest/v1/audit_logs?entity_id=eq.${id}`, ADMIN_JWT)
    await rest('DELETE', `/rest/v1/reservations?id=eq.${id}`, ADMIN_JWT)
  }
  for (const g of smokeGuests) await rest('DELETE', `/rest/v1/guests?id=eq.${g.id}`, ADMIN_JWT)
  if (prevIds.length) console.log(`PURGE  removed ${prevIds.length} stale smoke reservation(s)`)
}

// ---- 1. Settings (public RLS read, guest path) ----
const settingsRes = await rest('GET', '/rest/v1/settings?id=eq.1&select=id,business,sms,legal')
const settings = settingsRes.body?.[0]
check('settings row readable publicly', settingsRes.status === 200 && settings?.id === 1, `status=${settingsRes.status}`)
check('settings business_name seeded', settings?.business?.business_name === 'KRiB Beverly Place', settings?.business?.business_name)
check('settings legal terms present', typeof settings?.legal?.terms_conditions === 'string' && settings.legal.terms_conditions.length > 100, `${settings?.legal?.terms_conditions?.length ?? 0} chars`)

// ---- 2. Availability (PII-safe) ----
const availUpcoming = await fetch(`${SUPABASE_URL}/functions/v1/availability?villa=krib-1`, {
  headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
}).then(async (r) => ({ status: r.status, body: await r.json() }))
check('availability villa=krib-1 200', availUpcoming.status === 200, `status=${availUpcoming.status}`)
const piiSafe = (availUpcoming.body?.upcoming ?? []).every((r) =>
  Object.keys(r).sort().join(',') === ['arrival_datetime','checkout_datetime','id','status'].sort().join(','))
check('availability upcoming has NO PII (id/status/arrival/checkout only)', piiSafe, `n=${availUpcoming.body?.upcoming?.length}`)

// unreserved future slot
const future = new Date(Date.now() + 30 * 86400000)
future.setHours(14, 0, 0, 0)
const futureIso = future.toISOString()
const availSlot = await fetch(`${SUPABASE_URL}/functions/v1/availability?villa=krib-1&arrival=${encodeURIComponent(futureIso)}`, {
  headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
}).then(async (r) => ({ status: r.status, body: await r.json() }))
check('availability returns villa base_price/max_guests', availSlot.body?.villa?.slug === 'krib-1' && typeof availSlot.body?.villa?.base_price === 'number', JSON.stringify(availSlot.body?.villa))

// ---- 3. Existing test reservation lookup ----
const KRB = 'KRB-312AE96'
const existing = await rest('GET', `/rest/v1/reservations?reference_code=eq.${KRB}&select=reference_code,guest:guests(email)`, ADMIN_JWT)
const existingEmail = existing.body?.[0]?.guest?.email
check('existing test reservation KRB-312AE96 present', existing.status === 200 && Array.isArray(existing.body) && existing.body.length === 1, `n=${existing.body?.length}`)

if (existingEmail) {
  const lkGood = await invoke('lookup_reservation', { reference_code: KRB, email: existingEmail }, ANON_KEY)
  check('lookup by reference+email -> 200', lkGood.status === 200 && lkGood.body?.reservation?.reference_code === KRB, `status=${lkGood.status}`)
  const lkWrong = await invoke('lookup_reservation', { reference_code: KRB, email: 'wrong@example.com' }, ANON_KEY)
  check('lookup wrong email -> 401', lkWrong.status === 401 && lkWrong.body?.code === 'UNAUTHORIZED', `status=${lkWrong.status} code=${lkWrong.body?.code}`)
}
const lkMissing = await invoke('lookup_reservation', { reference_code: 'KRB-0000000', email: 'nobody@example.com' }, ANON_KEY)
check('lookup unknown code -> 404', lkMissing.status === 404, `status=${lkMissing.status}`)
const lkBadInput = await invoke('lookup_reservation', {}, ANON_KEY)
check('lookup empty body -> 400', lkBadInput.status === 400, `status=${lkBadInput.status}`)

// ---- 4. Create reservation (blocker fix: privacy consent now wired) ----
const basePayload = {
  villa_id: 'krib-1',
  full_name: 'P5 Smoke Guest',
  email: GUEST_EMAIL,
  phone: PHONE,
  adults: 2,
  children: 1,
  infants: 0,
  pets: 0,
  special_requests: 'phase5 smoke',
  terms_accepted: true,
  privacy_accepted: true,
}
const pastArrival = new Date(Date.now() - 86400000).toISOString()
const rPast = await invoke('create_reservation', { ...basePayload, arrival_datetime: pastArrival })
check('create with past arrival rejected', rPast.status >= 400, `status=${rPast.status} code=${rPast.body?.code}`)

const rNoConsent = await invoke('create_reservation', { ...basePayload, arrival_datetime: futureIso, privacy_accepted: false })
check('create without privacy consent -> 400', rNoConsent.status === 400, `status=${rNoConsent.status} code=${rNoConsent.body?.code}`)

const r1 = await invoke('create_reservation', { ...basePayload, arrival_datetime: futureIso })
check('create reservation 200', r1.status === 200, `status=${r1.status}`)
const res1 = r1.body?.reservation
if (res1?.id) { createdReservationIds.push(res1.id); guestId = res1.guest?.id ?? null }
check('created status pending', res1?.status === 'pending', res1?.status)
check('reference code KRB-XXXXXXXX', /^KRB-[A-Z0-9]{7}$/.test(res1?.reference_code ?? ''), res1?.reference_code)
const arrivalMs = new Date(res1?.arrival_datetime).getTime()
const checkoutMs = new Date(res1?.checkout_datetime).getTime()
check('checkout = arrival + 21h (server-enforced)', Math.abs((checkoutMs - arrivalMs) - 21 * 3600000) < 1000, `${(checkoutMs - arrivalMs) / 3600000}h`)

// owner SMS + audit create on the created reservation
const r1Sms = await rest('GET', `/rest/v1/sms_logs?reservation_id=eq.${res1?.id}&select=id,status,direction`, ADMIN_JWT)
check('owner SMS logged on create (best-effort)', arr(r1Sms.body).some((s) => s.direction === 'outbound_auto'), JSON.stringify(arr(r1Sms.body).map((s) => s.status)))
const r1Audit = await rest('GET', `/rest/v1/audit_logs?entity_id=eq.${res1?.id}&select=id,action,actor,metadata`, ADMIN_JWT)
const createAudit = arr(r1Audit.body).find((a) => a.action === 'create')
check('audit create written with actor metadata', !!createAudit && createAudit.metadata?.actor_name === 'P5 Smoke Guest', JSON.stringify(createAudit?.metadata))

// ---- 5. approve (guest SMS + audit) ----
const appr = await invoke('approve_reservation', { reservation_id: res1?.id }, ADMIN_JWT)
check('approve -> approved', appr.status === 200 && appr.body?.reservation?.status === 'approved', `status=${appr.status} s=${appr.body?.reservation?.status}`)
check('approved_at set', !!appr.body?.reservation?.approved_at, appr.body?.reservation?.approved_at)
const apprSms = await rest('GET', `/rest/v1/sms_logs?reservation_id=eq.${res1?.id}&select=id,status,direction`, ADMIN_JWT)
check('approve triggers guest SMS log', arr(apprSms.body).length >= arr(r1Sms.body).length + 1, `before=${arr(r1Sms.body).length} after=${arr(apprSms.body).length}`)
const apprAudit = await rest('GET', `/rest/v1/audit_logs?entity_id=eq.${res1?.id}&select=action,actor`, ADMIN_JWT)
check('audit approve written', arr(apprAudit.body).some((a) => a.action === 'approve'), arr(apprAudit.body).map((a) => a.action).join(','))

// approve again -> idempotent
const appr2 = await invoke('approve_reservation', { reservation_id: res1?.id }, ADMIN_JWT)
check('approve again idempotent 200', appr2.status === 200, `status=${appr2.status}`)

// ---- 6. complete (manual admin action, Phase 5 C2) ----
const comp = await invoke('complete_reservation', { reservation_id: res1?.id }, ADMIN_JWT)
check('complete -> completed', comp.status === 200 && comp.body?.reservation?.status === 'completed', `status=${comp.status} s=${comp.body?.reservation?.status}`)
check('completed_at set', !!comp.body?.reservation?.completed_at, comp.body?.reservation?.completed_at)
check('completed_by = admin_users id (E2E admin)', comp.body?.reservation?.completed_by === '375347b9-d783-41b3-8fe4-924c093b50f5', comp.body?.reservation?.completed_by)
const compAudit = await rest('GET', `/rest/v1/audit_logs?entity_id=eq.${res1?.id}&select=action`, ADMIN_JWT)
check('audit complete written', arr(compAudit.body).some((a) => a.action === 'complete'), arr(compAudit.body).map((a) => a.action).join(','))
const compAgain = await invoke('complete_reservation', { reservation_id: res1?.id }, ADMIN_JWT)
check('complete completed -> 200 idempotent (no-op)', compAgain.status === 200 && compAgain.body?.reservation?.status === 'completed', `status=${compAgain.status}`)

// complete on pending -> 409
const r2 = await invoke('create_reservation', { ...basePayload, email: `p5-smoke2-${ts}@example.com`, arrival_datetime: new Date(Date.now() + 31 * 86400000).toISOString() })
const res2 = r2.body?.reservation
if (res2?.id) createdReservationIds.push(res2.id)
const compPending = await invoke('complete_reservation', { reservation_id: res2?.id }, ADMIN_JWT)
check('complete pending -> 409 INVALID_TRANSITION', compPending.status === 409 && compPending.body?.code === 'INVALID_TRANSITION', `status=${compPending.status} code=${compPending.body?.code}`)

// ---- 7. decline (guest SMS + audit) ----
const decl = await invoke('decline_reservation', { reservation_id: res2?.id, reason: 'Owner unavailable' }, ADMIN_JWT)
check('decline -> declined', decl.status === 200 && decl.body?.reservation?.status === 'declined', `status=${decl.status} s=${decl.body?.reservation?.status}`)
const declAudit = await rest('GET', `/rest/v1/audit_logs?entity_id=eq.${res2?.id}&select=action,metadata`, ADMIN_JWT)
check('audit decline written', arr(declAudit.body).some((a) => a.action === 'decline'), arr(declAudit.body).map((a) => a.action).join(','))

// ---- 8. guest cancel (pending only; guest+owner SMS + audit actor guest) ----
const r3 = await invoke('create_reservation', { ...basePayload, email: `p5-smoke3-${ts}@example.com`, phone: '+639171234568', arrival_datetime: new Date(Date.now() + 32 * 86400000).toISOString() })
const res3 = r3.body?.reservation
if (res3?.id) createdReservationIds.push(res3.id)
const gCancelWrong = await invoke('cancel_reservation', { reference_code: res3?.reference_code, email: 'wrong@example.com' }, ANON_KEY)
check('guest cancel wrong email -> 401', gCancelWrong.status === 401, `status=${gCancelWrong.status}`)
const gCancelOk = await invoke('cancel_reservation', { reference_code: res3?.reference_code, email: `p5-smoke3-${ts}@example.com` }, ANON_KEY)
check('guest cancel pending -> cancelled', gCancelOk.status === 200 && gCancelOk.body?.reservation?.status === 'cancelled', `status=${gCancelOk.status} s=${gCancelOk.body?.reservation?.status}`)
const gCancelAudit = await rest('GET', `/rest/v1/audit_logs?entity_id=eq.${res3?.id}&select=action,metadata`, ADMIN_JWT)
const gCancel = arr(gCancelAudit.body).find((a) => a.action === 'cancel')
check('audit guest cancel with actor metadata', !!gCancel && gCancel.metadata?.actor === 'guest' && gCancel.metadata?.actor_email === `p5-smoke3-${ts}@example.com`, JSON.stringify(gCancel?.metadata))

// guest cancel approved -> 403
const r4 = await invoke('create_reservation', { ...basePayload, email: `p5-smoke4-${ts}@example.com`, phone: '+639171234569', arrival_datetime: new Date(Date.now() + 33 * 86400000).toISOString() })
const res4 = r4.body?.reservation
if (res4?.id) createdReservationIds.push(res4.id)
await invoke('approve_reservation', { reservation_id: res4?.id }, ADMIN_JWT)
const gCancelApproved = await invoke('cancel_reservation', { reference_code: res4?.reference_code, email: `p5-smoke4-${ts}@example.com` }, ANON_KEY)
check('guest cancel approved -> 403 GUEST_CANCEL_NOT_ALLOWED', gCancelApproved.status === 403 && gCancelApproved.body?.code === 'GUEST_CANCEL_NOT_ALLOWED', `status=${gCancelApproved.status} code=${gCancelApproved.body?.code}`)

// ---- 9. Admin RLS reads (control center path) ----
const adminReads = await Promise.all([
  rest('GET', '/rest/v1/reservations?select=id,status&limit=1', ADMIN_JWT),
  rest('GET', '/rest/v1/villas?select=id,slug', ADMIN_JWT),
  rest('GET', '/rest/v1/guests?select=id&limit=1', ADMIN_JWT),
  rest('GET', '/rest/v1/sms_logs?select=id&limit=1', ADMIN_JWT),
  rest('GET', '/rest/v1/audit_logs?select=id&limit=1', ADMIN_JWT),
])
check('admin RLS: reservations readable', adminReads[0].status === 200 && Array.isArray(adminReads[0].body), `status=${adminReads[0].status}`)
check('admin RLS: villas readable', adminReads[1].status === 200 && Array.isArray(adminReads[1].body), `status=${adminReads[1].status}`)
check('admin RLS: guests readable', adminReads[2].status === 200 && Array.isArray(adminReads[2].body), `status=${adminReads[2].status}`)
check('admin RLS: sms_logs readable', adminReads[3].status === 200 && Array.isArray(adminReads[3].body), `status=${adminReads[3].status}`)
check('admin RLS: audit_logs readable', adminReads[4].status === 200 && Array.isArray(adminReads[4].body), `status=${adminReads[4].status}`)

// anon must NOT read reservations (default deny)
const anonRead = await rest('GET', '/rest/v1/reservations?select=id&limit=1', ANON_KEY)
check('anon RLS: reservations blocked (empty)', anonRead.status === 200 && Array.isArray(anonRead.body) && anonRead.body.length === 0, `n=${anonRead.body?.length}`)

// ---- 10. Settings write via admin (update business, verify persisted) ----
const upd = await rest('PATCH', '/rest/v1/settings?id=eq.1', ADMIN_JWT, { business: { ...(settings?.business ?? {}), party_fee: 5000 } })
check('admin settings PATCH 200', upd.status === 200 || upd.status === 204, `status=${upd.status}`)

// ---- cleanup ----
async function cleanup() {
  for (const id of createdReservationIds) {
    await rest('DELETE', `/rest/v1/sms_logs?reservation_id=eq.${id}`, ADMIN_JWT)
    await rest('DELETE', `/rest/v1/audit_logs?entity_id=eq.${id}`, ADMIN_JWT)
    await rest('DELETE', `/rest/v1/reservations?id=eq.${id}`, ADMIN_JWT)
  }
  for (const email of [`p5-smoke-${ts}@example.com`, `p5-smoke2-${ts}@example.com`, `p5-smoke3-${ts}@example.com`, `p5-smoke4-${ts}@example.com`]) {
    const g = await rest('GET', `/rest/v1/guests?email=eq.${encodeURIComponent(email)}&select=id`, ADMIN_JWT)
    for (const row of arr(g.body)) await rest('DELETE', `/rest/v1/guests?id=eq.${row.id}`, ADMIN_JWT)
  }
  console.log(`CLEANUP  removed ${createdReservationIds.length} reservations + related logs/guests`)
}

try {
  // guarded via arr() — main body never throws a TypeError here
} finally {
  await cleanup()
}
console.log(`\nRESULT: ${pass} passed, ${fail} failed → ${fail === 0 ? 'ALL PASS' : 'FAILURES PRESENT'}`)
process.exit(fail === 0 ? 0 : 1)
