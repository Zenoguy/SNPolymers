# Master ERP Analytics & Dashboard Blueprint

This document outlines the finalized blueprint for the ERP's analytics and intelligence layers. By leveraging the existing relational database structure and PostgreSQL Materialized Views, we can build a highly sophisticated, data-driven operational platform without requiring external ML tools.

---

## 🏆 1. The Flagship Feature: Project Digital Twin
The Digital Twin consolidates the entire operational lifecycle for a specific project into a single, unified view, eliminating the need to navigate between isolated modules.

**The 13-Point Digital Twin Structure:**
1.  **Overview**: High-level metadata, current status, and Executive KPIs.
2.  **Financial**: Estimates vs. Approved Funds vs. Actual Billed (RA Bills).
3.  **Progress**: Daily physical progress reports aggregated over time.
4.  **Materials**: Master estimates vs. Requisitions issued vs. Actual consumption.
5.  **Documents**: Centralized repository for all uploaded PDFs and contracts.
6.  **Timeline**: Expected completion dates vs. reality, driven by delay forecasts.
7.  **Approvals**: Pending bottlenecks and historical sign-offs for this specific project.
8.  **Audit**: Full chronological audit log of who changed what, and when.
9.  **Risks**: System-flagged warnings (e.g., "Zone credit limit approaching").
10. **Forecast**: Projected final costs and linear completion date predictions.
11. **Alerts**: Active notifications triggered by the Business Rules Engine.
12. **Photos**: A visual gallery pulled directly from the daily progress uploads.
13. **Analytics**: The localized Health Score and Budget Leakage metrics.

---

## 2. Analytics Infrastructure (Materialized Views)
The entire analytics suite will be powered by a robust backend infrastructure composed of PostgreSQL Materialized Views (`_mv`). This ensures that complex dashboards consume precomputed data rather than executing expensive joins on every page load.

**Core Analytical Views to Implement:**
*   `project_health_mv`
*   `zone_performance_mv`
*   `approval_sla_mv`
*   `estimate_accuracy_mv`
*   `material_variance_mv`
*   `budget_leakage_mv`
*   `resource_utilization_mv`
*   `executive_kpi_mv`

---

## 3. Executive Dashboard (HO)
*Designed for Head Office to understand the organization's macro-health.*

*   **Executive KPI Cards**: Active Projects, Delayed Projects, Projects at Risk, Pending Approvals, Budget Utilization, and Material Consumption.
*   **Project Health Score**: `92/100 🟢 Healthy` calculated via `project_health_mv` (Budget 40%, Progress 20%, Approval 15%, Reporting 15%, Material 10%).
*   **Portfolio Risk Distribution**: Communicates overall organizational risk (e.g., *Healthy: 42 | Warning: 11 | Critical: 4*).
*   **Budget Leakage Detector**: Automatically flags anomalies: unusually high material issuance, repeated fund requests, excessive revisions, stalled progress, or idle released funds.

---

## 4. Operational Intelligence Dashboard (HO & Admins)
*Answers the question: "How efficiently are we operating?"*

*   **Approval SLA Dashboard**: Tracks average approval time by stage (JE Submission ➔ ZO Review ➔ HO Approval). Highlights the Slowest Zone, Slowest Approver, and overall SLA Compliance %.
*   **Resource Utilization**: Tracks Active vs. Idle JEs, Projects per JE, Pending Inspections, and Daily Reporting Compliance.
*   **Zone Benchmarking**: Ranks every Zonal Office by budget adherence, average project health, completion rate, and approval efficiency.

---

## 5. Zonal Office Dashboard (ZO)
*Designed for Zonal Managers to maintain operational visibility.*

*   **JE Productivity Dashboard**: Assigned Projects, Daily Reports Submitted, Pending Reports, Average Approval Delay, and Issues Raised/Resolved.
*   **Site Activity Timeline**: A chronological feed (e.g., *10:41 - JE uploaded photo*, *11:02 - Fund Request Approved*).
*   **Workload Distribution**: Monitors project assignments per JE to prevent overload.
*   **Improved Material Pulse**: Estimated vs. Actual Issued vs. Expected Consumption (e.g., *Variance: +13 Tons*).

---

## 6. The Business Rules & Cross Validation Engine
*Turns passive analytics into an active monitoring system by cross-referencing the ERP lifecycle (Estimate ➔ Material ➔ Funds ➔ Progress ➔ Bills).*

**Example Automated Rules:**
*   **Rule 1 (Fraud):** IF `Budget > 80%` AND `Progress < 50%` ➔ Flag for Audit.
*   **Rule 2 (Waste):** IF `Material Variance > 15%` ➔ Flag for Investigation.
*   **Rule 3 (Compliance):** IF `No Daily Progress for 3 days` ➔ Notify Zonal Officer.
*   **Rule 4 (Efficiency):** IF `Approval pending > SLA limit` ➔ Escalate to HO.
*   **Rule 5 (Training):** IF `Repeated revision requests > 3` ➔ Recommend Retraining.

---

## 7. Rule-Based Forecasting
*Deterministic projections built natively into the database views.*

*   **Cost Forecast**: *Current Spend (₹7.2 Cr) ➔ Forecast Final Cost (₹8.6 Cr) vs. Budget (₹8.0 Cr).*
*   **Schedule Forecast**: *Current Progress (42%) ➔ Expected Progress (58%) ➔ Estimated Delay (19 Days).*
*   **Cash Burn Forecast**: *Zone Credit (₹46L) ➔ Burn Rate (₹5.8L/day) ➔ Funds Exhaust In (8 Days).*

---

## 8. Audit & Compliance Center
*A standalone dashboard utilizing the ERP's `audit_logs` for strict compliance oversight.*

*   **Approval Timeline**: Created ➔ ZO Review ➔ Revision ➔ HO Approval ➔ Fund Release.
*   **Document Timeline**: Chronological view of uploaded Photos, Bills, GST documents, Requisitions, and Contracts.
*   **Full User Activity Log**: A complete, indisputable chronological record (e.g., *11:02 - Edited Estimate*, *11:17 - Rejected*).

---

## 9. Executive Drill-Down Navigation
The UI hierarchy designed to allow executives to drill into the exact transaction causing an issue:
`Company ➔ Zone ➔ Project (Digital Twin) ➔ Estimate ➔ Material ➔ Daily Progress ➔ Audit History`

---

## 10. GIS Dashboard (Phase 2 / Roadmap)
*Interactive map of all projects with color-coded health indicators and Zone filtering.*
*Note: Requires a minor database migration to add `latitude` and `longitude` columns to the `project_management` table.*
