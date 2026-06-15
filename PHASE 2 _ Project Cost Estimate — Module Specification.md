---
title: 'PHASE 2 : Project Cost Estimate — Module Specification'

---

# PHASE 2 : Project Cost Estimate — Module Specification

## Objective

The Project Cost Estimate module is the primary reporting component of Phase 2 of the Integrated Digital Business Platform (IDBP).

It enables field-level staff (Junior Engineers) to prepare itemised cost estimates for ongoing projects, which then flow through a two-stage approval hierarchy — Zonal Office then Head Office — before being considered final.

---

## Roles and Workflow

The Fund Report follows a Maker → Checker → Approver model.

| Role | Title | Responsibility |
|---|---|---|
| Maker | Junior Engineer (JE) | Creates and submits the estimate |
| Checker | Zonal Office (ZO)  | Reviews each line item and marks approval per row |
| Approver | Head Office (HO) | Final review and per-row approval |

### Workflow Rules

* A JE can create and submit a Fund Report but cannot edit or delete it after submission.
* Only one active estimate (any status other than Final Approved, Rejected by ZO, or Rejected by HO) may exist per Work Order at a time. A new estimate can only be created once the previous one has reached a terminal status. Rejected by ZO and Rejected by HO are both terminal — the JE must create a new estimate from scratch if either rejection is received without a Revision Request.
* During ZO review, the ZO may issue a Revision Request to the JE if one or more line items require correction.
* During HO review, the HO may issue a Revision Request to the JE if one or more line items require correction. Upon JE resubmission, the estimate returns directly to HO review. ZO row approvals are not affected and do not require re-evaluation.
* Revision Requests shall follow the Revision Request Workflow defined below.
* The Head Office can view a report only after Zonal Office approval.
* Neither ZO nor HO is required to directly edit estimate details; corrections shall be performed by the originating JE through the revision workflow.
* No report can be deleted by any user, including Admin. Neither hard deletion nor soft deletion is permitted as a user action.
* Approval information, status history, and estimate summaries are system-generated and maintained automatically.


### Save Draft Behaviour

The JE form exposes two primary actions: **Save Draft** and **Submit**.

**Save Draft**

* Available at any point during estimate creation, before the JE submits.
* Saves the current state of the header and all line items entered so far.
* Sets `Estimate_Status` to **Draft**.
* No notifications are sent to ZO or HO.
* The estimate remains fully editable by the JE — rows can be added, deleted, or modified.
* A Draft estimate is visible only to the originating JE and Admin. ZO and HO cannot see Draft estimates.
* There is no limit on how many times a JE can save a draft before submitting.
* Partial line items (e.g. a row where Qty or Rate has not yet been entered) are permitted in Draft state. Validation is enforced only at submission time.

**Submit**

* Finalises the estimate and sends it forward for ZO review.
* Sets `Estimate_Status` to **Submitted**, then immediately to **Under ZO Review** once the ZO opens it.
* After submission, the JE can no longer edit or delete the estimate unless a Revision Request is issued.
* Submission requires all line items to be complete: Material selection, Qty, Rate, and Rate_Reference must all be filled for every row.

```text
JE Creates Estimate
        |
JE Adds Line Items
        |
   +---- Save Draft? ----------+
   |            Yes            |
   |                           v
   |               Estimate saved as Draft
   |               JE may return and continue editing
   |               (no notifications sent)
   |                           |
   +---------------------------+
        |
        No (Submit)
        |
JE Submits Estimate → Telegram notification sent to ZO
        |
Under ZO Review
        |
ZO Reviews Each Line Item
ZO marks each row: Approve / Not Approve
ZO enters remarks if required
        |
   +---- All rows Approve? ----+
   |            No             |
   |                           |
   +-- Issue Revision Request? +
   |            Yes            |
   v                           |
ZO Revision Requested          |
(custom or 24hr deadline)      |
        |                      |
JE Edits Rejected Rows Only    |
(No Row Additions/Deletions)   |
        |                      |
JE Resubmits                   |
        |                      |
----- Back to ZO Review -------+
                               |
                               | No (Submit Review without revision)
                               v
                        Rejected by ZO
        |
        Yes (all rows Approve)
        |
ZO clicks Submit Review
        |
ZO Approved → Telegram notification sent to HO
        |
Under HO Review
        |
HO Reviews Each Line Item
HO marks each row: Approve / Not Approve
HO enters remarks if required
        |
   +---- All rows Approve? ----+
   |            No             |
   |                           |
   +-- Issue Revision Request? +
   |            Yes            |
   v                           |
HO Revision Requested          |
(custom or 24hr deadline)      |
        |                      |
JE Edits Rejected Rows Only    |
(No Row Additions/Deletions)   |
        |                      |
JE Resubmits                   |
(ZO approvals remain intact)   |
        |                      |
---- Back to HO Review --------+
                               |
                               | No (Submit Review without revision)
                               v
                        Rejected by HO
        |
        Yes (all rows Approve)
        |
HO clicks Submit Review
        |
Final Approved
```

![image](https://hackmd.io/_uploads/B1FG9N3-Ge.png)

> **Note:** The workflow diagram and the image above are included for layout inspiration only and are not exact designs to be recreated. The written specification in this document takes full precedence over any visual. The image illustrates general structural layout — nothing more.

---
## Revision Request Workflow

To support correction of rejected line items without requiring recreation of the entire estimate, the system shall provide a controlled revision workflow applicable to both Zonal Office (ZO) and Head Office (HO) review stages.

### Revision Request

During review, if one or more line items are marked **Not Approve**, the reviewing authority (ZO or HO) may issue a **Revision Request** to the Junior Engineer (JE).

When a Revision Request is issued:

* The estimate status changes to **ZO Revision Requested** or **HO Revision Requested**, depending on the review stage.
* The reviewing authority (ZO or HO) may set a custom revision deadline at the time of issuing the request. If no custom deadline is set, the system applies a default of **24 hours**.
* The estimate is returned to the originating JE for correction.

### JE Editing Rules During Revision

While the estimate is in a Revision Requested status:

* Only line items marked **Not Approve** by the reviewing authority become editable.
* All approved line items remain read-only.
* The JE cannot add new line items.
* The JE cannot delete existing line items.
* The JE may only modify the contents of rejected line items.
* Header information remains read-only unless explicitly permitted by system configuration.

### Resubmission Process

The JE may submit the corrected estimate before the revision deadline.

Upon resubmission:

* All line items become read-only.
* The estimate automatically transitions back to the corresponding review stage (**Under ZO Review** or **Under HO Review**).
* For ZO-stage resubmissions: approval statuses for revised rows are reset; previously approved rows retain their approval status.
* For HO-stage resubmissions: the estimate returns directly to **Under HO Review**. All ZO row approvals remain intact and are not reset.

If the revision deadline expires before resubmission:

* Editing is automatically disabled.
* The estimate is automatically resubmitted to the corresponding reviewing authority in its current state.
* The estimate status changes back to the corresponding review stage.

### Multiple Revision Cycles

The ZO or HO may request revisions multiple times during the review process.

Each revision cycle shall be recorded separately in the audit trail, including:

* Revision request timestamp
* Requesting user
* Revision deadline
* JE resubmission timestamp
* Modified line items
* Revision cycle number

### Audit Trail

All Revision Requests, resubmissions, approval actions, rejection actions, and modified fields shall be recorded in the audit trail with user, timestamp, and revision cycle number.

### Notifications

The system sends Telegram notifications at the following trigger points:

| Event | Recipient |
|---|---|
| JE submits estimate | Zonal Office (ZO) |
| ZO approves estimate (all rows approved) | Head Office (HO) |

No notifications are sent for Save Draft, Revision Requests, or JE resubmissions. No other notification channels (email, SMS, in-app) are used in this module.


## Estimate Structure

A Project Cost Estimate consists of three parts:

1. Estimate Header — entered once, applies to the entire estimate
2. Estimate Line Items — repeating rows, one per material or cost item
3. Approval Information — system-stamped and user-entered, per stage

Each Project Cost Estimate is linked to exactly one Work Order No. A Work Order may have multiple estimates over its lifetime, but only one estimate may be active at a time (active meaning any status other than Final Approved, Rejected by ZO, or Rejected by HO). The Work Order No. becomes immutable after the estimate is created. The Estimate_No is pre-assigned in the Master Data sheet by the System Admin alongside the Work Order No. and is read-only on all forms.

---

## Form Schema

### Part 1 — Estimate Header

The following fields form the header of the estimate. They are entered or auto-populated once at the time of estimate creation and apply to the entire estimate.

#### Auto-Populated Fields (triggered by Work Order No. selection)

When the user selects a Work Order No., the following fields are automatically populated from the Master Data Sheet and become read-only on the form.

| Field Name | Input Type | Data Source |
|---|---|---|
| Work_Order_No | Dropdown | Master Data |
| Estimate_No | Auto | Master Data |
| State | Auto | Master Data |
| District | Auto | Master Data |
| Area_Code | Auto | Master Data (Zone column) |
| Department | Auto | Master Data |
| Site_Details | Auto | Master Data |
| Estimate_Amount | Auto (system-calculated) | In Draft state: sum of all line item amounts regardless of approval status. After submission: sum of all Approved line items only (mirrors Grand Total Estimate). Recalculates on each line item save. Read-only. |

Note: Area_Code maps to the Zone column in the Master Data schema and is consistent with the field naming used across all downstream modules (Phases 3–5). The Work Order No. dropdown must only show projects with status Running or Complete Under Maintenance. Closed projects are not selectable for new estimate creation.

#### Initialization Fields (entered by JE at creation time)

These fields are captured in the Create Fund Report modal when the JE initialises a new estimate.

| Field Name | Input Type | Notes |
|---|---|---|
| Zonal_Office_No | Text Entry | Reference number for the Zonal Office. Distinct from Zonal_Code. |
| JE_Remarks | Text Entry | Opening remarks or context provided by the JE at creation time |

#### System-Stamped Header Fields (JE submission)

These are stamped automatically at the moment the JE submits the estimate. They are never editable by any user.

| Field Name | Populated At | Value |
|---|---|---|
| JE_User_Id | On JE submission | Logged-in user's phone number |
| JE_Date | On JE submission | System date and time |
| Estimate_Status | Throughout lifecycle | System-managed — see Estimate Status section |

---

### Part 2 — Estimate Line Items

Each estimate may contain one or more line items. There is no upper limit on the number of rows; estimates may span 500 or more rows. Users can add and delete rows. Amount is always system-calculated and is never directly editable.

#### Cascading Dropdown Fields (from Material Data)

Material selection is a three-level cascade. Each level filters the options available in the next.

| Field Name | Input Type | Depends On |
|---|---|---|
| Material_Main_Head | Dropdown (Level 1) | — |
| Material_Sub_Head | Dropdown (Level 2) | Material_Main_Head |
| Material_Details | Dropdown (Level 3) | Material_Sub_Head |
| Unit | Auto | Material_Details (from Material Data) |

#### Manual Entry Fields

| Field Name | Input Type | Notes |
|---|---|---|
| Qty | Number Entry | User-entered quantity |
| Rate | Number Entry | User-entered rate |
| Rate_Reference | Text Entry | Source or basis of the rate (e.g. DSR, market rate) |
| Amount | Auto | Calculated: Rate x Qty. Never directly editable. |
| Source_of_Purchase | Dropdown | Filled by JE per row. Options drawn from the Purchase_Data reference table, which is maintained by the ERP Admin. |

#### Per-Row Approval Fields

Approval is recorded at the line-item level. Each row carries its own approval status from both the ZO and HO stages. These fields are populated by the respective approving role and are not editable by any other user.

| Field Name | Input Type | Populated By | Notes |
|---|---|---|---|
| ZO_Office_Approve | Dropdown | Zonal Office | Options: Approve / Not Approve |
| ZO_Remarks | Text Entry | Zonal Office | Optional on approval; recommended on rejection |
| HO_Office_Approve | Dropdown | Head Office | Options: Approve / Not Approve |
| HO_Remarks | Text Entry | Head Office | Optional on approval; recommended on rejection |

---

### Part 3 — Approval Information

#### JE Stage Fields

| Field Name | Input Type | Notes |
|---|---|---|
| JE_User_Id | Auto | Logged-in user's phone number, stamped on submission |
| JE_Name | Auto | Resolved from User ID |
| JE_Date | Auto | System date and time at submission |
| Estimate_Status | Auto | Reflects current workflow state |

#### ZO / Zonal Office Stage Fields

| Field Name | Input Type | Notes |
|---|---|---|
| ZO_Approved_By | Auto | Logged-in user's phone number, stamped on ZO confirmation |
| ZO_Approval_Date | Auto | System date and time at ZO confirmation |
| ZO_Remarks | Text Entry | Overall remarks by the ZO on the estimate |

#### HO / Head Office Stage Fields

| Field Name | Input Type | Notes |
|---|---|---|
| HO_Approved_By | Auto | Logged-in user's phone number, stamped on HO confirmation |
| HO_Approval_Date | Auto | System date and time at HO confirmation |
| HO_Remarks | Text Entry | Overall remarks by the HO on the estimate |

---

## Estimate Status

The Estimate_Status field is system-managed and is never directly editable by any user. It transitions automatically based on user actions.

### Advancement Rules

The estimate cannot advance from ZO review to HO review unless **all rows** have been marked Approve by the ZO. If any row remains unapproved (Null or Not Approve), the ZO must either issue a Revision Request or mark all remaining rows before the system allows the estimate to proceed. The same rule applies at the HO stage. There is no separate header-level confirmation action — the system advances the status automatically once all rows carry an Approve mark and the reviewer clicks **Submit Review**.

| Status | Triggered By |
|---|---|
| Draft | JE saves the estimate without submitting |
| Submitted | JE clicks Submit |
| Under ZO Review | ZO opens the estimate for review |
| ZO Revision Requested | ZO issues a Revision Request (one or more rows marked Not Approve) |
| ZO Approved | All rows marked Approve by ZO; ZO clicks Submit Review |
| Rejected by ZO | ZO marks one or more rows Not Approve and clicks Submit Review without issuing a Revision Request |
| Under HO Review | HO opens the estimate for review |
| HO Revision Requested | HO issues a Revision Request (one or more rows marked Not Approve) |
| Final Approved | All rows marked Approve by HO; HO clicks Submit Review |
| Rejected by HO | HO marks one or more rows Not Approve and clicks Submit Review without issuing a Revision Request |

Estimate_Status is visible to all roles and serves as the primary filter on the dashboard and Estimate List views.

---

## Material Data Reference

The Material Data sheet defines the complete catalogue of items available for selection in a Fund Report. The three-level hierarchy is:

Material_Main_Head → Material_Sub_Head → Material_Details

| Material_Main_Head | Material_Sub_Head(s) |
|---|---|
| Materials | Raw Materials |
| Electrical | Electrical Consumables |
| Mechanical | Mechanical Consumables, Mechanical Project Items |
| Pipes | Pipe HDPE, Pipes Steel, Pipe DI, Pipe PVC |
| Solar System | Solar Pump Set Material |
| Labour | Labour Category |
| Transport | Transport / Logistics |
| Miscellaneous | Miscellaneous Cost |

Each Material_Details entry has a corresponding Unit (e.g. Bag, Mtr, Nos, Kg, Day, Trip, Cum) that is auto-filled when the item is selected.

---

## Estimate Summary Calculation

The system automatically calculates estimate totals from all line items. All summary values are read-only and system-generated.

| Summary Field | Calculation |
|---|---|
| Total Material Cost | Sum of all line items where Material_Main_Head is: Materials, Electrical, Mechanical, Pipes, or Solar System |
| Total Labour Cost | Sum of all line items where Material_Main_Head is Labour |
| Total Transport Cost | Sum of all line items where Material_Main_Head is Transport |
| Total Miscellaneous Cost | Sum of all line items where Material_Main_Head is Miscellaneous |
| Grand Total Estimate | Sum of all line item amounts across all categories (only approved ones) |

Note: Electrical, Mechanical, Pipes, and Solar System line items are grouped under Total Material Cost. They do not have separate summary lines.

Rows marked Not Approve at either the ZO or HO stage shall not contribute to the Grand Total Estimate.

---

## Access Control by Project Status

Fund Reports are governed by the project's Status in the Master Data Sheet.

| Project Status | Create Estimates | Edit Estimates | View Estimates |
|---|---|---|---|
| Running | Yes | Yes | Yes |
| Closed | No | No | Yes |
| Complete Under Maintenance | Yes | Yes | Yes |

A report referencing a Closed project automatically becomes read-only for all users until the Admin changes the project status back to Running or Complete Under Maintenance.

---

## Permissions Matrix

| Action | Junior Engineer (JE) | Zonal Office (ZO) | Head Office (HO) |
|---|---|---|---|
| Create Fund Report | Yes | No | No |
| Save Draft (before JE submission) | Yes | No | No |
| Edit Report (before JE submission) | Yes | No | No |
| Request Revision (ZO Stage) | No | Yes | No |
| Request Revision (HO Stage) | No | No | Yes |
| View Report at all stages | Yes | Yes | Yes |
| Mark row-level approval (ZO stage) | No | Yes | No |
| Mark row-level approval (HO stage) | No | No | Yes |
| Submit Review / advance estimate (ZO stage) | No | Yes | No |
| Submit Review / advance estimate (HO stage) | No | No | Yes |
| Set Source of Purchase (per row) | Yes | No | No |

Fund Report records are permanent. No user — including ZO, HO, and Admin — can delete a Fund Report record in any form.

---

## Logical Data Model

### Table: project_cost_estimates
One row per estimate.

| Column | Type | Notes |
|---|---|---|
| estimate_id | UUID / PK | |
| work_order_no | FK to Master Data | Immutable after creation |
| zonal_office_no | String | Entered at initialization |
| area_code | String | Auto from Master Data (Zone column) |
| estimate_amount | Decimal | Draft: sum of all line items. Post-submission: sum of Approved line items only. Auto-updated on each save. |
| estimate_status | Enum | See Estimate Status section |
| je_user_id | String | Stamped at submission |
| je_date | Timestamp | Stamped at submission |
| je_remarks | Text | |
| zo_approved_by | String | |
| zo_approval_date | Timestamp | |
| zo_remarks | Text | |
| ho_approved_by | String | |
| ho_approval_date | Timestamp | |
| ho_remarks | Text | |
| created_at | Timestamp | |
| updated_at | Timestamp | |

### Table: project_cost_estimate_items
One row per material line item.

| Column | Type | Notes |
|---|---|---|
| item_id | UUID / PK | |
| estimate_id | FK to project_cost_estimates | |
| material_main_head | String | |
| material_sub_head | String | |
| material_details | String | |
| unit | String | Auto from Material Data |
| qty | Decimal | |
| rate | Decimal | |
| rate_reference | String | |
| amount | Decimal | Computed: rate x qty |
| source_of_purchase | FK to Purchase_Data | Set by JE per row during estimate preparation. References the Purchase_Data table maintained by ERP Admin. |
| zo_office_approve | Enum (Approve / Not Approve / Null) | Row-level, set by ZO |
| zo_remarks | Text | |
| ho_office_approve | Enum (Approve / Not Approve / Null) | Row-level, set by HO |
| ho_remarks | Text | |

---

## Data Integrity Rules

- Fund Report records are permanent and cannot be deleted by any user, including Admin.
- Area_Code is auto-populated from the Zone column in Master Data and is read-only on all forms.
- Estimate_Amount is system-calculated and never directly editable. In Draft state it reflects the sum of all line items regardless of approval status. After submission it reflects only Approved line items (identical to Grand Total Estimate). It updates automatically on each line item save. Downstream modules (Phase 3 Fund Requisition) read Estimate_Amount directly from this field.
- Draft estimates are visible only to the originating JE and Admin. They are not visible to ZO or HO until submitted.
- Partial line items are permitted in Draft state; full validation (Material, Qty, Rate, Rate_Reference) is enforced only at submission time.
- Work_Order_No on a submitted report is immutable and cannot be changed after the estimate is created.
- Amount is always system-calculated as Rate x Qty and is never directly editable.
- Unit is always auto-populated from the Material Data catalogue and is never directly editable.
- All approval timestamps and user IDs are system-stamped and cannot be manually entered or overridden.
- Estimate_Status is system-managed and cannot be directly edited by any user.
- Source_of_Purchase is entered by the JE at the line-item level. Its options are drawn from the Purchase_Data reference table, which is maintained exclusively by the ERP Admin.

---