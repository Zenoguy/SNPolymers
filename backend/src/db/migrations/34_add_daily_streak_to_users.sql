-- Migration: Add daily_streak and last_report_date columns to authorised_users
ALTER TABLE public.authorised_users ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0;
ALTER TABLE public.authorised_users ADD COLUMN IF NOT EXISTS last_report_date DATE;
