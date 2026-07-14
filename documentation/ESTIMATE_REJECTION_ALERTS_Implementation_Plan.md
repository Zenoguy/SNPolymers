# Refinements Plan — Telegram Notifications on Rejection & Summary Panel Update

This document outlines the implementation plan for:
1. Triggering Telegram notifications when a Cost Estimate is rejected by either the Zonal Office (ZO) or Head Office (HO).
2. Removing the category breakdown table (Materials, Labour, Transport, Miscellaneous costs) from the **3. Estimate Summary** card, and presenting the budget totals in a clean list layout.

---

## Proposed Changes

### 1. Backend Modifications

#### [MODIFY] [telegram.service.js](file:///Users/aswint/Documents/GitHub/SNPolymers/backend/src/services/telegram.service.js)

* **Add `notifyJeEstimateRejected(estimate)`**:
  - Fetches the Telegram Chat ID of the Junior Engineer (`estimate.created_by`) who submitted the estimate.
  - Formats a message containing:
    - **Estimate Number**
    - **Work Order Number**
    - **Site Details**
    - **Total Estimate Amount**
    - **Rejected By** (Zonal Office or Head Office)
    - **Remarks/Reason** (pulls from `zo_remarks` or `ho_remarks` depending on who rejected it).
  - Dispatches the message via the Telegram Bot API.
* **Export the new function** in `module.exports`.

#### [MODIFY] [estimates.workflow.controller.js](file:///Users/aswint/Documents/GitHub/SNPolymers/backend/src/controllers/estimates.workflow.controller.js)

* **Update `submitReview(req, res)`**:
  - In the block where the final status of `updatedEstimate` is evaluated:
  - If the status is `'Rejected by ZO'` or `'Rejected by HO'`, import and call `notifyJeEstimateRejected(updatedEstimate)`.

---

### 2. Frontend Modifications

#### [MODIFY] [EstimateView.jsx](file:///Users/aswint/Documents/GitHub/SNPolymers/frontend/src/pages/EstimateView.jsx)

* **Remove Category Table**:
  - Delete the entire `<table className="w-full text-xs text-left border-collapse">...</table>` element from the **3. Estimate Summary** panel.
* **Update Budget Details Layout**:
  - Inside the summary card, render a clean list structure that includes the **Grand Total Estimate**, **Work Order Value**, and **Budget Variance**.

---

## Verification Plan

### Automated Tests
- Run existing and new Vitest suites to confirm no regressions:
  - Execute `npm test tests/vitest/milestones/milestone_p7_estimate_refinements.test.js`.

### Manual Verification
1. Log in as a Zonal Office user, open a Cost Estimate under review, reject one of the items and submit the final review.
2. Verify that the estimate transitions to status `'Rejected by ZO'`.
3. Verify that the JE receives a Telegram notification from the bot with the rejection details and remarks.
4. Verify that the **3. Estimate Summary** panel on the frontend no longer shows the table containing Material, Labour, Transport, and Miscellaneous rows, and instead shows a clean Grand Total comparison.
