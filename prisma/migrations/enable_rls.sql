-- RLS (Row Level Security) 설정 마이그레이션
-- 이 파일을 수동으로 실행하여 RLS를 활성화하세요.

-- 1. QrCode 테이블 RLS 활성화
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- 2. QrCode 접근 정책 생성 (사용자는 자신의 QR 코드만 접근 가능)
CREATE POLICY qr_codes_user_policy ON qr_codes
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

-- 3. QrTemplate 테이블 RLS 활성화
ALTER TABLE qr_templates ENABLE ROW LEVEL SECURITY;

-- 4. QrTemplate 접근 정책 생성 (사용자는 자신의 템플릿만 접근 가능)
CREATE POLICY qr_templates_user_policy ON qr_templates
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

-- 5. User 테이블 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. User 접근 정책 생성 (사용자는 자신의 정보만 접근 가능)
CREATE POLICY users_self_policy ON users
  FOR ALL
  USING (id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (id = current_setting('app.current_user_id', true)::text);

-- 7. Account 테이블 RLS 활성화
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- 8. Account 접근 정책 생성 (사용자는 자신의 계정만 접근 가능)
CREATE POLICY accounts_user_policy ON accounts
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

-- 9. Session 테이블 RLS 활성화
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 10. Session 접근 정책 생성 (사용자는 자신의 세션만 접근 가능)
CREATE POLICY sessions_user_policy ON sessions
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

-- 관리자용 정책 (선택사항)
-- 필요시 관리자 역할에 대한 정책을 추가할 수 있습니다.
-- CREATE POLICY admin_access_policy ON qr_codes
--   FOR ALL
--   TO admin_role
--   USING (true);
