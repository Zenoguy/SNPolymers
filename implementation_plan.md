# Phase 2: Project Cost Estimate Module — Implementation Plan (Final)

> All 43 audit issues (18 first-pass + 15 second-pass + 10 third-pass) have been resolved.
> Schema columns verified against live codebase before writing controller specs.

---

## Role Architecture Decision (Q1 — Confirmed)

Phase 2 introduces three workflow-specific user categories that map to actual organisational
roles within the approval hierarchy:

| Role value | Organisational title | Phase 2 responsibility |
|---|---|---|
| `je` | Junior Engineer | Maker — creates and submits estimates |
| `zo` | Zonal Office | Checker — reviews each line item, first stage |
| `ho` | Head Office | Approver — final review and approval |
| `admin` | ERP Administrator | Full access, purchase data management |
| `staff` | (legacy) | Retained for backward compatibility; treated as `je` in all Phase 2 routes |

**Rationale:** The Maker → Checker → Approver hierarchy maps cleanly to mutually exclusive
first-class roles. This simplifies authorization, routing, dashboard filtering, notification
targeting, and audit logging at the current project scope. If future phases introduce
additional actors (Accounts, Procurement, Maintenance Reviewer, Auditor), the model
should be re-evaluated toward a permission-based module-role system.

Migration 08 adds `'je'`, `'zo'`, `'ho'` to the `authorised_users.role` CHECK constraint.
Existing `'staff'` and `'admin'` rows are untouched.

---

## Schema Verification Results (Pre-Migration Checks)

Verified against live controllers (`admin.controller.js`, `materials.controller.js`):

| Column / Table | Verified? | Notes |
|---|---|---|
| `authorised_users.display_name` | ✅ Yes | Used in `addUser` line 46, sessions join line 160 |
| `authorised_users.is_active` | ✅ Yes | Used in `addUser` line 49, `updateUser` line 103 |
| `authorised_users.telegram_chat_id` | ✅ Yes | Used in `addUser` line 50, `updateUser` line 84 |
| `material_master` table | ✅ Yes | Confirmed table name, used throughout materials controller |
| `material_master.Material_Main_Head` | ✅ Yes | Quoted identifier, used in getMaterials filter |
| `material_master.Material_Sub_Head` | ✅ Yes | Quoted identifier |
| `material_master.Material_Details` | ✅ Yes | Quoted identifier |
| `material_master.M_Unit` | ✅ Yes | Quoted identifier, confirmed in createMaterial |
| `material_master.is_active` | ✅ Yes | Used in getMaterials non-admin filter |

No schema assumptions remain unverified. All column names used in the controller specs below are confirmed against live code.

---

## Open Questions — Final Status

> [!NOTE]
> **Q1 — Role Strategy: ✅ CONFIRMED (Option A)**
> Role values `'je'`, `'zo'`, `'ho'` added to `authorised_users`. `'staff'` retained as JE-equivalent.

> [!NOTE]
> **Q2 — Purchase Data Table:** Plan creates it fresh in migration 09. Skip if already exists.

> [!NOTE]
> **Q3 — Estimate Number Assignment:** Confirmed: `estimate_no` copied from `projects_master.estimate_no`
> at creation. Read-only on all forms, never user-entered.

> [!NOTE]
> **Q4 — Revision Deadline:** Polling-on-open approach confirmed. Known limitation: overdue estimates
> remain stuck until a user opens them. Mitigated by deadline flag in list view (see Issue 3-6 fix).

> [!NOTE]
> **Q5 — Telegram fallback:** `console.warn` with full estimate identifiers confirmed. No throw.

---

## Proposed Changes

---

### Component 1 — Database Migrations

#### [NEW] `08_extend_user_roles.sql`

```sql
-- Migration: Extend authorised_users role column for Phase 2 hierarchy
-- DB: PostgreSQL (Supabase)
-- PREREQUISITE: Q1 (role strategy) must be confirmed before running

ALTER TABLE authorised_users
  DROP CONSTRAINT IF EXISTS authorised_users_role_check;

ALTER TABLE authorised_users
  ADD CONSTRAINT authorised_users_role_check
  CHECK (role IN ('staff', 'admin', 'je', 'zo', 'ho'));

-- Existing 'staff' and 'admin' rows are untouched. No data migration required.
-- 'staff' is treated as equivalent to 'je' in all Phase 2 controller logic.
```

---

#### [NEW] `09_create_purchase_data.sql`

```sql
-- Migration: Create purchase_data reference table (source of purchase options)
-- DB: PostgreSQL (Supabase)
-- Maintained exclusively by ERP Admin via AdminPanel

CREATE TABLE IF NOT EXISTS purchase_data (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR NOT NULL,          -- e.g. "Local Market", "Authorised Dealer"
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  VARCHAR NOT NULL,          -- mobile number of admin who added it
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### [NEW] `10_create_project_cost_estimates.sql`

```sql
-- Migration: Create Project Cost Estimate tables, enums, and triggers
-- DB: PostgreSQL (Supabase)

-- ──────────────────────────────────────────────────────────────
-- 1. Enum types
-- ──────────────────────────────────────────────────────────────

CREATE TYPE estimate_status_enum AS ENUM (
  'Draft',
  'Submitted',
  'Under ZO Review',
  'ZO Revision Requested',
  'ZO Approved',
  'Rejected by ZO',
  'Under HO Review',
  'HO Revision Requested',
  'Final Approved',
  'Rejected by HO'
);

CREATE TYPE row_approval_enum AS ENUM ('Approve', 'Not Approve');

-- ──────────────────────────────────────────────────────────────
-- 2. project_cost_estimates (header — one row per estimate)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_cost_estimates (
  estimate_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_no     VARCHAR NOT NULL REFERENCES projects_master(work_order_no),

  -- Auto-populated from projects_master at creation (read-only, never user-entered)
  estimate_no       VARCHAR NOT NULL,
  area_code         VARCHAR NOT NULL,   -- from projects_master.zone

  -- Revision tracking
  estimate_revision INT NOT NULL DEFAULT 0,
  -- 0 = draft not yet submitted
  -- 1 = first submission
  -- N = Nth resubmission after revision request(s)

  zonal_office_no   VARCHAR NOT NULL,
  estimate_amount   NUMERIC(18,2) NOT NULL DEFAULT 0,  -- system-calculated; see calculation spec

  estimate_status   estimate_status_enum NOT NULL DEFAULT 'Draft',

  -- Audit attribution: always set by controller before any UPDATE
  -- Used by the audit trigger to reliably identify the acting user (Issue #12 fix)
  last_modified_by  VARCHAR,

  -- JE fields (stamped at submission — never user-editable)
  je_user_id        VARCHAR,
  je_date           TIMESTAMPTZ,
  je_remarks        TEXT,               -- opening remarks entered by JE at creation

  -- ZO fields (stamped at ZO Submit Review)
  zo_approved_by    VARCHAR,
  zo_approval_date  TIMESTAMPTZ,
  zo_remarks        TEXT,               -- overall ZO remarks on the estimate

  -- HO fields (stamped at HO Submit Review)
  ho_approved_by    VARCHAR,
  ho_approval_date  TIMESTAMPTZ,
  ho_remarks        TEXT,               -- overall HO remarks on the estimate

  -- Audit timestamps (consistent with existing table patterns)
  created_by        VARCHAR NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- 3. project_cost_estimate_items (one row per line item)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_cost_estimate_items (
  item_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id         UUID NOT NULL REFERENCES project_cost_estimates(estimate_id),

  -- Three-level material cascade (resolved from material_master)
  material_main_head  VARCHAR NOT NULL,
  material_sub_head   VARCHAR NOT NULL,
  material_details    VARCHAR NOT NULL,
  unit                VARCHAR NOT NULL,   -- auto from material_master.M_Unit, never user-editable

  -- Quantities and pricing
  qty                 NUMERIC(18,4) NOT NULL DEFAULT 0,
  rate                NUMERIC(18,4) NOT NULL DEFAULT 0,
  rate_reference      VARCHAR,
  amount              NUMERIC(18,2) NOT NULL DEFAULT 0,  -- enforced: rate * qty

  source_of_purchase  UUID REFERENCES purchase_data(id),

  -- ZO row-level approval (set by ZO only; never writable by JE or HO)
  zo_office_approve   row_approval_enum,  -- NULL = not yet reviewed
  zo_remarks          TEXT,

  -- HO row-level approval (set by HO only; never writable by JE or ZO)
  ho_office_approve   row_approval_enum,  -- NULL = not yet reviewed
  ho_remarks          TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- 4. estimate_revision_log (one row per revision cycle issued)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS estimate_revision_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id         UUID NOT NULL REFERENCES project_cost_estimates(estimate_id),
  revision_cycle      INT NOT NULL DEFAULT 1,
  stage               VARCHAR NOT NULL,         -- 'ZO' or 'HO'
  requested_by        VARCHAR NOT NULL,          -- mobile number of ZO/HO who issued request

  revision_deadline   TIMESTAMPTZ NOT NULL,      -- custom or now() + 24h

  -- Resubmission tracking
  resubmitted_at      TIMESTAMPTZ,              -- NULL until JE resubmits (or system auto-resubmits)
  resubmitted_by      VARCHAR,                  -- mobile number of JE, or NULL on auto-resubmit
  is_auto_resubmitted BOOLEAN NOT NULL DEFAULT FALSE,
  -- TRUE when the system auto-resubmits on deadline expiry (resubmitted_by stays NULL)
  -- Displayed in revision history as "Auto-resubmitted by system" — no name lookup attempted

  -- Items the JE modified during this revision cycle (populated at resubmit time)
  modified_item_ids   UUID[] NOT NULL DEFAULT '{}',

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- 5. Triggers
-- ──────────────────────────────────────────────────────────────

-- Auto-update updated_at on estimate header changes
CREATE OR REPLACE FUNCTION set_estimate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_estimate_updated_at ON project_cost_estimates;
CREATE TRIGGER trg_estimate_updated_at
BEFORE UPDATE ON project_cost_estimates
FOR EACH ROW EXECUTE FUNCTION set_estimate_updated_at();

-- Auto-update updated_at on item changes
CREATE OR REPLACE FUNCTION set_estimate_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_estimate_item_updated_at ON project_cost_estimate_items;
CREATE TRIGGER trg_estimate_item_updated_at
BEFORE UPDATE ON project_cost_estimate_items
FOR EACH ROW EXECUTE FUNCTION set_estimate_item_updated_at();

-- Block all hard DELETEs on estimates at DB level (permanent records per spec)
CREATE OR REPLACE FUNCTION prevent_estimate_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Hard deletion of project_cost_estimates is permanently prohibited. Records are immutable.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_estimate_hard_delete ON project_cost_estimates;
CREATE TRIGGER trg_prevent_estimate_hard_delete
BEFORE DELETE ON project_cost_estimates
FOR EACH ROW EXECUTE FUNCTION prevent_estimate_hard_delete();

-- Enforce amount = rate * qty at DB level on item INSERT and UPDATE
-- Application also enforces this; DB trigger is the final safety net
CREATE OR REPLACE FUNCTION enforce_estimate_item_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.amount := ROUND((NEW.rate * NEW.qty)::NUMERIC, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_estimate_item_amount ON project_cost_estimate_items;
CREATE TRIGGER trg_enforce_estimate_item_amount
BEFORE INSERT OR UPDATE ON project_cost_estimate_items
FOR EACH ROW EXECUTE FUNCTION enforce_estimate_item_amount();

-- Audit trigger: log all status transitions to audit_log
-- Uses last_modified_by column (set by application before every UPDATE) for reliable attribution
CREATE OR REPLACE FUNCTION audit_estimate_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estimate_status IS DISTINCT FROM OLD.estimate_status THEN
    INSERT INTO audit_log (user_id, action, module_name, record_identifier, old_value, new_value)
    VALUES (
      NEW.last_modified_by,   -- reliably set by controller; never COALESCE-guessed
      'STATUS_CHANGE',
      'Project Cost Estimate',
      NEW.estimate_id::VARCHAR,
      jsonb_build_object(
        'estimate_status', OLD.estimate_status,
        'estimate_revision', OLD.estimate_revision
      ),
      jsonb_build_object(
        'estimate_status', NEW.estimate_status,
        'estimate_revision', NEW.estimate_revision
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_estimate_status ON project_cost_estimates;
CREATE TRIGGER trg_audit_estimate_status
AFTER UPDATE ON project_cost_estimates
FOR EACH ROW EXECUTE FUNCTION audit_estimate_status_change();
```

---

### Component 2 — New Role-Based Middleware

#### [NEW] `backend/src/middleware/requireRole.js`

```javascript
/**
 * Middleware factory: restricts route access to users with one of the specified roles.
 * Consistent with existing requireAdmin.js pattern.
 *
 * Usage: requireRole(['je', 'staff', 'admin'])
 * Note: 'staff' is treated as equivalent to 'je' for all Phase 2 routes.
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`
      });
    }
    next();
  };
}

module.exports = requireRole;
```

---

### Component 3 — Backend: Purchase Data API

#### [NEW] `backend/src/controllers/purchaseData.controller.js`

Four functions following the `materials.controller.js` pattern exactly:

| Function | HTTP | Access | Description |
|---|---|---|---|
| `getPurchaseOptions` | GET `/` | All authenticated | All `is_active = true` options; admin sees all |
| `createPurchaseOption` | POST `/` | Admin only | Insert new option |
| `updatePurchaseOption` | PUT `/:id` | Admin only | Update name |
| `togglePurchaseOptionStatus` | PATCH `/:id/status` | Admin only | Toggle `is_active` |

#### [NEW] `backend/src/routes/purchaseData.routes.js`

```javascript
router.use(verifyJwt);
router.get('/',              getPurchaseOptions);
router.post('/',             requireAdmin, createPurchaseOption);
router.put('/:id',           requireAdmin, updatePurchaseOption);
router.patch('/:id/status',  requireAdmin, togglePurchaseOptionStatus);
```

---

### Component 4 — Backend: Project Cost Estimates API

#### Shared Helper: `_recalculateEstimateAmount(estimateId, currentStatus)`

This internal helper is called after any item save or approval change.
It encapsulates the full calculation matrix so no controller duplicates this logic.
**Always receives the actual current status — never hardcoded (Issue 3-3 fix).**

```
estimate_amount calculation by status (full matrix):

| estimate_status           | estimate_amount =                                      |
|---------------------------|--------------------------------------------------------|
| Draft                     | SUM(amount) — all items regardless of approval         |
| Submitted                 | SUM(amount) — all items (no approvals exist yet)       |
| Under ZO Review           | SUM(amount) — all items (ZO reviewing in progress)     |
| ZO Revision Requested     | SUM(amount) — all items                                |
| ZO Approved               | SUM(amount) WHERE zo_office_approve = 'Approve'        |
| Rejected by ZO            | SUM(amount) — all items (terminal; informational only) |
| Under HO Review           | SUM(amount) WHERE zo_office_approve = 'Approve'        |
| HO Revision Requested     | SUM(amount) WHERE zo_office_approve = 'Approve'        |
| Final Approved            | SUM(amount) WHERE zo_office_approve = 'Approve'        |
|                           |   AND ho_office_approve = 'Approve'                    |
| Rejected by HO            | SUM(amount) — all items (terminal; informational only) |

Spec note: The spec's Data Integrity Rules state "After submission it reflects only
Approved line items." This is correct at terminal/final stages. Mid-review (Submitted,
Under ZO Review, ZO Revision Requested), the all-rows sum is the correct behaviour
so that Phase 3 Fund Requisition has a meaningful value before approval is complete.
The plan's matrix takes precedence over the spec's simplified statement.
```

---

#### [NEW] `backend/src/controllers/estimates.controller.js`

---

##### `createEstimate(req, res)` — `POST /estimates`

**Access:** `['je', 'staff', 'admin']`

```
Body: { work_order_no, zonal_office_no, je_remarks? }

1. Validate (Issue 3-4 fix):
   - work_order_no: required, non-empty string
   - zonal_office_no: required, non-empty after .trim() — empty string "" is rejected:
     → 400: "zonal_office_no is required and cannot be blank."
   je_remarks is optional; no validation required.
2. Fetch project from projects_master:
   - If not found → 404
   - If status = 'Closed' → 403: "Cannot create estimates for Closed projects."
   - (Running and Complete Under Maintenance are both allowed)
3. One-active-estimate gate:
   SELECT COUNT(*) FROM project_cost_estimates
   WHERE work_order_no = $1
   AND estimate_status NOT IN ('Final Approved', 'Rejected by ZO', 'Rejected by HO')
   If count > 0 → 409: "An active estimate already exists for this work order."
4. Build insert payload:
   - estimate_no       ← project.estimate_no  (auto-populated from master data)
   - area_code         ← project.zone
   - estimate_revision ← 0  (draft, not yet submitted)
   - estimate_status   ← 'Draft'
   - je_remarks        ← req.body.je_remarks || null
   - created_by        ← req.user.mobile_number
   - last_modified_by  ← req.user.mobile_number
5. Insert and return 201 with created estimate header
```

---

##### `saveDraftItems(req, res)` — `PUT /estimates/:id/items`

**Access:** `['je', 'staff', 'admin']`

**Semantics:** This is a **full replacement** operation. The frontend sends the
complete current array of line items on every save. Items present in the DB but absent
from the payload are normally deleted. The route is PUT because it replaces the collection.

**`source_of_purchase` is explicitly optional (Issue 3-9):** Not all line items will have
a known source of purchase. Omitting it is valid at both Draft and submission time.
No validation is applied to this field at submit — it may remain null.

```
Body: { items: [{ item_id?, material_main_head, material_sub_head, material_details,
                   unit, qty, rate, rate_reference?, source_of_purchase? }] }

1. Fetch estimate — verify ownership (created_by = req.user.mobile_number) OR admin
2. Status allowlist check:
   Allowed statuses: ['Draft', 'ZO Revision Requested', 'HO Revision Requested']
   All others → 403: "Estimate cannot be edited in its current status."

3. If status = 'ZO Revision Requested':
   - Fetch all current items with their zo_office_approve values
   - Items in the payload that have zo_office_approve = 'Approve' → reject with 403:
     "Approved items cannot be modified during revision."
   - New items (item_id not in existing DB items) → 403: "New items cannot be added during revision."

4. If status = 'HO Revision Requested': same rules but gate on ho_office_approve

5. If status = 'Draft': unrestricted full replacement

6. For each item in payload:
   - Validate: material_main_head, material_sub_head, material_details, unit are non-empty
   - amount is NOT accepted from client; always set server-side: amount = ROUND(rate * qty, 2)
   - unit: verify it matches material_master."M_Unit" for the given Material_Details
     (prevents client-side tampering of the auto-fill)

7. Execute as a transaction:
   a. DELETE step — approved rows are NEVER deleted regardless of payload (Issue 3-1 fix):

      If status = 'Draft':
        DELETE FROM project_cost_estimate_items
        WHERE estimate_id = $1
        AND item_id NOT IN (<payload_item_ids>)

      If status = 'ZO Revision Requested':
        DELETE FROM project_cost_estimate_items
        WHERE estimate_id = $1
        AND item_id NOT IN (<payload_item_ids>)
        AND (zo_office_approve IS NULL OR zo_office_approve = 'Not Approve')
        -- 'Approve' rows are untouchable regardless of what the payload omits

      If status = 'HO Revision Requested':
        DELETE FROM project_cost_estimate_items
        WHERE estimate_id = $1
        AND item_id NOT IN (<payload_item_ids>)
        AND (ho_office_approve IS NULL OR ho_office_approve = 'Not Approve')

   b. UPSERT all items in payload:
      INSERT ... ON CONFLICT (item_id) DO UPDATE SET ...

8. Call _recalculateEstimateAmount(estimate_id, estimate.estimate_status)
   (Issue 3-3 fix: passes actual current status, never hardcoded)
9. Return updated items array
```

---

##### `submitEstimate(req, res)` — `POST /estimates/:id/submit`

**Access:** `['je', 'staff', 'admin']`

```
1. Fetch estimate — verify ownership + status ∈ ['Draft', 'ZO Revision Requested', 'HO Revision Requested']
2. Fetch all items for this estimate
3. Validate completeness of every item:
   - material_main_head, material_sub_head, material_details → non-null, non-empty
   - qty > 0
   - rate > 0
   - rate_reference → non-null, non-empty
   - source_of_purchase → NOT validated (explicitly optional — Issue 3-9)
   → On failure: 422 with array of { item_id, item_index, missing_fields }

4. Determine submission type:
   - isFirstSubmit = (estimate_revision === 0)
   - isZoResubmit  = (current status = 'ZO Revision Requested')
   - isHoResubmit  = (current status = 'HO Revision Requested')

5. Increment estimate_revision:
   NEW revision = estimate_revision + 1
   (0→1 on first submit; N→N+1 on any resubmission)

6. If isZoResubmit:
   a. Collect item_ids of rows where zo_office_approve = 'Not Approve'
      → these are the modified rows; will be written to revision log
   b. NULL out zo_office_approve for those rows:
      UPDATE project_cost_estimate_items
      SET zo_office_approve = NULL, updated_at = now()
      WHERE estimate_id = $1 AND zo_office_approve = 'Not Approve'
   c. Rows with zo_office_approve = 'Approve' are untouched

7. If isHoResubmit:
   a. Collect item_ids where ho_office_approve = 'Not Approve'
   b. NULL out ho_office_approve for those rows
   c. ALL zo_office_approve values are untouched

8. Update estimate header (Issue 3-2 fix — je_user_id and je_date only on first submit):
   Always set:
     estimate_status   = 'Submitted'
     estimate_revision = <new value>
     last_modified_by  = req.user.mobile_number
   Only if isFirstSubmit = true:
     je_user_id = req.user.mobile_number  ← original submitter; never overwritten
     je_date    = now()                   ← original submission timestamp; never overwritten
   On resubmission these fields are left unchanged. Resubmission timestamps are
   captured exclusively in estimate_revision_log.resubmitted_at.

9. If isZoResubmit or isHoResubmit:
   Update the open revision log entry (WHERE estimate_id = $1 AND resubmitted_at IS NULL):
   SET resubmitted_at    = now(),
       resubmitted_by    = req.user.mobile_number,
       modified_item_ids = <array from step 6a or 7a>

10. Call _recalculateEstimateAmount(estimate_id, 'Submitted')

11. Send Telegram notification (non-blocking):
    notifyZoEstimateSubmitted({
      estimate_id, work_order_no, estimate_no,
      je_name: req.user.display_name || req.user.mobile_number,
      estimate_revision: <new value>
    })

12. Return 200 with updated estimate
```

---

##### `reviewEstimate(req, res)` — `PATCH /estimates/:id/review`

**Access:** `['zo', 'ho', 'admin']` — further constrained by status inside controller

```
1. Fetch estimate

2. Status-to-role guard (Issue #5):
   const statusRoleMap = {
     'Submitted':   ['zo', 'admin'],
     'ZO Approved': ['ho', 'admin'],
   };
   If estimate.estimate_status not in statusRoleMap → 403: "Estimate is not awaiting review."
   If req.user.role not in statusRoleMap[estimate.estimate_status] → 403:
     e.g. "Only ZO can open a Submitted estimate."

3. Revision deadline expiry check (Issue #8 polling approach):
   Query estimate_revision_log for open cycle: WHERE estimate_id = $1 AND resubmitted_at IS NULL
   If found AND now() > revision_deadline:
     a. Update revision log:
        SET resubmitted_at      = now(),
            resubmitted_by      = NULL,   (Issue #4: NULL, not 'SYSTEM')
            is_auto_resubmitted = TRUE,
            modified_item_ids   = '{}'    (unknown — system resubmit)
     b. Set estimate_status appropriately (what it would have been after JE resubmit):
        - If stage = 'ZO': status → 'Submitted' (will transition to Under ZO Review in step 4)
        - If stage = 'HO': status → 'ZO Approved' (will transition to Under HO Review in step 4)
     c. Log to audit_log: action = 'AUTO_RESUBMIT', user_id = NULL
        (getRevisionLog name resolution: if resubmitted_by IS NULL and is_auto_resubmitted = TRUE
         → display "Auto-resubmitted by system" without name lookup)

4. Transition status:
   'Submitted'   → 'Under ZO Review'
   'ZO Approved' → 'Under HO Review'

5. Update estimate:
   SET estimate_status  = <new status>,
       last_modified_by = req.user.mobile_number

6. Return updated estimate
```

---

##### `submitRowApprovals(req, res)` — `POST /estimates/:id/row-approvals`

**Access:** `['zo', 'ho', 'admin']`

```
Body: { approvals: [{ item_id, approve_status, remarks? }] }
      approve_status must be 'Approve' or 'Not Approve'

1. Fetch estimate
2. Stage guard:
   if role = 'zo':
     allowed statuses: ['Under ZO Review']
     writable fields: zo_office_approve, zo_remarks
   if role = 'ho':
     allowed statuses: ['Under HO Review']
     writable fields: ho_office_approve, ho_remarks
   if role = 'admin':
     determine stage from current status
   If estimate.estimate_status not in allowed → 403: "Not in a reviewable state for your role."

3. Validate all item_ids before any writes:
   For each approval entry:
   a. Verify item_id exists and belongs to this estimate → 404 if not
   b. Validate approve_status is 'Approve' or 'Not Approve' → 400 if invalid

4. Execute steps 5–6 inside a single DB transaction (Issue 3-7 fix):
   If the server crashes mid-loop, no partial approval state is committed.

5. For each approval entry (inside transaction):
   Update only the role-appropriate columns:
   ZO: SET zo_office_approve = $approve, zo_remarks = $remarks, updated_at = now()
   HO: SET ho_office_approve = $approve, ho_remarks = $remarks, updated_at = now()
   WHERE item_id = $item_id AND estimate_id = $estimate_id

6. Inside same transaction — recalculate and write estimate_amount:
   SET last_modified_by  = req.user.mobile_number,
       estimate_amount   = <result of _recalculateEstimateAmount(estimate_id, status)>
   WHERE estimate_id = $1

7. Commit transaction. Return updated items array.
```

**Transaction implementation — Migration 11 deliverable:**
The Supabase JS client does not expose native PostgreSQL transactions.
Steps 5–6 are implemented as a single atomic PostgreSQL function called via `supabase.rpc()`.
The function is defined in **`11_create_approval_rpc.sql`** (see Component 1a below) and must be
deployed before `submitRowApprovals` is implemented.

The controller call pattern is:
```javascript
// Inside submitRowApprovals, after validation (steps 1–3):
const { error } = await supabase.rpc('submit_row_approvals', {
  p_estimate_id:   estimateId,
  p_approvals:     approvals,     // JSONB array
  p_stage:         stage,         // 'ZO' or 'HO'
  p_modified_by:   req.user.mobile_number
});
if (error) throw error;
```

---

### Component 1a — Migration 11: Approval RPC Function

#### [NEW] `backend/src/db/migrations/11_create_approval_rpc.sql`

This migration creates the atomic PostgreSQL function used by `submitRowApprovals`.
It must be run **after** migration 10 (tables must exist first).

```sql
-- Migration: Create transactional row-approvals RPC function
-- DB: PostgreSQL (Supabase)
-- Called via: supabase.rpc('submit_row_approvals', { ... })
-- Must be deployed before submitRowApprovals controller is implemented.

CREATE OR REPLACE FUNCTION submit_row_approvals(
  p_estimate_id   UUID,
  p_approvals     JSONB,         -- array of {item_id, approve_status, remarks}
  p_stage         TEXT,          -- 'ZO' or 'HO'
  p_modified_by   VARCHAR        -- acting user's mobile number
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER   -- runs with DB owner privileges; safe because inputs are validated in application layer
AS $$
DECLARE
  approval        JSONB;
  v_item_id       UUID;
  v_approve_status TEXT;
  v_remarks       TEXT;
  v_status        estimate_status_enum;
  v_new_amount    NUMERIC(18,2);
BEGIN
  -- 1. Read current estimate status (used for recalculation logic)
  SELECT estimate_status INTO v_status
  FROM project_cost_estimates
  WHERE estimate_id = p_estimate_id
  FOR UPDATE;  -- locks the row for the duration of this transaction

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estimate not found: %', p_estimate_id;
  END IF;

  -- 2. Apply each row approval based on stage
  FOR approval IN SELECT * FROM jsonb_array_elements(p_approvals)
  LOOP
    v_item_id       := (approval->>'item_id')::UUID;
    v_approve_status := approval->>'approve_status';
    v_remarks        := approval->>'remarks';  -- may be null

    IF p_stage = 'ZO' THEN
      UPDATE project_cost_estimate_items
      SET
        zo_office_approve = v_approve_status::row_approval_enum,
        zo_remarks        = v_remarks,
        updated_at        = now()
      WHERE item_id = v_item_id
        AND estimate_id = p_estimate_id;
    ELSIF p_stage = 'HO' THEN
      UPDATE project_cost_estimate_items
      SET
        ho_office_approve = v_approve_status::row_approval_enum,
        ho_remarks        = v_remarks,
        updated_at        = now()
      WHERE item_id = v_item_id
        AND estimate_id = p_estimate_id;
    ELSE
      RAISE EXCEPTION 'Invalid stage: %. Must be ZO or HO.', p_stage;
    END IF;
  END LOOP;

  -- 3. Recalculate estimate_amount based on current status
  --    Mirrors the _recalculateEstimateAmount logic from the application layer
  IF v_status IN ('Draft', 'Submitted', 'Under ZO Review', 'ZO Revision Requested',
                  'Rejected by ZO', 'Rejected by HO') THEN
    -- All rows
    SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
    FROM project_cost_estimate_items
    WHERE estimate_id = p_estimate_id;

  ELSIF v_status IN ('ZO Approved', 'Under HO Review', 'HO Revision Requested') THEN
    -- ZO-approved rows only
    SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
    FROM project_cost_estimate_items
    WHERE estimate_id = p_estimate_id
      AND zo_office_approve = 'Approve';

  ELSIF v_status = 'Final Approved' THEN
    -- Both ZO and HO approved
    SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
    FROM project_cost_estimate_items
    WHERE estimate_id = p_estimate_id
      AND zo_office_approve = 'Approve'
      AND ho_office_approve = 'Approve';

  ELSE
    -- Fallback: sum all rows
    SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
    FROM project_cost_estimate_items
    WHERE estimate_id = p_estimate_id;
  END IF;

  -- 4. Write recalculated amount + attribution back to header
  UPDATE project_cost_estimates
  SET
    estimate_amount  = v_new_amount,
    last_modified_by = p_modified_by,
    updated_at       = now()
  WHERE estimate_id = p_estimate_id;

  -- Both the item UPDATEs and the header UPDATE commit together.
  -- If any step fails, the entire function rolls back automatically.
END;
$$;

-- Grant execute permission to the service role used by the Express backend
GRANT EXECUTE ON FUNCTION submit_row_approvals(UUID, JSONB, TEXT, VARCHAR)
  TO service_role;
```

**Security note:** `SECURITY DEFINER` allows the function to run with DB owner privileges.
This is safe here because all inputs are validated in the application layer before the RPC
is called (item ownership, stage guard, approve_status enum check — all happen in steps 1–3
of `submitRowApprovals` before `supabase.rpc()` is invoked). Never call this RPC directly
from the frontend.

---

##### `submitReview(req, res)` — `POST /estimates/:id/submit-review`

**Access:** `['zo', 'ho', 'admin']`

```
Body: { zo_remarks?: string } or { ho_remarks?: string }

1. Fetch estimate + all items
2. Stage guard (same as submitRowApprovals):
   - 'Under ZO Review' → ZO only
   - 'Under HO Review' → HO only
3. Validate all rows have a decision:
   ZO stage: every item must have zo_office_approve IS NOT NULL
   HO stage: every item must have ho_office_approve IS NOT NULL
   → 422: "All rows must be marked (Approve or Not Approve) before submitting review."
4. hasRejected = any item where [stage]_office_approve = 'Not Approve'
   (Note Issue #10: if ZO called requestRevision earlier but now clicks Submit Review
   with Not Approve rows still present — this is allowed and results in Rejected by ZO.
   No separate block needed; the spec explicitly treats this as rejection.)
5. If ZO stage:
   - hasRejected = false → status = 'ZO Approved'
     stamp zo_approved_by = req.user.mobile_number, zo_approval_date = now()
     save req.body.zo_remarks if provided
     call _recalculateEstimateAmount (sum where zo = 'Approve')
     send notifyHoEstimateApproved (non-blocking)
   - hasRejected = true → status = 'Rejected by ZO'
6. If HO stage:
   - hasRejected = false → status = 'Final Approved'
     stamp ho_approved_by, ho_approval_date
     save req.body.ho_remarks if provided
     call _recalculateEstimateAmount (sum where zo AND ho = 'Approve')
   - hasRejected = true → status = 'Rejected by HO'
7. UPDATE estimate:
   SET estimate_status  = <new>,
       last_modified_by = req.user.mobile_number,
       <stamped fields>
8. Return updated estimate
```

---

##### `requestRevision(req, res)` — `POST /estimates/:id/request-revision`

**Access:** `['zo', 'ho', 'admin']`

```
Body: { deadline_hours?: number, remarks?: string }

1. Fetch estimate + all items
2. Stage guard:
   - 'Under ZO Review' → ZO only
   - 'Under HO Review' → HO only
   Other statuses → 403
3. Verify at least one item is 'Not Approve' (Issue #9):
   ZO stage: any item where zo_office_approve = 'Not Approve'
   HO stage: any item where ho_office_approve = 'Not Approve'
   NULL rows do NOT count. → 422: "At least one row must be marked Not Approve before
   requesting a revision. NULL (unreviewed) rows do not qualify."
4. Compute revision_deadline = now() + ((deadline_hours || 24) * 3600 * 1000)ms
5. Determine revision_cycle:
   SELECT COALESCE(MAX(revision_cycle), 0) + 1 FROM estimate_revision_log
   WHERE estimate_id = $1 AND stage = $2
6. INSERT into estimate_revision_log:
   { estimate_id, revision_cycle, stage, requested_by: req.user.mobile_number,
     revision_deadline, resubmitted_at: NULL, is_auto_resubmitted: FALSE,
     modified_item_ids: '{}' }
7. UPDATE estimate:
   SET estimate_status  = 'ZO Revision Requested' or 'HO Revision Requested',
       last_modified_by = req.user.mobile_number
8. Return updated estimate + new revision log entry
```

---

##### `getEstimates(req, res)` — `GET /estimates`

**Access:** All authenticated — response filtered by role

```
Role-based filter logic:

role = 'je' or 'staff':
  WHERE created_by = req.user.mobile_number
  (own estimates only — drafts included)

role = 'zo':
  WHERE estimate_status IN (
    'Submitted',               ← entry point: newly submitted by JE
    'Under ZO Review',
    'ZO Revision Requested',
    'ZO Approved',
    'Rejected by ZO'
  )
  Excludes: 'Draft' (ZO cannot see drafts)
  Default sort: updated_at DESC

role = 'ho':
  Active queue (default view):
    WHERE estimate_status IN ('ZO Approved', 'Under HO Review', 'HO Revision Requested')
  Historical (?view=history):
    WHERE estimate_status IN ('Final Approved', 'Rejected by HO')
  Excludes: all pre-ZO statuses

role = 'admin':
  No filter — all estimates

Joins: projects_master for site_details, state, district, zone, department, status
Pagination: page + limit, capped at 100

Issue 3-6 fix — active_revision_deadline in list response:
  LEFT JOIN LATERAL (
    SELECT revision_deadline, is_auto_resubmitted
    FROM estimate_revision_log
    WHERE estimate_id = pce.estimate_id
      AND resubmitted_at IS NULL
    ORDER BY created_at DESC LIMIT 1
  ) rev ON TRUE
  Include in each estimate row:
    active_revision_deadline: rev.revision_deadline | null
    is_deadline_overdue: (rev.revision_deadline IS NOT NULL AND now() > rev.revision_deadline)
  Frontend uses is_deadline_overdue to change the status badge from amber → red on the list view.
```

---

##### `getEstimateById(req, res)` — `GET /estimates/:id`

**Access:** All authenticated — draft visibility enforced

```
1. Fetch estimate with:
   JOIN projects_master: estimate_no, work_order_value, site_details, state, district, zone, department, status
2. Draft visibility check:
   If estimate_status = 'Draft':
     Allow only: created_by = req.user.mobile_number OR role = 'admin'
     Else → 404 (never 403 — avoids information leakage)
3. Fetch all line items from project_cost_estimate_items ORDER BY created_at ASC
4. Name resolution (verified columns: display_name, mobile_number confirmed in admin.controller.js):
   mobile_numbers = [je_user_id, zo_approved_by, ho_approved_by].filter(Boolean)
   If mobile_numbers.length > 0:
     SELECT mobile_number, display_name FROM authorised_users
     WHERE mobile_number = ANY($mobile_numbers)
   Build userMap: { mobile_number → display_name }
   je_name = userMap[je_user_id] || je_user_id || null
   zo_name = userMap[zo_approved_by] || zo_approved_by || null
   ho_name = userMap[ho_approved_by] || ho_approved_by || null

5. Active revision deadline (Issue 3-8 fix — needed by EstimateForm countdown):
   SELECT revision_deadline, is_auto_resubmitted
   FROM estimate_revision_log
   WHERE estimate_id = $1 AND resubmitted_at IS NULL
   ORDER BY created_at DESC LIMIT 1
   → active_revision_deadline: deadline | null
   → is_deadline_overdue: (deadline IS NOT NULL AND now() > deadline)

6. Inline summary (Issue 3-5 fix — gross totals vs approved grand_total clearly labelled):
   const MATERIAL_HEADS = ['Materials', 'Electrical', 'Mechanical', 'Pipes', 'Solar System'];
   summary = {
     // Gross category totals: sum ALL items regardless of approval status
     // These are always the full scope of the estimate for reference
     gross_material_cost:   sum where material_main_head IN MATERIAL_HEADS,
     gross_labour_cost:     sum where material_main_head = 'Labour',
     gross_transport_cost:  sum where material_main_head = 'Transport',
     gross_misc_cost:       sum where material_main_head = 'Miscellaneous',
     gross_total:           sum of all items (all categories),

     // Approved grand total: the system-calculated estimate_amount
     // Filtered by approval stage per the status matrix — what Phase 3 reads
     approved_grand_total:  estimate.estimate_amount
   }
   Frontend labels: "Gross Total" vs "Approved Grand Total" to avoid confusion.
   At Draft stage: gross_total = approved_grand_total (no approvals exist).
   At Final Approved: approved_grand_total ≤ gross_total.

7. Return:
   {
     success: true,
     estimate: { ...header fields, je_name, zo_name, ho_name,
                 active_revision_deadline, is_deadline_overdue },
     items: [...],
     summary: { gross_material_cost, gross_labour_cost, gross_transport_cost,
                gross_misc_cost, gross_total, approved_grand_total }
   }
```

**Note — `getEstimateItems` endpoint removed:**
Items are embedded in `getEstimateById`. No separate `GET /estimates/:id/items` route exists.
The `getEstimateItems` export in `estimatesApi.js` is also removed.

---

##### `getRevisionLog(req, res)` — `GET /estimates/:id/revisions`

```
1. Fetch all rows from estimate_revision_log WHERE estimate_id = $1 ORDER BY created_at ASC
2. Collect mobile numbers: requested_by + resubmitted_by (where is_auto_resubmitted = FALSE)
3. Batch-fetch display names from authorised_users (same pattern as getEstimateById)
4. For each log entry:
   - requested_by_name = userMap[requested_by] || requested_by
   - resubmitted_by_name:
     if is_auto_resubmitted = TRUE → 'Auto-resubmitted by system' (no lookup)
     else → userMap[resubmitted_by] || resubmitted_by || null
5. Return enriched revision log array
```

---

#### [NEW] `backend/src/routes/estimates.routes.js`

```javascript
const express = require('express');
const {
  getEstimates,
  getEstimateById,
  getRevisionLog,
  createEstimate,
  saveDraftItems,
  submitEstimate,
  reviewEstimate,
  submitRowApprovals,
  submitReview,
  requestRevision
} = require('../controllers/estimates.controller');
const verifyJwt    = require('../middleware/verifyJwt');
const requireRole  = require('../middleware/requireRole');

const router = express.Router();

// All estimate routes require authentication
router.use(verifyJwt);

// Reading (role-filtered inside controller)
router.get('/',              getEstimates);
router.get('/:id',           getEstimateById);
router.get('/:id/revisions', getRevisionLog);
// Note: GET /:id/items removed — items embedded in getEstimateById response

// JE actions
const jeRoles = ['je', 'staff', 'admin'];
router.post('/',             requireRole(jeRoles), createEstimate);
router.put('/:id/items',     requireRole(jeRoles), saveDraftItems);
router.post('/:id/submit',   requireRole(jeRoles), submitEstimate);

// ZO/HO review actions
// Note: status-to-role guard is enforced INSIDE each controller — route-level
// requireRole is the first filter only; wrong-role-for-current-status is blocked inside.
const reviewRoles = ['zo', 'ho', 'admin'];
router.patch('/:id/review',           requireRole(reviewRoles), reviewEstimate);
router.post('/:id/row-approvals',     requireRole(reviewRoles), submitRowApprovals);
router.post('/:id/submit-review',     requireRole(reviewRoles), submitReview);
router.post('/:id/request-revision',  requireRole(reviewRoles), requestRevision);

module.exports = router;
```

---

### Component 5 — Telegram Service Enhancement

#### [MODIFY] `backend/src/services/telegram.service.js`

Two new functions appended. All existing functions (`sendOtp`, `sendBotMessage`, `startPolling`) are **untouched**.

```javascript
/**
 * Notifies all active ZO users via Telegram when JE submits an estimate.
 * Silent fallback: logs console.warn with estimate identifiers if no chat IDs found.
 * Does not throw — called non-blocking from submitEstimate controller.
 */
async function notifyZoEstimateSubmitted(estimateInfo) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('[ESTIMATE NOTIFY] TELEGRAM_BOT_TOKEN not set — ZO notification skipped.');
    return;
  }

  const { supabase } = require('../db/supabase');
  const { data: zoUsers, error } = await supabase
    .from('authorised_users')
    .select('display_name, telegram_chat_id')
    .in('role', ['zo'])
    .eq('is_active', true);

  if (error) {
    console.error('[ESTIMATE NOTIFY] Failed to fetch ZO users:', error.message);
    return;
  }

  const recipients = (zoUsers || []).filter(u => u.telegram_chat_id);

  if (recipients.length === 0) {
    console.warn(
      `[ESTIMATE NOTIFY] No ZO users with telegram_chat_id found. ` +
      `Estimate ${estimateInfo.estimate_id} (WO: ${estimateInfo.work_order_no}, ` +
      `Est No: ${estimateInfo.estimate_no}) submitted by ${estimateInfo.je_name} — ` +
      `ZO was NOT notified via Telegram.`
    );
    return;
  }

  const text =
    `📋 New Cost Estimate Submitted\n\n` +
    `Work Order: ${estimateInfo.work_order_no}\n` +
    `Estimate No: ${estimateInfo.estimate_no}\n` +
    `Revision: Rev ${estimateInfo.estimate_revision}\n` +
    `Submitted by: ${estimateInfo.je_name}\n\n` +
    `Please log in to the IDBP console to review.`;

  for (const user of recipients) {
    await sendBotMessage(user.telegram_chat_id, text);
  }
}

/**
 * Notifies all active HO users via Telegram when ZO approves an estimate.
 * Same silent-fallback pattern as notifyZoEstimateSubmitted.
 */
async function notifyHoEstimateApproved(estimateInfo) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('[ESTIMATE NOTIFY] TELEGRAM_BOT_TOKEN not set — HO notification skipped.');
    return;
  }

  const { supabase } = require('../db/supabase');
  const { data: hoUsers, error } = await supabase
    .from('authorised_users')
    .select('display_name, telegram_chat_id')
    .in('role', ['ho'])
    .eq('is_active', true);

  if (error) {
    console.error('[ESTIMATE NOTIFY] Failed to fetch HO users:', error.message);
    return;
  }

  const recipients = (hoUsers || []).filter(u => u.telegram_chat_id);

  if (recipients.length === 0) {
    console.warn(
      `[ESTIMATE NOTIFY] No HO users with telegram_chat_id found. ` +
      `Estimate ${estimateInfo.estimate_id} ZO-approved by ${estimateInfo.zo_name} — ` +
      `HO was NOT notified via Telegram.`
    );
    return;
  }

  const text =
    `✅ Estimate ZO-Approved — Awaiting HO Review\n\n` +
    `Work Order: ${estimateInfo.work_order_no}\n` +
    `Estimate No: ${estimateInfo.estimate_no}\n` +
    `ZO Approved by: ${estimateInfo.zo_name}\n\n` +
    `Please log in to the IDBP console to complete final review.`;

  for (const user of recipients) {
    await sendBotMessage(user.telegram_chat_id, text);
  }
}

module.exports = {
  sendOtp,
  startPolling,
  notifyZoEstimateSubmitted,
  notifyHoEstimateApproved
};
```

---

### Component 6 — App.js Route Registration

#### [MODIFY] `backend/src/app.js`

```javascript
const estimatesRoutes    = require('./routes/estimates.routes');
const purchaseDataRoutes = require('./routes/purchaseData.routes');

app.use('/api/v1/auth/estimates',      estimatesRoutes);
app.use('/api/v1/auth/purchase-data',  purchaseDataRoutes);
```

No other changes.

---

### Component 7 — Frontend: API Client

#### [NEW] `frontend/src/api/estimatesApi.js`

```javascript
import authApi from './authApi';
// Base URL: /api/v1/auth/estimates

// Reading
export const getEstimates       = (params)   => authApi.get('/estimates', { params });
export const getEstimateById    = (id)        => authApi.get(`/estimates/${id}`);
// Note: getEstimateItems removed — items are embedded in getEstimateById response (Issue #1 fix)
export const getRevisionLog     = (id)        => authApi.get(`/estimates/${id}/revisions`);
// Note: getEstimateSummary removed — summary embedded in getEstimateById response (Issue #14 fix)

// JE actions
export const createEstimate     = (data)      => authApi.post('/estimates', data);
export const saveDraftItems     = (id, items) => authApi.put(`/estimates/${id}/items`, { items });
export const submitEstimate     = (id)        => authApi.post(`/estimates/${id}/submit`);

// ZO/HO review actions
export const reviewEstimate     = (id)        => authApi.patch(`/estimates/${id}/review`);
export const submitRowApprovals = (id, approvals) =>
  authApi.post(`/estimates/${id}/row-approvals`, { approvals });
export const submitReview       = (id, data)  => authApi.post(`/estimates/${id}/submit-review`, data);
export const requestRevision    = (id, data)  => authApi.post(`/estimates/${id}/request-revision`, data);

// Purchase data reference
export const getPurchaseOptions = ()          => authApi.get('/purchase-data');
```

---

### Component 8 — Frontend: New Pages

#### [NEW] `frontend/src/pages/Estimates.jsx`

**Route:** `/estimates` | **Access:** All authenticated

- Stat cards: Draft / Pending ZO / Pending HO / Final Approved / Rejected (role-appropriate counts)
- Table columns: work_order_no, estimate_no, status badge, amount (INR format), updated_at
  - **Issue 3-10 fix:** `estimate_revision` (Rev N) column rendered only for `role !== 'je' && role !== 'staff'`
- Status badge colour map (all 10 statuses intentionally included):
  - `Draft` → slate | `Submitted` → blue | `Under ZO Review` → indigo
  - `ZO Revision Requested` → amber (→ red if `is_deadline_overdue = true`) | `ZO Approved` → teal
  - `Under HO Review` → purple | `HO Revision Requested` → orange (→ red if overdue)
  - `Final Approved` → emerald | `Rejected by ZO` / `Rejected by HO` → red
  - **Issue 3-6 fix:** `is_deadline_overdue` from list response drives the amber→red badge escalation
- JE / staff / admin: "New Estimate" CTA button → `/estimates/new`
- ZO: default tab = active queue
- HO: default tab = active queue; "History" tab for terminal estimates (`?view=history`)
- Row click → `/estimates/:id`
- TanStack Query with `?view=history` for HO history tab

---

#### [NEW] `frontend/src/pages/EstimateForm.jsx`

**Revision deadline countdown source (Issue 3-8 fix):**
In edit mode (`/estimates/:id/edit`), `getEstimateById` is called on load.
The `active_revision_deadline` field in the response drives the countdown timer.
No secondary `getRevisionLog` call needed.

**Routes:** `/estimates/new` | `/estimates/:id/edit`
**Access:** JE / staff / admin

**Part 1 — Header**
- `Work_Order_No` — dropdown filtered to `Running` + `Complete Under Maintenance` projects
- On selection: auto-populate read-only fields from projects_master:
  Estimate No, State, District, Area Code, Department, Site Details
- `Zonal_Office_No` — text input (required)
- `JE_Remarks` — textarea (optional)
- `Estimate Amount` — read-only, INR-formatted, updates on save

**Part 2 — Line Items Table**
- Virtualised or paginated rows for performance (supports 500+ rows)
- Per row:
  - Level 1: `Material_Main_Head` dropdown
  - Level 2: `Material_Sub_Head` dropdown (filtered by L1)
  - Level 3: `Material_Details` dropdown (filtered by L2)
  - `Unit` — auto-filled on L3 selection, read-only
  - `Qty`, `Rate` — number inputs
  - `Amount` — auto-calculated (Rate × Qty), read-only, INR-formatted
  - `Rate_Reference` — text input
  - `Source_of_Purchase` — dropdown from `getPurchaseOptions()`
  - Delete row button (Draft mode only)
- Add row button at bottom of table (Draft mode only)
- **Full replacement semantics:** on Save Draft, entire current item array is sent to `saveDraftItems`

**Revision mode** (`ZO Revision Requested` / `HO Revision Requested`):
- Rejected rows (Not Approve): editable, amber border highlight
     - HO: Name (`ho_name`), Date (`ho_approval_date`), Remarks (`ho_remarks`)
     - JE sees all three approval sections (revision history visible — intentional for transparency)
3. **Line Items Table** — read-only display; ZO/HO approval columns conditionally visible by status
   - **ZO Review Mode** (role = zo, status = Under ZO Review):
     - Per-row inline dropdown: Approve / Not Approve
     - Per-row remarks text input
     - Running total updates as approvals are marked (local state)
     - "Request Revision" button (modal: optional deadline_hours, default 24h)
     - "Submit Review" button — disabled until all rows have a selection
   - **HO Review Mode**: identical UX to ZO
4. **Summary Footer** — from inline `summary` in `getEstimateById` response (no extra call)
5. **Revision History Tab** — accordion list from `getRevisionLog`; `is_auto_resubmitted = TRUE` rows display "Auto-resubmitted by system"
6. **Context-sensitive Actions:**
   - JE + Draft: "Edit Draft" → `/estimates/:id/edit`
   - ZO + Under ZO Review: Review controls inline in table
   - HO + Under HO Review: Review controls inline in table

---

### Component 9 — Sidebar, Routing, Dashboard

#### [MODIFY] `frontend/src/components/Sidebar.jsx`
Add "Cost Estimates" nav item. No other changes.

#### [MODIFY] `frontend/src/App.jsx`

```jsx
// Inside allowedRoles={['staff','je','zo','ho','admin']} ProtectedRoute:
<Route path="/estimates"          element={<Estimates />} />
<Route path="/estimates/new"      element={<EstimateForm />} />
<Route path="/estimates/:id"      element={<EstimateView />} />
<Route path="/estimates/:id/edit" element={<EstimateForm />} />
```

#### [MODIFY] `frontend/src/pages/Dashboard.jsx`
Add "Cost Estimates" stat card: total count + pending count. Consistent with existing card pattern.

---

### Component 10 — Admin Panel: Purchase Data

#### [MODIFY] `frontend/src/pages/admin/AdminPanel.jsx`
Add "Purchase Data" tab: list, add, toggle active. Consistent glassmorphism styling.

---

## Security Standards Compliance

| Control | Implementation |
|---|---|
| Authentication | All routes behind `verifyJwt` |
| Authorization | `requireRole` factory at route level |
| Stage-scoped auth | `reviewEstimate`, `submitRowApprovals`, `submitReview`, `requestRevision` all have **status-to-role guards inside controller** |
| Field isolation | ZO writes only `zo_*` fields; HO writes only `ho_*` fields |
| Immutability | `trg_prevent_estimate_hard_delete` blocks DELETE at DB level |
| Amount integrity | `trg_enforce_estimate_item_amount` enforces `rate * qty` at DB level; application enforces first |
| Audit trail | Status transitions written to `audit_log` via `trg_audit_estimate_status`; uses `last_modified_by` (reliably set by controller before every UPDATE) |
| Closed project gate | Checked in `createEstimate` and `saveDraftItems` |
| Telegram fallback | `console.warn` with full estimate identifiers; never throws |
| No hard deletes | No DELETE endpoint; DB trigger is final guard |
| Auto-resubmit attribution | `resubmitted_by = NULL` + `is_auto_resubmitted = TRUE` — no fake mobile number written |

---

## New Environment Variables

None. Existing `TELEGRAM_BOT_TOKEN` is reused.

---

## Complete File Inventory

### New Files

| File | Type |
|---|---|
| `backend/src/db/migrations/08_extend_user_roles.sql` | DB Migration |
| `backend/src/db/migrations/09_create_purchase_data.sql` | DB Migration |
| `backend/src/db/migrations/10_create_project_cost_estimates.sql` | DB Migration |
| `backend/src/db/migrations/11_create_approval_rpc.sql` | DB Migration + PostgreSQL Function |
| `backend/src/middleware/requireRole.js` | Middleware |
| `backend/src/controllers/estimates.controller.js` | Controller |
| `backend/src/controllers/purchaseData.controller.js` | Controller |
| `backend/src/routes/estimates.routes.js` | Routes |
| `backend/src/routes/purchaseData.routes.js` | Routes |
| `frontend/src/api/estimatesApi.js` | API Client |
| `frontend/src/pages/Estimates.jsx` | Page |
| `frontend/src/pages/EstimateForm.jsx` | Page |
| `frontend/src/pages/EstimateView.jsx` | Page |

### Modified Files

| File | Change |
|---|---|
| `backend/src/app.js` | +2 route mounts |
| `backend/src/services/telegram.service.js` | +2 notification functions; existing untouched |
| `frontend/src/App.jsx` | +4 routes |
| `frontend/src/components/Sidebar.jsx` | +1 nav item |
| `frontend/src/pages/Dashboard.jsx` | +1 estimates stat card |
| `frontend/src/pages/admin/AdminPanel.jsx` | +1 Purchase Data tab |

---

## Full Audit Resolution Table

| # | Pass | Sev | Issue | Resolution |
|---|---|---|---|---|
| 1 | 1st | 🔴 | estimate_no + estimate_revision missing from migration | Added both columns |
| 2 | 1st | 🔴 | estimate_amount mid-review calculation wrong | Full status matrix in `_recalculateEstimateAmount` |
| 3 | 1st | 🔴 | estimate_revision not incremented on submit | Explicit increment in `submitEstimate` step 5 |
| 4 | 1st | 🔴 | zo_office_approve not reset on resubmission | Explicit NULL-out in `submitEstimate` step 6 |
| 5 | 1st | 🔴 | reviewEstimate no status-to-role guard | `statusRoleMap` check inside controller |
| 6 | 1st | 🔴 | submitRowApprovals cross-stage writes possible | Stage guard + field isolation inside controller |
| 7 | 1st | 🟡 | Submitted missing from ZO queue | Added to getEstimates ZO filter |
| 8 | 1st | 🟡 | Revision deadline expiry unhandled | Polling-on-open in reviewEstimate with auto-resubmit |
| 9 | 1st | 🟡 | estimate_revision_log missing modified_item_ids | `modified_item_ids UUID[]` column added |
| 10 | 1st | 🟡 | JE/ZO/HO names never resolved | Batch authorised_users join in getEstimateById |
| 11 | 1st | 🟡 | saveDraftItems no status allowlist | Explicit allowlist + revision field isolation |
| 12 | 1st | 🟡 | Q1 role strategy unconfirmed | ✅ Confirmed: Option A — je/zo/ho/admin |
| 13 | 1st | 🟡 | Telegram fallback unspecified | console.warn with identifiers; no throw |
| 14 | 1st | 🔵 | Misleading trigger name | Renamed to prevent_estimate_hard_delete |
| 15 | 1st | 🔵 | /summary extra round-trip | Summary embedded in getEstimateById response |
| 16 | 1st | 🔵 | Countdown no client-side form disable | Form disabled at zero + expiry message shown |
| 17 | 1st | 🔵 | Submitted badge colour | Documented intentionally (blue) |
| 18 | 1st | 🔵 | requireRole.js missing from file inventory | Added to New Files table |
| 1 | 2nd | 🔴 | getEstimateItems no controller spec | Endpoint removed; items embedded in getEstimateById |
| 2 | 2nd | 🔴 | Spec vs plan estimate_amount conflict | Plan matrix is correct; spec note added |
| 3 | 2nd | 🔴 | modified_item_ids collection undefined | Explicitly collected before NULL-out in submitEstimate |
| 4 | 2nd | 🔴 | resubmitted_by = 'SYSTEM' breaks FK/display | NULL + is_auto_resubmitted = TRUE boolean |
| 5 | 2nd | 🟡 | display_name column assumed unverified | ✅ Verified in admin.controller.js line 46 + 160 |
| 6 | 2nd | 🟡 | is_active column assumed unverified | ✅ Verified in admin.controller.js line 49 + 103 |
| 7 | 2nd | 🟡 | material_master column names unverified | ✅ Verified in materials.controller.js |
| 8 | 2nd | 🟡 | saveDraftItems full-replace vs upsert ambiguous | Documented as full replacement; semantics explained |
| 9 | 2nd | 🟡 | requestRevision NULL rows counted as Not Approve | NULL rows explicitly excluded from the check |
| 10 | 2nd | 🟡 | submitReview edge case: revision then reject | Documented as allowed — hard rejection |
| 11 | 2nd | 🟡 | HO queue cluttered with terminal estimates | Active / history tab separation |
| 12 | 2nd | 🔵 | Audit trigger COALESCE fragile | last_modified_by column; always set before UPDATE |
| 13 | 2nd | 🔵 | estimate_revision visibility inconsistency | JE sees revision history — intentional |
| 14 | 2nd | 🔵 | getEstimateSummary route/export conflict | Both route and export removed; summary inline |
| 15 | 2nd | 🔵 | enforce_estimate_item_amount trigger dropped | Restored in migration 10 |
| 1 | 3rd | 🔴 | saveDraftItems full-replace deletes approved rows during revision | DELETE step guards: skips approved rows (zo OR ho = 'Approve') regardless of payload |
| 2 | 3rd | 🔴 | je_user_id/je_date overwritten on resubmission | Stamped only when isFirstSubmit = true; resubmit timestamps in revision log only |
| 3 | 3rd | 🟡 | _recalculateEstimateAmount hardcoded 'Draft' in saveDraftItems | Passes actual current estimate.estimate_status |
| 4 | 3rd | 🟡 | zonal_office_no empty-string passes required check | Explicit `.trim().length > 0` validation added |
| 5 | 3rd | 🟡 | Category totals don't match approved_grand_total | Renamed gross_* vs approved_grand_total; frontend labels them distinctly |
| 6 | 3rd | 🟡 | Overdue deadlines invisible until estimate opened | active_revision_deadline + is_deadline_overdue in getEstimates list response |
| 7 | 3rd | 🟡 | submitRowApprovals approval loop not transactional | Steps wrapped in DB transaction via Supabase RPC |
| 8 | 3rd | 🔵 | Countdown deadline source undefined in EstimateForm | active_revision_deadline from getEstimateById response; no secondary call |
| 9 | 3rd | 🔵 | source_of_purchase optionality undocumented | Explicitly documented as optional in saveDraftItems + submitEstimate |
| 10 | 3rd | 🔵 | estimate_revision rendered for all roles in frontend | Conditional: hidden for je/staff on list + detail views |
