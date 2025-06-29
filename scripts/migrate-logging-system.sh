#!/bin/bash

# 로그 시스템 최적화 마이그레이션 스크립트

set -e

echo "🚀 로그 시스템 최적화 마이그레이션을 시작합니다..."

# 1. 기존 데이터 백업
echo "📦 기존 로그 데이터를 백업합니다..."
npx prisma db execute --file ./scripts/backup-logs.sql --schema ./prisma/schema.prisma

# 2. Prisma 마이그레이션 실행
echo "🔄 데이터베이스 스키마를 업데이트합니다..."
npx prisma migrate dev --name optimize-logging-system

# 3. 기존 데이터를 새 테이블로 마이그레이션
echo "📊 기존 로그 데이터를 새 통합 테이블로 마이그레이션합니다..."
npx prisma db execute --file ./prisma/migrations/migrate-logs.sql --schema ./prisma/schema.prisma

# 4. Prisma Client 재생성
echo "🔧 Prisma Client를 재생성합니다..."
npx prisma generate

echo "✅ 로그 시스템 최적화가 완료되었습니다!"
echo ""
echo "📋 변경사항 요약:"
echo "   • 여러 로그 테이블을 하나의 통합 테이블(application_logs)로 합침"
echo "   • 로그 타입과 레벨을 위한 새로운 enum 추가"
echo "   • 메타데이터를 JSON 형태로 저장하여 유연성 향상"
echo "   • 인덱스 최적화로 조회 성능 개선"
echo "   • 통합 로깅 시스템과 미들웨어 제공"
echo ""
echo "🔍 새로운 기능:"
echo "   • UnifiedLogger 클래스를 통한 통합 로깅"
echo "   • 성능 측정 및 로깅 헬퍼"
echo "   • 로그 레벨 기반 필터링"
echo "   • 자동 로그 정리 기능"
