-- Migration: Create master_data_versions table, triggers, and auto-increment versioning
-- DB: PostgreSQL (Supabase)

CREATE TABLE IF NOT EXISTS master_data_versions (
  id          INT PRIMARY KEY DEFAULT 1,
  version     BIGINT NOT NULL DEFAULT 1,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT  chk_single_row CHECK (id = 1)
);

-- Seed initial version
INSERT INTO master_data_versions (id, version) VALUES (1, 1) ON CONFLICT DO NOTHING;

-- Trigger function to increment version
CREATE OR REPLACE FUNCTION increment_master_data_version()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE master_data_versions
  SET version = version + 1, updated_at = now()
  WHERE id = 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind triggers to material_master
DROP TRIGGER IF EXISTS trg_increment_version_material_master ON material_master;
CREATE TRIGGER trg_increment_version_material_master
AFTER INSERT OR UPDATE OR DELETE ON material_master
FOR EACH ROW
EXECUTE FUNCTION increment_master_data_version();

-- Bind triggers to purchase_data
DROP TRIGGER IF EXISTS trg_increment_version_purchase_data ON purchase_data;
CREATE TRIGGER trg_increment_version_purchase_data
AFTER INSERT OR UPDATE OR DELETE ON purchase_data
FOR EACH ROW
EXECUTE FUNCTION increment_master_data_version();
