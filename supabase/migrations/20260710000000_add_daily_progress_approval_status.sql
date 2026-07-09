-- Migration: Add approval_status to daily_progress_reports table
-- Tracks approval status for back-dated daily progress entries

ALTER TABLE public.daily_progress_reports
ADD COLUMN IF NOT EXISTS approval_status VARCHAR NOT NULL DEFAULT 'Approved';

-- Add check constraint to ensure only valid status values
ALTER TABLE public.daily_progress_reports
DROP CONSTRAINT IF EXISTS chk_approval_status;

ALTER TABLE public.daily_progress_reports
ADD CONSTRAINT chk_approval_status CHECK (approval_status IN ('Approved', 'Pending', 'Rejected'));
