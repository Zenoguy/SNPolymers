# Phase 3: ZO Fund Request & HO Approval Module — Implementation Plan

> **Status:** Draft — Awaiting user approval before execution begins.
> **Stack:** Supabase/PostgreSQL · Node.js/Express backend · React/Vite frontend
> **Builds on:** Phase 1 (auth, sessions, fund reports) + Phase 2 (estimates, review workflow)
> **Reference image:** ZO Fund Request & HO Approval Process Flow diagram

---

## Background & Scope

Phase 3 introduces the **Fund Requisition module** — the natural downstream step after a
`Final Approved` Project Cost Estimate. When HO gives final approval on an estimate, the
Zonal Office can raise a formal **Fund Request** against that approved amount. HO then logs
in and either **Approves** or puts the request on **Hold**.

This is the module described in the uploaded process-flow diagram and the Excel spec sheet.

### What Phase 3 delivers

| Actor | Action |
|---|---|
| **ZO** | Creates a Fund Request against a `Final Approved` estimate. Fields auto-populated: `ZO_ID`, `ZO_Date`. ZO enters: `ZO_FR_NO`, `ZO_FR_Amount`, `ZO_Remarks`. |
| **HO** | Reviews pending fund requests. Fields auto-populated: `Approve_HO_USER_ID`, `Approve_HO_DATE`. HO selects `Approve_type` (Approve / Hold). If **Approve**: fills `Approve_HO_AMOUNT`, `Transfer_from_Account` (CC / OD / CR), `HO_Remarks` (optional). If **Hold**: all fields disabled. |
| **System** | Notifies ZO via Telegram when HO approves. ZO receives funds from the selected account. |

### What Phase 3 does NOT change
- The estimate workflow (Phase 2) is frozen — no modifications.
- The fund reports module (Phase 1) is not touched.
- Auth, sessions, OTP, and user management are unchanged.

---

## Role Architecture (inherited + confirmed)

| Role | Phase 3 responsibility |
|---|---|
| `zo` / `staff` | Creates and manages fund requests |
| `ho` | Reviews fund requests; approves or holds |
| `admin` | Full access — can act as either ZO or HO |
| `je` | Read-only visibility into own estimate's fund request (if any) |

---

## Open Questions

> [!IMPORTANT]
> **Q1 — Multiple fund requests per estimate?**
> Can ZO raise more than one fund request for the same `Final Approved` estimate?
> **Plan assumes: No. One active fund request per estimate.** A second can only be raised
> after the previous one is fully processed (Approved or Cancelled). Raise this if your
> business rules differ.

> [!IMPORTANT]
> **Q2 — ZO_FR_NO (Fund Request Number) format**
> Is `ZO_FR_NO` free-text entered by ZO (as the spec implies), or should the system
> auto-generate it (e.g. `FR-{estimate_no}-{YYYYMMDD}`)?
> **Plan assumes: Free-text, user-entered, required, non-blank.**

> [!IMPORTANT]
> **Q3 — Cancellation by ZO?**
> Can ZO cancel a pending fund request before HO acts on it?
> **Plan assumes: Yes — ZO can cancel a Pending request. Once HO acts (Approved or Hold),
> cancellation is blocked.**

> [!IMPORTANT]
> **Q4 — `Approve_HO_AMOUNT` constraint**
> Should `Approve_HO_AMOUNT` be constrained to ≤ `ZO_FR_Amount`, or can HO approve any
> amount?
> **Plan assumes: `Approve_HO_AMOUNT` must be > 0 and ≤ `ZO_FR_Amount`. No upper bound
> beyond the requested amount.**

> [!NOTE]
> **Q5 — `Transfer_from_Account` options**
> The spec shows: CC / OD / CR. These are hardcoded enum values in the DB, not from a
> reference table. Confirmed by spec screenshot.

---

## Proposed Changes

---

### Component 1 — Database Migration

#### [NEW] `backend/src/db/migrations/19_create_fund_requests.sql`

```sql
-- Migration: Phase 3 — Fund Requests table and workflow
-- DB: PostgreSQL (Supabase)
-- PREREQUISITE: Migrations 01–18 must have been applied (project_cost_estimates must exist).

-- ──────────────────────────────────────────────────────────────
-- 1. Enum types
-- ──────────────────────────────────────────────────────────────

CREATE TYPE fund_request_status_enum AS ENUM (
  'Pending',    -- ZO submitted, awaiting HO action
  'Approved',   -- HO approved with amount and account
  'Hold',       -- HO placed on hold (no further action until released or new request)
  'Cancelled'   -- ZO cancelled before HO acted
);

CREATE TYPE transfer_account_enum AS ENUM ('CC', 'OD', 'CR');

-- ──────────────────────────────────────────────────────────────
-- 2. fund_requests table
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fund_requests (
  fund_request_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to the parent estimate (must be Final Approved)
  estimate_id         UUID NOT NULL REFERENCES project_cost_estimates(estimate_id),
  work_order_no       VARCHAR NOT NULL REFERENCES projects_master(work_order_no),

  -- ZO fields (auto-populated from session at creation)
  zo_user_id          VARCHAR NOT NULL,   -- mobile number of ZO who created request
  zo_date             TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- ZO fields (user-entered)
  zo_fr_no            VARCHAR NOT NULL,   -- Fund Request Number (e.g. "NB-101-150626")
  zo_fr_amount        NUMERIC(18,2) NOT NULL,   -- Requested amount
  zo_remarks          TEXT,                      -- Optional ZO remarks

  -- Status
  request_status      fund_request_status_enum NOT NULL DEFAULT 'Pending',

  -- HO fields (auto-populated at approval time)
  approve_ho_user_id  VARCHAR,            -- mobile number of HO who acted
  approve_ho_date     TIMESTAMPTZ,

  -- HO fields (user-entered on Approve only; NULL on Hold)
  approve_ho_amount   NUMERIC(18,2),      -- Approved amount (≤ zo_fr_amount; NULL on Hold)
  transfer_from_account transfer_account_enum,  -- CC / OD / CR; NULL on Hold
  ho_remarks          TEXT,               -- Optional HO remarks

  -- Cancellation tracking
  cancelled_by        VARCHAR,            -- mobile number of ZO who cancelled
  cancelled_at        TIMESTAMPTZ,

  -- Audit
  created_by          VARCHAR NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- 3. Indexes for performance
-- ──────────────────────────────────────────────────────────────

-- Fast lookup of all fund requests for a given estimate
CREATE INDEX IF NOT EXISTS idx_fund_requests_estimate_id
  ON fund_requests(estimate_id);

-- Fast lookup of all fund requests for a given work order
CREATE INDEX IF NOT EXISTS idx_fund_requests_work_order_no
  ON fund_requests(work_order_no);

-- Fast lookup of active (Pending) requests — used by the one-active gate
CREATE INDEX IF NOT EXISTS idx_fund_requests_status
  ON fund_requests(request_status)
  WHERE request_status = 'Pending';

-- ──────────────────────────────────────────────────────────────
-- 4. Trigger: auto-update updated_at
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_fund_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fund_request_updated_at ON fund_requests;
CREATE TRIGGER trg_fund_request_updated_at
BEFORE UPDATE ON fund_requests
FOR EACH ROW EXECUTE FUNCTION set_fund_request_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 5. Trigger: block hard DELETE (fund requests are permanent records)
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION prevent_fund_request_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Hard deletion of fund_requests is permanently prohibited. Use status transitions instead.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_fund_request_hard_delete ON fund_requests;
CREATE TRIGGER trg_prevent_fund_request_hard_delete
BEFORE DELETE ON fund_requests
FOR EACH ROW EXECUTE FUNCTION prevent_fund_request_hard_delete();

-- ──────────────────────────────────────────────────────────────
-- 6. Trigger: audit log on status change
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION audit_fund_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_status IS DISTINCT FROM OLD.request_status THEN
    INSERT INTO audit_log (user_id, action, module_name, record_identifier, old_value, new_value)
    VALUES (
      COALESCE(NEW.approve_ho_user_id, NEW.cancelled_by, NEW.created_by),
      'STATUS_CHANGE',
      'Fund Request',
      NEW.fund_request_id::VARCHAR,
      jsonb_build_object('request_status', OLD.request_status),
      jsonb_build_object('request_status', NEW.request_status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_fund_request_status ON fund_requests;
CREATE TRIGGER trg_audit_fund_request_status
AFTER UPDATE ON fund_requests
FOR EACH ROW EXECUTE FUNCTION audit_fund_request_status_change();

-- ──────────────────────────────────────────────────────────────
-- 7. One-active-request constraint (partial unique index)
-- A given estimate can only have ONE Pending fund request at a time.
-- After it resolves (Approved/Hold/Cancelled), ZO may raise another.
-- ──────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS uq_fund_requests_one_pending_per_estimate
  ON fund_requests(estimate_id)
  WHERE request_status = 'Pending';
```

---

### Component 2 — Backend: Fund Requests API

#### [NEW] `backend/src/controllers/fundRequests.controller.js`

Six controller functions:

| Function | Method | Path | Access | Description |
|---|---|---|---|---|
| `createFundRequest` | POST | `/` | ZO + Admin | Create a new fund request |
| `getFundRequests` | GET | `/` | All authenticated | Role-filtered list |
| `getFundRequestById` | GET | `/:id` | All authenticated | Single fund request with full detail |
| `actOnFundRequest` | PATCH | `/:id/action` | HO + Admin | Approve or Hold a pending request |
| `cancelFundRequest` | PATCH | `/:id/cancel` | ZO + Admin | Cancel a Pending request |
| `getFundRequestsByEstimate` | GET | `/by-estimate/:estimateId` | All authenticated | All requests for a given estimate |

---

##### `createFundRequest(req, res)` — `POST /api/v1/auth/fund-requests`

**Access:** `['zo', 'staff', 'admin']`

```
Body: { estimate_id, zo_fr_no, zo_fr_amount, zo_remarks? }

Validation:
  1. estimate_id: required, valid UUID
  2. zo_fr_no: required, non-blank string after .trim()
     → 400: "zo_fr_no (Fund Request Number) is required."
  3. zo_fr_amount: required, must be a positive number > 0
     → 400: "zo_fr_amount must be a positive number."

Business Rules:
  4. Fetch estimate by estimate_id:
     - 404 if not found
     - 403 if estimate_status ≠ 'Final Approved':
       → "Fund requests can only be raised for Final Approved estimates."
  5. One-active-request gate:
     SELECT COUNT(*) FROM fund_requests
     WHERE estimate_id = $1 AND request_status = 'Pending'
     If count > 0:
       → 409: "A pending fund request already exists for this estimate."
  6. Ownership check: ZO must own the estimate's zone or be admin.
     Specifically: req.user.role must be 'zo' or 'admin'. Staff can also
     create on behalf of ZO (treated as ZO equivalent).

Build insert:
  - zo_user_id  ← req.user.mobile_number
  - zo_date     ← now() (DB default)
  - request_status ← 'Pending'
  - work_order_no ← from estimate.work_order_no (auto-populated, never user-entered)
  - created_by  ← req.user.mobile_number

Return: 201 with the created fund request.
```

---

##### `getFundRequests(req, res)` — `GET /api/v1/auth/fund-requests`

**Access:** All authenticated (role-filtered)

```
Query params: page, limit (1–100, default 50), status (optional filter)

Role-based filtering:
  - 'je'/'staff': fund requests for estimates they created
    JOIN project_cost_estimates ON estimate_id WHERE created_by = req.user.mobile_number
  - 'zo'/'staff': own fund requests (zo_user_id = req.user.mobile_number)
  - 'ho': all Pending and Approved requests (HO's work queue + history)
  - 'admin': all records

Join project_cost_estimates and projects_master for site metadata.
Resolve display names for zo_user_id and approve_ho_user_id.

Response: { success, fundRequests: [...], pagination: { page, limit, total, totalPages } }
```

---

##### `getFundRequestById(req, res)` — `GET /api/v1/auth/fund-requests/:id`

**Access:** All authenticated (visibility rules apply)

```
1. Fetch fund_request JOIN project_cost_estimates JOIN projects_master.
2. Visibility:
   - 'je'/'staff': only if estimate was created by them
   - 'zo': only if zo_user_id = req.user.mobile_number
   - 'ho': any Pending or Approved request
   - 'admin': all
   Unauthorized → 404 (not 403, to avoid leaking IDs)
3. Resolve display names for zo_user_id and approve_ho_user_id.
4. Return full fund request object with enriched names.
```

---

##### `actOnFundRequest(req, res)` — `PATCH /api/v1/auth/fund-requests/:id/action`

**Access:** `['ho', 'admin']`

```
Body: { action, approve_ho_amount?, transfer_from_account?, ho_remarks? }
      action must be 'Approve' or 'Hold'

1. Validate fund_request_id as valid UUID.
2. Fetch fund request — 404 if not found.
3. Status guard: request_status must be 'Pending'
   → 403: "Action can only be taken on Pending fund requests."

4. If action = 'Hold':
   - No additional fields required (all HO fields remain NULL).
   - Update:
     SET request_status        = 'Hold'
         approve_ho_user_id    = req.user.mobile_number
         approve_ho_date       = now()
         ho_remarks            = req.body.ho_remarks || null
   - Return 200.

5. If action = 'Approve':
   - Validate approve_ho_amount:
     a. Required, must be a positive number > 0
        → 400: "approve_ho_amount is required for approval."
     b. Must be ≤ fund_request.zo_fr_amount
        → 400: "approve_ho_amount cannot exceed the requested amount of ₹{zo_fr_amount}."
   - Validate transfer_from_account:
     a. Required — must be 'CC', 'OD', or 'CR'
        → 400: "transfer_from_account is required for approval. Valid values: CC, OD, CR."
   - Update:
     SET request_status        = 'Approved'
         approve_ho_user_id    = req.user.mobile_number
         approve_ho_date       = now()
         approve_ho_amount     = validated value
         transfer_from_account = validated enum
         ho_remarks            = req.body.ho_remarks || null
   - Non-blocking Telegram notification to ZO user:
     notifyZoFundRequestApproved(fundRequest, updatedFundRequest)
   - Return 200.

6. If action is neither 'Approve' nor 'Hold':
   → 400: "action must be 'Approve' or 'Hold'."
```

---

##### `cancelFundRequest(req, res)` — `PATCH /api/v1/auth/fund-requests/:id/cancel`

**Access:** `['zo', 'staff', 'admin']`

```
1. Validate fund_request_id as valid UUID.
2. Fetch fund request — 404 if not found.
3. Ownership check: zo_user_id = req.user.mobile_number OR admin.
   → 403: "Access denied. You cannot cancel another ZO's fund request."
4. Status guard: request_status must be 'Pending'
   → 403: "Only Pending fund requests can be cancelled. Current status: {status}"
5. Update:
   SET request_status = 'Cancelled'
       cancelled_by   = req.user.mobile_number
       cancelled_at   = now()
6. Return 200 with updated record.
```

---

##### `getFundRequestsByEstimate(req, res)` — `GET /api/v1/auth/fund-requests/by-estimate/:estimateId`

**Access:** All authenticated (visibility rules inherited from `getFundRequestById`)

```
1. Validate estimateId as valid UUID.
2. Fetch estimate — 404 if not found. Apply role-based visibility.
3. Fetch all fund_requests WHERE estimate_id = $1
   ORDER BY created_at DESC.
4. Return: { success, fundRequests: [...] }
```

---

#### [NEW] `backend/src/routes/fundRequests.routes.js`

```javascript
const express = require('express');
const {
  createFundRequest,
  getFundRequests,
  getFundRequestById,
  actOnFundRequest,
  cancelFundRequest,
  getFundRequestsByEstimate
} = require('../controllers/fundRequests.controller');
const verifyJwt = require('../middleware/verifyJwt');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(verifyJwt);

// Read endpoints (all authenticated)
router.get('/', getFundRequests);
router.get('/by-estimate/:estimateId', getFundRequestsByEstimate);
router.get('/:id', getFundRequestById);

// ZO write endpoints
const zoRoles = ['zo', 'staff', 'admin'];
router.post('/', requireRole(zoRoles), createFundRequest);
router.patch('/:id/cancel', requireRole(zoRoles), cancelFundRequest);

// HO action endpoint
const hoRoles = ['ho', 'admin'];
router.patch('/:id/action', requireRole(hoRoles), actOnFundRequest);

module.exports = router;
```

#### [MODIFY] `backend/src/app.js`

Add the new route mount after the `purchase-data` mount:

```javascript
const fundRequestRoutes = require('./routes/fundRequests.routes');
// ...
app.use('/api/v1/auth/fund-requests', fundRequestRoutes);
```

---

### Component 3 — Telegram Notification

#### [MODIFY] `backend/src/services/telegram.service.js`

Add one new function `notifyZoFundRequestApproved`:

```
notifyZoFundRequestApproved(originalRequest, updatedRequest):
  - Fetch ZO user's telegram_chat_id from authorised_users
    WHERE mobile_number = originalRequest.zo_user_id
  - If no chat_id: console.warn with identifiers — no throw.
  - If no TELEGRAM_BOT_TOKEN: console.warn — no throw.
  - Message format:
    ✅ *Fund Request Approved*
    *Fund Request No:* {zo_fr_no}
    *Work Order:* {work_order_no}
    *Requested Amount:* ₹{zo_fr_amount}
    *Approved Amount:* ₹{approve_ho_amount}
    *Transfer Account:* {transfer_from_account}
    *HO Remarks:* {ho_remarks || 'None'}
    
    Your fund request has been approved. Funds will be transferred from the {CC/OD/CR} account.
  - Non-blocking: called with .catch() in controller
  - Export from module.exports
```

---

### Component 4 — Frontend

#### [NEW] `frontend/src/pages/FundRequests.jsx`

A full-featured Fund Requests management page.

**ZO View:**
- List of own fund requests with status badges (Pending → amber, Approved → green, Hold → red, Cancelled → grey).
- "New Fund Request" button → opens a modal/form.
- Form fields:
  - **Estimate** (dropdown — shows only `Final Approved` estimates that don't have a Pending request)
  - **Fund Request Number** (text input, required)
  - **Requested Amount** (numeric, required, > 0)
  - **ZO Remarks** (textarea, optional)
  - Auto-displayed read-only: ZO ID (logged-in user), ZO Date (today)
- Cancel button on Pending requests (with confirmation dialog).

**HO View:**
- Tabbed interface: "Pending Requests" | "History" (Approved + Hold)
- Each pending card shows: ZO name, Estimate No, Work Order, Site, Requested Amount, ZO Date.
- "Take Action" button opens an action panel:
  - `Approve_type` dropdown: **Approve** / **Hold**
  - If **Approve** selected: enables `Approve_HO_AMOUNT` (numeric), `Transfer_from_Account` (select: CC / OD / CR), `HO_Remarks` (textarea, optional).
  - If **Hold** selected: all other fields disabled (greyed out).
  - Submit button: "Save as Approved" or "Save as Hold".
  - Auto-displayed read-only: HO User ID (logged-in user), HO Date (today)

**Admin View:**
- All fund requests with full filter and sort.
- Can act as either ZO (create/cancel) or HO (approve/hold).

---

#### [MODIFY] `frontend/src/App.jsx`

Add the `FundRequests` page route:
```jsx
import FundRequestsNew from './pages/FundRequests';
// ...
<Route path="/fund-requests-new" element={<FundRequestsNew />} />
```

> [!NOTE]
> The existing `FundReports` page (`/fund-reports`) is the Phase 1 module and is not touched.
> The new Phase 3 module lives at `/fund-requests`. These are separate features with
> deliberately distinct names and routes.

---

#### [MODIFY] `frontend/src/pages/Dashboard.jsx`

Add a navigation card/link to the new Fund Requests module visible to `zo`, `ho`, and `admin` roles.

---

#### [NEW] `frontend/src/api/fundRequests.js`

API client module with Axios calls for all six endpoints.

---

### Component 5 — Code Quality & Security Hardening

This is a **non-functional component** covering issues found during codebase audit.
It is independent of the fund requests feature and can be done alongside or after M2.

#### Issues Found and Fixes Required

| # | File | Issue | Severity | Fix |
|---|---|---|---|---|
| CQ-1 | `estimates.core.controller.js` L113–126 | Hardcoded mobile numbers whitelist for filtering test data — production code smell | HIGH | Move to env variable `TEST_MOBILE_NUMBERS` or remove. Test data filtering must not use hardcoded production phone numbers. |
| CQ-2 | `auth.controller.js` L171 | `req.ip` can be a comma-separated list from `x-forwarded-for`; only first IP should be stored | MEDIUM | Use `(req.headers['x-forwarded-for'] || '').split(',')[0].trim() \|\| req.ip` |
| CQ-3 | `session.service.js` L6 | `JWT_SECRET` fallback to plaintext dev string creates false safety net | MEDIUM | Keep fallback only in dev; throw in prod (already handled in `app.js` but session service also resolves it independently). Add comment documenting this dual-path. |
| CQ-4 | `verifyJwt.js` L71 | Error message leaks `error.message` verbatim (may expose JWT library internals) | LOW | Standardize: only emit the structured codes `ACCESS_TOKEN_EXPIRED` and a generic "invalid token" message. |
| CQ-5 | `reports.controller.js` L215 | `amount` field is not validated for numeric type — string "abc" passes the `!== undefined` check | HIGH | Validate: `if (isNaN(Number(amount)) \|\| Number(amount) < 0)` → 400 |
| CQ-6 | `estimates.core.controller.js` | `getEstimates` has no role guard: a `je` user with `global=true` query param sees all estimates | MEDIUM | Only allow `global=true` for `admin` role. Enforce in the query builder. |
| CQ-7 | `admin.controller.js` L76 | `updateUser` accepts and persists any `role` string (no CHECK validation) — risk of injecting invalid role | HIGH | Validate `role` against the allowed enum set `['staff', 'admin', 'je', 'zo', 'ho']` before update. |
| CQ-8 | `rateLimiter.js` | `globalLimiter` uses a 1000 req/min window — very permissive for an internal ERP | LOW | Document rationale or tighten to 200/min for non-admin routes. No code change required if intentional — add inline comment. |
| CQ-9 | `otp.service.js` L87–92 | Failed attempt increment is a non-atomic read-modify-write (`attempts + 1`) — concurrent OTP attempts can bypass the 3-attempt limit | MEDIUM | Use Supabase RPC or DB-side `attempts = attempts + 1` increment to make it atomic. |
| CQ-10 | `telegram.service.js` L33 | OTP URL built with string concatenation — if `otp` or `telegramChatId` contains special chars, encoding may fail | LOW | Already uses `encodeURIComponent` — verify test coverage. Add a comment confirming this. |
| CQ-11 | `purchaseData.controller.js` | `getPurchaseOptions` has no UUID format validation on internal record iteration | INFO | Already handled at route level — add comment confirming no param in this route. |
| CQ-12 | All controllers | `console.error` in catch blocks logs `error.message` only — stack trace lost | LOW | Log `error.stack` (or full error object) in development; message only in production. Add a centralized error logger helper. |
| SEC-1 | `app.js` L57–58 | `materialsRoutes` mounted on BOTH `/api/materials` (unauthenticated) AND `/api/v1/auth/materials` | CRITICAL | The `/api/materials` route has no `verifyJwt` — it is publicly accessible. Verify whether `materials.routes.js` applies its own auth or relies on the prefix. If the former: document explicitly. If the latter: **remove the public mount immediately.** |
| SEC-2 | `linkTelegram` endpoint | Public endpoint with no rate limiting — an attacker can enumerate mobile numbers | HIGH | Apply `otpRequestLimiter` (or a dedicated limiter) to `POST /api/v1/link-telegram`. |
| SEC-3 | `session.service.js` | `createSession` stores raw `user-agent` string — not sanitized | LOW | Truncate to 500 chars max before storing to prevent oversized payloads. |
| SEC-4 | `verifyJwt.js` | On `TokenExpiredError`, no cookie cleanup is performed | MEDIUM | Clear `accessToken` cookie on `TokenExpiredError` response (same as on inactive session). |
| SEC-5 | `admin.controller.js` `removeUser` | Hard DELETE on `authorised_users` — if user has FK relations, this can cascade or fail silently | MEDIUM | Add a pre-check: if user has any active fund requests or estimates as `created_by`, return 409 with a clear message before deletion. |

---

## Verification Plan

### Automated Tests

All tests live in `backend/tests/milestones/` following the Phase 2 pattern.

**Migration Verification:**
```
SELECT * FROM fund_requests LIMIT 0; -- table exists
SELECT enum_range(NULL::fund_request_status_enum); -- enum has 4 values
SELECT enum_range(NULL::transfer_account_enum); -- enum has 3 values
```

**New milestone test files:**
- `tests/milestones/test_milestone_p3_m1.js` — DB schema verification
- `tests/milestones/test_milestone_p3_m2.js` — API endpoint tests (CRUD)
- `tests/milestones/test_milestone_p3_m3.js` — Workflow tests (approve/hold/cancel)
- `tests/milestones/test_milestone_p3_m4.js` — Security & edge case tests
- `tests/milestones/test_milestone_p3_m5.js` — Code quality fixes verification

**package.json additions:**
```json
"test:p3:m1": "node tests/milestones/test_milestone_p3_m1.js",
"test:p3:m2": "node tests/milestones/test_milestone_p3_m2.js",
"test:p3:m3": "node tests/milestones/test_milestone_p3_m3.js",
"test:p3:m4": "node tests/milestones/test_milestone_p3_m4.js",
"test:p3:m5": "node tests/milestones/test_milestone_p3_m5.js",
"test:p3:all": "node tests/milestones/test_milestone_p3_m1.js && node tests/milestones/test_milestone_p3_m2.js && node tests/milestones/test_milestone_p3_m3.js && node tests/milestones/test_milestone_p3_m4.js && node tests/milestones/test_milestone_p3_m5.js"
```

### Manual Verification
- ZO logs in → creates a fund request → receives confirmation
- HO logs in → sees Pending request → selects Approve → fills amount + account → submits
- ZO receives Telegram notification with approved amount
- HO logs in → sees Pending request → selects Hold → submits → fields stay blank
- ZO cancels a Pending request → status = Cancelled → HO no longer sees it in queue
- Admin can perform all actions as both ZO and HO

---

## Migration Sequence

All migrations are idempotent and must be run in order:

| Step | File | Notes |
|---|---|---|
| 19 | `19_create_fund_requests.sql` | New table, enums, indexes, triggers |

---

## File Inventory

| File | Action | Component |
|---|---|---|
| `backend/src/db/migrations/19_create_fund_requests.sql` | **NEW** | 1 — DB |
| `backend/src/controllers/fundRequests.controller.js` | **NEW** | 2 — API |
| `backend/src/routes/fundRequests.routes.js` | **NEW** | 2 — API |
| `backend/src/app.js` | **MODIFY** — add mount | 2 — API |
| `backend/src/services/telegram.service.js` | **MODIFY** — add `notifyZoFundRequestApproved` | 3 — Notifications |
| `frontend/src/pages/FundRequests.jsx` | **NEW** | 4 — Frontend |
| `frontend/src/api/fundRequests.js` | **NEW** | 4 — Frontend |
| `frontend/src/App.jsx` | **MODIFY** — add route | 4 — Frontend |
| `frontend/src/pages/Dashboard.jsx` | **MODIFY** — add nav card | 4 — Frontend |
| `backend/src/controllers/estimates.core.controller.js` | **MODIFY** — CQ-1, CQ-6 | 5 — Hardening |
| `backend/src/controllers/auth.controller.js` | **MODIFY** — CQ-2 | 5 — Hardening |
| `backend/src/controllers/reports.controller.js` | **MODIFY** — CQ-5 | 5 — Hardening |
| `backend/src/controllers/admin.controller.js` | **MODIFY** — CQ-7, SEC-5 | 5 — Hardening |
| `backend/src/services/otp.service.js` | **MODIFY** — CQ-9 | 5 — Hardening |
| `backend/src/middleware/verifyJwt.js` | **MODIFY** — SEC-4 | 5 — Hardening |
| `backend/src/app.js` | **VERIFY/MODIFY** — SEC-1 | 5 — Hardening |
| `backend/src/routes/auth.routes.js` | **MODIFY** — SEC-2 | 5 — Hardening |
| `backend/tests/milestones/test_milestone_p3_m1.js` | **NEW** | Tests |
| `backend/tests/milestones/test_milestone_p3_m2.js` | **NEW** | Tests |
| `backend/tests/milestones/test_milestone_p3_m3.js` | **NEW** | Tests |
| `backend/tests/milestones/test_milestone_p3_m4.js` | **NEW** | Tests |
| `backend/tests/milestones/test_milestone_p3_m5.js` | **NEW** | Tests |
| `backend/package.json` | **MODIFY** — add test scripts | Tests |
