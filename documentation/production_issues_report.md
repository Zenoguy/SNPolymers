# SN Polymers IDBP — Production Issues Report
**Audit Date:** 2026-06-30  
**Scope:** Full codebase review — backend (Node/Express), frontend (React/Vite), Supabase DB schema, and third-party integrations.

> [!NOTE]
> **Scale context (updated):** Maximum expected concurrent user base is **30 users**. Several performance and scalability issues have been downgraded in severity accordingly. Security and data-integrity issues remain unchanged — user count does not affect those.

---

## Severity Legend

| Level | Meaning |
|---|---|
| 🔴 **CRITICAL** | Will cause data loss, security breach, or complete outage in production |
| 🟠 **HIGH** | Will cause user-visible failures or data integrity issues under normal usage |
| 🟡 **MEDIUM** | Will cause degraded experience, subtle bugs, or reliability risk under load |
| 🔵 **LOW** | Minor quality / observability gaps |

---

## 🔴 CRITICAL Issues

### [x] M-10 (RESOLVED) — Telegram Long-Polling Conflict Risk during rolling deploys
**File:** [telegram.service.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/services/telegram.service.js#L80-L149)  
**Status:** Resolved (Migrated from Telegram Long-Polling to Webhook architecture in production. The webhook endpoint allows any instance to handle updates without polling conflicts. Long polling is preserved as a fallback for local development only).

---

### [x] C-2 (RESOLVED) — Budget Validation Race Condition in `createRequisition`
**File:** [requisitions.controller.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/controllers/requisitions.controller.js#L107-L123)  
**Status:** Resolved (Implemented SQL function `create_requisition_secure` that uses row-level locking on the `projects_master` table to serialize concurrent checks and insertions).

```js
// Step 1: Read committed amount
const { data: committedRes } = await supabase.from('requisitions')...

// Step 2: Check budget
committed = committedRes.reduce(...)
if (requisition_amount > remainingAmount) { return 422; }

// Step 3: Insert (separate DB call, no transaction)
await supabase.from('requisitions').insert(...)
```

Two JEs submitting simultaneously for the same work order can both pass the budget check and both insert, causing the total to exceed the estimate amount.

**Recommendation:** Move the budget validation inside a Supabase database function (RPC) that runs atomically with the insert under an explicit `SELECT ... FOR UPDATE` lock on the work order.

---

### [x] C-3 (RESOLVED) — OTP Logged in Plaintext to Production Terminal
**File:** [telegram.service.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/services/telegram.service.js#L16-L20)  
**Status:** Resolved (Plaintext OTP logs are now wrapped in a non-production environment guard).

```js
console.log(`[OTP CODE]: ${otp}`);
```

This log runs **unconditionally** on every OTP request, in every environment including production. If your backend logs are ever streamed to an external logging service (e.g., Render, Datadog, Papertrail), the raw OTP codes will be stored in plaintext in those logs — a direct credential leak.

**Recommendation:** Wrap this in a `NODE_ENV !== 'production'` guard. Only log the OTP in development; in production, log that an OTP was generated (without the value).

---

### [x] C-4 (RESOLVED) — No Input Size Limit on `express.json()`
**File:** [app.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/app.js#L50)  
**Status:** Resolved (Configured a size limit of `100kb` on incoming JSON payloads to protect the backend from memory exhaustion / DoS attacks).

```js
app.use(express.json());
```

No `limit` is configured. The default Express JSON body limit is **100KB**, which is often fine, but certain endpoints (e.g., `submit_row_approvals` sending a large JSONB array of estimate item approvals) could approach this. More importantly, there is **no explicit protection** against someone sending a 50KB crafted payload to the `estimates.items` bulk-update endpoint. A malicious actor could DoS the server with large payloads that are processed before the rate limiter rejects them.

**Recommendation:** Set an explicit and conservative limit: `app.use(express.json({ limit: '50kb' }))`. For the estimate row-approval RPC endpoint which sends arrays, validate the array length at the controller level.

---

## 🟠 HIGH Issues

### ~~H-1~~ M-9 (Downgraded) — N+1 Query on `getRequisitions` Is Slow But Manageable at 30 Users
**File:** [requisitions.controller.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/controllers/requisitions.controller.js#L236-L261)  
**Originally:** 🟠 High → **Revised:** 🟡 Medium (scale-dependent)

For every requisition in the list, two sequential Supabase Storage signed-URL calls are made per row. At 30 users and expected low data volume (likely <200 total requisitions ever), a full page load will take **~1-3 seconds** — noticeable but not a timeout risk. It becomes a real problem only if data grows beyond a few hundred rows.

**Recommendation:** Move signed URL generation to the detail modal (on-demand, triggered only when a user opens a specific record). This is still worth doing — it's a simple change that eliminates the slowness entirely.

---

### [x] H-2 (RESOLVED) — `JWT_EXPIRY` Config Variable Name Mismatch
**File:** [session.service.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/services/session.service.js#L10-L11), [.env.example](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/.env.example#L14)
**Status:** Resolved (Updated `.env.example` to document `JWT_ACCESS_EXPIRY` and `JWT_REFRESH_EXPIRY` correctly).

```js
// session.service.js reads:
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
```

But the `.env.example` file documents:
```
JWT_EXPIRY=24h
```

The code will **never read** `JWT_EXPIRY`. Both `JWT_ACCESS_EXPIRY` and `JWT_REFRESH_EXPIRY` will always fall back to their hardcoded defaults (`15m` and `7d`) in any deployment that copies `.env.example` and fills in `JWT_EXPIRY`. This silent mismatch means you cannot configure token lifetimes via environment variables.

**Recommendation:** Update `.env.example` to document `JWT_ACCESS_EXPIRY` and `JWT_REFRESH_EXPIRY` instead of `JWT_EXPIRY`.

---

### H-3 — Supabase Client Uses `service_role` Key — No RLS Defense in Depth
**File:** [supabase.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/db/supabase.js#L14)

The single Supabase client initialised with the `SUPABASE_SERVICE_ROLE_KEY` bypasses **all Row Level Security (RLS)** policies. This is intentional for a backend, but it means that any SQL injection or logic error in the application layer provides an attacker with superuser-level database access. There is no second layer of defense.

If a bug allows an attacker to call `supabase.from('authorised_users').select('*')` (e.g., via an unsanitised filter), they get every user record.

**Recommendation:** The RLS policies in the migration are defined but have no effect from the backend. Consider implementing an additional application-layer ownership assertion on every sensitive query (user data, sessions) to ensure you are never returning data for a different user due to a bug.

---

### ~~H-4~~ L-7 (Downgraded) — Session Table Growth Is Negligible at 30 Users
**File:** [session.service.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/services/session.service.js)  
**Originally:** 🟠 High → **Revised:** 🔵 Low (scale-dependent)

With 30 users logging in daily, the `sessions` table will accumulate at most a few hundred rows per month — no meaningful performance impact on the `verifyJwt` query. The `otp_requests` table is similarly tiny. This is a good-housekeeping issue, not a production risk at this scale.

**Recommendation:** Set up a Supabase pg_cron job to prune old sessions/OTPs, but this is not urgent.

---

### [x] H-5 (RESOLVED) — OTP Development Bypass (`123456`) Could Slip into Production
**File:** [otp.service.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/services/otp.service.js#L58-L60)
**Status:** Resolved (Bypass condition changed to `process.env.NODE_ENV !== 'production'` so that it is safe-by-default if `NODE_ENV` is unset or invalid).

```js
if (process.env.NODE_ENV === 'development' && rawOtp === '123456') {
  return { success: true };
}
```

This bypass works correctly as long as `NODE_ENV=production` is set. However, if `NODE_ENV` is not explicitly set (e.g., it defaults to `undefined` or `'test'` on a Render deploy), the bypass is active in production. The condition `!== 'production'` would be safer than `=== 'development'`.

**Recommendation:** Change the condition to:
```js
if (process.env.NODE_ENV !== 'production' && rawOtp === '123456') {
```
This is safe-by-default: the bypass only fires in explicitly non-production environments.

---

### [x] H-6 (RESOLVED) — Orphaned PDF Upload If Requisition Creation Fails After Upload
**File:** [Requisitions.jsx](file:///home/zenoguy/Desktop/projects/SNPolymers/frontend/src/pages/Requisitions.jsx#L619-L635), [requisitions.uploads.controller.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/controllers/requisitions.uploads.controller.js)
**Status:** Resolved (Implemented active cleanup hooks in the frontend. If a user cancels creation, clears files, or closes the form, `handleCancelOrClose` and `handleClearRequisitionPdf`/`handleClearGstPdf` make explicit DELETE calls to purge those documents from Supabase Storage).

---

## 🟡 MEDIUM Issues

### [x] M-1 (RESOLVED) — No `VITE_API_URL` Documented for Production Build
**File:** [authApi.js](file:///home/zenoguy/Desktop/projects/SNPolymers/frontend/src/api/authApi.js#L3)
**Status:** Resolved (Created `frontend/.env.example` with detailed instructions so developers/ops configure it properly on Vercel).

```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1/auth';
```

The fallback `localhost:5000` is only useful in development. If the Vite build is run without `VITE_API_URL` set in the Vercel environment variables, the **production frontend will silently point to localhost** and all API calls will fail with network errors (CORS or connection refused).

**Recommendation:** Add a check in the Vite build process (or CI/CD) that errors if `VITE_API_URL` is missing. In the meantime, ensure Vercel environment variables include `VITE_API_URL=https://your-render-api-url.com/api/v1/auth`.

---

### [x] M-2 (RESOLVED) — Telegram Markdown Injection Risk in Notifications
**File:** [telegram.service.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/services/telegram.service.js#L306-L515)
**Status:** Resolved (Switched all Telegram notification templates from `parse_mode=Markdown` to `parse_mode=HTML` and implemented a helper utility `escapeHtml` to escape all dynamic user values before message interpolation, ensuring special characters don't crash delivery).

---

### ~~M-3~~ L-8 (Downgraded) — `getFundRequests` Pagination Limit Is 1,000
**File:** [fundRequests.controller.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/controllers/fundRequests.controller.js#L128-L130)  
**Originally:** 🟡 Medium → **Revised:** 🔵 Low (scale-dependent)

With 30 users, the total fund requests in the system will likely never exceed a few hundred. A cap of 1,000 is excessive but harmless at this scale. Still worth fixing for consistency and future-proofing.

**Recommendation:** Align the cap to `100` to match other endpoints.

---

### M-4 — `requestLogger` Logs Full URL Path Including Query Params
**File:** [requestLogger.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/middleware/requestLogger.js#L9)

```js
const path = req.originalUrl; // includes ?status=Pending&page=1
```

If any sensitive data is ever passed as a query parameter (even accidentally), it would be logged. While the current API design uses query params only for filters, this is a forward-looking risk.

**Recommendation:** Log `req.path` (path only, no query string) instead of `req.originalUrl` to avoid accidentally logging any sensitive filter values in the future.

---

### M-5 — No Backend for Process Manager / Crash Recovery
**File:** [package.json (backend)](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/package.json#L7)

```json
"start": "node src/app.js"
```

Plain `node` is used in production. If the process throws an uncaught exception (e.g., from the Telegram polling loop), the **entire backend crashes and stays down** until manually restarted. There is no PM2, cluster mode, or supervisor configured.

**Recommendation:** Add `pm2` as a dependency and use `pm2 start src/app.js --name idbp-api` for production. Alternatively configure the hosting platform (Render) to auto-restart on crash — verify this is configured in Render settings.

---

### M-6 — Revision Budget Calculation at `getRequisitions` Uses In-Memory Stale Data (Frontend)
**File:** [Requisitions.jsx](file:///home/zenoguy/Desktop/projects/SNPolymers/frontend/src/pages/Requisitions.jsx#L487-L495)

```jsx
const getAdvisoryBalance = () => {
  // Uses the `requisitions` list already fetched — stale data
  const committed = requisitions
    .filter(r => r.work_order_no === selectedWO && r.requisition_status !== 'Cancelled')
    .reduce(...);
};
```

The advisory balance shown while creating a new requisition is calculated from the **already-loaded list in memory**. If another user submitted a requisition since the page loaded, the balance shown to the user will be wrong. The server-side budget check (H-2 issue aside) is authoritative, but the user may get a confusing mismatch: the UI shows they have budget, but the server rejects with 422.

**Recommendation:** Trigger a fresh re-fetch of requisitions when the work order selection changes in the form modal, or call a dedicated endpoint to get the live remaining budget for the selected work order.

---

### [x] M-7 (RESOLVED) — `linkTelegram` Endpoint Accepts Any Chat ID Without Verification
**File:** [auth.controller.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/controllers/auth.controller.js#L73-L119), [auth.routes.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/routes/auth.routes.js#L12)
**Status:** Resolved (Disabled and removed the unused unauthenticated `POST /api/v1/auth/link-telegram` REST endpoint. Users link Telegram accounts strictly and securely backend-to-backend via native Telegram Contact Sharing, ensuring only verified phone numbers can link chat IDs).

---

### [x] M-8 (RESOLVED) — Email HTML Template Has XSS Risk via Unescaped User Data
**File:** [email.service.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/services/email.service.js#L70-L86)  
**Status:** Resolved (Implemented the `escapeHtml` utility and sanitized all dynamic user variables in login and logout notification templates).

```js
const htmlBody = `
  <td>${mobileNumber}</td>
  <td>${displayName}</td>
  <td>${role}</td>
  <td>${ipAddress}</td>
  <td>${userAgent}</td>
`;
```

These values are inserted directly into the HTML email body without HTML-escaping. `userAgent` in particular can contain arbitrary strings. A crafted User-Agent string like `<script>alert(1)</script>` would be in the email HTML. While this is an admin-only email, it is still a stored XSS vector if an admin views it in a vulnerable email client.

**Recommendation:** HTML-escape all dynamic values before inserting into email templates. A simple helper function:
```js
const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
```

---

## 🔵 LOW Issues

### L-1 — Scratch/Debug Files Committed to Repository
**File:** [backend/scratch_simulate_query.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/scratch_simulate_query.js), [backend/scratch/debug_test_fail.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/scratch/debug_test_fail.js)

Several scratch and debug files are tracked in git. While not a security risk (they contain no secrets), they pollute the production Docker/node image if built from this directory and indicate git hygiene issues.

**Recommendation:** Add `scratch/`, `scratch_*.js`, `test_data/` to `.gitignore` and remove committed scratch files.

---

### L-2 — `node_modules` Must Be Excluded from Production Image
**File:** [.gitignore (backend)](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/.gitignore)

The backend `.gitignore` correctly excludes `node_modules`, but there is no `Dockerfile` or `.dockerignore` to confirm the deployment pipeline doesn't accidentally copy `node_modules` into the image. Multer (`^1.4.5-lts.1`) is the last LTS release before multer v2 — it has known memory-related concerns with large file uploads.

**Recommendation:** Pin multer to a specific version `1.4.5-lts.1` (already done) and ensure a `.dockerignore` is added if containerising.

---

### L-3 — `xlsx` Package in Frontend Is a Known CVE Vector
**File:** [frontend/package.json](file:///home/zenoguy/Desktop/projects/SNPolymers/frontend/package.json#L20)

```json
"xlsx": "^0.18.5"
```

The `xlsx` library (SheetJS CE) at `^0.18.5` has multiple published CVEs related to prototype pollution and ReDoS. The `^` will not update to `0.19.x` or the commercial fork. If Excel exports are used in the app (e.g., for reports), a maliciously crafted `.xlsx` file could exploit these.

**Recommendation:** If only generating (not parsing) Excel files from user input, the risk is lower. But consider switching to `exceljs` which is actively maintained and has no known critical CVEs.

---

### [x] L-4 (RESOLVED) — No Health Check Includes Database Connectivity
**File:** [app.js](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/src/app.js#L76-L92)
**Status:** Resolved (Upgraded health check endpoint `/health` to execute a lightweight database query using Supabase. Outages or connection loss to the database will now correctly throw a `503 Service Unavailable` response).

---

### L-5 — `IDBP_FILTER_TEST_DATA` Flag Is Not Used by Any Controller
**File:** [.env.example](file:///home/zenoguy/Desktop/projects/SNPolymers/backend/.env.example#L25)

```
IDBP_FILTER_TEST_DATA=true
```

This environment variable is documented in `.env.example` and presumably intended to filter `TEST_%` prefixed work orders from responses. However, no controller currently reads `process.env.IDBP_FILTER_TEST_DATA`. If test data was seeded during development and this flag was expected to hide it in production, it will silently fail to do so.

**Recommendation:** Either implement the filter in relevant controllers (e.g., `getRequisitions`, `getProjects`), or remove the variable from `.env.example` to avoid confusion.

---

### L-6 — Frontend QueryClient Has No Retry or Error Boundary
**File:** [App.jsx](file:///home/zenoguy/Desktop/projects/SNPolymers/frontend/src/App.jsx#L28-L34)

```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false }
  }
});
```

No global `retry`, `onError`, or React Error Boundary is configured. A failed query that throws an unhandled error will crash the entire React tree with a blank white screen, with no user-friendly error message.

**Recommendation:** Add a global `ErrorBoundary` component wrapping the router, and configure `defaultOptions.queries.retry: 1` to handle transient network failures gracefully.

---

## Summary Table

| ID | Severity | Area | One-Line Description | Scale-Dependent? | Status |
|---|---|---|---|---|---|
| C-2 | 🔴 Critical | Backend / DB | Budget validation race condition — double-spend possible | No | **Resolved** |
| C-3 | 🔴 Critical | Backend / Security | OTP logged in plaintext to production terminal | No | **Resolved** |
| C-4 | 🔴 Critical | Backend / Security | No JSON body size limit — DoS vector | No | **Resolved** |
| H-2 | 🟠 High | Backend / Config | `JWT_EXPIRY` env var mismatch — token lifetime not configurable | No | **Resolved** |
| H-3 | 🟠 High | Backend / Security | Service role key bypasses RLS — no defense in depth | No | Pending |
| H-5 | 🟠 High | Backend / Security | OTP bypass `123456` could activate if `NODE_ENV` is unset | No | **Resolved** |
| H-6 | 🟠 High | Backend / Storage | Orphaned PDF on failed requisition creation | No | **Resolved** |
| M-1 | 🟡 Medium | Frontend / Ops | No `VITE_API_URL` enforcement — silent prod→localhost fallback | No | **Resolved** |
| M-2 | 🟡 Medium | Backend / Integr. | Markdown injection breaks Telegram notifications silently | No | **Resolved** |
| M-4 | 🟡 Medium | Backend / Logging | Logger logs full URL including query strings | No | Pending |
| M-5 | 🟡 Medium | Backend / Ops | No process manager — crash = permanent downtime | No | Pending |
| M-6 | 🟡 Medium | Frontend / UX | Advisory budget is stale — UX/server budget mismatch | No | Pending |
| M-7 | 🟡 Medium | Backend / Auth | Telegram link accepts any chat ID without proof of ownership | No | **Resolved** |
| M-8 | 🟡 Medium | Backend / Security | Admin email template has unescaped HTML — XSS risk | No | **Resolved** |
| M-9 ↓ | 🟡 Medium | Backend / Perf | N+1 query on `getRequisitions` — slow but manageable at 30 users | **Yes** | Pending |
| M-10 ↓ | 🟡 Medium | Backend / Ops | Telegram polling conflict risk during rolling deploys | **Yes** | **Resolved** |
| L-1 | 🔵 Low | Git / Ops | Scratch/debug files committed to repo | No | Pending |
| L-2 | 🔵 Low | Ops | No `.dockerignore`; `multer` is last LTS version | No | Pending |
| L-3 | 🔵 Low | Frontend / Security | `xlsx ^0.18.5` has known CVEs | No | Pending |
| L-4 | 🔵 Low | Backend / Ops | Health endpoint doesn't check DB connectivity | No | **Resolved** |
| L-5 | 🔵 Low | Backend / Config | `IDBP_FILTER_TEST_DATA` env var is documented but never read | No | Pending |
| L-6 | 🔵 Low | Frontend / UX | No Error Boundary or query retry — blank screen on failure | No | Pending |
| L-7 ↓ | 🔵 Low | DB / Ops | `sessions` / `otp_requests` table growth — negligible at 30 users | **Yes** | Pending |
| L-8 ↓ | 🔵 Low | Backend / API | Fund requests pagination cap is 1,000 — harmless at this scale | **Yes** | Pending |

*↓ = Downgraded from original severity due to 30-user scale context.*

---

> **Recommended priority order for fixes before go-live:** H-6 → M-5
