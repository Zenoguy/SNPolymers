-- Migration: Prevent multiple active cost estimates per work order
-- DB: PostgreSQL (Supabase)

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_estimate_per_work_order
ON project_cost_estimates (work_order_no)
WHERE estimate_status NOT IN ('Final Approved', 'Rejected by ZO', 'Rejected by HO');
