#!/bin/bash

# RLS 설정 및 테스트 스크립트
# 이 스크립트는 RLS를 활성화하고 테스트를 실행합니다.

echo "🔒 RLS (Row Level Security) 설정 및 테스트를 시작합니다..."

# 환경 변수 확인
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL 환경 변수가 설정되지 않았습니다."
    echo "   .env 파일에서 DATABASE_URL을 확인해주세요."
    exit 1
fi

echo "✅ 데이터베이스 연결 정보 확인됨"

# RLS 활성화 확인
echo "📋 현재 RLS 상태를 확인합니다..."
psql "$DATABASE_URL" -c "
SELECT
  schemaname,
  tablename,
  rowsecurity,
  (SELECT count(*) FROM pg_policies WHERE schemaname = n.nspname AND tablename = c.relname) as policy_count
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname IN ('qr_codes', 'qr_templates', 'users', 'accounts', 'sessions')
AND n.nspname = 'public'
ORDER BY tablename;
"

echo ""
echo "❓ RLS를 활성화하시겠습니까? (y/N): "
read -r answer

if [[ $answer =~ ^[Yy]$ ]]; then
    echo "🔧 RLS를 활성화합니다..."

    if psql "$DATABASE_URL" -f prisma/migrations/enable_rls.sql; then
        echo "✅ RLS가 성공적으로 활성화되었습니다!"
    else
        echo "❌ RLS 활성화에 실패했습니다."
        exit 1
    fi

    echo ""
    echo "🧪 RLS 테스트를 실행하시겠습니까? (y/N): "
    read -r test_answer

    if [[ $test_answer =~ ^[Yy]$ ]]; then
        echo "🧪 RLS 테스트를 실행합니다..."
        echo "⚠️  주의: test_rls.sql 파일에서 실제 사용자 ID로 교체해야 합니다."

        # 실제 사용자 ID 입력 받기
        echo "테스트할 사용자 ID를 입력하세요 (CUID 또는 UUID 형식): "
        read -r user_id

        if [[ -n "$user_id" ]]; then
            # 임시 테스트 파일 생성
            cp prisma/migrations/test_rls.sql /tmp/test_rls_temp.sql
            sed -i.bak "s/your-test-user-id-here/$user_id/g" /tmp/test_rls_temp.sql
            sed -i.bak "s/another-test-user-id-here/test-fake-user-id/g" /tmp/test_rls_temp.sql

            echo "📊 사용자 ID '$user_id'로 RLS 테스트를 실행합니다..."
            psql "$DATABASE_URL" -f /tmp/test_rls_temp.sql

            # 임시 파일 정리
            rm /tmp/test_rls_temp.sql /tmp/test_rls_temp.sql.bak
        else
            echo "⏭️  사용자 ID가 입력되지 않아 테스트를 건너뜁니다."
        fi
    fi
else
    echo "⏭️  RLS 활성화를 건너뜁니다."
fi

echo ""
echo "📖 RLS 설정에 대한 자세한 정보는 docs/RLS_SETUP.md를 참조하세요."
echo "🎉 RLS 설정 스크립트가 완료되었습니다!"
