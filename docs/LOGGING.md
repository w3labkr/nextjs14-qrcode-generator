# 로깅 시스템 (Logging System)

이 문서는 QR 코드 생성기 프로젝트의 로깅 시스템에 대한 설명을 제공합니다.

## 개요

로깅 시스템은 애플리케이션의 다양한 활동을 추적하고 모니터링하기 위해 구현되었습니다. 총 5가지 유형의 로그를 지원합니다:

1. **API 접근 로그** (Access Logs)
2. **인증 로그** (Auth Logs)
3. **감사 로그** (Audit Logs)
4. **에러 로그** (Error Logs)
5. **관리자 활동 로그** (Admin Action Logs)

## 테이블 구조

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

## 사용법

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

## 타입 정의

```typescript
// 인증 액션 타입
export type AuthAction = 'LOGIN' | 'LOGOUT' | 'REFRESH' | 'REVOKE' | 'FAIL'

// 로그 필터링 옵션
export interface LogFilterOptions {
  userId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
  orderBy?: 'asc' | 'desc'
}

// API 접근 로그 필터링 옵션
export interface AccessLogFilterOptions extends LogFilterOptions {
  method?: string
  statusCode?: number
  path?: string
}
```

## 성능 고려사항

### 인덱싱

모든 로그 테이블에는 적절한 인덱스가 설정되어 있습니다:

```prisma
@@index([userId, createdAt])
@@index([createdAt])
@@index([tableName, createdAt]) // AuditLog 전용
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
Promise.resolve().then(() => createAccessLog(logData)).catch(console.error)
```

## 모니터링 및 알람

### 에러 로그 모니터링

- 특정 시간 내 에러 발생 빈도 모니터링
- 중요한 에러에 대한 즉시 알람 설정

### 보안 이벤트 모니터링

- 반복적인 로그인 실패 감지
- 비정상적인 API 접근 패턴 감지
- 권한 상승 시도 감지

## 주의사항

1. **개인정보 보호**: 로그에 민감한 정보(비밀번호, 토큰 등)가 포함되지 않도록 주의
2. **저장 공간**: 로그 데이터는 빠르게 증가할 수 있으므로 정기적인 정리 필요
3. **성능 영향**: 과도한 로깅은 애플리케이션 성능에 영향을 줄 수 있음
4. **법적 요구사항**: 데이터 보호 규정(GDPR 등)에 따른 로그 데이터 관리 필요

## 예제 구현

실제 사용 예제는 다음 파일들을 참고하세요:

- `lib/log-utils.ts` - 핵심 로깅 함수들
- `app/actions/log-management.ts` - Server Actions
- `lib/logging-middleware.ts` - 미들웨어 헬퍼
- `types/logs.ts` - TypeScript 타입 정의
