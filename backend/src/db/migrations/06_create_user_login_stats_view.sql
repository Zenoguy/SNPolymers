-- Optimize joining and aggregate column on sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_user_login ON sessions(user_id, login_at DESC);

-- Define aggregate view
DROP VIEW IF EXISTS user_login_stats;
CREATE OR REPLACE VIEW user_login_stats
WITH (security_invoker = true)
AS
SELECT 
  u.id,
  u.mobile_number,
  u.display_name,
  u.role,
  u.permissions,
  u.created_at,
  u.is_active,
  u.telegram_chat_id,
  COUNT(s.id)::int AS session_count,
  MAX(s.login_at) AS last_login_at
FROM authorised_users u
LEFT JOIN sessions s ON u.id = s.user_id
GROUP BY u.id, u.mobile_number, u.display_name, u.role, u.permissions, u.created_at, u.is_active, u.telegram_chat_id;
