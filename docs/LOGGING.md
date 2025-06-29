# 로깅 시스템 (Logging System)

이 문서는 QR 코드 생성기 프로젝트의 통합 로깅 시스템에 대한 설명을 제공합니다.

## 개요

기존의 분산된 로그 테이블들을 하나의 통합 로그 테이블(`ApplicationLog`)로 통합하여 성능과 유지보수성을 향상시켰습니다.

현재 7가지 유형의 로그를 지원합니다:

1. **API 접근 로그** (ACCESS)
2. **인증 로그** (AUTH)
3. **감사 로그** (AUDIT)
4. **에러 로그** (ERROR)
5. **관리자 활동 로그** (ADMIN)
6. **QR 코드 생성 로그** (QR_GENERATION)
7. **시스템 로그** (SYSTEM)

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

## UnifiedLogger 클래스

### 기본 사용법

```typescript
import { UnifiedLogger } from '@/lib/unified-logging';

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

## 레거시 테이블 구조 (참고용)

## 레거시 테이블 구조 (참고용)

마이그레이션 이전에 사용되었던 개별 로그 테이블들의 구조입니다.

### 1. AccessLog (access_logs)

API 요청에 대한 로그를 기록합니다.

```prisma
model AccessLog {
  id         String   @id @default(cuid())
  userId     String?
  method     String   // HTTP 메서드 (GET, POST, PUT, DELETE 등)
  path       String   // API 경로
  statusCode Int      // HTTP 상태 코드
  userAgent  String?  // 사용자 에이전트
  ipAddress  String?  // IP 주소
  createdAt  DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

### 2. AuthLog (auth_logs)

인증 관련 이벤트를 기록합니다.

```prisma
model AuthLog {
  id        String     @id @default(cuid())
  userId    String?
  action    AuthAction // LOGIN, LOGOUT, REFRESH, REVOKE, FAIL
  createdAt DateTime   @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

### 3. AuditLog (audit_logs)

데이터 변경 이력을 기록합니다.

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String   // 수행된 액션
  tableName String   // 변경된 테이블명
  recordId  String?  // 변경된 레코드 ID
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

### 4. ErrorLog (error_logs)

에러 정보를 기록합니다.

```prisma
model ErrorLog {
  id           String   @id @default(cuid())
  userId       String?
  errorMessage String   // 에러 메시지
  createdAt    DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

### 5. AdminActionLog (admin_action_logs)

관리자 활동을 기록합니다.

```prisma
model AdminActionLog {
  id        String   @id @default(cuid())
  adminId   String
  action    String   // 수행된 관리자 액션
  detail    String?  // 상세 정보
  createdAt DateTime @default(now())

  admin User @relation(fields: [adminId], references: [id], onDelete: Cascade)
}
```

## 레거시 사용법 (참고용)

### 1. 로그 생성

```typescript
import {
  createAccessLog,
  createAuthLog,
  createAuditLog,
  createErrorLog,
  createAdminActionLog,
} from '@/lib/log-utils'

// API 접근 로그
await createAccessLog({
  userId: 'user_id',
  method: 'GET',
  path: '/api/qrcodes',
  statusCode: 200,
  userAgent: 'Mozilla/5.0...',
  ipAddress: '192.168.1.1',
})

// 인증 로그
await createAuthLog({
  userId: 'user_id',
  action: 'LOGIN',
})

// 감사 로그
await createAuditLog({
  userId: 'user_id',
  action: 'CREATE',
  tableName: 'qr_codes',
  recordId: 'qr_code_id',
})

// 에러 로그
await createErrorLog({
  userId: 'user_id',
  errorMessage: 'QR 코드 생성 실패: 잘못된 URL 형식',
})

// 관리자 액션 로그
await createAdminActionLog({
  adminId: 'admin_id',
  action: 'DELETE_USER',
  detail: '사용자 계정 삭제: user@example.com',
})
```

### 2. 로그 조회

```typescript
import {
  getAccessLogs,
  getAuthLogs,
  getAuditLogs,
  getErrorLogs,
  getAdminActionLogs,
  getLogStatistics,
} from '@/lib/log-utils'

// API 접근 로그 조회
const accessLogs = await getAccessLogs({
  userId: 'user_id',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  limit: 100,
  orderBy: 'desc',
})

// 통계 조회
const stats = await getLogStatistics()
console.log(stats.total.accessLogs) // 전체 API 접근 로그 수
console.log(stats.today.errorLogs)  // 오늘 발생한 에러 로그 수
```

### 3. Server Actions 사용

```typescript
import {
  createAccessLogAction,
  getAccessLogsAction,
  getLogStatisticsAction,
} from '@/app/actions'

// Server Actions를 통한 로그 생성
await createAccessLogAction({
  method: 'POST',
  path: '/api/qrcodes',
  statusCode: 201,
})

// Server Actions를 통한 로그 조회
const logs = await getAccessLogsAction({
  limit: 50,
  orderBy: 'desc',
})
```

### 4. 미들웨어와 함께 사용

```typescript
import { logApiRequest, logAuthEvent, logError } from '@/lib/logging-middleware'

// API 요청 로깅
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 요청 로깅
  await logApiRequest(request, response, getUserId(request))
  
  return response
}

// 인증 이벤트 로깅
await logAuthEvent('LOGIN', userId)

// 에러 로깅
try {
  // 어떤 작업...
} catch (error) {
  await logError(error, userId, { context: 'QR 코드 생성' })
  throw error
}
```

## Row Level Security (RLS)

로그 테이블들은 RLS(Row Level Security)를 지원합니다:

- **사용자 로그**: 사용자는 자신의 로그만 조회 가능
- **관리자 로그**: 관리자만 모든 로그 조회 가능

### RLS 정책 설정

```sql
-- AccessLog 테이블 RLS 활성화
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 로그만 접근 가능
CREATE POLICY access_logs_user_policy ON access_logs
  USING (user_id = current_setting('app.current_user_id')::text OR current_setting('app.is_admin')::boolean = true);

-- 다른 로그 테이블들도 동일한 패턴으로 설정
```

### 통합 로그 테이블 RLS

```sql
-- ApplicationLog 테이블 RLS 활성화
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 로그만 접근 가능
CREATE POLICY application_logs_user_policy ON application_logs
  USING (
    user_id = current_setting('app.current_user_id')::text 
    OR current_setting('app.is_admin')::boolean = true
    OR type = 'SYSTEM'
  );

-- 민감한 로그는 관리자만 접근 가능
CREATE POLICY application_logs_admin_policy ON application_logs
  USING (
    current_setting('app.is_admin')::boolean = true
    AND type IN ('AUDIT', 'ADMIN', 'ERROR')
  );
```

## 타입 정의

```typescript
// 로그 타입
export type LogType = 'ACCESS' | 'AUTH' | 'AUDIT' | 'ERROR' | 'ADMIN' | 'QR_GENERATION' | 'SYSTEM'

// 로그 레벨
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

// 인증 액션 타입
export type AuthAction = 'LOGIN' | 'LOGOUT' | 'REFRESH' | 'REVOKE' | 'FAIL'

// 로그 필터링 옵션
export interface LogFilterOptions {
  userId?: string
  type?: LogType[]
  level?: LogLevel
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
  orderBy?: 'asc' | 'desc'
}

// 로그 생성 옵션
export interface CreateLogOptions {
  userId?: string
  action: string
  level?: LogLevel
  metadata?: Record<string, any>
}
```

## 성능 고려사항

### 인덱싱

모든 로그 테이블에는 적절한 인덱스가 설정되어 있습니다:

```prisma
@@index([userId, createdAt])
@@index([type, createdAt])
@@index([level, createdAt])
@@index([action, createdAt])
@@index([createdAt])
```

### 데이터 보존 정책

로그 데이터는 시간이 지남에 따라 누적되므로 적절한 보존 정책을 수립하는 것이 중요합니다:

1. **90일 이상된 API 접근 로그 자동 삭제**
2. **1년 이상된 인증 로그 아카이브**
3. **중요한 감사 로그는 장기 보존**

### 비동기 로깅

성능을 위해 로깅은 가능한 한 비동기적으로 처리되어야 합니다:

```typescript
// 메인 로직을 차단하지 않는 로깅
Promise.resolve().then(() => 
  UnifiedLogger.logAccess(logData)
).catch(console.error)
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

### 에러 로그 모니터링

- 특정 시간 내 에러 발생 빈도 모니터링
- 중요한 에러에 대한 즉시 알람 설정

### 보안 이벤트 모니터링

- 반복적인 로그인 실패 감지
- 비정상적인 API 접근 패턴 감지
- 권한 상승 시도 감지

## 추가 개선 사항

향후 추가할 수 있는 기능들:

1. **실시간 로그 스트리밍**
2. **로그 압축 및 아카이빙**
3. **분산 로깅 시스템 연동**
4. **ML 기반 이상 탐지**
5. **로그 기반 사용자 행동 분석**
6. **자동 로그 레벨 조정**
7. **성능 메트릭 기반 자동 알림**

## 주의사항

1. **개인정보 보호**: 로그에 민감한 정보(비밀번호, 토큰 등)가 포함되지 않도록 주의
2. **저장 공간**: 로그 데이터는 빠르게 증가할 수 있으므로 정기적인 정리 필요
3. **성능 영향**: 과도한 로깅은 애플리케이션 성능에 영향을 줄 수 있음
4. **법적 요구사항**: 데이터 보호 규정(GDPR 등)에 따른 로그 데이터 관리 필요

## 예제 구현

실제 사용 예제는 다음 파일들을 참고하세요:

- `lib/unified-logging.ts` - 통합 로깅 시스템
- `lib/log-utils.ts` - 레거시 로깅 함수들 (참고용)
- `app/actions/log-management.ts` - Server Actions
- `lib/logging-middleware.ts` - 미들웨어 헬퍼
- `types/logs.ts` - TypeScript 타입 정의

## 프로젝트 통계 (v1.4.31)

- **총 파일 수**: 170+ TypeScript/JavaScript 파일
- **총 패키지 수**: 100+ npm 패키지
- **UI 컴포넌트**: 46개 shadcn/ui 컴포넌트
- **지원 QR 코드 타입**: 7가지
- **로깅 시스템**: 통합 로깅 시스템 (UnifiedLogger)
- **데이터베이스**: Supabase PostgreSQL with RLS
- **인증**: NextAuth.js v5.0.0-beta.28
- **상태 관리**: Zustand v5.0.5
