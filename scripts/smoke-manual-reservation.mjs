// Manual reservation live smoke test — KRiB Beverly Place (Option B)
// Exercises the full Control Center manual booking path:
//   admin form payload → create_manual_reservation edge function
//   → create_manual_reservation RPC → reservations INSERT (approved)
// and regression-checks the public create_reservation path.
// Run: node scripts/smoke-manual-reservation.mjs
//   (requires .env with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
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
const futureDate = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)

let pass = 0, fail = 0, skip = 0
const createdReservationIds = []
const smokeEmails = []

function check(label, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS  ${label}${extra ? '  [' + extra + ']' : ''}`) }
  else { fail++; console.log(`FAIL  ${label}${extra ? '  [' + extra + ']' : ''}`) }
}
function skipCheck(label) { skip++; console.log(`SKIP  ${label}`) }

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

// ---- Live admin sign-in ----
const signIn = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
})
const signInBody = await signIn.json().catch(() => null)
const ADMIN_JWT = signInBody?.access_token ?? ''
check('live admin sign-in returns JWT', signIn.status === 200 && !!ADMIN_JWT, `status=${signIn.status}`)

const adminRowRes = await rest('GET', '/rest/v1/admin_users?select=id,auth_user_id&auth_user_id=eq.' + (signInBody?.user?.id ?? 'none'), ADMIN_JWT)
const adminRow = arr(adminRowRes.body)[0] ?? null
const manualPayload = (over = {}) => ({
  villa_id: 'krib-1',
  arrival_date: futureDate(40),
  full_name: `Manual Smoke ${ts}`,
  email: `manual-smoke-${ts}@example.com`,
  phone: '+639171110001',
  adults: 2,
  children: 1,
  infants: 0,
  pets: 0,
  is_party: false,
  special_requests: 'manual smoke',
  ...over,
})

// ---- 1. Baseline manual booking: 2 adults + 1 child → guest_count 3, approved ----
const r1 = await invoke('create_manual_reservation', manualPayload(), ADMIN_JWT)
const res1 = r1.body?.reservation
if (res1?.id) createdReservationIds.push(res1.id)
smokeEmails.push(manualPayload().email)
check('manual booking returns 201', r1.status === 201, `status=${r1.status}`)
check('guest_count = adults + children (3)', res1?.guest_count === 3, `guest_count=${res1?.guest_count}`)
check('status = approved', res1?.status === 'approved', `status=${res1?.status}`)
check('approved_at is set', !!res1?.approved_at)
check('approved_by is set', !!res1?.approved_by)
check('approved_by = current admin', adminRow ? res1?.approved_by === adminRow.id : !!res1?.approved_by, `approved_by=${res1?.approved_by}`)
check('checkout = arrival + 21h', res1?.arrival_datetime && res1?.checkout_datetime && (new Date(res1.checkout_datetime) - new Date(res1.arrival_datetime)) === 21 * 3600000)
check('below capacity 20, party OFF → no fees', Number(res1?.additional_guest_fee) === 0 && Number(res1?.party_fee) === 0, `additional=${res1?.additional_guest_fee} party=${res1?.party_fee}`)

// ---- 2. 10 adults + 5 children + 2 infants + 1 pet → guest_count 15 ----
const r2 = await invoke('create_manual_reservation', manualPayload({
  arrival_date: futureDate(41),
  adults: 10,
  children: 5,
  infants: 2,
  pets: 1,
  email: `manual-smoke2-${ts}@example.com`,
}), ADMIN_JWT)
const res2 = r2.body?.reservation
if (res2?.id) createdReservationIds.push(res2.id)
smokeEmails.push(`manual-smoke2-${ts}@example.com`)
check('mixed composition booking 201', r2.status === 201, `status=${r2.status}`)
check('guest_count = 15 (infants/pets excluded)', res2?.guest_count === 15, `guest_count=${res2?.guest_count}`)
check('guest_count 15 status approved', res2?.status === 'approved')

// ---- 3. Validation: invalid adults / negative children / non-integer ----
const r3a = await invoke('create_manual_reservation', manualPayload({ adults: 0, arrival_date: futureDate(42) }), ADMIN_JWT)
check('adults=0 rejected 400', r3a.status === 400, `status=${r3a.status} msg=${r3a.body?.message}`)
const r3b = await invoke('create_manual_reservation', manualPayload({ adults: -2, arrival_date: futureDate(42) }), ADMIN_JWT)
check('negative adults rejected 400', r3b.status === 400, `status=${r3b.status} msg=${r3b.body?.message}`)
const r3c = await invoke('create_manual_reservation', manualPayload({ children: -1, arrival_date: futureDate(42) }), ADMIN_JWT)
check('negative children rejected 400', r3c.status === 400, `status=${r3c.status} msg=${r3c.body?.message}`)
const r3d = await invoke('create_manual_reservation', manualPayload({ adults: 1.5, arrival_date: futureDate(42) }), ADMIN_JWT)
check('non-integer adults rejected 400', r3d.status === 400, `status=${r3d.status} msg=${r3d.body?.message}`)

// ---- 4. Overlap protection: same villa/date as approved manual booking → 409 ----
const r4 = await invoke('create_manual_reservation', manualPayload({
  arrival_date: futureDate(40),
  email: `manual-smoke3-${ts}@example.com`,
}), ADMIN_JWT)
smokeEmails.push(`manual-smoke3-${ts}@example.com`)
check('conflict with existing reservation rejected 409', r4.status === 409 && r4.body?.code === 'DATE_UNAVAILABLE', `status=${r4.status} code=${r4.body?.code}`)

// ---- 5. Security: unauthenticated and non-admin requests rejected ----
const r5a = await invoke('create_manual_reservation', manualPayload({ arrival_date: futureDate(43) }), 'anon-placeholder-token')
check('unauthenticated request rejected 401', r5a.status === 401, `status=${r5a.status}`)

const signUp = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
  method: 'POST',
  headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: `manual-nonadmin-${ts}@example.com`, password: `NonAdmin-${ts}!a` }),
})
const signUpBody = await signUp.json().catch(() => null)
const NONADMIN_JWT = signUpBody?.access_token ?? ''
if (NONADMIN_JWT) {
  smokeEmails.push(`manual-nonadmin-${ts}@example.com`)
  const r5b = await invoke('create_manual_reservation', manualPayload({ arrival_date: futureDate(43) }), NONADMIN_JWT)
  check('non-admin authenticated request rejected 401', r5b.status === 401, `status=${r5b.status}`)
} else {
  skipCheck('non-admin authenticated request rejected (signup unconfirmed — no session returned)')
}

// ---- 6. Different villa (krib-2) ----
const r6 = await invoke('create_manual_reservation', manualPayload({
  villa_id: 'krib-2',
  arrival_date: futureDate(40),
  email: `manual-smoke4-${ts}@example.com`,
}), ADMIN_JWT)
const res6 = r6.body?.reservation
if (res6?.id) createdReservationIds.push(res6.id)
smokeEmails.push(`manual-smoke4-${ts}@example.com`)
check('different villa booking 201', r6.status === 201, `status=${r6.status}`)
check('different villa guest_count = 3', res6?.guest_count === 3, `guest_count=${res6?.guest_count}`)

// ---- 7. Pricing: party ON vs OFF (KRiB 1) ----
const r7a = await invoke('create_manual_reservation', manualPayload({
  arrival_date: futureDate(44),
  adults: 25,
  children: 0,
  is_party: true,
  email: `manual-smoke5-${ts}@example.com`,
}), ADMIN_JWT)
const res7a = r7a.body?.reservation
if (res7a?.id) createdReservationIds.push(res7a.id)
smokeEmails.push(`manual-smoke5-${ts}@example.com`)
check('party ON 201, guest_count 25', r7a.status === 201 && res7a?.guest_count === 25, `status=${r7a.status} guest_count=${res7a?.guest_count}`)
check('party ON: party_fee 5000, additional fee 0', Number(res7a?.party_fee) === 5000 && Number(res7a?.additional_guest_fee) === 0, `party=${res7a?.party_fee} additional=${res7a?.additional_guest_fee}`)

const r7b = await invoke('create_manual_reservation', manualPayload({
  arrival_date: futureDate(45),
  adults: 25,
  children: 0,
  is_party: false,
  email: `manual-smoke6-${ts}@example.com`,
}), ADMIN_JWT)
const res7b = r7b.body?.reservation
if (res7b?.id) createdReservationIds.push(res7b.id)
smokeEmails.push(`manual-smoke6-${ts}@example.com`)
check('party OFF 201, guest_count 25', r7b.status === 201 && res7b?.guest_count === 25, `status=${r7b.status} guest_count=${res7b?.guest_count}`)
check('party OFF: additional fee (25-20)*200=1000, party fee 0', Number(res7b?.additional_guest_fee) === 1000 && Number(res7b?.party_fee) === 0, `additional=${res7b?.additional_guest_fee} party=${res7b?.party_fee}`)

// ---- 8. Regression: public create_reservation still creates pending with correct guest_count ----
const pub = await invoke('create_reservation', {
  villa_id: 'krib-1',
  arrival_datetime: new Date(new Date(futureDate(46) + 'T00:00:00Z').getTime() + 14 * 3600000).toISOString(),
  full_name: `Public Smoke ${ts}`,
  email: `manual-pub-${ts}@example.com`,
  phone: '+639171110002',
  adults: 2,
  children: 1,
  infants: 2,
  pets: 1,
  is_party: false,
  special_requests: 'public regression',
  terms_accepted: true,
  privacy_accepted: true,
})
const pubRes = pub.body?.reservation
if (pubRes?.id) createdReservationIds.push(pubRes.id)
smokeEmails.push(`manual-pub-${ts}@example.com`)
check('public create_reservation 200', pub.status === 200, `status=${pub.status}`)
check('public reservation status = pending', pubRes?.status === 'pending', `status=${pubRes?.status}`)
check('public guest_count = adults + children (3)', pubRes?.guest_count === 3, `guest_count=${pubRes?.guest_count}`)

// ---- Cleanup ----
for (const id of createdReservationIds) {
  await rest('DELETE', '/rest/v1/sms_logs?reservation_id=eq.' + id, ADMIN_JWT)
  await rest('DELETE', '/rest/v1/audit_logs?entity_id=eq.' + id, ADMIN_JWT)
  await rest('DELETE', '/rest/v1/reservations?id=eq.' + id, ADMIN_JWT)
}
const guestRows = []
for (const email of smokeEmails) {
  const g = await rest('GET', `/rest/v1/guests?select=id&email=eq.${encodeURIComponent(email)}`, ADMIN_JWT)
  guestRows.push(...arr(g.body).map((x) => x.id))
}
for (const id of guestRows) await rest('DELETE', '/rest/v1/guests?id=eq.' + id, ADMIN_JWT)
console.log(`CLEANUP removed ${createdReservationIds.length} reservation(s), ${guestRows.length} guest(s)`)

console.log(`\nRESULT  pass=${pass} fail=${fail}${skip ? ` skip=${skip}` : ''}`)
process.exit(fail > 0 ? 1 : 0)