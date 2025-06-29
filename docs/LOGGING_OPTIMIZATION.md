# 로그 시스템 최적화 가이드

## 개요

기존의 분산된 로그 테이블들(AccessLog, AuthLog, AuditLog, ErrorLog, AdminActionLog, QrGenerationLog)을 하나의 통합 로그 테이블(`ApplicationLog`)로 통합하여 성능과 유지보수성을 향상시켰습니다.

## 주요 개선사항

### 1. 테이블 통합
- **이전**: 6개의 분리된 로그 테이블
- **이후**: 1개의 통합 로그 테이블
- **장점**: 조회 성능 향상, 유지보수 간소화, 스토리지 효율성

### 2. 데이터 구조 최적화
- **로그 타입 열거형**: `ACCESS`, `AUTH`, `AUDIT`, `ERROR`, `ADMIN`, `QR_GENERATION`, `SYSTEM`
- **로그 레벨 열거형**: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`
- **메타데이터 JSON**: 유연한 추가 정보 저장

### 3. 인덱스 최적화
```sql
@@index([userId, createdAt])
@@index([type, createdAt])
@@index([level, createdAt])
@@index([action, createdAt])
@@index([createdAt])
```

## 새로운 기능

### UnifiedLogger 클래스
```typescript
// API 접근 로그
await UnifiedLogger.logAccess({
  userId: "user123",
  method: "POST",
  path: "/api/qrcode",
  statusCode: 200,
  responseTime: 45
});

// 인증 로그
await UnifiedLogger.logAuth({
  userId: "user123",
  action: "User login",
  authAction: "LOGIN",
  provider: "google"
});

// 에러 로그
await UnifiedLogger.logError({
  userId: "user123",
  error: new Error("Database connection failed"),
  errorCode: "DB_CONN_001"
});

// QR 코드 생성 로그
await UnifiedLogger.logQrGeneration({
  userId: "user123",
  qrType: "URL",
  contentHash: "abc123...",
  size: "200x200"
});
```

### 성능 측정
```typescript
const perf = new PerformanceLogger("QR_GENERATION", userId);
// ... 작업 수행
await perf.end({ qrType: "URL", size: "200x200" });
```

### 로그 조회 및 필터링
```typescript
const logs = await UnifiedLogger.getLogs({
  userId: "user123",
  type: ["ACCESS", "ERROR"],
  level: "ERROR",
  startDate: new Date("2023-01-01"),
  endDate: new Date("2023-12-31"),
  limit: 100
});
```

### 로그 통계
```typescript
const stats = await UnifiedLogger.getLogStats({
  userId: "user123",
  startDate: new Date("2023-01-01")
});
// 결과: { total: 1234, byType: { ACCESS: 800, ERROR: 50 }, byLevel: { INFO: 1000, ERROR: 50 } }
```

## 환경변수 설정

`.env` 파일에 다음 변수들을 추가하세요:

```env
# 로그 레벨 설정 (DEBUG, INFO, WARN, ERROR, FATAL)
LOG_LEVEL=INFO

# 관리자 이메일 목록 (쉼표로 구분)
ADMIN_EMAILS=admin@example.com,manager@example.com

# 로그 보존 기간 (일 단위)
LOG_RETENTION_DAYS=90
```

## 마이그레이션 실행

### 방법 1: 자동 스크립트 사용 (권장)
```bash
./scripts/migrate-logging-system.sh
```

### 방법 2: 수동 실행
```bash
# 1. 데이터 백업
npx prisma db execute --file ./scripts/backup-logs.sql

# 2. 마이그레이션 실행
npx prisma migrate dev --name optimize-logging-system

# 3. 데이터 마이그레이션
npx prisma db execute --file ./prisma/migrations/migrate-logs.sql

# 4. Prisma Client 재생성
npx prisma generate
```

## 코드 업데이트 가이드

### 1. 기존 로그 생성 코드 교체

**이전:**
```typescript
import { createAccessLog, createAuthLog } from "@/lib/log-utils";

await createAccessLog({
  userId: "user123",
  method: "POST",
  path: "/api/test",
  statusCode: 200
});
```

**이후:**
```typescript
import { UnifiedLogger } from "@/lib/unified-logging";

await UnifiedLogger.logAccess({
  userId: "user123",
  method: "POST",
  path: "/api/test",
  statusCode: 200
});
```

### 2. 미들웨어 업데이트

**이전:**
```typescript
import { logApiRequest } from "@/lib/logging-middleware";

await logApiRequest(request, response, userId);
```

**이후:**
```typescript
import { logApiRequest } from "@/lib/logging-middleware";

await logApiRequest(request, response, userId, responseTime);
```

### 3. 로그 조회 코드 업데이트

**이전:**
```typescript
import { getAccessLogs, getAuthLogs } from "@/lib/log-utils";

const accessLogs = await getAccessLogs({ userId: "user123" });
const authLogs = await getAuthLogs({ userId: "user123" });
```

**이후:**
```typescript
import { UnifiedLogger } from "@/lib/unified-logging";

const allLogs = await UnifiedLogger.getLogs({ 
  userId: "user123",
  type: ["ACCESS", "AUTH"]
});
```

## 성능 최적화 팁

### 1. 로그 레벨 활용
- 프로덕션에서는 `LOG_LEVEL=INFO` 이상 설정
- 개발 환경에서는 `LOG_LEVEL=DEBUG` 사용

### 2. 정기적인 로그 정리
```typescript
// 관리자만 실행 가능
const deletedCount = await UnifiedLogger.cleanupOldLogs(90); // 90일 이전 로그 삭제
```

### 3. 효율적인 조회
- 인덱스를 활용한 필터링 (userId, type, level, createdAt)
- 필요한 경우에만 메타데이터 조회
- 페이지네이션 활용

## 모니터링 및 알림

### 대시보드에서 확인할 수 있는 지표
- 시간대별 로그 생성량
- 타입별 로그 분포
- 에러 로그 빈도
- 응답 시간 통계

### 알림 설정 (예시)
```typescript
// 에러 로그가 임계치를 초과할 때 알림
const errorCount = await UnifiedLogger.getLogStats({
  type: "ERROR",
  startDate: new Date(Date.now() - 60 * 60 * 1000) // 지난 1시간
});

if (errorCount.total > 10) {
  // 알림 발송 로직
}
```

## 백업 및 복구

### 백업된 데이터 확인
마이그레이션 후 백업 테이블에서 기존 데이터를 확인할 수 있습니다:
- `logs_backup_access`
- `logs_backup_auth`
- `logs_backup_audit`
- `logs_backup_error`
- `logs_backup_admin`
- `logs_backup_qr`

### 롤백 (필요시)
```sql
-- 새 테이블 삭제
DROP TABLE application_logs;

-- 백업에서 복원
ALTER TABLE logs_backup_access RENAME TO access_logs;
-- ... 다른 테이블들도 동일하게 복원
```

## 문제 해결

### 자주 발생하는 문제

1. **마이그레이션 실패**
   - 기존 데이터가 있는 경우 백업 후 진행
   - 권한 확인 (데이터베이스 스키마 수정 권한 필요)

2. **성능 저하**
   - 인덱스 확인 및 쿼리 최적화
   - 정기적인 로그 정리 실행

3. **메타데이터 형식 오류**
   - JSON 형식 확인
   - 타입 검증 추가

## 추가 개선 사항

향후 추가할 수 있는 기능들:

1. **실시간 로그 스트리밍**
2. **로그 압축 및 아카이빙**
3. **분산 로깅 시스템 연동**
4. **ML 기반 이상 탐지**
5. **로그 기반 사용자 행동 분석**
6. **자동 로그 레벨 조정**
7. **성능 메트릭 기반 자동 알림**

## 프로젝트 통계 (v1.4.31)

- **총 파일 수**: 170+ TypeScript/JavaScript 파일
- **총 패키지 수**: 100+ npm 패키지
- **UI 컴포넌트**: 46개 shadcn/ui 컴포넌트
- **지원 QR 코드 타입**: 7가지
- **로깅 시스템**: 통합 로깅 시스템 (UnifiedLogger)
- **데이터베이스**: Supabase PostgreSQL with RLS
- **인증**: NextAuth.js v5.0.0-beta.28
- **상태 관리**: Zustand v5.0.5
