-- Migration: Fix auto resubmit audit user id to be NULL instead of SYSTEM
-- DB: PostgreSQL (Supabase)

-- Drop NOT NULL constraint on user_id to support NULL system-driven audits
ALTER TABLE audit_log ALTER COLUMN user_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION audit_estimate_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.estimate_status IS DISTINCT FROM OLD.estimate_status THEN
    INSERT INTO audit_log (user_id, action, module_name, record_identifier, old_value, new_value)
    VALUES (
      NEW.last_modified_by, -- NULL for system auto-resubmissions (no fake mobile number)
      CASE WHEN NEW.last_modified_by IS NULL THEN 'AUTO_RESUBMIT' ELSE 'STATUS_CHANGE' END,
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
$$;
