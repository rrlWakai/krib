# KRiB Beverly Place Reservation System — Final Production-Readiness Audit

**Audit date:** 2026-09-10  
**Auditor role:** Senior Full-Stack / Security / QA  
**Repository:** `C:\Users\zeref\Downloads\stitch_krib_beverly_place_digital_experience`  
**Branch:** `main` (clean, tracking `origin/main`)

---

## Scope & Environment Confirmation

| Item | Value |
|---|---|
| Repository path | `C:\Users\zeref\Downloads\stitch_krib_beverly_place_digital_experience` |
| Git branch | `main` |
| Supabase project ref | `vwvorheeurkehhrbkxun` |
| Supabase host | `vwvorheeurkehhrbkxun.supabase.co` |
| Environment classification | **Production** (single linked project; `supabase/config.toml` `site_url` = `https://kribbeverlyplace.vercel.app`; no separate staging project found) |
| Git commits / pushes | **None made during this audit** |
| Database writes | Limited to explicitly tagged audit test reservation (created and deleted in same session); smoke script also created/cleaned ephemeral `p5-smoke-*` test data |

**Audit constraint honored:** No real SMS delivery was intentionally attempted outside existing automated flows. Smoke and audit tests invoked the live Semaphore integration as implemented; all observed provider responses were **HTTP 403 Forbidden** (logged, not delivered).

---

## 1. Overall Verdict

# 🔴 NOT READY FOR DEPLOYMENT

The application backend, reservation lifecycle, admin APIs, RLS, and production build are in strong shape. **SMS delivery is completely non-functional in the live environment** — every recent `sms_logs` record shows `failed` with `Semaphore returned HTTP 403: Forbidden`. Until Semaphore credentials/account access are corrected and at least one test message is accepted by the provider, the system cannot safely serve real guests with the approved notification workflow.

---

## 2. Semaphore SMS Result

### **PARTIAL**

| Check | Result |
|---|---|
| Server-side credential storage (`Deno.env.get('SEMAPHORE_API_KEY')`) | ✅ PASS — never in frontend bundle |
| Shared SMS utility (`supabase/functions/_shared/sms.ts`) | ✅ PASS — phone normalization, templates, error sanitization, `sms_logs` persistence |
| Edge Function triggers wired correctly | ✅ PASS — see trigger matrix below |
| Manual admin SMS (`send_sms`) | ✅ PASS — admin-auth required |
| `sms_logs` persistence on failure | ✅ PASS — failures recorded with sanitized error |
| Admin SMS Activity page | ✅ PASS — reads real `sms_logs`, redacts errors in UI |
| **Actual Semaphore delivery** | ❌ **FAIL** — 11/11 recent logs `failed`; provider error: `HTTP 403: Forbidden` |
| Delivery verification | ❌ **Not verified** — production environment; provider rejects all requests |

### SMS Trigger Matrix (code + live smoke evidence)

| Event | Recipient | Edge Function | Verified |
|---|---|---|---|
| New reservation | Owner/admin mobile | `create_reservation` → `sendSms` | Log written; status `failed` (403) |
| Approved | Guest phone | `approve_reservation` → `sendSms` | Log written; status `failed` (403) |
| Declined | Guest phone | `decline_reservation` → `sendSms` | Log written; status `failed` (403) |
| Cancelled (admin) | Guest phone | `cancel_reservation` → `notifyGuestCancelled` | Log written; status `failed` (403) |
| Cancelled (guest) | Guest + owner | `cancel_reservation` → guest + owner SMS | Log written; status `failed` (403) |

**Distinction:** SMS integration is **technically functional** (request construction, auth, logging, best-effort non-blocking behavior). **Actual SMS delivery was not verified** because the live Semaphore account/API key returns **HTTP 403 Forbidden** on every attempt in the production-linked project.

### Technical notes (no secrets exposed)

- API URL: `https://api.semaphore.co/api/v4/messages` (default)
- Request format: `application/x-www-form-urlencoded` with `apikey`, `number`, `message`, optional `sendername`
- Failures do not block reservation mutations (best-effort pattern confirmed)
- `SEMAPHORE_API_KEY` is set locally and configured for Edge Functions; the 403 indicates an **account/key permission issue**, not missing env wiring in code

---

## 3. Critical Issues Only

1. **Semaphore SMS delivery fails 100% (HTTP 403 Forbidden)**  
   - Evidence: 11 recent `sms_logs` rows — `sent: 0`, `failed: 11`, `queued: 0`  
   - Sample error (redacted): `Semaphore returned HTTP 403: Forbidden`  
   - Impact: Owner receives no new-reservation alerts; guests receive no approve/decline/cancel SMS. Core business workflow is broken for notifications.

2. **Production-only environment — no staging isolation**  
   - All live tests ran against project `vwvorheeurkehhrbkxun` (production).  
   - Impact: Cannot safely validate paid SMS delivery or destructive flows without touching production data.

---

## 4. Minor Issues Only

1. **Owner mobile number publicly readable** — `settings` table has public SELECT policy; `sms.owner_mobile` is exposed to unauthenticated clients (masked: `+63 968-***0748`). Consider restricting SMS config to admin-only if not intentionally public.

2. **Hardcoded admin credentials in `scripts/smoke-phase5.mjs`** — plaintext test admin email/password committed to git history (commit `69c1dcd`). Not a production secret leak of service keys, but a credential hygiene issue; rotate if those credentials are still active.

3. **Smoke test stale fixture** — expects reservation `KRB-312AE96` which no longer exists (1/42 checks fail); test assumption drift, not app regression.

4. **CORS `Access-Control-Allow-Origin: *`** on Edge Functions — acceptable for public functions but broad; review before hardening.

5. **`npm audit` — 3 high, 1 moderate** (dev/build toolchain: `browserslist`, `nanoid`, `sharp`; moderate `baseline-browser-mapping`). Not runtime app dependencies; still worth scheduled update.

6. **Manual "Send Confirmation SMS" button** on approved reservations (`ReservationDetail` → `send_sms`) — exists beyond the four automatic triggers; already in codebase (not introduced by audit).

7. **Guest-initiated cancel sends owner SMS** — additional notification beyond the four listed audit checkpoints; pre-existing in `cancel_reservation`.

8. **No automated unit/integration test suite** — only `scripts/smoke-phase5.mjs` E2E script; no `vitest`/`jest` tests in repo.

9. **Admin UI browser testing not performed** — admin pages verified via code review + live API; visual/interaction regression not executed in browser this session.

---

## 5. Tests Performed and Results

### Static analysis & build

| Command | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | ✅ PASS |
| `npm run build` (`tsc -b && vite build`) | ✅ PASS — no TS errors, production bundle generated |
| `npm audit --audit-level=high` | ⚠️ 3 high (dev deps), 1 moderate |
| Production bundle secret scan (`dist/`) | ✅ PASS — no `service_role`, `SEMAPHORE`, or server keys in output |
| Git history secret scan (`SEMAPHORE`, JWT patterns in `.env`) | ✅ PASS — no committed secret values found; only code references like `params.set('apikey', apiToken)` |

### Live API tests (production project)

| Test | Result |
|---|---|
| Health endpoint `/functions/v1/health` | ✅ `status: ok`, `database: connected` |
| Anon RLS: reservations empty | ✅ PASS |
| Anon RLS: sms_logs empty | ✅ PASS |
| Edge auth: `approve_reservation` without JWT → 401 | ✅ PASS |
| Edge auth: `delete_reservation` without JWT → 401 | ✅ PASS |
| Edge auth: `send_sms` without JWT → 401 | ✅ PASS |
| `create_reservation` empty body → 400 | ✅ PASS |
| `availability?villa=krib-1` → 200 | ✅ PASS |
| `lookup_reservation` unknown → 404 | ✅ PASS |

### Smoke E2E (`node scripts/smoke-phase5.mjs`)

**41 passed, 1 failed**

Passed (highlights):
- Admin sign-in, reservation create/approve/complete/decline/cancel lifecycle
- 21-hour checkout server enforcement
- Audit log writes for create/approve/complete/decline/cancel
- Guest cancel email verification (401 wrong email, 403 approved cancel blocked)
- Admin RLS reads (reservations, villas, guests, sms_logs, audit_logs)
- Anon reservation read blocked
- SMS **logs** created on create/approve (best-effort; all `failed` at provider)

Failed:
- `existing test reservation KRB-312AE96 present` — stale test fixture (reservation not in DB)

### Delete reservation regression (tagged audit test)

Created reservation with:
- Guest name: `TEST_AUDIT_DO_NOT_USE`
- Email: `test-audit-do-not-use@example.com`
- Phone: `+639000000001`
- Special requests: `AUDIT TEST - DELETE ME`
- Villa: `krib-2`

| Step | Result |
|---|---|
| Create tagged reservation | ✅ 200 |
| Admin visibility | ✅ |
| `delete_reservation` (admin auth) | ✅ 200, `success: true` |
| DB record removed | ✅ |
| Audit log `delete` action | ✅ |
| Orphan guest cleaned up | ✅ |

**7/7 PASS** — only the tagged test reservation was deleted.

### SMS delivery test

| Test | Result |
|---|---|
| Send test SMS to verify delivery | ⛔ **Not performed as PASS** — production environment; all existing attempts fail with 403 |
| Verify Semaphore accepts API request | ❌ FAIL — provider returns 403 on all 11 recent logs |

---

## 6. Changes Made During Audit

| Change | Type |
|---|---|
| `AUDIT_REPORT.md` | Created (this file) |
| Tagged test reservation create + delete | Live DB write (audit hygiene test only; cleaned up) |
| Smoke script execution | Live DB writes (ephemeral `p5-smoke-*` data; script cleans up) |

**No application code, migrations, RLS, or configuration files were modified.**

---

## 7. Deployment Blockers

1. **Semaphore SMS returns HTTP 403 on every send** — must fix API key, account status, sender-name registration, or Semaphore account permissions; then verify at least one message reaches `sent` or `queued` in `sms_logs`.

2. **End-to-end notification workflow unverified** — owner new-reservation alert and guest approve/decline/cancel SMS cannot be confirmed until blocker #1 is resolved.

---

## 8. Exact Next Action Required

1. **Fix Semaphore account access (owner action, highest priority)**  
   - Log into [Semaphore dashboard](https://semaphore.co)  
   - Verify API key is active, not revoked, and matches the key configured in Supabase Edge Function secrets (`SEMAPHORE_API_KEY`)  
   - Confirm sender name `KRiB` (or configured `SEMAPHORE_SENDER_NAME`) is approved  
   - Confirm account has credits and is not restricted  
   - Re-test with a single tagged test reservation in a maintenance window; confirm `sms_logs.status` is `sent` or `queued` (not `failed`)

2. **After SMS fix — re-run verification**  
   ```bash
   node scripts/smoke-phase5.mjs
   ```  
   Confirm owner SMS on create and guest SMS on approve show non-`failed` status.

3. **Deploy frontend to Vercel** (after SMS fix)  
   - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel  
   - Ensure Supabase secrets include `SUPABASE_SERVICE_ROLE_KEY`, `SEMAPHORE_API_KEY`, `SEMAPHORE_SENDER_NAME`

4. **Security hygiene (non-blocking but recommended)**  
   - Remove or externalize admin credentials from `scripts/smoke-phase5.mjs`  
   - Rotate smoke-test admin password if still in use  
   - Update dev dependencies flagged by `npm audit`

---

## Category Scorecard

| Category | Score |
|---|---|
| SEMAPHORE SMS | **PARTIAL** |
| SUPABASE | **PASS** |
| AUTHENTICATION | **PARTIAL** |
| RLS / SECURITY | **PARTIAL** |
| RESERVATIONS | **PASS** |
| CALENDAR | **PASS** |
| ADMIN CONTROL CENTER | **PARTIAL** |
| GUEST BOOKING UX | **PASS** |
| DELETE RESERVATION | **PASS** |
| BUILD | **PASS** |
| TESTS | **PARTIAL** |
| PRODUCTION CONFIG | **PASS** |

### Category notes

**SUPABASE — PASS:** Health check connected; 22 migrations present; RLS enabled on all application tables; `is_admin()` SECURITY DEFINER helper; Edge Functions use service role server-side only.

**AUTHENTICATION — PARTIAL:** `AuthGuard` enforces user + active admin profile; Edge Functions use `getAdminUser()` with JWT + `admin_users.is_active`; unauthenticated edge calls return 401. Inactive-admin and authenticated-non-admin browser paths not live-tested this session (code review only).

**RLS / SECURITY — PARTIAL:** Anon cannot read reservations/guests/sms_logs; service role not in frontend bundle; `src/lib/supabase/admin.ts` is a safe stub returning `null`. Minor: public `settings` exposes owner mobile; smoke script credentials in git; CORS wildcard.

**RESERVATIONS — PASS:** Full lifecycle verified live (create → approve → complete → decline → guest cancel → admin cancel rules); 21-hour stay enforced server-side; overlap/conflict handling confirmed; audit logging present.

**CALENDAR — PASS:** Regression by code review — uses real reservation data via admin services, Asia/Manila timezone helpers, 21-hour stay constants; no mock availability generators found in `src/`.

**ADMIN CONTROL CENTER — PARTIAL:** Dashboard, Reservations, Reports, SMS Activity, Settings, etc. all fetch from Supabase via `useAdminQuery` / edge mutations — no mock data or `setTimeout` simulations found. Browser UI session not manually exercised.

**GUEST BOOKING UX — PASS:** `BookingExperience` calls `create_reservation` edge function; availability from live `/functions/v1/availability`; KRiB 1 fixed 2:00 PM check-in enforced in UI + server; privacy/terms consent validated.

**TESTS — PARTIAL:** Smoke 41/42; no unit test framework; one stale fixture failure.

**PRODUCTION CONFIG — PASS:** `.env.example` matches required vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, server-side keys documented); `src/config/env.ts` validates frontend env at startup; `vercel.json` configured for SPA; no localhost URLs in production source.

---

*End of audit report.*
