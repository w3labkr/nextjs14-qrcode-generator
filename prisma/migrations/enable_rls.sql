-- RLS (Row Level Security) 설정 마이그레이션
-- 이 파일을 수동으로 실행하여 RLS를 활성화하세요.

-- 1. QrCode 테이블 RLS 활성화
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- 2. QrCode 접근 정책 생성 (사용자는 자신의 QR 코드만 접근 가능)
DROP POLICY IF EXISTS qr_codes_user_policy ON qr_codes;
CREATE POLICY qr_codes_user_policy ON qr_codes
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

-- 3. QrTemplate 테이블 RLS 활성화
ALTER TABLE qr_templates ENABLE ROW LEVEL SECURITY;

-- 4. QrTemplate 접근 정책 생성 (사용자는 자신의 템플릿만 접근 가능)
DROP POLICY IF EXISTS qr_templates_user_policy ON qr_templates;
CREATE POLICY qr_templates_user_policy ON qr_templates
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

-- 5. User 테이블 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. User 접근 정책 생성 (사용자는 자신의 정보만 접근 가능)
DROP POLICY IF EXISTS users_self_policy ON users;
CREATE POLICY users_self_policy ON users
  FOR ALL
  USING (id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (id = current_setting('app.current_user_id', true)::text);

-- 7. Account 테이블 RLS 활성화
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- 8. Account 접근 정책 생성 (사용자는 자신의 계정만 접근 가능)
DROP POLICY IF EXISTS accounts_user_policy ON accounts;
CREATE POLICY accounts_user_policy ON accounts
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

-- 9. Session 테이블 RLS 활성화
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 10. Session 접근 정책 생성 (사용자는 자신의 세션만 접근 가능)
DROP POLICY IF EXISTS sessions_user_policy ON sessions;
CREATE POLICY sessions_user_policy ON sessions
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

-- 성능을 위한 인덱스 추가 (이미 존재하는 경우 무시됨)
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_templates_user_id ON qr_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- 관리자용 정책 (선택사항)
-- 필요시 관리자 역할에 대한 정책을 추가할 수 있습니다.
-- CREATE POLICY admin_access_policy ON qr_codes
--   FOR ALL
--   TO admin_role
--   USING (true);

-- RLS가 올바르게 설정되었는지 확인하는 쿼리
SELECT
  schemaname,
  tablename,
  rowsecurity,
  (SELECT count(*) FROM pg_policies WHERE schemaname = n.nspname AND tablename = c.relname) as policy_count
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname IN ('qr_codes', 'qr_templates', 'users', 'accounts', 'sessions')
AND n.nspname = 'public';
