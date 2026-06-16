-- Migration: Create submit_ho_review RPC function
-- DB: PostgreSQL (Supabase)

CREATE OR REPLACE FUNCTION submit_ho_review(
  p_estimate_id         UUID,
  p_reviewer            VARCHAR,
  p_remarks             TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status              estimate_status_enum;
  v_user_role           VARCHAR;
  v_item_count          INT;
  v_undecided_count     INT;
  v_rejected_count      INT;
  v_target_status       estimate_status_enum;
  v_new_amount          NUMERIC(18,2);
  v_inconsistent_count  INT;
BEGIN
  -- 1. Security Check: Confirm reviewer exists, is active, and is HO or Admin
  SELECT role INTO v_user_role
  FROM authorised_users
  WHERE mobile_number = p_reviewer AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized: User is inactive or does not exist.';
  END IF;

  IF v_user_role NOT IN ('ho', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: User does not have HO or Admin role.';
  END IF;

  -- 2. Lock header and validate existence
  SELECT estimate_status INTO v_status
  FROM project_cost_estimates
  WHERE estimate_id = p_estimate_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estimate not found';
  END IF;

  -- 3. Acquire exclusive row-level locks on estimate items to prevent concurrent modifications
  PERFORM 1
  FROM project_cost_estimate_items
  WHERE estimate_id = p_estimate_id
  FOR UPDATE;

  -- 4. Defensive Check: Prevent submission if the estimate contains zero line items
  SELECT COUNT(*) INTO v_item_count
  FROM project_cost_estimate_items
  WHERE estimate_id = p_estimate_id;

  IF v_item_count = 0 THEN
    RAISE EXCEPTION 'Estimate contains no line items.';
  END IF;

  -- 5. Enforce status is Under HO Review
  IF v_status <> 'Under HO Review'::estimate_status_enum THEN
    RAISE EXCEPTION 'Expected Under HO Review, found %', v_status;
  END IF;

  -- 6. Validate all items decided by HO
  SELECT COUNT(*) INTO v_undecided_count
  FROM project_cost_estimate_items
  WHERE estimate_id = p_estimate_id
    AND ho_office_approve IS NULL;

  IF v_undecided_count > 0 THEN
    RAISE EXCEPTION 'All rows must be decided. Found % undecided rows.', v_undecided_count;
  END IF;

  -- 7. Determine if any item was rejected by HO
  SELECT COUNT(*) INTO v_rejected_count
  FROM project_cost_estimate_items
  WHERE estimate_id = p_estimate_id
    AND ho_office_approve = 'Not Approve';

  IF v_rejected_count > 0 THEN
    v_target_status := 'Rejected by HO'::estimate_status_enum;
    
    -- Rejected is terminal; sum all items for record-keeping
    SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
    FROM project_cost_estimate_items
    WHERE estimate_id = p_estimate_id;
  ELSE
    v_target_status := 'Final Approved'::estimate_status_enum;
    
    -- Defensive Check: Verify all HO approved items were also ZO approved
    SELECT COUNT(*) INTO v_inconsistent_count
    FROM project_cost_estimate_items
    WHERE estimate_id = p_estimate_id
      AND ho_office_approve = 'Approve'
      AND (zo_office_approve IS NULL OR zo_office_approve <> 'Approve');

    IF v_inconsistent_count > 0 THEN
      RAISE EXCEPTION 'Inconsistent review state: found % items approved by HO that were not approved by ZO.', v_inconsistent_count;
    END IF;

    -- Final Approved: sum items where both ZO and HO approved
    SELECT COALESCE(SUM(amount), 0) INTO v_new_amount
    FROM project_cost_estimate_items
    WHERE estimate_id = p_estimate_id
      AND zo_office_approve = 'Approve'
      AND ho_office_approve = 'Approve';
  END IF;

  -- 8. Update header and audit fields (let trigger handle updated_at)
  UPDATE project_cost_estimates
  SET estimate_status = v_target_status,
      estimate_amount = v_new_amount,
      ho_approved_by = p_reviewer,
      ho_approval_date = now(),
      ho_remarks = p_remarks,
      last_modified_by = p_reviewer
  WHERE estimate_id = p_estimate_id;

END;
$$;

GRANT EXECUTE ON FUNCTION submit_ho_review(UUID, VARCHAR, TEXT) TO service_role;
