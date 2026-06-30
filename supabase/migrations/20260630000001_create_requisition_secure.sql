-- Migration: Add create_requisition_secure function to handle budget validation atomically

CREATE OR REPLACE FUNCTION public.create_requisition_secure(
    p_requester_user_id character varying,
    p_work_order_no character varying,
    p_estimate_no character varying,
    p_estimate_amount numeric,
    p_state character varying,
    p_district character varying,
    p_area_code character varying,
    p_department character varying,
    p_site_details text,
    p_requisition_no character varying,
    p_material_main_head character varying,
    p_requisition_pdf_url text,
    p_original_filename character varying,
    p_requisition_amount numeric,
    p_gst_bill public.gst_bill_enum,
    p_gst_bill_pdf_url text,
    p_bank_details text,
    p_expen_head_remarks text,
    p_requisition_status public.requisition_status_enum,
    p_created_by character varying
) RETURNS public.requisitions
    LANGUAGE plpgsql
    SECURITY DEFINER
AS $$
DECLARE
    v_project_status public.project_status;
    v_committed numeric(18,2) := 0.00;
    v_inserted public.requisitions;
BEGIN
    -- 1. Lock the corresponding project row for update to serialize concurrent requisition insertions
    -- on the same project / work order. This prevents race conditions in budget sum calculation.
    SELECT status INTO v_project_status
    FROM public.projects_master
    WHERE work_order_no = p_work_order_no
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Work order % not found.', p_work_order_no USING ERRCODE = 'P0002';
    END IF;

    -- 2. Verify project is not closed
    IF v_project_status = 'Closed'::public.project_status THEN
        RAISE EXCEPTION 'Cannot create requisitions for projects with "Closed" status. All linked reports are immutable.' USING ERRCODE = 'PR001';
    END IF;

    -- 3. Re-verify uniqueness of requisition_no
    IF EXISTS (
        SELECT 1 FROM public.requisitions WHERE requisition_no = p_requisition_no
    ) THEN
        RAISE EXCEPTION 'A requisition with number % already exists.', p_requisition_no USING ERRCODE = '23505';
    END IF;

    -- 4. Calculate total committed amount so far (excluding Cancelled requisitions)
    SELECT COALESCE(SUM(requisition_amount), 0) INTO v_committed
    FROM public.requisitions
    WHERE work_order_no = p_work_order_no
      AND requisition_status <> 'Cancelled'::public.requisition_status_enum;

    -- 5. Validate budget
    IF p_estimate_amount IS NOT NULL AND (v_committed + p_requisition_amount) > p_estimate_amount THEN
        RAISE EXCEPTION 'Requisition amount exceeds the remaining estimate balance. Estimate Amount: %, Already Committed: %, Remaining: %, Your Request: %', 
            p_estimate_amount, v_committed, (p_estimate_amount - v_committed), p_requisition_amount
            USING ERRCODE = 'BUD01';
    END IF;

    -- 6. Insert the requisition
    INSERT INTO public.requisitions (
        requester_user_id,
        work_order_no,
        estimate_no,
        estimate_amount,
        state,
        district,
        area_code,
        department,
        site_details,
        requisition_no,
        material_main_head,
        requisition_pdf_url,
        original_filename,
        requisition_amount,
        gst_bill,
        gst_bill_pdf_url,
        bank_details,
        expen_head_remarks,
        requisition_status,
        created_by
    ) VALUES (
        p_requester_user_id,
        p_work_order_no,
        p_estimate_no,
        p_estimate_amount,
        p_state,
        p_district,
        p_area_code,
        p_department,
        p_site_details,
        p_requisition_no,
        p_material_main_head,
        p_requisition_pdf_url,
        p_original_filename,
        p_requisition_amount,
        p_gst_bill,
        p_gst_bill_pdf_url,
        p_bank_details,
        p_expen_head_remarks,
        p_requisition_status,
        p_created_by
    ) RETURNING * INTO v_inserted;

    RETURN v_inserted;
END;
$$;

-- Grant execute permissions to standard roles
GRANT EXECUTE ON FUNCTION public.create_requisition_secure TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_requisition_secure TO service_role;
