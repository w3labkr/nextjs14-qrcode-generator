-- 통합 로그 시스템용 RLS 설정 스크립트

-- 1. QrCode 테이블 RLS 활성화
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- 2. QrCode 접근 정책 생성 (사용자는 자신의 QR 코드만 접근 가능)
CREATE POLICY qr_codes_user_policy ON qr_codes
  USING (user_id = current_setting('app.current_user_id')::text);

-- 3. QrTemplate 테이블 RLS 활성화
ALTER TABLE qr_templates ENABLE ROW LEVEL SECURITY;

-- 4. QrTemplate 접근 정책 생성 (사용자는 자신의 템플릿만 접근 가능)
CREATE POLICY qr_templates_user_policy ON qr_templates
  USING (user_id = current_setting('app.current_user_id')::text);

-- 5. User 테이블 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. User 접근 정책 생성 (사용자는 자신의 정보만 접근 가능)
CREATE POLICY users_self_policy ON users
  USING (id = current_setting('app.current_user_id')::text);

-- 7. Account 테이블 RLS 활성화
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- 8. Account 접근 정책 생성 (사용자는 자신의 계정만 접근 가능)
CREATE POLICY accounts_user_policy ON accounts
  USING (user_id = current_setting('app.current_user_id')::text);

-- 9. Session 테이블 RLS 활성화
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 10. Session 접근 정책 생성 (사용자는 자신의 세션만 접근 가능)
CREATE POLICY sessions_user_policy ON sessions
  USING (user_id = current_setting('app.current_user_id')::text);

-- 11. ApplicationLog 테이블 RLS 활성화 (통합 로그 시스템)
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;

-- 12. ApplicationLog 일반 사용자 접근 정책
CREATE POLICY application_logs_user_policy ON application_logs
  FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id')::text
    OR current_setting('app.is_admin')::boolean = true
    OR type = 'SYSTEM' -- 시스템 로그는 모든 사용자가 조회 가능
  );

-- 13. ApplicationLog 관리자 전용 정책 (민감한 로그 타입)
CREATE POLICY application_logs_admin_sensitive ON application_logs
  FOR SELECT
  USING (
    CASE
      WHEN type IN ('AUDIT', 'ADMIN', 'ERROR')
      THEN current_setting('app.is_admin')::boolean = true
      ELSE true
    END
  );

-- 14. ApplicationLog 삽입 정책 (모든 사용자가 로그 생성 가능)
CREATE POLICY application_logs_insert_policy ON application_logs
  FOR INSERT
  WITH CHECK (true); -- 모든 로그 생성 허용

-- 15. ApplicationLog 업데이트 정책 (관리자만 수정 가능)
CREATE POLICY application_logs_update_policy ON application_logs
  FOR UPDATE
  USING (current_setting('app.is_admin')::boolean = true);

-- 16. ApplicationLog 삭제 정책 (관리자만 삭제 가능)
CREATE POLICY application_logs_delete_policy ON application_logs
  FOR DELETE
  USING (current_setting('app.is_admin')::boolean = true);
