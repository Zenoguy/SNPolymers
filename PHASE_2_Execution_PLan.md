# Phase 2 — Project Cost Estimate / Fund Report
# Milestone-Driven Execution Plan

> **Status:** Implementation Plan approved and frozen. This document converts it into a sequential,
> dependency-ordered execution plan for AI-assisted development.
>
> **Stack:** Supabase/PostgreSQL · Node.js/Express backend · React frontend
> **Assumed existing:** Authentication (`verifyJwt`), user management (`authorised_users`),
> master data tables (`projects_master`, `material_master`, `audit_log`)

---

## Milestone Overview

| # | Milestone | Primary Layer | Depends On |
|---|---|---|---|
| M1 | Database Foundation | DB | — |
| M2 | Role Middleware & Purchase Data API | Backend | M1 |
| M3 | Estimate CRUD & Draft Workflow | Backend | M2 |
| M4 | Estimate Submission Workflow | Backend | M3 |
| M5 | ZO Review Workflow | Backend | M4 |
| M6 | Revision Workflow | Backend | M5 |
| M7 | HO Review Workflow | Backend | M6 |
| M8 | Audit Trail & Notifications | Backend | M5, M7 |
| M9 | Frontend Integration | Frontend | M3–M8 |
| M10 | UAT & Release Gate | All | M9 |

---
A milestone is complete only if:

✓ Code implemented
✓ Acceptance criteria pass
✓ All milestone test cases pass
✓ No failing lint checks
✓ No failing build
✓ No open P1 defects
---

## M1 — Database Foundation

### Objective
Establish all schema objects required by Phase 2: enums, tables, triggers, RPC functions,
and role constraint extension. No application code is written in this milestone.

### Scope
- Run migrations 08 through 11 in order against the Supabase project.
- Verify all objects are created correctly before any backend work begins.

### Deliverables
- `08_extend_user_roles.sql` applied
- `09_create_purchase_data.sql` applied
- `10_create_project_cost_estimates.sql` applied
- `11_create_approval_rpc.sql` applied
- Verification queries confirming schema correctness

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/db/migrations/08_extend_user_roles.sql` | NEW — apply to DB |
| `backend/src/db/migrations/09_create_purchase_data.sql` | NEW — apply to DB |
| `backend/src/db/migrations/10_create_project_cost_estimates.sql` | NEW — apply to DB |
| `backend/src/db/migrations/11_create_approval_rpc.sql` | NEW — apply to DB |

### Backend Work
None. Migrations are SQL-only.

### Frontend Work
None.

### Database Work

**Migration 08** — Extend `authorised_users.role` CHECK constraint to include `'je'`, `'zo'`, `'ho'`.
Existing `'staff'` and `'admin'` rows untouched.

**Migration 09** — Create `purchase_data` table:
`id (UUID PK)`, `name (VARCHAR)`, `is_active (BOOLEAN)`, `created_by (VARCHAR)`, `created_at (TIMESTAMPTZ)`

**Migration 10** — Create:
- Enum `estimate_status_enum` (10 values: Draft → Final Approved / Rejected by HO)
- Enum `row_approval_enum` ('Approve', 'Not Approve')
- Table `project_cost_estimates` (header; FK → `projects_master`)
- Table `project_cost_estimate_items` (line items; FK → estimates + `purchase_data`)
- Table `estimate_revision_log` (revision cycles)
- Triggers: `trg_estimate_updated_at`, `trg_estimate_item_updated_at`,
  `trg_prevent_estimate_hard_delete`, `trg_enforce_estimate_item_amount`,
  `trg_audit_estimate_status`

**Migration 11** — Create PostgreSQL function `submit_row_approvals(UUID, JSONB, TEXT, VARCHAR)`
with `SECURITY DEFINER`. Grant EXECUTE to `service_role`.
Must run after Migration 10 (tables must exist).

### Dependencies
- Existing `projects_master` table (FK target)
- Existing `authorised_users` table (role constraint extension)
- Existing `audit_log` table (used by `trg_audit_estimate_status`)
- Existing `purchase_data` must NOT already exist (Migration 09 uses `CREATE TABLE IF NOT EXISTS`)

### Acceptance Criteria
```
✓ authorised_users.role CHECK accepts 'je', 'zo', 'ho'
✓ authorised_users.role CHECK still accepts 'staff', 'admin'
✓ purchase_data table exists with correct columns
✓ project_cost_estimates table exists with all 20+ columns
✓ project_cost_estimate_items table exists with zo_* and ho_* approval columns
✓ estimate_revision_log table exists with modified_item_ids UUID[] column
✓ All 5 triggers are registered and active
✓ submit_row_approvals function exists and service_role has EXECUTE
✓ Hard DELETE on project_cost_estimates raises exception
✓ INSERT to project_cost_estimate_items with mismatched amount auto-corrects to rate * qty
```

### Test Cases

**Test 1:** Insert a role value of `'je'` into `authorised_users`.
Expected: row inserted successfully.

**Test 2:** Insert a role value of `'invalid_role'` into `authorised_users`.
Expected: CHECK constraint violation error.

**Test 3:** Insert a row into `project_cost_estimate_items` with `qty = 3`, `rate = 100`, `amount = 999`.
Expected: `amount` stored as `300.00` (trigger overrides client value).

**Test 4:** Attempt `DELETE FROM project_cost_estimates WHERE estimate_id = <any>`.
Expected: exception raised — "Hard deletion of project_cost_estimates is permanently prohibited."

**Test 5:** Attempt to run Migration 10 a second time.
Expected: no error — all statements are idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `DROP TRIGGER IF EXISTS`).

**Test 6:** Update `estimate_status` on a `project_cost_estimates` row; verify `audit_log` receives a new row with `action = 'STATUS_CHANGE'`.
Expected: audit row inserted with correct `old_value` and `new_value` JSON.

**Test 7:** Call `submit_row_approvals` RPC with a non-existent `estimate_id`.
Expected: exception — "Estimate not found."

### Exit Criteria
```
✓ All 7 test cases pass against Supabase project
✓ No migration errors in Supabase dashboard logs
✓ Schema inspector confirms all tables, enums, triggers, and functions
✓ No open P1 defects
✓ Ready to begin M2
```

---

## M2 — Role Middleware & Purchase Data API

### Objective
Implement the `requireRole` middleware and the complete Purchase Data CRUD API.
This milestone delivers the first working backend endpoints and validates the middleware
pattern before the larger estimates controller is built.

### Scope
- `requireRole` factory middleware
- `purchaseData.controller.js` — 4 endpoints
- `purchaseData.routes.js`
- Route registration in `app.js`

### Deliverables
- Working `GET /api/v1/auth/purchase-data` (returns active options)
- Working `POST /api/v1/auth/purchase-data` (admin only)
- Working `PUT /api/v1/auth/purchase-data/:id` (admin only)
- Working `PATCH /api/v1/auth/purchase-data/:id/status` (admin only)

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/middleware/requireRole.js` | NEW |
| `backend/src/controllers/purchaseData.controller.js` | NEW |
| `backend/src/routes/purchaseData.routes.js` | NEW |
| `backend/src/app.js` | MODIFY — add purchase-data route mount |

### Backend Work

**`requireRole.js`**
Factory function `requireRole(allowedRoles)` returning Express middleware.
Reads `req.user.role` (set by existing `verifyJwt`). Returns 403 with structured error
if role is absent or not in `allowedRoles`. Calls `next()` on pass.
Mirrors existing `requireAdmin.js` pattern.

**`purchaseData.controller.js`** — 4 functions:

| Function | Method | Path | Auth |
|---|---|---|---|
| `getPurchaseOptions` | GET | `/` | All authenticated |
| `createPurchaseOption` | POST | `/` | Admin only |
| `updatePurchaseOption` | PUT | `/:id` | Admin only |
| `togglePurchaseOptionStatus` | PATCH | `/:id/status` | Admin only |

`getPurchaseOptions`: non-admin returns only `is_active = true` rows; admin returns all.
`createPurchaseOption`: validates `name` non-empty; sets `created_by = req.user.mobile_number`.
`updatePurchaseOption`: updates `name` only.
`togglePurchaseOptionStatus`: flips `is_active`.

**`app.js`:** Add two mounts:
```
app.use('/api/v1/auth/estimates',     estimatesRoutes);    // stub — actual routes in M3
app.use('/api/v1/auth/purchase-data', purchaseDataRoutes);
```

### Frontend Work
None. Frontend integration for Purchase Data admin panel is in M9.

### Database Work
None new. Uses `purchase_data` table created in M1.

### Dependencies
- M1 complete (`purchase_data` table must exist)
- Existing `verifyJwt` middleware available at `../middleware/verifyJwt`
- Existing `requireAdmin` middleware for pattern reference

### Acceptance Criteria
```
✓ requireRole(['zo']) blocks a 'je' user with 403
✓ requireRole(['zo', 'admin']) allows an 'admin' user
✓ requireRole(['zo']) allows a 'zo' user
✓ GET /purchase-data returns only active options to non-admin
✓ GET /purchase-data returns all options (active + inactive) to admin
✓ POST /purchase-data with valid name returns 201
✓ POST /purchase-data by non-admin returns 403
✓ POST /purchase-data with empty name returns 400
✓ PUT /purchase-data/:id updates name; returns updated record
✓ PATCH /purchase-data/:id/status toggles is_active
✓ PATCH /purchase-data/:id/status with non-existent id returns 404
```

### Test Cases

**Test 1:** `GET /purchase-data` as `zo` user with 2 active + 1 inactive options in DB.
Expected: 200, array of 2 items.

**Test 2:** `GET /purchase-data` as `admin` user with same data.
Expected: 200, array of 3 items.

**Test 3:** `POST /purchase-data` as `admin`, body `{ "name": "Local Market" }`.
Expected: 201, object with new UUID and `is_active: true`.

**Test 4:** `POST /purchase-data` as `je` user.
Expected: 403 — "Access denied."

**Test 5:** `POST /purchase-data` as `admin`, body `{ "name": "  " }` (whitespace only).
Expected: 400 — name cannot be blank.

**Test 6:** `PATCH /purchase-data/:id/status` on an active option.
Expected: 200, `is_active: false`.

**Test 7:** Call `requireRole(['zo'])` with `req.user = undefined`.
Expected: 403 returned without crash.

### Exit Criteria
```
✓ All 7 test cases pass
✓ No open P1 defects
✓ requireRole pattern confirmed and ready to use in M3+
✓ Ready to begin M3
```

---

## M3 — Estimate CRUD & Draft Workflow

### Objective
Implement estimate creation and the full draft editing loop: create header, save/replace
line items, read single estimate (with embedded items and summary), read list. No
submission or review logic yet.

### Scope
- `createEstimate` — POST /estimates
- `saveDraftItems` — PUT /estimates/:id/items
- `getEstimates` — GET /estimates (role-filtered list)
- `getEstimateById` — GET /estimates/:id (with items + summary embedded)
- Routes file and app.js registration

### Deliverables
- JE can create an estimate header and receive a Draft record.
- JE can save, update, and replace line items in Draft status.
- JE can re-open the draft and see all data intact.
- List endpoint returns role-filtered estimates with deadline fields.
- Detail endpoint returns header + items + inline summary + name resolution.

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/controllers/estimates.controller.js` | NEW (partial — CRUD functions only) |
| `backend/src/routes/estimates.routes.js` | NEW (partial — read + JE write routes only) |
| `backend/src/app.js` | MODIFY — estimates route mount (already added in M2 as stub) |

### Backend Work

**`createEstimate(req, res)`** — `POST /estimates`

1. Validate: `work_order_no` required; `zonal_office_no` required and `.trim().length > 0`.
2. Fetch `projects_master` — 404 if missing; 403 if `status = 'Closed'`.
3. One-active-estimate gate: reject 409 if an estimate with non-terminal status already exists for this work order.
4. Auto-populate `estimate_no` from `projects_master.estimate_no`; `area_code` from `projects_master.zone`.
5. Insert with `estimate_revision = 0`, `estimate_status = 'Draft'`, `created_by + last_modified_by = req.user.mobile_number`.
6. Return 201 with created estimate header.

**`saveDraftItems(req, res)`** — `PUT /estimates/:id/items`

Full replacement semantics (entire item array sent each time).
1. Verify ownership (or admin). Status allowlist: `['Draft', 'ZO Revision Requested', 'HO Revision Requested']` — 403 otherwise.
2. In Draft: unrestricted full replacement.
3. In ZO/HO Revision Requested: reject modifications to Approved rows; reject new items.
4. Per-item: server calculates `amount = ROUND(rate * qty, 2)` — never trusted from client. Verify `unit` matches `material_master."M_Unit"` for the given `Material_Details`.
5. DELETE step: in Draft — delete items not in payload. In Revision — skip rows where `[stage]_office_approve = 'Approve'`.
6. UPSERT all payload items.
7. Call `_recalculateEstimateAmount(estimate_id, actual_current_status)`.
8. Return updated items array.

**`_recalculateEstimateAmount(estimateId, currentStatus)`** — shared helper (not a route).

Encapsulates the full status-to-calculation matrix. Called by `saveDraftItems`, `submitEstimate`, `submitReview`.

**`getEstimates(req, res)`** — `GET /estimates`

Role-filtered query:
- `je`/`staff`: own estimates only (`created_by = mobile_number`).
- `zo`: statuses Submitted, Under ZO Review, ZO Revision Requested, ZO Approved, Rejected by ZO.
- `ho`: active queue (ZO Approved, Under HO Review, HO Revision Requested) or `?view=history` (Final Approved, Rejected by HO).
- `admin`: all.

Join `projects_master` for site metadata. Include `active_revision_deadline` and `is_deadline_overdue` via lateral join on `estimate_revision_log`. Paginate (page + limit, cap 100).

**`getEstimateById(req, res)`** — `GET /estimates/:id`

1. Fetch header + project join.
2. Draft visibility: allow only `created_by` or admin — else 404 (not 403).
3. Fetch items ordered by `created_at ASC`.
4. Batch name resolution: `je_user_id`, `zo_approved_by`, `ho_approved_by` → `display_name` from `authorised_users`.
5. Fetch `active_revision_deadline` and `is_deadline_overdue` from `estimate_revision_log`.
6. Inline summary: `gross_*` category totals (all items) + `approved_grand_total` (= `estimate_amount`).
7. Return `{ estimate, items, summary }`.

**Routes (partial):**
```
GET  /              → getEstimates
GET  /:id           → getEstimateById
POST /              → requireRole(jeRoles), createEstimate
PUT  /:id/items     → requireRole(jeRoles), saveDraftItems
```

### Frontend Work
None. Frontend is M9.

### Database Work
None new. All queries use tables from M1.

### Dependencies
- M1 complete (tables and triggers)
- M2 complete (`requireRole` available)
- `material_master` table accessible for unit verification

### Acceptance Criteria
```
✓ JE creates estimate with valid Running work order → 201, status = 'Draft', estimate_revision = 0
✓ estimate_no auto-populated from projects_master (not user-entered)
✓ area_code auto-populated from projects_master.zone
✓ JE creates estimate on Closed project → 403
✓ JE creates second estimate on same active work order → 409
✓ zonal_office_no = "" (empty string) → 400
✓ saveDraftItems: amount stored as rate * qty (client amount ignored)
✓ saveDraftItems: unit mismatch vs material_master → 400
✓ saveDraftItems on Submitted estimate → 403
✓ Reload getEstimateById — all items preserved, summary correct
✓ getEstimates as je: own drafts visible, others' hidden
✓ getEstimates as zo: Draft estimates not returned
✓ getEstimateById on another user's Draft returns 404 (not 403)
✓ inline summary: gross_total matches sum of all item amounts
✓ Name resolution: je_name resolved from authorised_users.display_name
```

### Test Cases

**Test 1:** `POST /estimates` as `je`, body `{ work_order_no: "WO-001", zonal_office_no: "ZO-01" }` where WO-001 is Running.
Expected: 201, `{ estimate_status: "Draft", estimate_revision: 0, estimate_no: <from master> }`.

**Test 2:** `POST /estimates` with same `work_order_no` while first estimate is still Draft.
Expected: 409 — "An active estimate already exists for this work order."

**Test 3:** `POST /estimates` with `work_order_no` pointing to a Closed project.
Expected: 403 — "Cannot create estimates for Closed projects."

**Test 4:** `POST /estimates` with `zonal_office_no: "  "` (whitespace).
Expected: 400 — zonal_office_no required.

**Test 5:** `PUT /estimates/:id/items` with 3 items where client sends `amount = 9999` but `qty = 2, rate = 50`.
Expected: 200, all stored amounts = `100.00`.

**Test 6:** `PUT /estimates/:id/items` with `unit = "KG"` but `material_master` says `"Nos"` for that `Material_Details`.
Expected: 400 — unit mismatch.

**Test 7:** `PUT /estimates/:id/items` on an estimate with status `'Submitted'`.
Expected: 403 — cannot edit in current status.

**Test 8:** `GET /estimates` as `je` user — confirm only own estimates returned.
Expected: 200, all items have `created_by = req.user.mobile_number`.

**Test 9:** `GET /estimates/:id` on a Draft estimate belonging to a different `je`.
Expected: 404.

**Test 10:** `GET /estimates` as `zo` — confirm no Draft estimates in response.
Expected: 200, zero items with `estimate_status = 'Draft'`.

### Exit Criteria
```
✓ All 10 test cases pass
✓ _recalculateEstimateAmount helper verified for Draft status
✓ No open P1 defects
✓ Ready to begin M4
```

---

## M4 — Estimate Submission Workflow

### Objective
Implement `submitEstimate` — the action that transitions an estimate from Draft (or Revision
Requested) to Submitted, increments `estimate_revision`, manages resubmission attribution,
and triggers the ZO Telegram notification.

### Scope
- `submitEstimate` controller function
- `POST /estimates/:id/submit` route
- Telegram service: `notifyZoEstimateSubmitted`
- Telegram service `module.exports` update

### Deliverables
- JE can submit a Draft estimate → status transitions to `Submitted`.
- First submission stamps `je_user_id` and `je_date` (never overwritten on resubmit).
- Resubmissions close the open revision log entry and NULL out `Not Approve` rows.
- `estimate_revision` incremented on every submit (0→1 on first; N→N+1 on resubmit).
- ZO notified via Telegram on every submission (non-blocking, silent fallback).

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/controllers/estimates.controller.js` | MODIFY — add `submitEstimate` |
| `backend/src/routes/estimates.routes.js` | MODIFY — add `POST /:id/submit` |
| `backend/src/services/telegram.service.js` | MODIFY — add `notifyZoEstimateSubmitted` |

### Backend Work

**`submitEstimate(req, res)`** — `POST /estimates/:id/submit`

1. Fetch estimate; verify ownership + status ∈ `['Draft', 'ZO Revision Requested', 'HO Revision Requested']`.
2. Fetch all items; validate completeness: `material_main_head`, `sub_head`, `details` non-empty; `qty > 0`; `rate > 0`; `rate_reference` non-empty. `source_of_purchase` is optional — no validation. Return 422 with `[{ item_id, item_index, missing_fields }]` on failure.
3. Determine submission type: `isFirstSubmit`, `isZoResubmit`, `isHoResubmit`.
4. Increment `estimate_revision` by 1.
5. If `isZoResubmit`: collect item_ids where `zo_office_approve = 'Not Approve'`; NULL those out.
6. If `isHoResubmit`: collect item_ids where `ho_office_approve = 'Not Approve'`; NULL those out. `zo_office_approve` values untouched.
7. Update header: always set `estimate_status = 'Submitted'`, `estimate_revision`, `last_modified_by`. Set `je_user_id` and `je_date` only if `isFirstSubmit`.
8. If resubmit: update open revision log entry (`resubmitted_at = now()`, `resubmitted_by = mobile_number`, `modified_item_ids = <collected>`).
9. Call `_recalculateEstimateAmount(id, 'Submitted')`.
10. Non-blocking: call `notifyZoEstimateSubmitted(...)` (no await for response).
11. Return 200 with updated estimate.

**`notifyZoEstimateSubmitted(estimateInfo)`** in `telegram.service.js`:
- Fetch all `is_active = true` ZO users with `telegram_chat_id`.
- If none: `console.warn` with full estimate identifiers — no throw.
- Send formatted message to each recipient.
- Export from `module.exports`.

### Frontend Work
None.

### Database Work
None new.

### Dependencies
- M3 complete (`createEstimate` + `saveDraftItems` working)
- Existing `TELEGRAM_BOT_TOKEN` environment variable
- Existing `sendBotMessage` function in `telegram.service.js`

### Acceptance Criteria
```
✓ Draft estimate with valid items submits → status = 'Submitted', estimate_revision = 1
✓ je_user_id and je_date stamped on first submit only
✓ Second submit (resubmit) does not overwrite je_user_id or je_date
✓ estimate_revision increments correctly on every submission (0→1→2→...)
✓ Submit with incomplete item (qty = 0) → 422 with item-level error detail
✓ Submit with missing rate_reference → 422
✓ Submit with missing source_of_purchase → allowed (200)
✓ ZO Resubmit: Not Approve rows NULLed; Approve rows untouched
✓ ZO Resubmit: open revision log entry updated with resubmitted_at and modified_item_ids
✓ HO Resubmit: only ho_office_approve NULLed; zo_office_approve untouched
✓ submitEstimate called by non-owner non-admin → 403
✓ submitEstimate on Submitted estimate → 403
✓ Telegram notification sent to active ZO users (non-blocking — does not delay response)
✓ Telegram notification failure does not return 5xx to client
```

### Test Cases

**Test 1:** Submit a complete Draft estimate.
Expected: 200, `estimate_status = 'Submitted'`, `estimate_revision = 1`, `je_user_id` set.

**Test 2:** Submit the same estimate again (now in Submitted status).
Expected: 403 — invalid status.

**Test 3:** Submit with one item having `qty = 0`.
Expected: 422, error array contains `{ item_index: N, missing_fields: ['qty'] }`.

**Test 4:** Submit with `source_of_purchase = null` on all items.
Expected: 200 — optional field, no error.

**Test 5:** Simulate ZO Revision Requested status; submit (resubmit). Verify DB: items with `zo_office_approve = 'Not Approve'` → NULL. Items with `zo_office_approve = 'Approve'` unchanged. `je_user_id` unchanged. `estimate_revision` incremented.
Expected: 200, revision log entry updated.

**Test 6:** `POST /estimates/:id/submit` as a `zo` user.
Expected: 403 — wrong role.

**Test 7:** Disable `TELEGRAM_BOT_TOKEN`; submit a valid estimate.
Expected: 200 returned without error. `console.warn` logged.

### Exit Criteria
```
✓ All 7 test cases pass
✓ estimate_revision increment logic confirmed correct across all submission types
✓ No open P1 defects
✓ Ready to begin M5
```

---

## M5 — ZO Review Workflow

### Objective
Implement the ZO review path: opening an estimate for review (`reviewEstimate`), saving
row-level approval decisions atomically (`submitRowApprovals` via RPC), and finalising the
ZO decision (`submitReview`).

### Scope
- `reviewEstimate` — PATCH /estimates/:id/review
- `submitRowApprovals` — POST /estimates/:id/row-approvals
- `submitReview` — POST /estimates/:id/submit-review (ZO stage)

### Deliverables
- ZO can open a Submitted estimate → status transitions to `Under ZO Review`.
- ZO can mark row-level Approve / Not Approve decisions atomically.
- `estimate_amount` recalculates after each row-approvals call.
- ZO can submit review with all rows decided → status transitions to `ZO Approved` or `Rejected by ZO`.
- Attempting to submit review with undecided rows → 422.
- HO notified via Telegram on ZO Approval.

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/controllers/estimates.controller.js` | MODIFY — add `reviewEstimate`, `submitRowApprovals`, `submitReview` (ZO path) |
| `backend/src/routes/estimates.routes.js` | MODIFY — add review routes |
| `backend/src/services/telegram.service.js` | MODIFY — add `notifyHoEstimateApproved` |

### Backend Work

**`reviewEstimate(req, res)`** — `PATCH /estimates/:id/review`

1. Fetch estimate.
2. Status-to-role guard: `statusRoleMap = { 'Submitted': ['zo','admin'], 'ZO Approved': ['ho','admin'] }`. If status not in map → 403. If role not in `statusRoleMap[status]` → 403.
3. Revision deadline expiry check: query for open `estimate_revision_log` entry (`resubmitted_at IS NULL`). If found and `now() > revision_deadline` → auto-resubmit: mark log entry (`resubmitted_at = now()`, `resubmitted_by = NULL`, `is_auto_resubmitted = TRUE`, `modified_item_ids = '{}'`); set status to what it would be after manual resubmit; log `AUTO_RESUBMIT` to `audit_log`.
4. Transition: `'Submitted'` → `'Under ZO Review'`.
5. Update `estimate_status` and `last_modified_by`. Return updated estimate.

**`submitRowApprovals(req, res)`** — `POST /estimates/:id/row-approvals`

Body: `{ approvals: [{ item_id, approve_status, remarks? }] }`.

1. Fetch estimate. Stage guard: ZO only for `Under ZO Review`.
2. Validate all `item_id` values exist and belong to this estimate.
3. Validate all `approve_status` values are `'Approve'` or `'Not Approve'`.
4. Call `supabase.rpc('submit_row_approvals', { p_estimate_id, p_approvals, p_stage: 'ZO', p_modified_by })`.
   The RPC handles item updates + `estimate_amount` recalculation atomically.
5. Return updated items array.

**`submitReview(req, res)`** — `POST /estimates/:id/submit-review` (ZO stage handled here)

1. Fetch estimate + all items.
2. Stage guard: `Under ZO Review` → ZO only.
3. Validate all items have `zo_office_approve IS NOT NULL` → 422 if any are NULL.
4. `hasRejected = any item where zo_office_approve = 'Not Approve'`.
5. If `!hasRejected`: status → `'ZO Approved'`; stamp `zo_approved_by`, `zo_approval_date`, save `zo_remarks`; recalculate amount (approved rows only); call `notifyHoEstimateApproved` (non-blocking).
6. If `hasRejected`: status → `'Rejected by ZO'`.
7. Update estimate. Return updated estimate.

**`notifyHoEstimateApproved`** in `telegram.service.js` — same pattern as `notifyZoEstimateSubmitted` but targets active HO users.

### Frontend Work
None.

### Database Work
Uses `submit_row_approvals` RPC from M1. No new schema.

### Dependencies
- M4 complete (estimates in Submitted status exist)
- M1 complete (RPC function deployed)

### Acceptance Criteria
```
✓ ZO opens Submitted estimate → status = 'Under ZO Review'
✓ 'je' user calling reviewEstimate on Submitted estimate → 403
✓ 'zo' user calling reviewEstimate on ZO Approved estimate → 403 (wrong stage)
✓ submitRowApprovals writes zo_office_approve only (ho_office_approve untouched)
✓ submitRowApprovals with invalid item_id → 404
✓ submitRowApprovals with invalid approve_status → 400
✓ estimate_amount recalculated atomically after row approvals
✓ submitReview with all Approve → status = 'ZO Approved', zo fields stamped
✓ submitReview with one Not Approve → status = 'Rejected by ZO'
✓ submitReview before all rows decided → 422
✓ HO Telegram notification sent on ZO Approved (non-blocking)
✓ ZO cannot call submitReview on 'Under HO Review' estimate → 403
```

### Test Cases

**Test 1:** `PATCH /estimates/:id/review` as `zo` on Submitted estimate.
Expected: 200, `estimate_status = 'Under ZO Review'`.

**Test 2:** `PATCH /estimates/:id/review` as `je` on Submitted estimate.
Expected: 403.

**Test 3:** `POST /estimates/:id/row-approvals` with all items Approve.
Expected: 200, items show `zo_office_approve = 'Approve'`, `estimate_amount` = sum of all approved items.

**Test 4:** `POST /estimates/:id/row-approvals` with an `item_id` not belonging to this estimate.
Expected: 404.

**Test 5:** `POST /estimates/:id/row-approvals` with `approve_status = 'Maybe'`.
Expected: 400.

**Test 6:** `POST /estimates/:id/submit-review` before all items have been decided (some NULL).
Expected: 422 — "All rows must be marked."

**Test 7:** `POST /estimates/:id/submit-review` with all items Approve.
Expected: 200, `estimate_status = 'ZO Approved'`, `zo_approved_by` set.

**Test 8:** `POST /estimates/:id/submit-review` with one item Not Approve.
Expected: 200, `estimate_status = 'Rejected by ZO'`.

**Test 9:** Simulate concurrent calls to `submitRowApprovals` (rapid duplicate requests).
Expected: RPC atomicity — no partial state; idempotent result.

### Exit Criteria
```
✓ All 9 test cases pass
✓ RPC atomicity verified (no partial approval state possible)
✓ No open P1 defects
✓ Ready to begin M6
```

---

## M6 — Revision Workflow

### Objective
Implement the revision request path — ZO or HO can request JE to revise specific line items,
setting a deadline, creating a revision log entry, and transitioning status back to JE.

### Scope
- `requestRevision` — POST /estimates/:id/request-revision
- `getRevisionLog` — GET /estimates/:id/revisions
- Revision deadline expiry (auto-resubmit) already handled inside `reviewEstimate` in M5

### Deliverables
- ZO (Under ZO Review) or HO (Under HO Review) can request revision.
- At least one `Not Approve` row required; NULL rows do not count.
- Revision log entry created with computed deadline (custom or default 24h).
- JE sees amber/red deadline badge in list view (via `is_deadline_overdue` already in `getEstimates`).
- `getRevisionLog` returns enriched log with display names.

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/controllers/estimates.controller.js` | MODIFY — add `requestRevision`, `getRevisionLog` |
| `backend/src/routes/estimates.routes.js` | MODIFY — add `POST /:id/request-revision`, `GET /:id/revisions` |

### Backend Work

**`requestRevision(req, res)`** — `POST /estimates/:id/request-revision`

Body: `{ deadline_hours?: number, remarks?: string }`.

1. Fetch estimate + items.
2. Stage guard: `Under ZO Review` → ZO only; `Under HO Review` → HO only; others → 403.
3. Require at least one item with `[stage]_office_approve = 'Not Approve'`. NULL rows excluded. → 422 if none.
4. `revision_deadline = now() + ((deadline_hours || 24) hours)`.
5. `revision_cycle = MAX(revision_cycle for this estimate + stage) + 1`, defaulting to 1.
6. INSERT `estimate_revision_log` row.
7. UPDATE estimate: `estimate_status = 'ZO Revision Requested'` or `'HO Revision Requested'`; `last_modified_by`.
8. Return updated estimate + new revision log entry.

**`getRevisionLog(req, res)`** — `GET /estimates/:id/revisions`

1. Fetch all rows from `estimate_revision_log` WHERE `estimate_id = $1` ORDER BY `created_at ASC`.
2. Batch-fetch `display_name` for `requested_by` and `resubmitted_by` (where `is_auto_resubmitted = FALSE`).
3. Build enriched response: `requested_by_name`, `resubmitted_by_name` (or `'Auto-resubmitted by system'` when `is_auto_resubmitted = TRUE`).
4. Return enriched array.

### Frontend Work
None.

### Database Work
None new. Writes to `estimate_revision_log` from M1.

### Dependencies
- M5 complete (estimates must be in `Under ZO Review` to trigger revision)
- M3 complete (`saveDraftItems` must respect Revision Requested status restrictions — already implemented)

### Acceptance Criteria
```
✓ ZO requests revision on Under ZO Review estimate → status = 'ZO Revision Requested'
✓ revision_cycle = 1 on first revision for this estimate+stage
✓ revision_cycle = 2 on second revision for same estimate+stage
✓ deadline_hours = 48 → revision_deadline = now() + 48h
✓ deadline_hours omitted → revision_deadline = now() + 24h
✓ requestRevision with no Not Approve rows (all NULL or all Approve) → 422
✓ requestRevision with at least one Not Approve → 201/200, log entry created
✓ getRevisionLog returns entries ordered by created_at ASC
✓ Auto-resubmitted entry shows 'Auto-resubmitted by system' (no name lookup)
✓ getRevisionLog shows resolved display_name for human resubmissions
✓ JE cannot call requestRevision → 403
```

### Test Cases

**Test 1:** ZO calls `POST /estimates/:id/request-revision` with estimate in `Under ZO Review`, one item `Not Approve`, `deadline_hours = 48`.
Expected: 200, `estimate_status = 'ZO Revision Requested'`, revision log entry with `revision_deadline = now() + 48h`.

**Test 2:** ZO calls `requestRevision` with all items NULL (no decisions made yet).
Expected: 422 — "At least one row must be marked Not Approve."

**Test 3:** ZO calls `requestRevision` with all items Approve (no rejects).
Expected: 422 — same error.

**Test 4:** Simulate two revision cycles; check `revision_cycle` values.
Expected: first entry has `revision_cycle = 1`, second has `revision_cycle = 2`.

**Test 5:** `GET /estimates/:id/revisions` after one manual and one auto resubmission.
Expected: manual entry shows `resubmitted_by_name = display_name`; auto entry shows `'Auto-resubmitted by system'`.

**Test 6:** `POST /estimates/:id/request-revision` as `je` user.
Expected: 403.

### Exit Criteria
```
✓ All 6 test cases pass
✓ Revision log correctly tracks all cycles
✓ No open P1 defects
✓ Ready to begin M7
```

---

## M7 — HO Review Workflow

### Objective
Implement the HO review path: open ZO-Approved estimate for HO review, save HO row-level
decisions, and submit final HO decision (Final Approved or Rejected by HO).

### Scope
- `reviewEstimate` (HO path) — already implemented in M5 (status transition `ZO Approved` → `Under HO Review`); validate it works end-to-end here.
- `submitRowApprovals` (HO stage) — already implemented in M5 via RPC; validate HO field isolation.
- `submitReview` (HO stage) — extend `submitReview` from M5 to handle HO path.

### Deliverables
- HO can open a ZO-Approved estimate → status transitions to `Under HO Review`.
- HO marks row-level decisions (only `ho_office_approve` written; `zo_office_approve` untouched).
- HO submits final review → `Final Approved` or `Rejected by HO`.
- `estimate_amount` on Final Approved = sum of rows where both ZO and HO = Approve.

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/controllers/estimates.controller.js` | MODIFY — complete HO path in `submitReview` |

### Backend Work

**`reviewEstimate`** HO path (already in M5): `ZO Approved` → `Under HO Review`. Confirm status-to-role guard blocks ZO from opening HO-stage estimates.

**`submitRowApprovals`** HO stage: already handled by RPC via `p_stage = 'HO'`. Confirm `zo_office_approve` is untouched (verify DB after call).

**`submitReview`** HO stage extension:
1. Stage guard: `Under HO Review` → HO only.
2. All items must have `ho_office_approve IS NOT NULL` → 422 if any NULL.
3. `hasRejected = any item where ho_office_approve = 'Not Approve'`.
4. If `!hasRejected`: status → `'Final Approved'`; stamp `ho_approved_by`, `ho_approval_date`, save `ho_remarks`; recalculate amount (rows where both ZO and HO = Approve).
5. If `hasRejected`: status → `'Rejected by HO'`.
6. Update estimate. Return updated estimate.

### Frontend Work
None.

### Database Work
No new schema. Confirm `_recalculateEstimateAmount` returns `SUM where zo = Approve AND ho = Approve` for `Final Approved` status.

### Dependencies
- M5 complete (ZO workflow must produce `ZO Approved` estimates)
- M6 complete (revision loop validated — HO can also trigger revisions)

### Acceptance Criteria
```
✓ HO opens ZO Approved estimate → status = 'Under HO Review'
✓ ZO cannot open ZO Approved estimate (wrong role for that status) → 403
✓ submitRowApprovals (HO stage) writes ho_office_approve only
✓ zo_office_approve values unchanged after HO row approval call
✓ HO submitReview all Approve → status = 'Final Approved', ho fields stamped
✓ HO submitReview with one Not Approve → status = 'Rejected by HO'
✓ estimate_amount at Final Approved = SUM where both zo AND ho = 'Approve'
✓ estimate_amount at Rejected by HO = SUM of all items
✓ HO cannot call submitReview on Under ZO Review estimate → 403
✓ JE cannot call submitRowApprovals (HO stage) → 403
```

### Test Cases

**Test 1:** `PATCH /estimates/:id/review` as `ho` on `ZO Approved` estimate.
Expected: 200, `estimate_status = 'Under HO Review'`.

**Test 2:** `PATCH /estimates/:id/review` as `zo` on `ZO Approved` estimate.
Expected: 403 — ZO cannot open HO-stage estimates.

**Test 3:** `POST /estimates/:id/row-approvals` as `ho` with stage `HO`. Verify DB: `ho_office_approve` updated; `zo_office_approve` unchanged.
Expected: 200, field isolation confirmed.

**Test 4:** `POST /estimates/:id/submit-review` as `ho` with all items Approve.
Expected: 200, `estimate_status = 'Final Approved'`. `estimate_amount` = sum of dual-approved rows only.

**Test 5:** `POST /estimates/:id/submit-review` as `ho` with one item Not Approve.
Expected: 200, `estimate_status = 'Rejected by HO'`. `estimate_amount` = sum of all items.

**Test 6:** Full end-to-end: JE create → submit → ZO review + approve all → HO review + approve all → Final Approved. Verify `estimate_amount` at each stage.
Expected: all transitions correct; final amount reflects only dual-approved rows.

### Exit Criteria
```
✓ All 6 test cases pass including end-to-end flow (Test 6)
✓ estimate_amount calculation matrix verified for all 10 statuses
✓ No open P1 defects
✓ Ready to begin M8
```

---

## M8 — Audit Trail & Notifications

### Objective
Validate that all status transitions are correctly captured in `audit_log` by the DB trigger,
and that both Telegram notification functions are complete, exported, and behave correctly
under all fallback conditions.

### Scope
- Audit trigger verification across all status transitions
- `notifyZoEstimateSubmitted` and `notifyHoEstimateApproved` — full validation
- `telegram.service.js` module.exports correctness

### Deliverables
- Verified `audit_log` entries for every possible status transition in the workflow.
- Telegram notifications confirmed non-blocking and silent-fallback compliant.
- `module.exports` in `telegram.service.js` includes both new functions without removing existing ones.

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/services/telegram.service.js` | VERIFY / FINALISE — both notification functions + module.exports |

### Backend Work

**Audit trail verification:** `trg_audit_estimate_status` (deployed in M1) fires on every
`UPDATE` to `project_cost_estimates` that changes `estimate_status`. Verify:
- `user_id` = `last_modified_by` (always set by controller before every UPDATE).
- `old_value` and `new_value` are correct JSON with both `estimate_status` and `estimate_revision`.
- `AUTO_RESUBMIT` entries: `user_id = NULL` (no fake mobile number).
- All 10 statuses appear as either old or new values across the full workflow.

**Telegram service:** Both functions already written in M4/M5. This milestone finalises
and validates them:
- `notifyZoEstimateSubmitted`: called from `submitEstimate` — verify non-blocking (`void` return used, no `await` in controller response path).
- `notifyHoEstimateApproved`: called from `submitReview` ZO path on `ZO Approved` transition.
- Both: if `TELEGRAM_BOT_TOKEN` unset → `console.warn`, no throw.
- Both: if no recipients with `telegram_chat_id` → `console.warn` with full estimate identifiers.
- `module.exports`: must export `sendOtp`, `startPolling`, `notifyZoEstimateSubmitted`, `notifyHoEstimateApproved`.

### Frontend Work
None.

### Database Work
Read-only verification of `audit_log` entries. No schema changes.

### Dependencies
- M5 complete (ZO workflow produces audit entries)
- M7 complete (HO workflow completes all possible status values)

### Acceptance Criteria
```
✓ audit_log has an entry for each of the 10 possible status transitions triggered during M3–M7 tests
✓ audit_log.user_id = the mobile number of the acting user for all manual transitions
✓ audit_log.user_id = NULL for AUTO_RESUBMIT entries
✓ old_value.estimate_status matches pre-transition status
✓ new_value.estimate_status matches post-transition status
✓ notifyZoEstimateSubmitted does not block the submitEstimate response
✓ notifyHoEstimateApproved does not block the submitReview response
✓ Both functions: missing TELEGRAM_BOT_TOKEN → console.warn, 200 still returned
✓ Both functions: no telegram_chat_id recipients → console.warn with estimate identifiers
✓ telegram.service.js module.exports includes all 4 functions; sendOtp and startPolling unmodified
```

### Test Cases

**Test 1:** Execute full workflow end-to-end; query `audit_log WHERE module_name = 'Project Cost Estimate'`.
Expected: rows present for every status transition; `old_value → new_value` chain is contiguous.

**Test 2:** Trigger auto-resubmit (simulate expired deadline); check `audit_log`.
Expected: `action = 'AUTO_RESUBMIT'`, `user_id = NULL`.

**Test 3:** Submit an estimate with `TELEGRAM_BOT_TOKEN` unset. Check response.
Expected: 200 returned. `console.warn` logged — no 5xx.

**Test 4:** Submit an estimate where no ZO users have `telegram_chat_id`. Check response.
Expected: 200 returned. `console.warn` includes `estimate_id`, `work_order_no`, `estimate_no`.

**Test 5:** Verify `require('../services/telegram.service')` exports `notifyZoEstimateSubmitted` and `notifyHoEstimateApproved`.
Expected: both functions are defined and callable.

**Test 6:** Verify `sendOtp` and `startPolling` still work after M4/M5 modifications to `telegram.service.js`.
Expected: existing Phase 1 auth tests still pass.

### Exit Criteria
```
✓ All 6 test cases pass
✓ Audit trail complete and correct for all 10 status values
✓ No regressions in existing Telegram functions
✓ No open P1 defects
✓ Backend implementation 100% complete
✓ Ready to begin M9
```

---

## M9 — Frontend Integration

### Objective
Implement all Phase 2 React pages and UI components: Estimates list, EstimateForm (create/edit),
EstimateView (detail + review), Purchase Data admin tab, sidebar nav, routing, and Dashboard
stat card.

### Scope
All Phase 2 frontend pages and modifications listed in the implementation plan.

### Deliverables
- `/estimates` — role-filtered list with status badges, deadline escalation, and filters.
- `/estimates/new` — header creation form with work order selection and auto-population.
- `/estimates/:id/edit` — draft/revision editing with line items table, material cascade, countdown timer.
- `/estimates/:id` — read-only detail + ZO/HO inline review controls + revision history tab.
- Admin panel: Purchase Data tab (list, add, toggle).
- Sidebar: "Cost Estimates" nav item.
- App.jsx: 4 new routes.
- Dashboard: stat card for estimates.

### Files Created or Modified
| File | Action |
|---|---|
| `frontend/src/api/estimatesApi.js` | NEW |
| `frontend/src/pages/Estimates.jsx` | NEW |
| `frontend/src/pages/EstimateForm.jsx` | NEW |
| `frontend/src/pages/EstimateView.jsx` | NEW |
| `frontend/src/App.jsx` | MODIFY — add 4 routes |
| `frontend/src/components/Sidebar.jsx` | MODIFY — add nav item |
| `frontend/src/pages/Dashboard.jsx` | MODIFY — add stat card |
| `frontend/src/pages/admin/AdminPanel.jsx` | MODIFY — add Purchase Data tab |

### Backend Work
None. All backend endpoints completed in M3–M8.

### Frontend Work

**`estimatesApi.js`:**
12 exported functions wrapping `authApi` calls to all estimate and purchase-data endpoints.
No `getEstimateItems` or `getEstimateSummary` exports (removed per plan).

**`Estimates.jsx` (list page):**
- Stat cards: counts by status appropriate to role.
- Table columns: `work_order_no`, `estimate_no`, status badge, INR-formatted amount, `updated_at`.
- `estimate_revision` column hidden for `je`/`staff`.
- Status badge colour map: all 10 statuses, amber→red escalation on `is_deadline_overdue`.
- JE/admin: "New Estimate" CTA. HO: active / history tabs.
- TanStack Query; row click → `/estimates/:id`.

**`EstimateForm.jsx` (create + edit):**
- `/estimates/new`: header form (work order dropdown filtered to Running + Complete Under Maintenance; auto-populate Estimate No, State, District, Area Code, Department, Site Details; `zonal_office_no` text; `je_remarks` textarea).
- `/estimates/:id/edit`: loads `getEstimateById`; `active_revision_deadline` drives countdown; form disabled at zero with expiry message.
- Line items table: virtualised/paginated for 500+ rows. Per row: 3-level material cascade (L2 filtered by L1; L3 filtered by L2); `unit` auto-filled (read-only); `qty`, `rate` inputs; `amount` calculated (read-only, INR); `rate_reference` text; `source_of_purchase` dropdown from `getPurchaseOptions()`; delete button (Draft only).
- Revision mode: rejected rows (Not Approve) editable with amber border; approved rows read-only.
- Add row button (Draft only). Save Draft / Submit buttons.
- Full replacement semantics: entire items array sent on Save Draft.

**`EstimateView.jsx` (detail + review):**
- Sections: estimate header metadata, line items table (read-only), summary footer, revision history tab.
- ZO review mode (role = zo, status = Under ZO Review): per-row inline Approve/Not Approve dropdown + remarks; running total updates; "Request Revision" modal (optional deadline_hours); "Submit Review" button disabled until all rows decided.
- HO review mode: identical UX to ZO.
- Summary: "Gross Total" and "Approved Grand Total" labelled distinctly.
- Revision history: accordion; auto-resubmitted rows show "Auto-resubmitted by system".
- Context-sensitive actions: JE+Draft → edit link; ZO/HO review controls inline.

**`AdminPanel.jsx` — Purchase Data tab:**
List of options with name and active status. Add form. Toggle active button.
Consistent glassmorphism styling matching existing tabs.

**`App.jsx`:**
```jsx
<Route path="/estimates"          element={<Estimates />} />
<Route path="/estimates/new"      element={<EstimateForm />} />
<Route path="/estimates/:id"      element={<EstimateView />} />
<Route path="/estimates/:id/edit" element={<EstimateForm />} />
```
All under `allowedRoles={['staff','je','zo','ho','admin']}` ProtectedRoute.

**`Dashboard.jsx`:** Add estimates stat card: total count + pending count. Consistent with existing card pattern.

### Database Work
None.

### Dependencies
- M3–M8 all complete (all backend endpoints operational)
- `authApi` Axios instance already configured with JWT
- TanStack Query already used in project
- Existing glassmorphism / INR-format / badge patterns from Phase 1 UI

### Acceptance Criteria
```
✓ JE can create estimate from /estimates/new; redirected to list on creation
✓ Work order dropdown shows only Running and Complete Under Maintenance projects
✓ Estimate No, Area Code, State, District auto-populate on work order selection
✓ Line items table supports add / edit / delete in Draft mode
✓ Material L2 dropdown filtered by L1 selection; L3 filtered by L2
✓ Unit auto-filled from material_master (read-only)
✓ amount = rate × qty displayed live (read-only)
✓ Save Draft preserves all items on page reload
✓ Revision mode: approved rows locked; rejected rows editable with amber border
✓ Countdown timer shows on /estimates/:id/edit when revision deadline active
✓ Form disabled with expiry message when countdown reaches zero
✓ ZO review: all rows must be decided before Submit Review enabled
✓ "Request Revision" modal: deadline_hours input, submit creates revision log entry
✓ HO review: identical UX to ZO; zo_office_approve column visible in table
✓ Summary footer: Gross Total and Approved Grand Total labelled distinctly
✓ Revision history tab: entries ordered oldest-first; auto entries labelled correctly
✓ Status badges use correct colours for all 10 statuses
✓ is_deadline_overdue = true → amber badge escalates to red
✓ estimate_revision column hidden for je/staff on list view
✓ Purchase Data admin tab: add, list, toggle active working
✓ Sidebar shows "Cost Estimates" nav item for all Phase 2 roles
✓ Dashboard stat card shows correct counts
✓ All 4 routes registered and accessible to correct roles
```

### Test Cases

**Test 1:** JE navigates to `/estimates/new`, selects work order, fills zonal_office_no, saves.
Expected: redirected to list; new Draft row visible.

**Test 2:** JE selects a Closed work order in the dropdown.
Expected: Closed projects not shown in dropdown (filtered out).

**Test 3:** JE adds 3 line items, saves draft, reloads page.
Expected: all 3 items present with correct amounts.

**Test 4:** JE adds item with qty = 2, rate = 150. Verify amount display.
Expected: amount = ₹300.00, read-only.

**Test 5:** Navigate to `/estimates` as ZO. Verify Draft estimates not visible.
Expected: no Draft status rows in table.

**Test 6:** ZO opens Under ZO Review estimate. Mark 2 items Approve, 1 Not Approve. Verify Submit Review is enabled after all 3 are marked.
Expected: button enabled only after 3rd row marked.

**Test 7:** ZO clicks "Request Revision" with one Not Approve row; enters deadline_hours = 48. Submits.
Expected: estimate status changes to ZO Revision Requested; amber badge visible in list.

**Test 8:** Simulate deadline overdue (`is_deadline_overdue = true` in API response). Check list view.
Expected: badge colour = red.

**Test 9:** JE opens `/estimates/:id/edit` with active revision deadline countdown; wait for zero.
Expected: form inputs disabled; expiry message displayed.

**Test 10:** Admin navigates to AdminPanel → Purchase Data tab. Adds "Local Market", then deactivates it.
Expected: option appears in list; toggle changes is_active to false.

### Exit Criteria
```
✓ All 10 test cases pass
✓ No console errors in browser during any workflow path
✓ Full end-to-end flow (JE → ZO → HO → Final Approved) completable through UI
✓ No open P1 or P2 defects
✓ Ready to begin M10
```

---

## M10 — UAT & Release Gate

### Objective
End-to-end user acceptance testing across all roles and all workflow paths. Confirm the
implementation matches the approved plan. Obtain sign-off before Phase 2 goes live.

### Scope
Full workflow coverage by a real or designated test user for each role.
Regression check: Phase 1 functionality unaffected.

### Deliverables
- Completed UAT test log (pass/fail against each scenario below)
- Zero open P1 defects
- Phase 1 regression sign-off
- Deployment to production environment

### Files Created or Modified
No code changes expected. Any defects found during UAT → fix → re-test before exit.

### Backend Work
Production deployment: run migrations 08–11 on production Supabase project.

### Frontend Work
Production build and deployment.

### Database Work
Migrations 08–11 applied to production in sequence.

### Dependencies
- M9 complete (all frontend pages working)
- Staging or production environment with representative master data (`projects_master`, `material_master`, `authorised_users` with je/zo/ho roles assigned)

### Acceptance Criteria

**Full workflow — Happy Path:**
```
✓ JE creates estimate for a Running work order
✓ JE adds 5+ line items (multiple material categories)
✓ JE saves draft; reloads; data preserved
✓ JE submits estimate; status = Submitted
✓ ZO receives Telegram notification
✓ ZO opens estimate → Under ZO Review
✓ ZO marks all rows Approve
✓ ZO submits review → ZO Approved; estimate_amount = sum of approved rows
✓ HO receives Telegram notification
✓ HO opens estimate → Under HO Review
✓ HO marks all rows Approve
✓ HO submits review → Final Approved; estimate_amount = sum of dual-approved rows
```

**Revision Path — ZO:**
```
✓ ZO marks 2 rows Not Approve; requests revision (deadline 48h)
✓ JE sees amber badge; opens edit form with countdown
✓ JE edits Not Approve rows; resubmits
✓ estimate_revision incremented; ZO revision log entry closed
✓ ZO reviews again; approves all → ZO Approved
```

**Revision Path — HO:**
```
✓ HO marks 1 row Not Approve; requests revision
✓ JE sees orange badge; resubmits
✓ zo_office_approve values from ZO stage untouched
✓ HO reviews again; approves all → Final Approved
```

**Rejection Paths:**
```
✓ ZO submits review with Not Approve rows → Rejected by ZO
✓ HO submits review with Not Approve rows → Rejected by HO
✓ JE can create new estimate for same work order after Rejected by ZO
```

**Security & Authorization:**
```
✓ JE cannot access /estimates/:id/review endpoint
✓ ZO cannot see Draft estimates in list
✓ ZO cannot open HO-stage estimates
✓ JE cannot view another JE's Draft estimate
✓ Hard DELETE on estimate table blocked at DB level
```

**Audit Trail:**
```
✓ audit_log shows all status transitions with correct acting user
✓ Auto-resubmit entry shows user_id = NULL
```

**Phase 1 Regression:**
```
✓ Login / OTP flow works as before
✓ Existing admin/materials/projects routes unaffected
✓ sendOtp Telegram function unaffected
✓ No new roles break existing staff/admin functionality
```

### Test Cases

**Scenario A — Full Approval Cycle:**
JE (test account) → create → submit → ZO (test account) → approve all → HO (test account) → approve all.
Expected: Final Approved, correct amounts at each stage.

**Scenario B — ZO Revision Cycle:**
JE submit → ZO mark 1 Not Approve → Request Revision → JE resubmit → ZO approve all → ZO Approved.
Expected: revision log has 1 entry; estimate_revision = 2 after resubmit.

**Scenario C — HO Revision After ZO Approval:**
Scenario A up to ZO Approved → HO marks 1 Not Approve → Request Revision → JE resubmit → HO approve all → Final Approved.
Expected: zo_office_approve values unchanged through HO revision; final amount correct.

**Scenario D — ZO Rejection:**
JE submit → ZO mark all Not Approve → Submit Review → Rejected by ZO.
Expected: terminal status; JE can start new estimate for same work order.

**Scenario E — Auto-Resubmit:**
ZO requests revision with 1h deadline → wait for expiry → ZO opens estimate via `reviewEstimate`.
Expected: auto-resubmit fires, status returns to correct pre-review state, audit log entry with `user_id = NULL`.

**Scenario F — Concurrent Write Safety:**
Two users simultaneously call `submitRowApprovals` on the same estimate.
Expected: no partial approval state; final DB state is consistent.

**Scenario G — Phase 1 Regression:**
Run existing Phase 1 smoke tests (login, OTP, admin panel, materials, projects).
Expected: all pass without change.

### Exit Criteria
```
✓ All 7 UAT scenarios pass
✓ All Acceptance Criteria above checked ✓
✓ Zero open P1 defects
✓ Zero open P2 defects that block go-live
✓ Migrations 08–11 applied successfully to production
✓ Phase 1 regression sign-off obtained
✓ Phase 2 released to production
```

---

## Appendix A — Dependency Graph

```
M1 (DB Foundation)
 └── M2 (Middleware + Purchase Data API)
      └── M3 (Estimate CRUD + Draft)
           └── M4 (Submission Workflow)
                └── M5 (ZO Review)
                     ├── M6 (Revision Workflow)
                     │    └── M7 (HO Review)
                     │         └── M8 (Audit + Notifications)
                     │              └── M9 (Frontend Integration)
                     │                   └── M10 (UAT)
                     └── M7 (HO Review) ──┘
```

---

## Appendix B — File Inventory by Milestone

| File | Milestone(s) |
|---|---|
| `migrations/08_extend_user_roles.sql` | M1 |
| `migrations/09_create_purchase_data.sql` | M1 |
| `migrations/10_create_project_cost_estimates.sql` | M1 |
| `migrations/11_create_approval_rpc.sql` | M1 |
| `middleware/requireRole.js` | M2 |
| `controllers/purchaseData.controller.js` | M2 |
| `routes/purchaseData.routes.js` | M2 |
| `app.js` | M2 (purchase-data mount) |
| `controllers/estimates.controller.js` | M3 (CRUD) → M4 (submit) → M5 (ZO review) → M6 (revision) → M7 (HO review) |
| `routes/estimates.routes.js` | M3 → M4 → M5 → M6 → M7 |
| `services/telegram.service.js` | M4 (ZO notify) → M5 (HO notify) → M8 (verify) |
| `frontend/src/api/estimatesApi.js` | M9 |
| `frontend/src/pages/Estimates.jsx` | M9 |
| `frontend/src/pages/EstimateForm.jsx` | M9 |
| `frontend/src/pages/EstimateView.jsx` | M9 |
| `frontend/src/App.jsx` | M9 |
| `frontend/src/components/Sidebar.jsx` | M9 |
| `frontend/src/pages/Dashboard.jsx` | M9 |
| `frontend/src/pages/admin/AdminPanel.jsx` | M9 |

---

## Appendix C — Status Transition Reference

```
Draft
  └─[JE submit]──────────────────► Submitted
                                        └─[ZO reviewEstimate]──► Under ZO Review
                                                                      ├─[ZO submitReview, all Approve]──► ZO Approved
                                                                      │                                        └─[HO reviewEstimate]──► Under HO Review
                                                                      │                                                                      ├─[HO submitReview, all Approve]──► Final Approved
                                                                      │                                                                      ├─[HO submitReview, any Not Approve]──► Rejected by HO
                                                                      │                                                                      └─[HO requestRevision]──► HO Revision Requested
                                                                      │                                                                                                       └─[JE submit / auto]──► Submitted (→ ZO Approved → Under HO Review)
                                                                      ├─[ZO submitReview, any Not Approve]──► Rejected by ZO
                                                                      └─[ZO requestRevision]──► ZO Revision Requested
                                                                                                      └─[JE submit / auto]──► Submitted
```

---

*End of Phase 2 Execution Plan*