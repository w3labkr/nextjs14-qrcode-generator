-- RLS 테스트를 위한 SQL 스크립트
-- 이 스크립트를 사용하여 RLS가 올바르게 작동하는지 확인할 수 있습니다.

-- 1. RLS 활성화 상태 확인
SELECT
  schemaname,
  tablename,
  rowsecurity,
  (SELECT count(*) FROM pg_policies WHERE schemaname = n.nspname AND tablename = c.relname) as policy_count
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname IN ('qr_codes', 'qr_templates', 'users', 'accounts', 'sessions')
AND n.nspname = 'public';

-- 2. 정책 목록 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('qr_codes', 'qr_templates', 'users', 'accounts', 'sessions')
ORDER BY tablename, policyname;

-- 3. 테스트용 사용자 ID 설정 (실제 사용자 ID로 교체)
SET app.current_user_id = 'your-test-user-id-here';

-- 4. 현재 설정된 사용자 ID 확인
SELECT current_setting('app.current_user_id', true) as current_user_id;

-- 5. 사용자별 데이터 조회 테스트
SELECT 'qr_codes' as table_name, count(*) as count FROM qr_codes
UNION ALL
SELECT 'qr_templates' as table_name, count(*) as count FROM qr_templates
UNION ALL
SELECT 'users' as table_name, count(*) as count FROM users
UNION ALL
SELECT 'accounts' as table_name, count(*) as count FROM accounts
UNION ALL
SELECT 'sessions' as table_name, count(*) as count FROM sessions;

-- 6. 다른 사용자 ID로 변경해서 테스트
SET app.current_user_id = 'another-test-user-id-here';

-- 7. 다시 데이터 조회 (다른 결과가 나와야 함)
SELECT 'qr_codes' as table_name, count(*) as count FROM qr_codes
UNION ALL
SELECT 'qr_templates' as table_name, count(*) as count FROM qr_templates
UNION ALL
SELECT 'users' as table_name, count(*) as count FROM users
UNION ALL
SELECT 'accounts' as table_name, count(*) as count FROM accounts
UNION ALL
SELECT 'sessions' as table_name, count(*) as count FROM sessions;

-- 8. RLS 설정 초기화
RESET app.current_user_id;

-- 9. RLS 없이 전체 데이터 확인 (관리자 권한 필요)
-- 이 쿼리는 RLS가 비활성화된 상태에서만 전체 데이터를 보여줍니다.
SELECT 'Total qr_codes' as info, count(*) as count FROM qr_codes
UNION ALL
SELECT 'Total qr_templates' as info, count(*) as count FROM qr_templates
UNION ALL
SELECT 'Total users' as info, count(*) as count FROM users;
