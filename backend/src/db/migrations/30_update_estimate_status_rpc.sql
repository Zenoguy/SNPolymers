-- 1. Add the new status to the enum type
ALTER TYPE estimate_status_enum ADD VALUE 'Estimate Reopened';

-- 2. Update submit_estimate RPC function to support Estimate Reopened status
CREATE OR REPLACE FUNCTION submit_estimate(
  p_estimate_id         UUID,
  p_stage               TEXT,          -- 'FirstSubmit', 'ZO', or 'HO'
  p_mobile_number       VARCHAR,       -- acting user's mobile number
  p_new_revision        INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id              UUID;
  v_open_log_count      INT;
  v_modified_item_ids   UUID[] := '{}';
  v_new_amount          NUMERIC(18,2);
  v_status              estimate_status_enum;
BEGIN
  -- 1. Lock the estimate header for update to prevent race conditions
  SELECT estimate_status INTO v_status
  FROM project_cost_estimates
  WHERE estimate_id = p_estimate_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estimate not found: %', p_estimate_id;
  END IF;

  -- Enforce expected workflow status inside the RPC itself
  IF p_stage = 'ZO' AND v_status <> 'ZO Revision Requested'::estimate_status_enum THEN
    RAISE EXCEPTION 'Expected ZO Revision Requested, found %', v_status;
  END IF;

  -- ENFORCE: stage HO supports both HO Revision Requested and Estimate Reopened status
  IF p_stage = 'HO' AND v_status <> 'HO Revision Requested'::estimate_status_enum AND v_status <> 'Estimate Reopened'::estimate_status_enum THEN
    RAISE EXCEPTION 'Expected HO Revision Requested or Estimate Reopened, found %', v_status;
  END IF;

  -- 2. Route based on submit stage
  IF p_stage = 'FirstSubmit' THEN
    -- Verify status is Draft before first submit
    IF v_status <> 'Draft'::estimate_status_enum THEN
      RAISE EXCEPTION 'Invalid status for first submission: %', v_status;
    END IF;

  ELSIF p_stage IN ('ZO', 'HO') THEN
    -- Enforce exactly one open revision log entry
    SELECT COUNT(*) INTO v_open_log_count
    FROM estimate_revision_log
    WHERE estimate_id = p_estimate_id
      AND resubmitted_at IS NULL;

    IF v_open_log_count <> 1 THEN
      RAISE EXCEPTION 'Expected exactly one open revision log, found %', v_open_log_count;
    END IF;

    -- Collect modified item IDs BEFORE resetting approval fields
    IF p_stage = 'ZO' THEN
      SELECT ARRAY(
        SELECT item_id FROM project_cost_estimate_items
        WHERE estimate_id = p_estimate_id
          AND zo_office_approve = 'Not Approve'
      ) INTO v_modified_item_ids;

      UPDATE project_cost_estimate_items
      SET zo_office_approve = NULL,
          updated_at = now()
      WHERE estimate_id = p_estimate_id
        AND zo_office_approve = 'Not Approve';

    ELSIF p_stage = 'HO' THEN
      SELECT ARRAY(
        SELECT item_id FROM project_cost_estimate_items
        WHERE estimate_id = p_estimate_id
          AND ho_office_approve = 'Not Approve'
      ) INTO v_modified_item_ids;

      UPDATE project_cost_estimate_items
      SET ho_office_approve = NULL,
          updated_at = now()
      WHERE estimate_id = p_estimate_id
        AND ho_office_approve = 'Not Approve';
    END IF;

    -- Close the active revision log entry (deterministic fetch)
    SELECT id INTO v_log_id
    FROM estimate_revision_log
    WHERE estimate_id = p_estimate_id
      AND resubmitted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    UPDATE estimate_revision_log
    SET resubmitted_at = now(),
        resubmitted_by = p_mobile_number,
        modified_item_ids = v_modified_item_ids
    WHERE id = v_log_id;

  ELSE
    RAISE EXCEPTION 'Invalid submit stage: %. Must be FirstSubmit, ZO, or HO.', p_stage;
  END IF;

  -- 3. Recalculate amount for Submitted status (sum of all items)
  SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
  FROM project_cost_estimate_items
  WHERE estimate_id = p_estimate_id;

  -- 4. Update header status, revision, amount, and timestamp
  IF p_stage = 'FirstSubmit' THEN
    UPDATE project_cost_estimates
    SET estimate_status = 'Submitted'::estimate_status_enum,
        estimate_revision = p_new_revision,
        estimate_amount = v_new_amount,
        last_modified_by = p_mobile_number,
        je_user_id = p_mobile_number,
        je_date = now(),
        updated_at = now()
    WHERE estimate_id = p_estimate_id;
  ELSE
    UPDATE project_cost_estimates
    SET estimate_status = 'Submitted'::estimate_status_enum,
        estimate_revision = p_new_revision,
        estimate_amount = v_new_amount,
        last_modified_by = p_mobile_number,
        updated_at = now()
    WHERE estimate_id = p_estimate_id;
  END IF;

END;
$$;

GRANT EXECUTE ON FUNCTION submit_estimate(UUID, TEXT, VARCHAR, INT) TO service_role;

-- 3. Update submit_row_approvals RPC function to support Estimate Reopened status calculations
CREATE OR REPLACE FUNCTION submit_row_approvals(
  p_estimate_id   UUID,
  p_approvals     JSONB,
  p_stage         TEXT,
  p_modified_by   VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role     VARCHAR;
  approval        JSONB;
  v_item_id       UUID;
  v_approve_status TEXT;
  v_remarks       TEXT;
  v_status        estimate_status_enum;
  v_new_amount    NUMERIC(18,2);
  v_rows          INT;
BEGIN
  -- 1. Security Check: Confirm modifier role has authorization for the stage
  SELECT role INTO v_user_role
  FROM authorised_users
  WHERE mobile_number = p_modified_by AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized: User is inactive or does not exist.';
  END IF;

  IF p_stage = 'ZO' AND v_user_role NOT IN ('zo', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: User does not have ZO or Admin role.';
  END IF;

  IF p_stage = 'HO' AND v_user_role NOT IN ('ho', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: User does not have HO or Admin role.';
  END IF;

  -- 2. Read current estimate status
  SELECT estimate_status INTO v_status
  FROM project_cost_estimates
  WHERE estimate_id = p_estimate_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estimate not found: %', p_estimate_id;
  END IF;

  -- 3. Apply each row approval
  FOR approval IN SELECT * FROM jsonb_array_elements(p_approvals)
  LOOP
    v_item_id       := (approval->>'item_id')::UUID;
    v_approve_status := approval->>'approve_status';
    v_remarks        := approval->>'remarks';

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

    -- Rollback Safety Check: Validate the target item row was modified
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN
      RAISE EXCEPTION 'Item ID % not found or does not belong to estimate %.', v_item_id, p_estimate_id;
    END IF;
  END LOOP;

  -- 4. Recalculate amount based on current status (Workflow calculation matrix)
  IF v_status IN ('Draft', 'Submitted', 'Under ZO Review', 'ZO Revision Requested',
                  'Rejected by ZO', 'Rejected by HO') THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
    FROM project_cost_estimate_items
    WHERE estimate_id = p_estimate_id;

  ELSIF v_status IN ('ZO Approved', 'Under HO Review', 'HO Revision Requested', 'Estimate Reopened') THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
    FROM project_cost_estimate_items
    WHERE estimate_id = p_estimate_id
      AND zo_office_approve = 'Approve';

  ELSIF v_status = 'Final Approved' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
    FROM project_cost_estimate_items
    WHERE estimate_id = p_estimate_id
      AND zo_office_approve = 'Approve'
      AND ho_office_approve = 'Approve';
  ELSE
    SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
    FROM project_cost_estimate_items
    WHERE estimate_id = p_estimate_id;
  END IF;

  -- 5. Write back to header
  UPDATE project_cost_estimates
  SET
    estimate_amount  = v_new_amount,
    last_modified_by = p_modified_by,
    updated_at       = now()
  WHERE estimate_id = p_estimate_id;

END;
$$;

GRANT EXECUTE ON FUNCTION submit_row_approvals(UUID, JSONB, TEXT, VARCHAR) TO service_role;
