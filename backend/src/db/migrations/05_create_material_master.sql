-- Migration: Create material_master Table & Audit Triggers
-- DB: PostgreSQL (Supabase)

-- 1. Create material_master table (with exact active columns)
CREATE TABLE IF NOT EXISTS material_master (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "Material_Main_Head" VARCHAR NOT NULL,
  "Material_Sub_Head"  VARCHAR NOT NULL,
  "Material_Details"   TEXT NOT NULL,
  "M_Unit"             VARCHAR NOT NULL,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_by           VARCHAR NOT NULL, -- Stored as user mobile number (e.g., +918276071523)
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_by            VARCHAR,           -- Stored as user mobile number (e.g., +918276071523)
  edited_at            TIMESTAMPTZ
);

-- 2. Create trigger to automatically update edited_at timestamp
CREATE OR REPLACE FUNCTION set_material_master_edited_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.edited_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_material_master_edited_at ON material_master;
CREATE TRIGGER trg_material_master_edited_at
BEFORE UPDATE ON material_master
FOR EACH ROW
EXECUTE FUNCTION set_material_master_edited_at();

-- 3. Create trigger to automatically audit material_master CRUD operations
CREATE OR REPLACE FUNCTION audit_material_master_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_old_json JSONB := '{}';
  v_new_json JSONB := '{}';
  v_action VARCHAR := 'EDIT';
  v_changed BOOLEAN := FALSE;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_new_json := jsonb_build_object(
      'id', NEW.id,
      'Material_Main_Head', NEW."Material_Main_Head",
      'Material_Sub_Head', NEW."Material_Sub_Head",
      'Material_Details', NEW."Material_Details",
      'M_Unit', NEW."M_Unit",
      'is_active', NEW.is_active
    );
    INSERT INTO audit_log (user_id, action, module_name, record_identifier, old_value, new_value)
    VALUES (NEW.created_by, 'CREATE', 'Material Master', NEW.id::VARCHAR, NULL, v_new_json);
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- If is_active changes, mark action as STATUS_CHANGE
    IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      v_action := 'STATUS_CHANGE';
      v_old_json := v_old_json || jsonb_build_object('is_active', OLD.is_active);
      v_new_json := v_new_json || jsonb_build_object('is_active', NEW.is_active);
      v_changed := TRUE;
    END IF;

    -- Compare each business field to build old/new value snapshots
    IF NEW."Material_Main_Head" IS DISTINCT FROM OLD."Material_Main_Head" THEN
      v_old_json := v_old_json || jsonb_build_object('Material_Main_Head', OLD."Material_Main_Head");
      v_new_json := v_new_json || jsonb_build_object('Material_Main_Head', NEW."Material_Main_Head");
      v_changed := TRUE;
    END IF;

    IF NEW."Material_Sub_Head" IS DISTINCT FROM OLD."Material_Sub_Head" THEN
      v_old_json := v_old_json || jsonb_build_object('Material_Sub_Head', OLD."Material_Sub_Head");
      v_new_json := v_new_json || jsonb_build_object('Material_Sub_Head', NEW."Material_Sub_Head");
      v_changed := TRUE;
    END IF;

    IF NEW."Material_Details" IS DISTINCT FROM OLD."Material_Details" THEN
      v_old_json := v_old_json || jsonb_build_object('Material_Details', OLD."Material_Details");
      v_new_json := v_new_json || jsonb_build_object('Material_Details', NEW."Material_Details");
      v_changed := TRUE;
    END IF;

    IF NEW."M_Unit" IS DISTINCT FROM OLD."M_Unit" THEN
      v_old_json := v_old_json || jsonb_build_object('M_Unit', OLD."M_Unit");
      v_new_json := v_new_json || jsonb_build_object('M_Unit', NEW."M_Unit");
      v_changed := TRUE;
    END IF;

    -- Only write to audit_log if changes actually occurred
    IF v_changed THEN
      INSERT INTO audit_log (user_id, action, module_name, record_identifier, old_value, new_value)
      VALUES (NEW.edited_by, v_action, 'Material Master', NEW.id::VARCHAR, v_old_json, v_new_json);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_material_master ON material_master;
CREATE TRIGGER trg_audit_material_master
AFTER INSERT OR UPDATE ON material_master
FOR EACH ROW
EXECUTE FUNCTION audit_material_master_changes();
