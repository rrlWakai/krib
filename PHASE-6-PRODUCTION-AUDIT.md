# PHASE-6-PRODUCTION-AUDIT

**Scope:** Full read-only audit of the KRiB Beverly Place reservation system ahead of Phase 6 hardening, deployment, and final readiness verification.
**Method:** Repository source review (frontend + edge functions + migrations), live-dashboard cross-checks, secret scan, and comparison against the locked business rules.
**Status:** ✅ **FINAL — all findings fixed and re-verified** (P1 security fixes deployed; 44/44 smoke + 16/16 E2E green).

---

## 1. Locked business rules vs. implementation

| Locked rule | Status | Evidence |
|---|---|---|
| 21-hour stay, checkout = arrival + 21h | ✅ DB-enforced | `20260807000001` `trg_reservations_stay_duration` sets `checkout_datetime := arrival_datetime + interval '21 hours'`; edge fn computes the same value; client never sends checkout (only `arrival_datetime`). |
| 5 statuses: pending/approved/declined/cancelled/completed | ✅ | `20260731000001` enum `reservation_status`; transition trigger `enforce_reservation_status_transition` (pending→{approved,declined,cancelled}, approved→{completed,cancelled}, else none). |
| DB is source of truth (constraints, overlap, triggers) | ✅ | GiST exclusion `no_overlapping_bookings` (tstzrange, WHERE status IN pending/approved) in `20260806000001`; capacity trigger `enforce_reservation_capacity` against `villas.max_guests`; insert-side invariant `enforce_reservation_insert_rules` (start pending, arrival in future). |
| No SaaS / no multi-tenant | ✅ | Single-tenant app. No SaaS plumbing found. |
| No gallery management | ✅ | `gallery_images` is read-only marketing; no admin gallery CRUD page found. |
| No payments | ✅ | No payment integration; reservations are requests subject to owner approval (per settings `terms_conditions`). |
| No rewards / coupons / CMS | ⚠️ | No implementation, but a dead **Discounts** stub page + route + sidebar item exists (banned surface). See Finding P2-1. |
| SMS contract: exactly 4 events (owner-on-create, guest-on-approve, guest-on-decline, guest-on-cancel) | ⚠️ | Auto path in `_shared/sms.ts` implements exactly the 4 events. However the **manual** `send_sms` function still accepts `type: 'checkout'` + a freeform `message`. See Finding P1-2. |
| Villa ops data (base_price, max_guests, is_active) from live DB | ✅ | Guest quote uses live `base_price`/`max_guests` (`VillaDetailPage.tsx`), admin Villas page edits live rows. Static `src/lib/data.ts` is marketing-only and not used for the quote total. |
| Party fee is an operational setting, not a hardcode | ❌ | Guest flow hardcodes `5000` / `'₱5,000'` in 6 places while `settings.business.party_fee` is the live source of truth. See Finding P1-1. |

## 2. Findings

### P1-1 — Party fee hardcoded at ₱5,000 in the guest flow; DB `settings.business.party_fee` ignored

**Severity:** P1 (production) — violates "no static value silently overrides the database" and the Phase 5 mandate to remove hardcoded business config.

**Root cause:** The guest booking flow computes the party fee from a literal instead of the live `settings.business.party_fee` value.

**Evidence:**
- `src/components/ui/BookingExperience.tsx:254` — `const partyFee = partyFeeActive ? 5000 : 0;`
- `src/components/ui/BookingExperience.tsx:255` — `const total = basePrice + partyFee;`
- `src/components/ui/BookingExperience.tsx:372` — payload `partyFee: partyFeeActive ? 5000 : 0,`
- `src/components/ui/BookingExperience.tsx:491` and `:1555` — `formatPrice(5000)`
- `src/components/ui/StickyReservationCard.tsx:43` — `partyFeeActive ? basePrice + 5000 : basePrice`
- `src/components/ui/StickyReservationCard.tsx:155` — `formatPrice(5000)`
- `src/components/ui/StickyBookingBar.tsx:32` — `partyFeeActive ? basePrice + 5000 : basePrice`
- `src/pages/VillaDetailPage.tsx:789` — `partyFeeLabel: '₱5,000'`

**Source of truth:** `settings.business.party_fee` (seeded `5000` in `20260807000002`, editable in Control Center `src/admin/pages/Settings.tsx:166`, readable on the guest site via `useSiteSettings`/`fetchSiteSettings`).

**Impact:** If the owner changes the party fee in the Control Center, the guest-facing quote AND the `partyFee` value stored on each reservation still show/save ₱5,000. The admin UI and the guest site can disagree with the database.

**Required fix:** Derive the party fee from `settings.business.party_fee` in `VillaDetailPage` (via the existing `useSiteSettings` hook) and pass it through `BookingExperience` / `StickyReservationCard` / `StickyBookingBar`; keep a defensive fallback of `5000` only while settings load. Remove the literal `5000` / `'₱5,000'` values.

### P1-2 — `send_sms` (manual resend) still supports banned types and freeform message

**Severity:** P1 (production) — the locked SMS contract allows exactly 4 events; a check-out reminder and freeform messaging are out of contract.

**Root cause:** The `send_sms` edge function predates the locked contract and was not tightened.

**Evidence:**
- `supabase/functions/send_sms/index.ts:8-12` — `type?: 'confirmation' | 'checkout' | 'cancellation'` and `message?: string`
- `supabase/functions/send_sms/index.ts:42-43` — checkout template ("This is a reminder that your stay … is coming to an end")
- `supabase/functions/send_sms/index.ts:71-76` — validation explicitly accepts `checkout` and `message`
- Admin UI only ever sends `{ type: 'confirmation' }` (`src/admin/pages/ReservationDetail.tsx:80`, `src/admin/components/calendar/ReservationDrawer.tsx:48`)

**Impact:** Any admin (or a compromised admin token) could send a check-out reminder or an arbitrary text message — expanding the contract the product owner locked. Not currently triggered by the UI, but the capability exists.

**Required fix:** Restrict `type` to `'confirmation' | 'cancellation'` and remove the freeform `message` body path (the 4 contract messages are already the only auto templates; the manual resend should only be able to re-send the confirmation or cancellation message). Delete the checkout template.

### P1-3 — Reservation lookup leaks PII: email-only and code-only lookups return full guest data with no proof of ownership

**Severity:** P1 (security / privacy).

**Root cause:** `lookup_reservation` returns complete reservation + guest data (full name, phone, dates, villa) without requiring the guest to prove they own the reservation.

**Evidence:**
- `supabase/functions/lookup_reservation/index.ts:95-107` — an email-only request returns **all reservations under that email** with no verification.
- `supabase/functions/lookup_reservation/index.ts:41-63` — a code-only request (no email) returns the reservation + guest phone. The email check is skipped when `email` is absent.
- `src/components/my-reservation/LookupForm.tsx:160-169` — the UI explicitly offers "Look up by email" ("We'll find all reservations under this email.").
- `src/pages/MyReservationPage.tsx:75-95` — code-only and email-only lookup branches both reachable from the form.
- The reference code `KRB-XXXXXXXX` is printed on screen and sent via SMS; anyone who sees it (or knows a guest's email) can retrieve that guest's phone number and booking history.

**Impact:** Any person who knows or guesses an email address can view another guest's reservation history including **phone number**, arrival/checkout dates, and villa. This is PII exposure on the production guest site.

**Required fix:** Require the reservation identifier **and** the matching email together (or an email proof) before returning any reservation data:
- Remove the email-only list branch from `lookup_reservation` (return 400 or 404).
- Require `email` whenever `reference_code` or `id` is used; verify it matches the reservation before returning (the check already exists at `:53-58`/`:82-87` — make it mandatory, not conditional).
- Update `LookupForm`/`MyReservationPage` so both fields are always submitted together.

### P2-1 — Dead "Discounts" stub is routed and linked in the admin sidebar

**Severity:** P2 (banned feature surface).

**Evidence:**
- `src/App.tsx:170` — `<Route path="discounts" element={<AdminDiscounts />} />`
- `src/admin/pages/Discounts.tsx:17-22` — "Discounts are not available yet. There is no discounts table in the database yet…"
- Sidebar nav item (Control Center).

**Impact:** Coupons/discounts are an explicitly out-of-scope feature. A routed stub that advertises a nonexistent module is unprofessional production surface.

**Required fix:** Remove the route and sidebar item (optionally delete the file).

### P2-2 — `AvailabilityCalendar` is a permanent placeholder promising a nonexistent sync

**Severity:** P2 (clearly defective UI / fake production value).

**Evidence:**
- `src/components/ui/AvailabilityCalendar.tsx:12-14` — "Availability calendar will appear once dates are synced from the booking system." with a fake `available / limited / booked` legend.
- Rendered at `src/pages/VillaDetailPage.tsx:484`.

**Impact:** The page ships a dead section that promises a feature that will never exist under the locked scope. Real availability is enforced server-side at submit (409 on overlap) and reflected in the booking modal.

**Required fix:** Remove the placeholder section from `VillaDetailPage` (and the component if unused elsewhere). Do not build a calendar feature — out of scope.

### P2-3 — GuestSelector pets limit label contradicts the enforced limit

**Severity:** P2 (cosmetic defect; minor).

**Evidence:** `src/components/ui/GuestSelector.tsx:25` — pets `description: 'Maximum 2'` but `max: 10`.

**Impact:** The selector allows up to 10 pets while telling the guest the maximum is 2. (Note: house rules in settings state pets are not allowed inside the villa — product content question, out of audit scope.)

**Required fix:** Align the description with the enforced limit (or the limit with the description) per owner preference.

### P3-1 — `vite-env.d.ts` declares server secrets in the client env type

**Severity:** P3 (hygiene; no secret values exposed).

**Evidence:** `src/vite-env.d.ts` declares `SUPABASE_SERVICE_ROLE_KEY`, `SEMAPHORE_API_KEY`, `SEMAPHORE_SENDER_NAME` in `ImportMetaEnv`. No code reads them; they are server-only env vars.

**Impact:** Misleading surface; a future contributor could `import.meta.env.SEMAPHORE_API_KEY` and ship the key to the client bundle. Secret scan found no actual secret values anywhere in the repo. `.env` is gitignored; `.env.example` contains placeholders only.

**Required fix:** Remove the three server-only declarations from `vite-env.d.ts`.

### P3-2 — Decline reason not collected from the admin UI

**Severity:** P3 (informational).

**Evidence:** `src/admin/pages/ReservationDetail.tsx:65` — `declineReservation(reservationId, '')`. The edge function (`supabase/functions/decline_reservation/index.ts:68`) stores the reason in the audit log; the UI never provides one, and the decline SMS (`guestDeclinedMessage`) never includes it.

**Impact:** No contract violation; the reason column/audit field is effectively always empty. Optional improvement (a reason modal) is a feature add — out of scope.

## 3. Verified-clean areas (no action)

- **Secret handling:** no `VITE_`-prefixed server secrets; no hardcoded keys/tokens/passwords in `src/` or `supabase/`. `.env` gitignored; `.env.example` tracked with placeholders only.
- **Client env:** `src/config/env.ts` (zod) validates only `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `VITE_APP_TITLE`; `src/lib/supabase/client.ts` is anon-only with a safe `NullClient` fallback.
- **Admin auth:** `AuthGuard.tsx` + `AuthContext.tsx` gate every `/admin` route; non-admin users are bounced to `/admin/login?denied=1`. Edge functions use `getAdminUser` (Bearer JWT → `auth.getUser()` → `admin_users` row `is_active=true`).
- **Service role:** `_shared/adminClient.ts` reads `SUPABASE_SERVICE_ROLE_KEY` from `Deno.env`; service-role access exists only inside edge functions.
- **RLS:** settings readable by public; every other table admin-only via `is_admin()`; no public access to `reservations`/`guests`/`sms_logs`/`audit_logs` — guest flows run through edge functions. No guest→admin data path.
- **SMS auto events:** `_shared/sms.ts` implements exactly owner-on-create (`ownerNewReservationMessage`), guest-on-approve (`guestApprovedMessage`), guest-on-decline (`guestDeclinedMessage`), guest-on-cancel (`guestCancelledMessage`) + `ownerGuestCancelledMessage` for the owner when a guest cancels.
- **Overlap / duration / capacity:** all DB-enforced (see rules table). Reference codes are server-generated `KRB-XXXXXXXX` with a format CHECK.
- **Guest flow:** submit uses `arrival_datetime` only; success screen shows the real server-generated reference; lookup uses `lookup_reservation` with `reference_code` + `email` and handles 404/401.
- **Auth config:** `supabase/config.toml` — `enable_signup = false`, anonymous sign-ins disabled, 8-char password with lower/upper/digit, sessions `timebox 24h` / `inactivity_timeout 8h`, MFA enrollment disabled. No public signup path.
- **Admin pages:** all pages use real REST/edge calls and real data (verified `Reservations`, `ReservationDetail`, `Dashboard`, `Calendar`, `Guests`, `Villas`, `Reports`, `SmsActivity`, `AuditLogs`, `Settings`). No fake/mock data, no `setTimeout` fake saves.
- **Live DB (Step 2):** all 21 migrations applied on remote in order — zero migration drift. PostgREST read-only checks: `settings` (public) row 1 exists with `business.party_fee = 5000`; `villas` = krib-1 (₱25,000 / 20), krib-2 (₱30,000 / 30), both active; `villa_amenities`/`gallery_images` are empty (marketing is static). Anon SELECT returns empty (blocked) on `reservations`, `guests`, `sms_logs`, `audit_logs`, `admin_users` — RLS verified working live.

## 4. Fix status

| Finding | Fix applied | Verified |
|---|---|---|
| P1-1 Party fee hardcoded ₱5,000 | Guest flow reads `settings.business.party_fee` via `useSiteSettings`; `partyFeeAmount` prop threaded through `BookingExperience` / `StickyReservationCard` / `StickyBookingBar`; literal `5000`/`'₱5,000'` removed | Build + visual/type check; live settings = 5000 |
| P1-2 `send_sms` freeform message + `checkout` type | Type restricted to `confirmation \| cancellation`; freeform `message` removed; validation returns 400 for anything else | E2E: checkout→400, freeform→400, no type→400, confirmation→200 (live) |
| P1-3 Lookup PII (email-only / code-only) | `lookup_reservation` now requires identifier **and** matching email; email-only branch removed; `LookupForm` + `MyReservationPage` always send both | E2E: email-only→400, code-only→400, wrong email→401, correct→200 (live) |
| P2-1 Discounts stub | Route + lazy import + `NAV_ITEMS` entry + `Tag` icon removed; file deleted | Build clean |
| P2-2 AvailabilityCalendar placeholder | Section + component removed from `VillaDetailPage`; file deleted | Build clean |
| P2-3 GuestSelector pets label | `max` aligned to advertised "Maximum 2" | Build clean |
| P3-1 `vite-env.d.ts` server-secret declarations | Removed the three server-only `ImportMetaEnv` entries | Build clean |

Edge functions `lookup_reservation` and `send_sms` were re-deployed to the live project (`vwvorheeurkehhrbkxun`) with the fixes.

## 5. Status after fixes

- P1/P2/P3 fixes applied; `tsc -b`, `npm run build`, `npm run lint` green.
- Regression: `node scripts/smoke-phase5.mjs` = **44/44**; Phase-5 E2E = **16/16**.
- Edge functions redeployed to live project; verified live (400/401/200 paths above).
- **Frontend deploy is the only remaining release step** (backend fully live). See `PRODUCTION-READINESS-REPORT.md` for the final verdict and owner actions.
