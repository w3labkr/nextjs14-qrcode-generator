# RLS (Row Level Security) 설정 가이드

이 프로젝트에서는 PostgreSQL의 RLS(Row Level Security) 기능을 사용하여 사용자별 데이터 접근을 제한합니다.

## RLS란?

RLS(Row Level Security)는 PostgreSQL에서 제공하는 보안 기능으로, 테이블의 행 단위로 접근 권한을 제어할 수 있습니다. 이를 통해 사용자는 자신의 데이터만 조회하고 수정할 수 있도록 보장됩니다.

## 설정 방법

### 1. RLS 정책 활성화

다음 SQL 스크립트를 실행하여 RLS를 활성화합니다:

```bash
psql -d your_database -f prisma/migrations/enable_rls.sql
```

또는 데이터베이스 클라이언트에서 직접 실행:

```sql
-- QrCode 테이블 RLS 활성화
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- QrCode 접근 정책 생성
CREATE POLICY qr_codes_user_policy ON qr_codes
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

-- QrTemplate 테이블 RLS 활성화
ALTER TABLE qr_templates ENABLE ROW LEVEL SECURITY;

-- QrTemplate 접근 정책 생성
CREATE POLICY qr_templates_user_policy ON qr_templates
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

-- User 테이블 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- User 접근 정책 생성
CREATE POLICY users_self_policy ON users
  FOR ALL
  USING (id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (id = current_setting('app.current_user_id', true)::text);

-- Account 테이블 RLS 활성화
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Account 접근 정책 생성
CREATE POLICY accounts_user_policy ON accounts
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);

-- Session 테이블 RLS 활성화
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Session 접근 정책 생성
CREATE POLICY sessions_user_policy ON sessions
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::text)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::text);
```

### 2. 애플리케이션 코드 수정

RLS 유틸리티 함수들을 사용하여 데이터베이스 접근 시 사용자 컨텍스트를 설정합니다:

```typescript
import { withRLS, withRLSTransaction } from '@/lib/rls-utils';

// 단순 조회
const db = await withRLS(userId);
const qrCodes = await db.qrCode.findMany();

// 트랜잭션 사용
const result = await withRLSTransaction(userId, async (tx) => {
  const qrCode = await tx.qrCode.create({
    data: { ... }
  });
  return qrCode;
});
```

## RLS 유틸리티 함수

### `withRLS(userId: string)`

사용자 ID를 설정하고 RLS가 적용된 Prisma 클라이언트를 반환합니다.

```typescript
const db = await withRLS(session.user.id);
const userQrCodes = await db.qrCode.findMany(); // 사용자의 QR 코드만 조회
```

### `withRLSTransaction(userId: string, callback)`

트랜잭션 내에서 RLS를 사용합니다.

```typescript
const result = await withRLSTransaction(userId, async (tx) => {
  // 트랜잭션 내의 모든 작업은 해당 사용자의 컨텍스트에서 실행됩니다
  const qrCode = await tx.qrCode.create({ ... });
  const template = await tx.qrTemplate.update({ ... });
  return { qrCode, template };
});
```

### `testRLS(userId: string)`

RLS가 올바르게 작동하는지 테스트합니다.

```typescript
const testResult = await testRLS(userId);
console.log(testResult); // { qrCodesCount: 5, templatesCount: 3 }
```

## 보안 고려사항

1. **사용자 인증**: RLS를 사용하기 전에 반드시 사용자 인증을 확인해야 합니다.

2. **세션 관리**: 각 요청마다 올바른 사용자 ID가 설정되어야 합니다.

3. **관리자 접근**: 필요시 `withoutRLS()` 함수를 사용하여 관리자 권한으로 접근할 수 있습니다.

4. **에러 처리**: RLS 정책 위반 시 적절한 에러 메시지를 제공해야 합니다.

5. **SQL 인젝션 방지**: RLS 유틸리티 함수는 사용자 ID 검증을 통해 SQL 인젝션을 방지합니다.

6. **UUID 형식 검증**: 사용자 ID는 반드시 유효한 UUID 형식이어야 합니다.

**중요**: `$executeRawUnsafe` 사용으로 인한 보안 고려사항:

- PostgreSQL의 `SET` 명령어는 prepared statement를 지원하지 않아 `$executeRawUnsafe`를 사용해야 합니다.
- 이를 위해 엄격한 사용자 ID 검증을 통해 SQL 인젝션을 방지합니다.
- 사용자 ID는 UUID 형식으로만 허용되며, 다른 형식은 거부됩니다.

## 테스트

RLS가 올바르게 작동하는지 확인하려면:

1. 서로 다른 사용자로 로그인
2. 각 사용자의 데이터만 조회되는지 확인
3. 다른 사용자의 데이터에 접근할 수 없는지 확인

```typescript
// 사용자 A로 테스트
await testRLS('user-a-id');

// 사용자 B로 테스트
await testRLS('user-b-id');
```

## 문제 해결

### RLS 정책이 작동하지 않는 경우

1. `current_setting('app.current_user_id')` 값이 올바르게 설정되었는지 확인
2. 데이터베이스 연결이 RLS 설정을 유지하고 있는지 확인
3. 정책이 올바르게 생성되었는지 확인

### SQL 구문 오류가 발생하는 경우

`ERROR: syntax error at or near "$1"` 오류가 발생하면:

1. `$executeRaw` 대신 `$executeRawUnsafe`를 사용하고 있는지 확인
2. PostgreSQL의 `SET` 명령어는 prepared statement를 지원하지 않음
3. 사용자 ID가 올바른 UUID 형식인지 확인

### 성능 이슈

RLS는 모든 쿼리에 WHERE 절을 추가하므로 성능에 영향을 줄 수 있습니다. 필요시 인덱스를 추가하여 성능을 최적화하세요:

```sql
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX idx_qr_templates_user_id ON qr_templates(user_id);
```

## 마이그레이션 시 주의사항

1. RLS 활성화는 기존 데이터에 영향을 줄 수 있습니다.
2. 프로덕션 환경에서는 충분한 테스트 후 적용하세요.
3. 백업을 먼저 생성한 후 마이그레이션을 실행하세요.
