#!/bin/bash

# RLS 설정 및 테스트 스크립트
# 이 스크립트는 RLS를 활성화하고 테스트를 실행합니다.

set -e  # 오류 발생 시 스크립트 중단

echo "🔒 RLS (Row Level Security) 설정 및 테스트를 시작합니다..."

# 프로젝트 루트 디렉토리로 이동 (스크립트가 어디서 실행되든 상관없이)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "📂 프로젝트 디렉토리: $PROJECT_ROOT"

# .env 파일 로드
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    echo "📄 .env 파일을 로드합니다..."
    # .env 파일의 모든 환경 변수를 로드 (주석과 빈 줄 제외)
    set -a
    source "$ENV_FILE"
    set +a

    if [ -n "$DATABASE_URL" ]; then
        echo "✅ DATABASE_URL이 .env 파일에서 로드되었습니다"
        # 보안을 위해 URL의 일부만 표시
        echo "   연결 대상: $(echo $DATABASE_URL | sed 's/:[^@]*@/:***@/')"
    fi
else
    echo "⚠️  .env 파일을 찾을 수 없습니다."
fi

# 환경 변수 확인
if [ -z "$DATABASE_URL" ]; then
    echo ""
    echo "❌ DATABASE_URL 환경 변수가 설정되지 않았습니다."
    echo ""
    echo "다음 중 하나의 방법으로 해결하세요:"
    echo "1. .env 파일에 DATABASE_URL을 설정"
    echo "2. 환경 변수로 직접 설정: export DATABASE_URL='your-database-url'"
    echo "3. 스크립트 실행 시 직접 전달: DATABASE_URL='your-url' ./scripts/setup-rls.sh"
    echo ""
    echo "DATABASE_URL 형식 예시:"
    echo "postgresql://username:password@host:port/database"
    echo ""
    exit 1
fi

# RLS 작업을 위해 DIRECT_URL 사용 (pgbouncer 문제 회피)
RLS_DATABASE_URL="${DIRECT_URL:-$DATABASE_URL}"

echo "✅ 데이터베이스 연결 정보 확인됨"

# PATH에 PostgreSQL 추가 (macOS Homebrew 설치 시)
if [ -d "/opt/homebrew/opt/postgresql@14/bin" ]; then
    export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"
fi

# 데이터베이스 연결 테스트
echo "🔗 데이터베이스 연결을 테스트합니다..."
if psql "$RLS_DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ 데이터베이스 연결 성공!"
else
    echo "❌ 데이터베이스 연결 실패!"
    echo "DATABASE_URL/DIRECT_URL을 확인하고 데이터베이스가 실행 중인지 확인하세요."
    echo "psql이 설치되어 있는지도 확인하세요: brew install postgresql"
    exit 1
fi

# RLS 활성화 확인
echo ""
echo "📋 현재 RLS 상태를 확인합니다..."

RLS_STATUS_OUTPUT=$(psql "$RLS_DATABASE_URL" -t -c "
SELECT
  n.nspname as schemaname,
  c.relname as tablename,
  c.relrowsecurity as rowsecurity,
  (SELECT count(*) FROM pg_policies WHERE schemaname = n.nspname AND tablename = c.relname) as policy_count
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname IN ('qr_codes', 'qr_templates', 'users', 'accounts', 'sessions', 'verification_tokens')
AND n.nspname = 'public'
ORDER BY c.relname;
" 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$RLS_STATUS_OUTPUT" ]; then
    echo "현재 RLS 상태:"
    echo "테이블명 | RLS 활성화 | 정책 수"
    echo "--------------------------------"
    echo "$RLS_STATUS_OUTPUT" | while IFS='|' read -r schema table rls_enabled policy_count; do
        schema=$(echo "$schema" | xargs)
        table=$(echo "$table" | xargs)
        rls_enabled=$(echo "$rls_enabled" | xargs)
        policy_count=$(echo "$policy_count" | xargs)

        if [ "$rls_enabled" = "t" ]; then
            rls_status="✅ 활성화"
        else
            rls_status="❌ 비활성화"
        fi

        printf "%-12s | %-10s | %s개\n" "$table" "$rls_status" "$policy_count"
    done
else
    echo "⚠️  RLS 상태를 확인할 수 없습니다. 테이블이 존재하지 않을 수 있습니다."
    echo ""
    echo "먼저 데이터베이스 마이그레이션을 실행하세요:"
    echo "npx prisma migrate dev --name init"
    echo ""
    echo -n "계속하시겠습니까? (y/N): "
    read -r continue_anyway
    if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
        echo "스크립트를 중단합니다."
        exit 1
    fi
fi

# RLS 활성화 여부 확인
echo ""
echo -n "RLS를 활성화하시겠습니까? (Y/n): "
read -r enable_rls

if [[ ! $enable_rls =~ ^[Nn]$ ]]; then
    echo "🔐 RLS를 활성화합니다..."

    # RLS 활성화 SQL 실행
    RLS_SQL_FILE="./prisma/migrations/enable_rls.sql"
    if [ -f "$RLS_SQL_FILE" ]; then
        echo "📁 RLS SQL 파일을 실행합니다: $RLS_SQL_FILE"
        if psql "$RLS_DATABASE_URL" -f "$RLS_SQL_FILE"; then
            echo "✅ RLS 활성화 완료!"
        else
            echo "❌ RLS 활성화 실패!"
            exit 1
        fi
    else
        echo "⚠️  RLS SQL 파일을 찾을 수 없습니다: $RLS_SQL_FILE"
        echo "npx prisma migrate dev를 먼저 실행하거나 수동으로 RLS를 설정하세요."
        exit 1
    fi

    # RLS 테스트 실행
    echo ""
    echo -n "RLS 테스트를 실행하시겠습니까? (Y/n): "
    read -r run_tests

    if [[ ! $run_tests =~ ^[Nn]$ ]]; then
        echo "🧪 RLS 테스트를 실행합니다..."

        RLS_TEST_FILE="./prisma/migrations/test_rls.sql"
        if [ -f "$RLS_TEST_FILE" ]; then
            echo "📁 RLS 테스트 파일을 실행합니다: $RLS_TEST_FILE"
            if psql "$RLS_DATABASE_URL" -f "$RLS_TEST_FILE"; then
                echo "✅ RLS 테스트 완료!"
            else
                echo "❌ RLS 테스트 실패!"
                echo "테스트 결과를 확인하고 필요시 RLS 정책을 수정하세요."
            fi
        else
            echo "⚠️  RLS 테스트 파일을 찾을 수 없습니다: $RLS_TEST_FILE"
        fi
    else
        echo "⏭️  RLS 테스트를 건너뜁니다."
    fi
else
    echo "⏭️  RLS 활성화를 건너뜁니다."
fi

echo ""
echo "📖 RLS 설정에 대한 자세한 정보는 docs/RLS_SETUP.md를 참조하세요."
echo "🎉 RLS 설정 스크립트가 완료되었습니다!"
