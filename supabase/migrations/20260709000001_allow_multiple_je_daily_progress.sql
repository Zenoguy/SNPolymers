-- Migration: Allow multiple JEs to submit daily progress reports on the same day for the same work order
-- Drops the old unique constraint (work_order_no, site_visit_date)
-- Adds a new unique constraint (work_order_no, site_visit_date, created_by)

ALTER TABLE public.daily_progress_reports 
DROP CONSTRAINT IF EXISTS uq_daily_progress_work_order_date;

ALTER TABLE public.daily_progress_reports 
ADD CONSTRAINT uq_daily_progress_work_order_date UNIQUE (work_order_no, site_visit_date, created_by);
