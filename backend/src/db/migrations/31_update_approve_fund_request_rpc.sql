-- ===========================================================================
-- Migration 31: ZO Fund Request & HO Approval — Atomic Transactions & Validations
-- DB: PostgreSQL (Supabase)
-- ===========================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Drop existing function to avoid signature conflicts
-- ────────────────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.approve_fund_request_transact(UUID, NUMERIC, VARCHAR, VARCHAR, TEXT);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Re-create approve_fund_request_transact with enhanced validations
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.approve_fund_request_transact(
    p_fund_request_id UUID,
    p_approved_amount NUMERIC,
    p_transfer_from_account VARCHAR,
    p_actioned_by VARCHAR,
    p_remarks TEXT
)
RETURNS public.fund_requests AS $$
DECLARE
    v_fr public.fund_requests;
    v_wo_value NUMERIC(18,2);
    v_cumulative_approved NUMERIC(18,2);
    v_balance public.zo_balances;
BEGIN
    -- A. Lock fund request row and verify it exists
    SELECT * INTO v_fr 
      FROM public.fund_requests 
     WHERE fund_request_id = p_fund_request_id 
       FOR UPDATE;
       
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Fund request not found.';
    END IF;

    -- B. Verify request status is Pending or Hold
    IF v_fr.request_status NOT IN ('Pending', 'Hold') THEN
        RAISE EXCEPTION 'Fund request status must be Pending or Hold.';
    END IF;

    -- C. Fetch Work Order Value from projects_master
    SELECT work_order_value INTO v_wo_value 
      FROM public.projects_master 
     WHERE work_order_no = v_fr.work_order_no;
     
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Associated Work Order not found in projects_master.';
    END IF;

    -- D. Duplicate Posting Check: Verify no ALLOCATION ledger entry already exists for this Fund Request
    IF EXISTS (
        SELECT 1 
          FROM public.zo_fund_ledger 
         WHERE reference_type = 'FUND_REQUEST' 
           AND reference_id = p_fund_request_id
    ) THEN
        RAISE EXCEPTION 'Duplicate Posting Check Failed: Allocation ledger entry already exists for this Fund Request.';
    END IF;

    -- E. Recalculate Work Order remaining funding capacity
    SELECT COALESCE(SUM(approve_ho_amount), 0.00) INTO v_cumulative_approved
      FROM public.fund_requests
     WHERE work_order_no = v_fr.work_order_no
       AND request_status = 'Approved';

    -- F. Validate Approved Amount
    IF p_approved_amount <= 0.00 THEN
        RAISE EXCEPTION 'Approved amount must be positive and greater than zero.';
    END IF;

    IF p_approved_amount > v_fr.zo_fr_amount THEN
        RAISE EXCEPTION 'Approved amount (₹%) cannot exceed the requested amount (₹%).', 
            p_approved_amount, v_fr.zo_fr_amount;
    END IF;

    IF (v_cumulative_approved + p_approved_amount) > v_wo_value THEN
        RAISE EXCEPTION 'Approved amount (₹%) exceeds the remaining Work Order capacity (₹%).', 
            p_approved_amount, (v_wo_value - v_cumulative_approved);
    END IF;

    -- G. Validate Transfer Account is provided
    IF p_transfer_from_account IS NULL OR p_transfer_from_account = '' THEN
        RAISE EXCEPTION 'Transfer account is required for approval.';
    END IF;

    -- H. Initialize balance cache row with ON CONFLICT DO NOTHING if missing
    INSERT INTO public.zo_balances (zo_user_id, available_balance)
    VALUES (v_fr.zo_user_id, 0.00)
    ON CONFLICT (zo_user_id) DO NOTHING;

    -- I. Lock ZO balance row for update
    SELECT * INTO v_balance 
      FROM public.zo_balances 
     WHERE zo_user_id = v_fr.zo_user_id 
       FOR UPDATE;

    -- J. Increase Zonal available balance
    UPDATE public.zo_balances 
       SET available_balance = available_balance + p_approved_amount, 
           updated_at = now()
     WHERE zo_user_id = v_fr.zo_user_id;

    -- K. Create Fund Ledger Entry (credit allocation)
    INSERT INTO public.zo_fund_ledger (
        zo_user_id,
        transaction_type,
        reference_type,
        reference_id,
        amount,
        work_order_no,
        created_by
    ) VALUES (
        v_fr.zo_user_id,
        'ALLOCATION',
        'FUND_REQUEST',
        p_fund_request_id,
        p_approved_amount,
        v_fr.work_order_no,
        p_actioned_by
    );

    -- L. Update Fund Request Record status to 'Approved'
    UPDATE public.fund_requests
       SET request_status = 'Approved',
           approve_ho_amount = p_approved_amount,
           transfer_from_account = p_transfer_from_account::transfer_account_enum,
           approve_ho_user_id = p_actioned_by,
           approve_ho_date = now(),
           ho_remarks = p_remarks,
           updated_at = now()
     WHERE fund_request_id = p_fund_request_id
    RETURNING * INTO v_fr;

    RETURN v_fr;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Grant Permissions
-- ────────────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.approve_fund_request_transact TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_fund_request_transact TO service_role;
