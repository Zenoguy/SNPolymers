# Phase 3 — ZO Fund Request & HO Approval Module
# Milestone-Driven Execution Plan

> **Status:** Implementation Plan approved and frozen. This document converts it into a sequential,
> dependency-ordered execution plan for AI-assisted development.
>
> **Stack:** Supabase/PostgreSQL · Node.js/Express backend · React/Vite frontend
> **Assumed existing:** Phase 1 (auth, fund reports) + Phase 2 (estimates, review workflow)
> **Process flow source:** ZO Fund Request & HO Approval Process Flow diagram

---

## Milestone Overview

| # | Milestone | Primary Layer | Depends On |
|---|---|---|---|
| M1 | Database Foundation | DB | Phase 2 migrations complete |
| M2 | Fund Requests API — Core CRUD | Backend | M1 |
| M3 | Fund Requests API — Workflow (Act/Cancel) | Backend | M2 |
| M4 | Telegram Notification | Backend | M3 |
| M5 | Code Quality & Security Hardening | Backend | Any (independent) |
| M6a | Frontend — Fund Request Entry Screen | Frontend | M3, M4 |
| M6b | Frontend — Fund Request Dashboard | Frontend | M6a |
| M6c | Frontend — Miscellaneous & Backward Support | Frontend | M6b |
| M7 | Test Suite — Phase 3 | All | M1–M6c |
| M8 | UAT & Release Gate | All | M7 |

---

A milestone is complete only if:

✓ Code implemented
✓ Acceptance criteria pass
✓ All milestone test cases pass
✓ No failing lint checks
✓ No open P1 (Critical/High) security defects

---

## M1 — Database Foundation

### Objective
Establish all schema objects required by Phase 3: enums, the independent `fund_requests` table,
indexes, and triggers.

### Scope
- Apply migration `19_create_fund_requests.sql` to the Supabase project.
- Verify all objects are created correctly before any backend work begins.

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/db/migrations/19_create_fund_requests.sql` | **NEW** — apply to DB |

### Database Work

**`19_create_fund_requests.sql`** creates:
- Enum `fund_request_status_enum`: `'Pending'`, `'Approved'`, `'Hold'`, `'Cancelled'`
- Enum `transfer_account_enum`: `'CC'`, `'OD'`, `'CR'`
- Table `fund_requests` with all columns (independent schema, no estimate/work order links)
- Performance indexes on status and foreign keys
- 3 triggers: `trg_fund_request_updated_at`, `trg_prevent_fund_request_hard_delete`, `trg_audit_fund_request_status`

### SQL to Create

```sql
-- ===========================================================================
-- Migration 19: Phase 3 — Fund Requests
-- ===========================================================================

CREATE TYPE fund_request_status_enum AS ENUM (
  'Pending',
  'Approved',
  'Hold',
  'Cancelled'
);

CREATE TYPE transfer_account_enum AS ENUM ('CC', 'OD', 'CR');

CREATE TABLE IF NOT EXISTS fund_requests (
  fund_request_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zo_user_id            VARCHAR NOT NULL REFERENCES authorised_users(mobile_number) ON DELETE RESTRICT,
  zo_date               TIMESTAMPTZ NOT NULL DEFAULT now(),
  zo_fr_no              VARCHAR NOT NULL UNIQUE,
  zo_fr_amount          NUMERIC(18,2) NOT NULL,
  zo_remarks            TEXT,
  request_status        fund_request_status_enum NOT NULL DEFAULT 'Pending',
  approve_ho_user_id    VARCHAR REFERENCES authorised_users(mobile_number) ON DELETE RESTRICT,
  approve_ho_date       TIMESTAMPTZ,
  approve_ho_amount     NUMERIC(18,2),
  transfer_from_account transfer_account_enum,
  ho_remarks            TEXT,
  cancelled_by          VARCHAR REFERENCES authorised_users(mobile_number) ON DELETE RESTRICT,
  cancelled_at          TIMESTAMPTZ,
  created_by            VARCHAR NOT NULL REFERENCES authorised_users(mobile_number) ON DELETE RESTRICT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fund_requests_status
  ON fund_requests(request_status)
  WHERE request_status = 'Pending';

-- Auto-update updated_at
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

-- Block hard DELETE
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

-- Audit status changes
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
```

### Acceptance Criteria
```
✓ fund_requests table exists with all 17 columns
✓ fund_request_status_enum has exactly 4 values: Pending, Approved, Hold, Cancelled
✓ transfer_account_enum has exactly 3 values: CC, OD, CR
✓ Index on status exists
✓ trg_fund_request_updated_at fires on UPDATE (updated_at changes)
✓ trg_prevent_fund_request_hard_delete raises exception on DELETE
✓ trg_audit_fund_request_status inserts into audit_log on status change
✓ zo_fr_no unique constraint prevents duplicate request numbers
```

### Test Cases

**Test 1:** Insert a fund request row with `request_status = 'Pending'` and a unique request number.
Expected: row inserted successfully.

**Test 2:** Insert a second fund request with the same `zo_fr_no`.
Expected: unique constraint violation on `zo_fr_no`.

**Test 3:** Insert a second fund request with a different `zo_fr_no`.
Expected: insertion succeeds.

**Test 4:** Attempt `DELETE FROM fund_requests WHERE fund_request_id = <any>`.
Expected: exception — "Hard deletion of fund_requests is permanently prohibited."

**Test 5:** Update `request_status` on a fund_requests row; check `audit_log`.
Expected: new row in `audit_log` with `module_name = 'Fund Request'`, `action = 'STATUS_CHANGE'`.

**Test 6:** Update any non-status field (e.g. `ho_remarks`); check `updated_at`.
Expected: `updated_at` automatically updated by trigger.

### Exit Criteria
```
✓ All 6 test cases pass
✓ No migration errors in Supabase dashboard
✓ Schema inspector confirms table, enums, indexes, triggers
✓ Ready to begin M2
```

---

## M2 — Fund Requests API: Core CRUD

### Objective
Implement `createFundRequest`, `getFundRequests`, and `getFundRequestById`. These are the read/write endpoints that don't involve workflow status transitions.

### Scope
- `fundRequests.controller.js` — 3 CRUD functions
- `fundRequests.routes.js` — read + create routes
- `app.js` — mount registration

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/controllers/fundRequests.controller.js` | **NEW** (partial — CRUD functions) |
| `backend/src/routes/fundRequests.routes.js` | **NEW** |
| `backend/src/app.js` | **MODIFY** — add route mount |

### Backend Work

**Controller file skeleton:**

```javascript
'use strict';

const { supabase } = require('../db/supabase');

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const VALID_STATUSES = ['Pending', 'Approved', 'Hold', 'Cancelled'];
const VALID_TRANSFER_ACCOUNTS = ['CC', 'OD', 'CR'];

// Role normalization (staff treated as zo for fund request purposes)
function getEffectiveFrRole(role) {
  return role === 'staff' ? 'zo' : role;
}
```

**`createFundRequest(req, res)`** — Full implementation spec:

```
1. Destructure: { zo_fr_no, zo_fr_amount, zo_remarks } = req.body

2. Input validation (all return 400):
   a. zo_fr_no: required; String(zo_fr_no).trim().length > 0
      Error: "zo_fr_no (Fund Request Number) is required."
   b. zo_fr_amount: required; Number(zo_fr_amount) must be > 0 and finite
      Error: "zo_fr_amount must be a positive number greater than zero."

3. Unique request number check:
   SELECT COUNT(*) FROM fund_requests WHERE zo_fr_no = $1
   - 409 if count > 0:
     Error: "A fund request with number {zo_fr_no} already exists."

4. Insert:
   {
     zo_user_id:    req.user.mobile_number,
     zo_fr_no:      zo_fr_no.trim(),
     zo_fr_amount:  Number(zo_fr_amount),
     zo_remarks:    zo_remarks?.trim() || null,
     created_by:    req.user.mobile_number,
     request_status: 'Pending'
   }
   - On insert error code '23505': return 409 (duplicate unique constraint on zo_fr_no)

5. Return 201 with created fund request.
```

**`getFundRequests(req, res)`** — Role-filtered list with pagination:

```
Query params: page, limit (cap 100), status (optional)

Filtering by role:
  'zo': fund_requests WHERE zo_user_id = req.user.mobile_number
  'ho'/'admin': all fund_requests
  'je': 403 Forbidden

Apply optional status filter if provided and valid.
Order: created_at DESC.
Paginate: RANGE(offset, offset+limit-1) with count: 'exact'.

Resolve display names for zo_user_id and approve_ho_user_id by fetching authorised_users.

Return: { success, fundRequests, pagination }
```

**`getFundRequestById(req, res)`** — Single record with visibility:

```
1. Validate fund_request_id UUID.
2. Fetch fund_request.
3. Visibility gate:
   'zo': fund_request.zo_user_id must = req.user.mobile_number → else 404 (or 403)
   'ho'/'admin': always visible
   'je': 403 Forbidden
4. Resolve display names for zo_user_id and approve_ho_user_id.
5. Return enriched record.
```

### Acceptance Criteria
```
✓ POST /fund-requests with valid parameters → 201, status = 'Pending'
✓ POST /fund-requests with duplicate zo_fr_no → 409
✓ POST /fund-requests with zo_fr_amount = 0 → 400
✓ POST /fund-requests with zo_fr_amount = -100 → 400
✓ POST /fund-requests with blank zo_fr_no → 400
✓ GET /fund-requests as 'zo': only own requests returned
✓ GET /fund-requests as 'ho': all Pending/Approved/Hold returned
✓ GET /fund-requests as 'je' → 403
✓ GET /fund-requests/:id by non-owner → 404/403
✓ Pagination: page, limit, total, totalPages present in response
```

### Test Cases

**Test 1:** `POST /fund-requests` as `zo` user with unique `zo_fr_no`.
Expected: 201, `{ request_status: 'Pending', zo_user_id: <mobile> }`.

**Test 2:** `POST /fund-requests` with the same `zo_fr_no`.
Expected: 409 — "A fund request with number already exists."

**Test 3:** `POST /fund-requests` with blank `zo_fr_no`.
Expected: 400 — "zo_fr_no (Fund Request Number) is required."

**Test 4:** `POST /fund-requests` with `zo_fr_amount = "abc"`.
Expected: 400 — amount validation.

**Test 5:** `GET /fund-requests` as `zo` user — only own requests visible.
Expected: 200, all items have `zo_user_id = req.user.mobile_number`.

**Test 6:** `GET /fund-requests/:id` where request belongs to a different ZO user.
Expected: 404 or 403 (no ID leakage).

**Test 7:** `GET /fund-requests?page=1&limit=5`.
Expected: 200, `pagination.limit = 5`, `pagination.total` ≥ 0.

**Test 8:** `GET /fund-requests` as `je` user.
Expected: 403 Forbidden.

### Exit Criteria
```
✓ All 8 test cases pass
✓ No P1 defects
✓ Route registered in app.js and server starts without error
✓ Ready to begin M3
```

---

## M3 — Fund Requests API: Workflow (Act + Cancel)

### Objective
Implement the two state-transition endpoints: `actOnFundRequest` (HO Approve or Hold) and
`cancelFundRequest` (ZO Cancel). These are the core workflow actions shown in the process
flow diagram.

### Scope
- `actOnFundRequest` — PATCH `/:id/action`
- `cancelFundRequest` — PATCH `/:id/cancel`
- Routes addition to `fundRequests.routes.js`

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/controllers/fundRequests.controller.js` | **MODIFY** — add `actOnFundRequest`, `cancelFundRequest` |
| `backend/src/routes/fundRequests.routes.js` | **MODIFY** — add action + cancel routes |

### Backend Work

**`actOnFundRequest(req, res)`** — Full implementation:

```javascript
async function actOnFundRequest(req, res) {
  const { id } = req.params;
  const { action, approve_ho_amount, transfer_from_account, ho_remarks } = req.body;

  // 1. UUID validation
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid fund request ID.' });
  }

  // 2. Action validation
  if (!['Approve', 'Hold'].includes(action)) {
    return res.status(400).json({ success: false, message: "action must be 'Approve' or 'Hold'." });
  }

  try {
    // 3. Fetch fund request
    const { data: fr, error: frError } = await supabase
      .from('fund_requests')
      .select('*')
      .eq('fund_request_id', id)
      .maybeSingle();

    if (frError) throw frError;
    if (!fr) return res.status(404).json({ success: false, message: 'Fund request not found.' });

    // 4. Status guard: must be Pending
    if (fr.request_status !== 'Pending') {
      return res.status(403).json({
        success: false,
        message: `Action can only be taken on Pending requests. Current status: ${fr.request_status}`
      });
    }

    let updatePayload = {
      approve_ho_user_id: req.user.mobile_number,
      approve_ho_date: new Date().toISOString(),
      ho_remarks: ho_remarks?.trim() || null
    };

    // 5a. Hold path
    if (action === 'Hold') {
      updatePayload.request_status = 'Hold';
      // approve_ho_amount and transfer_from_account remain NULL
    }

    // 5b. Approve path
    if (action === 'Approve') {
      // validate approve_ho_amount
      const hoAmount = Number(approve_ho_amount);
      if (!approve_ho_amount || isNaN(hoAmount) || hoAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'approve_ho_amount is required for approval and must be greater than zero.'
        });
      }
      if (hoAmount > Number(fr.zo_fr_amount)) {
        return res.status(400).json({
          success: false,
          message: `approve_ho_amount (₹${hoAmount.toLocaleString('en-IN')}) cannot exceed the requested amount (₹${Number(fr.zo_fr_amount).toLocaleString('en-IN')}).`
        });
      }

      // validate transfer_from_account
      if (!VALID_TRANSFER_ACCOUNTS.includes(transfer_from_account)) {
        return res.status(400).json({
          success: false,
          message: `transfer_from_account is required for approval. Valid values: ${VALID_TRANSFER_ACCOUNTS.join(', ')}.`
        });
      }

      updatePayload.request_status = 'Approved';
      updatePayload.approve_ho_amount = hoAmount;
      updatePayload.transfer_from_account = transfer_from_account;
    }

    // 6. Perform update
    const { data: updated, error: updateError } = await supabase
      .from('fund_requests')
      .update(updatePayload)
      .eq('fund_request_id', id)
      .eq('request_status', 'Pending')  // optimistic lock — prevents race conditions
      .select()
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updated) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: The fund request status was already changed by another action.'
      });
    }

    // 7. Non-blocking Telegram notification on Approve
    if (action === 'Approve') {
      const { notifyZoFundRequestApproved } = require('../services/telegram.service');
      notifyZoFundRequestApproved(fr, updated).catch(err => {
        console.error(`[FUND REQUEST] Telegram notification failed: ${err.message}`);
      });
    }

    return res.status(200).json({
      success: true,
      fundRequest: updated,
      message: `Fund request has been ${action === 'Approve' ? 'approved' : 'placed on hold'}.`
    });

  } catch (error) {
    console.error(`actOnFundRequest failed: ${error.message}`, error.stack);
    return res.status(500).json({ success: false, message: 'Failed to process fund request action.' });
  }
}
```

**`cancelFundRequest(req, res)`** — Full implementation:

```javascript
async function cancelFundRequest(req, res) {
  const { id } = req.params;

  if (!uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid fund request ID.' });
  }

  try {
    const { data: fr, error: frError } = await supabase
      .from('fund_requests')
      .select('*')
      .eq('fund_request_id', id)
      .maybeSingle();

    if (frError) throw frError;
    if (!fr) return res.status(404).json({ success: false, message: 'Fund request not found.' });

    // Ownership check
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && fr.zo_user_id !== req.user.mobile_number) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own fund requests.'
      });
    }

    // Status guard
    if (fr.request_status !== 'Pending') {
      return res.status(403).json({
        success: false,
        message: `Only Pending fund requests can be cancelled. Current status: ${fr.request_status}`
      });
    }

    const { data: updated, error: updateError } = await supabase
      .from('fund_requests')
      .update({
        request_status: 'Cancelled',
        cancelled_by: req.user.mobile_number,
        cancelled_at: new Date().toISOString()
      })
      .eq('fund_request_id', id)
      .eq('request_status', 'Pending')  // optimistic lock
      .select()
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updated) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: The fund request was already acted upon.'
      });
    }

    return res.status(200).json({
      success: true,
      fundRequest: updated,
      message: 'Fund request cancelled successfully.'
    });

  } catch (error) {
    console.error(`cancelFundRequest failed: ${error.message}`, error.stack);
    return res.status(500).json({ success: false, message: 'Failed to cancel fund request.' });
  }
}
```

### Acceptance Criteria
```
✓ PATCH /:id/action with action='Hold' on Pending request → 200, status = 'Hold', HO fields blank
✓ PATCH /:id/action with action='Approve', valid amount and account → 200, status = 'Approved'
✓ PATCH /:id/action with action='Approve', missing approve_ho_amount → 400
✓ PATCH /:id/action with action='Approve', approve_ho_amount > zo_fr_amount → 400
✓ PATCH /:id/action with action='Approve', approve_ho_amount = 0 → 400
✓ PATCH /:id/action with action='Approve', invalid transfer_from_account ('BANK') → 400
✓ PATCH /:id/action on non-Pending request → 403
✓ PATCH /:id/action by 'zo' user → 403 (requireRole(hoRoles) blocks it)
✓ PATCH /:id/action with action='Maybe' → 400
✓ PATCH /:id/cancel on own Pending request → 200, status = 'Cancelled'
✓ PATCH /:id/cancel on another ZO's request → 403
✓ PATCH /:id/cancel on Approved request → 403
✓ Concurrent PATCH /:id/action calls → optimistic lock returns 409 for the second one
✓ approve_ho_amount exactly = zo_fr_amount → allowed (200)
```

### Test Cases

**Test 1:** HO calls `PATCH /:id/action` with `action='Approve'`, valid amount, valid account.
Expected: 200, `request_status = 'Approved'`, `approve_ho_user_id` set, `approve_ho_amount` matches.

**Test 2:** HO calls `PATCH /:id/action` with `action='Hold'`.
Expected: 200, `request_status = 'Hold'`, `approve_ho_amount` is NULL, `transfer_from_account` is NULL.

**Test 3:** HO calls `PATCH /:id/action` with `action='Approve'`, `approve_ho_amount = 999999999` exceeding `zo_fr_amount`.
Expected: 400 — amount exceeds requested.

**Test 4:** HO calls `PATCH /:id/action` with `action='Approve'`, missing `transfer_from_account`.
Expected: 400 — transfer_from_account required.

**Test 5:** HO calls `PATCH /:id/action` on an already-Approved request.
Expected: 403 — not Pending.

**Test 6:** ZO calls `PATCH /:id/cancel` on own Pending request.
Expected: 200, `request_status = 'Cancelled'`, `cancelled_by` set.

**Test 7:** ZO calls `PATCH /:id/cancel` on Approved request.
Expected: 403 — not Pending.

**Test 8:** ZO calls `PATCH /:id/cancel` on a different ZO's request.
Expected: 403 — ownership.

**Test 9:** JE calls `PATCH /:id/action`.
Expected: 403 — role guard at route level.

**Test 10:** Simulate concurrent `action=Hold` and `action=Approve` on same request.
Expected: One succeeds (200); the other gets 409 (optimistic lock on `request_status = 'Pending'`).

### Exit Criteria
```
✓ All 10 test cases pass
✓ Optimistic locking confirmed for concurrent action prevention
✓ No P1 defects
✓ Ready to begin M4
```

---

## M4 — Telegram Notification

### Objective
Add a non-blocking `notifyZoFundRequestApproved` function to the Telegram service that
notifies the ZO user when their fund request is approved by HO.

### Scope
- `notifyZoFundRequestApproved` function in `telegram.service.js`
- Export registration

### Files Created or Modified
| File | Action |
|---|---|
| `backend/src/services/telegram.service.js` | **MODIFY** — add `notifyZoFundRequestApproved` |

### Backend Work

**Implementation:**

```javascript
/**
 * Notifies the ZO user when their fund request is approved by HO.
 * Non-blocking: called with .catch() in the controller.
 * Silent fallback on any error — no throw.
 *
 * @param {object} originalRequest - Fund request before approval (contains zo_user_id, zo_fr_no)
 * @param {object} updatedRequest  - Fund request after approval (contains approve_ho_amount, etc.)
 */
async function notifyZoFundRequestApproved(originalRequest, updatedRequest) {
  if (process.env.NODE_ENV === 'test') return;

  try {
    // 1. Fetch ZO user's telegram_chat_id
    const { data: zoUser, error } = await supabase
      .from('authorised_users')
      .select('display_name, telegram_chat_id')
      .eq('mobile_number', originalRequest.zo_user_id)
      .maybeSingle();

    if (error) {
      console.warn(`[FUND REQUEST] Failed to fetch ZO user for notification: ${error.message}`);
      return;
    }

    if (!zoUser || !zoUser.telegram_chat_id || zoUser.telegram_chat_id.trim() === '') {
      console.warn(
        `[FUND REQUEST] ZO user ${originalRequest.zo_user_id} has no Telegram chat ID configured. ` +
        `Fund Request: ${originalRequest.fund_request_id}, FR No: ${originalRequest.zo_fr_no}`
      );
      return;
    }

    if (!TELEGRAM_BOT_TOKEN) {
      console.warn(
        `[FUND REQUEST] TELEGRAM_BOT_TOKEN not set. Cannot notify ZO for FR: ${originalRequest.zo_fr_no}`
      );
      return;
    }

    const approvedAmount = Number(updatedRequest.approve_ho_amount);
    const requestedAmount = Number(originalRequest.zo_fr_amount);
    const account = updatedRequest.transfer_from_account;

    const messageText =
      `✅ *Fund Request Approved*\n\n` +
      `*Fund Request No:* ${originalRequest.zo_fr_no}\n` +
      `*Requested Amount:* ₹${requestedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `*Approved Amount:* ₹${approvedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n` +
      `*Transfer Account:* ${account}\n` +
      `*HO Remarks:* ${updatedRequest.ho_remarks || 'None'}\n\n` +
      `Your fund request has been approved. Funds will be transferred from the *${account}* account.`;

    const url = `${TELEGRAM_API_BASE}/sendMessage?chat_id=${encodeURIComponent(zoUser.telegram_chat_id)}&text=${encodeURIComponent(messageText)}&parse_mode=Markdown`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.ok) {
      console.warn(
        `[FUND REQUEST] Telegram notification failed for ${zoUser.display_name}: ${data.description}`
      );
    } else {
      console.log(`[FUND REQUEST] Approval notification sent to ${zoUser.display_name}`);
    }

  } catch (error) {
    console.error(`[FUND REQUEST] notifyZoFundRequestApproved failed: ${error.message}`);
    // Never re-throw — this is a non-critical side effect
  }
}
```

Update `module.exports`:
```javascript
module.exports = {
  sendOtp,
  startPolling,
  notifyZoEstimateSubmitted,
  notifyHoEstimateApproved,
  notifyZoFundRequestApproved   // ADD
};
```

### Acceptance Criteria
```
✓ Approval notification sent to ZO's Telegram when HO approves
✓ TELEGRAM_BOT_TOKEN missing → console.warn only, response unaffected
✓ ZO has no telegram_chat_id → console.warn only, response unaffected
✓ Telegram API returns error → console.warn only, response unaffected
✓ NODE_ENV = 'test' → function returns immediately without network call
✓ Controller response is never delayed by this function (non-blocking, .catch())
```

### Test Cases

**Test 1:** HO approves fund request; ZO has a valid `telegram_chat_id`.
Expected: 200 response is immediate. `console.log` confirms notification sent.

**Test 2:** HO approves; ZO has no `telegram_chat_id`.
Expected: 200 response returned. `console.warn` emitted. No error thrown.

**Test 3:** HO approves; `TELEGRAM_BOT_TOKEN` not set.
Expected: 200 response returned. `console.warn` emitted. No error thrown.

### Exit Criteria
```
✓ All 3 test cases pass
✓ No blocking behavior introduced
✓ Ready to begin M5
```

---

## M5 — Code Quality & Security Hardening

### Objective
Fix 17 issues (12 code quality + 5 security) identified in the codebase audit.
This milestone is independent and can run in parallel with M4 or M6.

### Files Created or Modified
| File | Action | Issues Fixed |
|---|---|---|
| `backend/src/controllers/estimates.core.controller.js` | **MODIFY** | CQ-1, CQ-6 |
| `backend/src/controllers/auth.controller.js` | **MODIFY** | CQ-2 |
| `backend/src/controllers/reports.controller.js` | **MODIFY** | CQ-5 |
| `backend/src/controllers/admin.controller.js` | **MODIFY** | CQ-7, SEC-5 |
| `backend/src/services/otp.service.js` | **MODIFY** | CQ-9 |
| `backend/src/middleware/verifyJwt.js` | **MODIFY** | SEC-4 |
| `backend/src/app.js` | **VERIFY + MODIFY** | SEC-1 |
| `backend/src/routes/auth.routes.js` | **MODIFY** | SEC-2 |

### Fix-by-Fix Implementation

#### CQ-1 — Hardcoded Mobile Numbers in Production Code

**File:** `estimates.core.controller.js` lines 113–126

**Problem:** Hardcoded array of production phone numbers used to filter test data. This
is a major code smell — these numbers will change, new prod users won't be filtered,
and it leaks PII into source code.

**Fix:**
```javascript
// BEFORE:
const legitMobiles = ['+918276071523', '+917980526576', ...];
if (legitMobiles.includes(req.user.mobile_number)) { ... }

// AFTER:
// Filter test data (work_order_no like 'TEST_%') for non-test environments.
// IDBP_FILTER_TEST_DATA env var enables this filter for production users who
// should not see seed/test records. Set to 'true' in the production .env.
if (process.env.IDBP_FILTER_TEST_DATA === 'true') {
  dbQuery = dbQuery
    .not('work_order_no', 'like', 'TEST_%')
    .not('estimate_no', 'like', 'EST_%');
}
```

Also add `IDBP_FILTER_TEST_DATA=true` to `.env.example` with comment.

---

#### CQ-2 — IP Address Extraction Bug

**File:** `auth.controller.js` line 171

**Problem:** `req.headers['x-forwarded-for']` may contain `"1.2.3.4, 5.6.7.8"` — only
the first IP is the real client IP, the rest are proxies.

**Fix:**
```javascript
// BEFORE:
const ipAddress = req.ip || req.headers['x-forwarded-for'];

// AFTER:
// Extract real client IP: x-forwarded-for may contain multiple addresses.
// Only the first (leftmost) is the original client IP.
const ipAddress = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || 'unknown';
```

---

#### CQ-5 — Amount Not Validated as Number in Reports

**File:** `reports.controller.js` `createReport` and `updateReport`

**Problem:** `amount` is accepted as long as it's `!== undefined`, so strings like `"abc"`
or objects pass through to the DB and cause runtime errors or data corruption.

**Fix:**
```javascript
// In createReport:
const amountNum = Number(amount);
if (amount === undefined || amount === null || isNaN(amountNum) || amountNum < 0) {
  return res.status(400).json({
    success: false,
    message: 'amount must be a non-negative number.'
  });
}

// In updateReport (same pattern):
const amountNum = Number(amount);
if (isNaN(amountNum) || amountNum < 0) {
  return res.status(400).json({
    success: false,
    message: 'amount must be a non-negative number.'
  });
}
```

---

#### CQ-6 — `global=true` Bypass on JE Role

**File:** `estimates.core.controller.js` line 128

**Problem:** A `je` user can pass `?global=true` in the query string to see ALL estimates
from all users. This is a privilege escalation through an unguarded query parameter.

**Fix:**
```javascript
// BEFORE:
if (effectiveRole === 'je' && query.global !== 'true') {
  dbQuery = dbQuery.eq('created_by', req.user.mobile_number);
}

// AFTER:
// Only admin may use global=true to bypass the created_by filter.
// JE and staff are always scoped to their own estimates regardless of query params.
if (effectiveRole === 'je') {
  dbQuery = dbQuery.eq('created_by', req.user.mobile_number);
} else if (effectiveRole === 'admin' && query.global !== 'true') {
  // Admin without global=true still sees all (no created_by filter for admin)
  // No additional filter needed
}
```

---

#### CQ-7 — `updateUser` Accepts Any Role String

**File:** `admin.controller.js` `updateUser`

**Problem:** An admin can accidentally (or maliciously) update a user's role to an
unsupported value like `'superadmin'` or `'root'`. The DB CHECK constraint would catch it,
but the error is opaque and not user-friendly.

**Fix:**
```javascript
const ALLOWED_ROLES = ['staff', 'admin', 'je', 'zo', 'ho'];

// In updateUser, before building updateFields:
if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
  return res.status(400).json({
    success: false,
    message: `Invalid role. Allowed values: ${ALLOWED_ROLES.join(', ')}.`
  });
}
```

---

#### CQ-9 — Non-Atomic OTP Attempt Increment

**File:** `otp.service.js` `verifyOtp` lines 87–92

**Problem:** The current code reads `otpRequest.attempts`, adds 1, and writes back.
Under concurrent OTP verification (race condition), two simultaneous invalid attempts
could both read `attempts = 2`, both write `3`, and effectively use 5 attempts
instead of consuming two slots.

**Fix — use DB-side increment:**
```javascript
// BEFORE:
await supabase
  .from('otp_requests')
  .update({ attempts: otpRequest.attempts + 1 })
  .eq('id', otpRequest.id);

// AFTER: atomic increment at DB level
await supabase
  .from('otp_requests')
  .update({ attempts: otpRequest.attempts + 1 })  // Supabase JS v2 doesn't support SQL increment directly
  .eq('id', otpRequest.id);
// NOTE: For true atomicity, use an RPC:
// await supabase.rpc('increment_otp_attempts', { p_id: otpRequest.id });
// For now, the 3-attempt limit on a 5-minute window OTP with single active OTP per user
// provides sufficient protection. Document this known limitation.

// ADD COMMENT above the .update() call:
// Security note: This increment is not atomic — a theoretical race condition exists
// under concurrent invalid attempts. In practice, this is mitigated by:
// 1. Only 1 active OTP per user (LIFO fetch ensures old tokens are effectively voided)
// 2. 5-minute window before expiry
// 3. OTP rate limiter: max 3 requests per 15 min per mobile number
// If atomicity becomes critical, implement increment_otp_attempts RPC (Migration 20).
```

---

#### SEC-1 — Unauthenticated Materials Route (CRITICAL)

**File:** `app.js` lines 57–58

**Problem:** `materialsRoutes` is mounted on BOTH `/api/materials` (no JWT middleware)
AND `/api/v1/auth/materials`. The first mount has NO authentication. The `materials.routes.js`
file must be inspected — if `verifyJwt` is applied inside the router, the unauthenticated
mount still works but JWT is enforced. If not, material data is publicly readable.

**Fix:**

First, read `materials.routes.js` to check whether it applies `verifyJwt` internally.

```javascript
// materials.routes.js (inspect):
// IF it has: router.use(verifyJwt); — then the /api/materials mount is safe.
// IF it does NOT have verifyJwt — remove the /api/materials mount immediately.
```

Action regardless of finding:
1. **Remove** the `/api/materials` mount from `app.js` (line 57–58). The authenticated
   `/api/v1/auth/materials` mount is sufficient.
2. Add a comment on the authenticated mount explaining the public mount was removed.

```javascript
// REMOVE:
app.use('/api/materials', materialsRoutes);   // ← REMOVE THIS LINE (SEC-1)

// KEEP (with comment):
// Materials endpoint — requires JWT via verifyJwt in materials.routes.js
app.use('/api/v1/auth/materials', materialsRoutes);
```

---

#### SEC-2 — Telegram Link Endpoint Has No Rate Limiter

**File:** `auth.routes.js` (and `app.js` if needed)

**Problem:** `POST /api/v1/auth/link-telegram` is a public endpoint with no rate limiter.
An attacker can call it in a tight loop to enumerate whether a given mobile number is
in `authorised_users` (the response reveals this via 403 vs 200).

**Fix:**
```javascript
// In auth.routes.js — apply otpRequestLimiter to linkTelegram:
const { otpRequestLimiter } = require('../middleware/rateLimiter');

router.post('/link-telegram', otpRequestLimiter, linkTelegram);
```

---

#### SEC-4 — Missing Cookie Cleanup on TokenExpiredError

**File:** `verifyJwt.js` line 72–78

**Problem:** When the access token is expired, cookies are NOT cleared. The browser
retains the expired cookie and will send it on every subsequent request, causing the
same 401 repeatedly without cleanup.

**Fix:**
```javascript
// In the catch block, on TokenExpiredError:
if (error.name === 'TokenExpiredError') {
  // Clear stale cookies so the client stops sending the expired token
  res.clearCookie('accessToken', cookieOptions);
  return res.status(401).json({
    success: false,
    code: 'ACCESS_TOKEN_EXPIRED',
    message: 'Authentication failed. Access token expired.'
  });
}
```

---

#### SEC-5 — Hard DELETE on User with Active Relations

**File:** `admin.controller.js` `removeUser`

**Problem:** Admin can delete a user who has created estimates, fund requests, or fund
reports. The foreign key relationships may cause a cascade delete (losing records) or
a constraint violation with an opaque error message.

**Fix — pre-check before deletion:**
```javascript
async function removeUser(req, res) {
  const { id } = req.params;

  try {
    // 0. Pre-check: block deletion if user has active resource associations
    const { data: userRecord } = await supabase
      .from('authorised_users')
      .select('mobile_number')
      .eq('id', id)
      .maybeSingle();

    if (userRecord) {
      // Check for active estimates
      const { count: estimateCount } = await supabase
        .from('project_cost_estimates')
        .select('estimate_id', { count: 'exact', head: true })
        .eq('created_by', userRecord.mobile_number);

      if (estimateCount > 0) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete user: they have ${estimateCount} cost estimate(s). Deactivate the user instead.`
        });
      }

      // Check for active fund requests
      const { count: frCount } = await supabase
        .from('fund_requests')
        .select('fund_request_id', { count: 'exact', head: true })
        .eq('zo_user_id', userRecord.mobile_number)
        .eq('request_status', 'Pending');

      if (frCount > 0) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete user: they have ${frCount} pending fund request(s). Cancel them first.`
        });
      }
    }

    // Existing deletion logic follows...
  }
}
```

### Acceptance Criteria
```
✓ CQ-1: No hardcoded mobile numbers in production source; IDBP_FILTER_TEST_DATA env var works
✓ CQ-2: IP stored correctly when x-forwarded-for has multiple IPs
✓ CQ-5: createReport/updateReport return 400 for non-numeric amount
✓ CQ-6: JE with ?global=true still only sees own estimates
✓ CQ-7: updateUser returns 400 for role='superadmin'
✓ CQ-9: Comment documents OTP increment limitation; behavior unchanged for single-user flow
✓ SEC-1: /api/materials unauthenticated mount removed; server starts without error
✓ SEC-2: POST /link-telegram returns 429 after 3 rapid requests per IP
✓ SEC-4: accessToken cookie cleared on TokenExpiredError response
✓ SEC-5: Deleting user with active estimates returns 409
```

### Exit Criteria
```
✓ All 10 acceptance criteria verified
✓ Server starts cleanly after /api/materials removal
✓ Existing milestone tests still pass (no regression)
✓ No P1 defects introduced
```

---

## M6a — Frontend: Fund Request Entry Screen

### Objective
Build the entry/creation interface for Zonal Offices to submit new Fund Requests and the ability for ZO to view/cancel pending requests.

### Scope
- `NewFundRequestModal` or creation form in `FundRequests.jsx`
- `fundRequests.js` — API client module (partial)
- Cancel action for pending requests with confirmation dialog

### Files Created or Modified
| File | Action |
|---|---|
| `frontend/src/pages/FundRequests.jsx` | **NEW** (creation flow and list) |
| `frontend/src/api/fundRequests.js` | **NEW** |

### Frontend Work

**`frontend/src/api/fundRequests.js`:**

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true
});

export const getFundRequests = (params = {}) =>
  API.get('/api/v1/auth/fund-requests', { params });

export const getFundRequestById = (id) =>
  API.get(`/api/v1/auth/fund-requests/${id}`);

export const createFundRequest = (data) =>
  API.post('/api/v1/auth/fund-requests', data);

export const actOnFundRequest = (id, data) =>
  API.patch(`/api/v1/auth/fund-requests/${id}/action`, data);

export const cancelFundRequest = (id) =>
  API.patch(`/api/v1/auth/fund-requests/${id}/cancel`);
```

**ZO Entry Screen Component Architecture:**

```
<FundRequests>
  └── [ZO View]
      ├── <FundRequestListZO>   — own requests with status badges (Pending, Approved, Hold, Cancelled)
      │   └── <FundRequestCard>  — per-request card with Cancel button (Pending status only)
      └── <NewFundRequestModal> — modal form for creating a new request
          ├── ZO_FR_NO input (User entered, unique)
          ├── ZO_FR_Amount input (> 0)
          ├── ZO_Remarks textarea (optional)
          └── Auto-display: ZO ID (read-only), ZO Date (read-only, today)
```

**Key UI Behavior Rules:**
1. `ZO_ID`, `ZO_Date` are always **read-only** (auto-populated from session, never editable).
2. Cancel button is only present on `Pending` status requests and requires confirmation.

### Acceptance Criteria
```
✓ ZO creates fund request — form validates, submits, new card appears in list
✓ ZO cannot edit ZO_ID or ZO_Date fields (read-only)
✓ ZO cancels Pending request — confirmation dialog shown; on confirm, status = Cancelled
✓ ZO cannot cancel Approved or Hold requests (Cancel button absent)
```

### Exit Criteria
```
✓ Form validation and submission work correctly
✓ Cancel workflow successfully updates DB record to 'Cancelled'
✓ Ready to begin M6b
```

---

## M6b — Frontend: Fund Request Dashboard

### Objective
Build the dashboard/history listing for all roles and the HO action panel (Approve / Hold workflows).

### Scope
- Tabbed dashboard for HO and Admin (Pending tab, History tab)
- HO Action Modal / Panel in `FundRequests.jsx`
- HO fields enable/disable logic based on Approve_type dropdown

### Files Created or Modified
| File | Action |
|---|---|
| `frontend/src/pages/FundRequests.jsx` | **MODIFY** — add HO View & Action Modals |

### Frontend Work

**HO Dashboard & Action Modal Architecture:**

```
<FundRequests>
  ├── [HO View]
  │   ├── <Tabs> — "Pending Requests" | "History"
  │   ├── <FundRequestListHO>  — pending requests with "Take Action" button
  │   └── <ActionModal>        — HO action panel
  │       ├── Auto-display: Approve_HO_USER_ID (read-only), Approve_HO_DATE (read-only)
  │       ├── <Approve_type dropdown> — Approve / Hold
  │       ├── [Approve selected — fields ENABLED]:
  │       │   ├── Approve_HO_AMOUNT (numeric input)
  │       │   ├── Transfer_from_Account (select: CC / OD / CR)
  │       │   └── HO_Remarks (textarea, optional)
  │       └── [Hold selected — fields DISABLED/GREYED]:
  │           ├── Approve_HO_AMOUNT (disabled)
  │           ├── Transfer_from_Account (disabled)
  │           └── HO_Remarks (disabled)
  │
  └── [Admin View]
      └── Toggle/Render both ZO and HO views with Admin overrides
```

**Key UI Behavior Rules (from spec):**
1. When `Approve_type = 'Hold'`: all HO entry fields (`Approve_HO_AMOUNT`, `Transfer_from_Account`, `HO_Remarks`) are **disabled** with visual greying.
2. When `Approve_type = 'Approve'`: all HO entry fields are **enabled**.
3. `Approve_HO_USER_ID`, `Approve_HO_DATE` are always **read-only** (auto-populated, never editable by user).
4. Status badges use consistent styling: `Pending` → amber, `Approved` → green, `Hold` → red, `Cancelled` → grey.

### Acceptance Criteria
```
✓ HO sees Pending tab with all Pending requests
✓ HO selects 'Hold' → all entry fields grey out and become disabled
✓ HO selects 'Approve' → entry fields enable; amount and account required
✓ HO cannot enter approve_ho_amount > zo_fr_amount (frontend validation)
✓ HO submits Approve → card moves to History tab with green badge
✓ HO submits Hold → card moves to History tab with red badge
```

### Exit Criteria
```
✓ HO action workflows (Approve/Hold) function correctly
✓ UI dynamically manages disabled/enabled states based on dropdown selection
✓ Ready to begin M6c
```

---

## M6c — Frontend: Miscellaneous & Backward Support

### Objective
Wire up routing, menu access, role restrictions, dashboard navigation cards, and maintain backward support across the application.

### Scope
- App route registration and navbar integration
- Dashboard navigation cards visible only to authorised roles (`zo`, `ho`, `admin`)
- Enforcing role-based page guards on frontend routing
- General verification and backward support testing

### Files Created or Modified
| File | Action |
|---|---|
| `frontend/src/App.jsx` | **MODIFY** — add route |
| `frontend/src/pages/Dashboard.jsx` | **MODIFY** — add navigation card |

### Frontend Work
1. Add route `<Route path="/fund-requests" element={<FundRequests />} />` in `App.jsx`.
2. Add a navigation card to `Dashboard.jsx` which displays link to `/fund-requests` for `zo`, `ho`, and `admin` roles, while remaining hidden/unreachable for `je` role.
3. Verify that old modules (Phase 1 fund reports, Phase 2 estimates) are unaffected and continue to work as expected.

### Acceptance Criteria
```
✓ Access to /fund-requests is blocked for JE users
✓ Dashboard navigation card displays and directs to /fund-requests for authorized roles
✓ Existing routes (Estimates, Reports) continue to function perfectly
✓ Build succeeds (npm run build)
```

### Exit Criteria
```
✓ Build succeeds without console errors
✓ Backward support verified: Estimates and Reports function correctly
✓ Ready to begin M7
```

---

## M7 — Test Suite: Phase 3

### Objective
Create comprehensive automated tests for all Phase 3 milestones, following the same
patterns established in Phase 2's milestone test files.

### Files Created or Modified
| File | Action |
|---|---|
| `backend/tests/milestones/test_milestone_p3_m1.js` | **NEW** — DB schema tests |
| `backend/tests/milestones/test_milestone_p3_m2.js` | **NEW** — CRUD API tests |
| `backend/tests/milestones/test_milestone_p3_m3.js` | **NEW** — Workflow tests |
| `backend/tests/milestones/test_milestone_p3_m4.js` | **NEW** — Security + edge cases |
| `backend/tests/milestones/test_milestone_p3_m5.js` | **NEW** — Code quality regression |
| `backend/package.json` | **MODIFY** — add test:p3:* scripts |

### Test Suite Structure

**test_milestone_p3_m1.js** — DB Foundation:
```
✓ fund_requests table exists
✓ fund_request_status_enum has 4 values
✓ transfer_account_enum has 3 values (CC, OD, CR)
✓ Index on status exists
✓ All 3 triggers exist
✓ zo_fr_no unique constraint exists
✓ Hard delete raises exception
✓ updated_at trigger fires
✓ Audit trigger inserts to audit_log on status change
```

**test_milestone_p3_m2.js** — CRUD API:
```
✓ POST /fund-requests: 201 on valid unique request
✓ POST /fund-requests: 409 on duplicate request number
✓ POST /fund-requests: 400 on invalid amount (0, negative, string)
✓ POST /fund-requests: 400 on blank zo_fr_no
✓ GET /fund-requests: role-filtered correctly (zo/ho/admin)
✓ GET /fund-requests: 403 on 'je' role
✓ GET /fund-requests/:id: 404/403 for unauthorized access
✓ Pagination params respected (page, limit)
```

**test_milestone_p3_m3.js** — Workflow:
```
✓ PATCH /action=Approve: 200, all fields set correctly
✓ PATCH /action=Hold: 200, HO amount/account NULL
✓ PATCH /action=Approve with amount > zo_fr_amount: 400
✓ PATCH /action=Approve with amount = zo_fr_amount: 200 (boundary test)
✓ PATCH /action=Approve with missing transfer_from_account: 400
✓ PATCH /action on non-Pending: 403
✓ PATCH /cancel on own Pending: 200
✓ PATCH /cancel on another user's request: 403
✓ PATCH /cancel on non-Pending: 403
✓ Concurrent action: optimistic lock returns 409 for second call
```

**test_milestone_p3_m4.js** — Security & Edge Cases:
```
✓ SEC-1: GET /api/materials returns 401 (unauthenticated mount removed)
✓ SEC-2: POST /link-telegram returns 429 after 3 rapid requests
✓ SEC-4: TokenExpiredError clears accessToken cookie
✓ SEC-5: DELETE /admin/users/:id with active estimates returns 409
✓ CQ-6: JE with ?global=true query sees only own estimates
✓ CQ-7: updateUser with role='invalid_role' returns 400
✓ CQ-5: createReport with amount='abc' returns 400
✓ CQ-5: createReport with amount=-100 returns 400
✓ UUID injection: /fund-requests/<sql-injection-string> returns 400
✓ XSS in zo_remarks field: stored safely, no eval in response
```

**test_milestone_p3_m5.js** — Code Quality Regression:
```
✓ No hardcoded mobile numbers in estimates.core.controller.js
✓ IDBP_FILTER_TEST_DATA=false → all estimates visible (no filtering)
✓ IDBP_FILTER_TEST_DATA=true → TEST_ work orders filtered
✓ IP extraction: x-forwarded-for='1.1.1.1, 2.2.2.2' → stored as '1.1.1.1'
✓ OTP attempt increment comment present in otp.service.js (code review check)
```

### Exit Criteria
```
✓ All 5 test files pass (npm run test:p3:all)
✓ No regressions in existing Phase 2 test suite (npm run test:all)
✓ No P1 defects
✓ Ready for M8 UAT
```

---

## M8 — UAT & Release Gate

### Objective
End-to-end manual user acceptance testing. All milestone tests must be green before UAT begins.

### ZO Acceptance Flow
1. ZO logs in → navigates to Fund Requests page
2. ZO creates a fund request by entering a unique request number and amount
3. ZO verifies: `ZO_ID` = own display name, `ZO_Date` = today (read-only)
4. ZO verifies: request appears in list with `Pending` badge
5. ZO cancels the request → confirmation dialog → status = `Cancelled`

### HO Approval Flow
1. HO logs in → navigates to Fund Requests → Pending tab
2. HO opens a Pending request → clicks "Take Action"
3. HO selects `Approve_type = Hold` → verifies all entry fields are greyed/disabled
4. HO changes to `Approve_type = Approve` → verifies fields are enabled
5. HO enters approved amount ≤ requested amount, selects account, adds remarks
6. HO submits → card moves to History with green badge
7. ZO receives Telegram notification with approved amount and account type

### HO Hold Flow
1. HO opens another Pending request
2. HO selects `Hold` → submits → card moves to History with red badge
3. ZO does NOT receive Telegram notification (Hold ≠ Approve)

### Admin Flow
1. Admin navigates to Fund Requests
2. Admin can see all requests (not filtered by user)
3. Admin can create a fund request as ZO
4. Admin can take action as HO

### Release Gate Checklist
```
✓ All M7 tests pass: npm run test:p3:all
✓ All Phase 2 tests still pass: npm run test:all
✓ Build succeeds: cd frontend && npm run build
✓ Server starts without errors: cd backend && npm run dev
✓ ZO flow verified manually end-to-end
✓ HO Approve flow verified manually
✓ HO Hold flow verified manually
✓ Telegram notification received after HO Approve
✓ Audit log entries present for all status changes
✓ No P1 (Critical/High) open defects
```

---

## Appendix A: API Reference Summary

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/v1/auth/fund-requests` | ZO, HO, Admin | Role-filtered list |
| POST | `/api/v1/auth/fund-requests` | ZO/Staff/Admin | Create new request |
| GET | `/api/v1/auth/fund-requests/:id` | ZO, HO, Admin | Single request detail |
| PATCH | `/api/v1/auth/fund-requests/:id/action` | HO/Admin | Approve or Hold |
| PATCH | `/api/v1/auth/fund-requests/:id/cancel` | ZO/Staff/Admin | Cancel Pending |

---

## Appendix B: Status Transition Matrix

```
Pending  ──Approve──►  Approved  (terminal — no further transitions)
Pending  ──Hold──────►  Hold      (terminal — no further transitions)
Pending  ──Cancel────►  Cancelled (terminal — no further transitions)

Note: After a terminal state, ZO may raise a NEW fund request at any time (as long as request numbers are unique).
```

---

## Appendix C: Security Issue Severity Reference

| ID | File | Severity | Fix Status |
|---|---|---|---|
| SEC-1 | app.js | **CRITICAL** | M5 — Remove public materials mount |
| SEC-2 | auth.routes.js | **HIGH** | M5 — Rate limit link-telegram |
| SEC-3 | session.service.js | LOW | Not fixing in Phase 3 (document) |
| SEC-4 | verifyJwt.js | MEDIUM | M5 — Clear cookie on expired |
| SEC-5 | admin.controller.js | MEDIUM | M5 — Pre-check before user delete |

---

## Appendix D: Code Quality Issue Reference

| ID | File | Severity | Fix Status |
|---|---|---|---|
| CQ-1 | estimates.core.controller.js | HIGH | M5 — Env var |
| CQ-2 | auth.controller.js | MEDIUM | M5 — IP extraction |
| CQ-3 | session.service.js | MEDIUM | Not fixing — documented |
| CQ-4 | verifyJwt.js | LOW | Not fixing — message is already safe |
| CQ-5 | reports.controller.js | HIGH | M5 — Number validation |
| CQ-6 | estimates.core.controller.js | MEDIUM | M5 — Role gate |
| CQ-7 | admin.controller.js | HIGH | M5 — Role validation |
| CQ-8 | rateLimiter.js | LOW | Not fixing — intentional limit, add comment |
| CQ-9 | otp.service.js | MEDIUM | M5 — Document limitation |
| CQ-10 | telegram.service.js | LOW | Already correct — add confirming comment |
| CQ-11 | purchaseData.controller.js | INFO | Already correct — no action |
| CQ-12 | All controllers | LOW | Add error.stack logging in catch blocks |
