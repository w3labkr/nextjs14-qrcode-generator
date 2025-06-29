# Jest 테스트 가이드

이 문서는 Next.js 14 QR 코드 생성기 프로젝트의 Jest 테스트 환경과 작성된 테스트들에 대한 가이드입니다.

## 테스트 환경 설정

### 설치된 패키지

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest ts-jest
```

### 주요 설정 파일

- **`jest.config.js`**: Jest 설정 파일
- **`jest.setup.ts`**: 테스트 환경 초기화 및 모킹 설정
- **`tsconfig.json`**: Jest 타입 정의 포함

## 최신 테스트 결과 리포트 (2025년 6월 30일)

### 전체 테스트 현황

- **총 테스트 스위트**: 20개 (통과: 17개, 실패: 3개)
- **총 테스트 케이스**: 173개 (통과: 163개, 실패: 10개)
- **성공률**: 94.2%

### 커버리지 현황

- **Statements (명령문)**: 9.65%
- **Branches (분기)**: 8.62%
- **Functions (함수)**: 7.39%
- **Lines (라인)**: 9.81%

### 영역별 테스트 상태

#### ✅ 완전히 통과하는 영역 (17개 스위트)

1. **UI 컴포넌트 (9개)**
   - `components/ui/button.test.tsx`: 100% 통과
   - `components/ui/input.test.tsx`: 100% 통과
   - `components/ui/textarea.test.tsx`: 100% 통과
   - `components/ui/select.test.tsx`: 100% 통과
   - `components/ui/checkbox.test.tsx`: 100% 통과
   - `components/ui/dialog.test.tsx`: 100% 통과
   - `components/ui/form.test.tsx`: 100% 통과
   - `components/ui/card.test.tsx`: 100% 통과
   - `components/ui/badge.test.tsx`: 100% 통과
   - `components/ui/label.test.tsx`: 100% 통과

2. **커스텀 Hook (2개)**
   - `hooks/use-mobile.test.tsx`: 100% 통과
   - `hooks/use-toast.test.tsx`: 100% 통과

3. **유틸리티 함수 (6개)**
   - `lib/utils.test.ts`: 100% 통과
   - `lib/constants.test.ts`: 100% 통과
   - `lib/qr-utils.test.ts`: 100% 통과
   - `lib/csv-utils.test.ts`: 100% 통과
   - `lib/download-utils.test.ts`: 100% 통과

#### ❌ 일부 실패하는 영역 (3개 스위트)

1. **QR 코드 생성 액션** (`__tests__/actions/qr-code-generator.test.ts`)
   - **통과**: 8/10 (80%)
   - **실패 원인**: 
     - User ID 형식 검증 (CUID/UUID) 실패
     - Prisma 트랜잭션 Mock 불완전
   - **실패 테스트**:
     - `generateAndSaveQrCode › QR 코드를 생성하고 저장해야 한다`
     - `generateAndSaveQrCode › 저장 중 오류 발생 시 적절한 에러를 반환해야 한다`

2. **QR 코드 관리 액션** (`__tests__/actions/qr-code-management.test.ts`)
   - **통과**: 0/5 (0%)
   - **실패 원인**:
     - User ID 형식 검증 (CUID/UUID) 실패
     - Prisma Mock 불완전 (groupBy, count 메서드 누락)
     - Unified Logging Mock 불완전
   - **실패 테스트**:
     - `getUserQrCodes › 인증된 사용자의 QR 코드 목록을 반환해야 한다`
     - `toggleQrCodeFavorite › QR 코드 즐겨찾기 상태를 토글해야 한다`
     - `deleteQrCode › QR 코드를 삭제해야 한다`
     - `clearQrCodeHistory › 사용자의 모든 QR 코드를 삭제해야 한다`
     - `getQrCodeStats › QR 코드 통계를 반환해야 한다`

3. **API 라우트** (`__tests__/api/qrcodes.test.ts`)
   - **통과**: 1/4 (25%)
   - **실패 원인**:
     - User ID 형식 검증 (CUID/UUID) 실패
     - RLS (Row Level Security) Mock 불완전
   - **실패 테스트**:
     - `GET /api/qrcodes › 인증된 사용자의 QR 코드 목록을 반환해야 한다`
     - `GET /api/qrcodes › 검색 파라미터로 필터링해야 한다`
     - `GET /api/qrcodes › 페이지네이션이 올바르게 작동해야 한다`

### 주요 성과

1. **UI 컴포넌트 테스트 안정화**: Radix UI와 jsdom 호환성 문제 해결
2. **Hook 테스트 완성**: 모든 커스텀 Hook 100% 테스트 통과
3. **유틸리티 테스트 완성**: 모든 유틸리티 함수 100% 테스트 통과
4. **Mock 인프라 구축**: 기본적인 Mock 시스템 구축 완료

### 남은 과제

#### 높은 우선순위
1. **User ID 검증 우회**: 테스트 환경에서 CUID/UUID 검증 Mock 개선
2. **Prisma Mock 완성**: 모든 필요한 Prisma 메서드 Mock 구현
3. **Unified Logging Mock 완성**: 로깅 시스템 Mock 개선
4. **RLS Mock 완성**: Row Level Security Mock 구현

#### 중간 우선순위
1. **비즈니스 로직 커버리지 향상**: 현재 ~10%에서 50% 이상으로 개선
2. **추가 테스트 작성**: 미테스트 비즈니스 로직 테스트 추가
3. **통합 테스트 추가**: E2E 시나리오 테스트 구현

#### 낮은 우선순위
1. **성능 테스트**: QR 코드 생성 성능 테스트
2. **접근성 테스트**: UI 컴포넌트 접근성 테스트 확장
3. **시각적 회귀 테스트**: 스크린샷 테스트 도입

## 작성된 테스트

### 1. UI 컴포넌트 테스트

#### Button 컴포넌트 (`__tests__/components/button.test.tsx`)
- ✅ 기본 렌더링 테스트
- ✅ Variant 스타일 적용 테스트 (destructive, outline, ghost)
- ✅ Size 스타일 적용 테스트 (sm, lg, icon)
- ✅ 클릭 이벤트 처리 테스트
- ✅ Disabled 상태 테스트
- ✅ 커스텀 className 적용 테스트
- ✅ asChild prop 테스트

#### Input 컴포넌트 (`__tests__/components/input.test.tsx`)
- ✅ 기본 렌더링 테스트
- ✅ 다양한 type 속성 테스트 (email, password, number)
- ✅ 사용자 입력 처리 테스트
- ✅ Disabled 상태 테스트
- ✅ 커스텀 className 적용 테스트
- ✅ Ref 전달 테스트
- ✅ HTML 속성 전달 테스트
- ✅ Focus/blur 이벤트 테스트

#### Textarea 컴포넌트 (`__tests__/components/textarea.test.tsx`)
- ✅ 기본 렌더링 테스트
- ✅ 사용자 입력 처리 테스트
- ✅ Disabled 상태 테스트
- ✅ 커스텀 className 적용 테스트
- ✅ Ref 전달 테스트
- ✅ HTML 속성 전달 테스트
- ✅ Focus/blur 이벤트 테스트
- ✅ 여러 줄 텍스트 처리 테스트

#### Select 컴포넌트 (`__tests__/components/select.test.tsx`)
- ✅ 기본 렌더링 테스트
- ✅ 옵션 선택 테스트
- ✅ Disabled 상태 테스트
- ✅ 커스텀 className 적용 테스트
- ✅ 플레이스홀더 테스트

#### Checkbox 컴포넌트 (`__tests__/components/checkbox.test.tsx`)
- ✅ 기본 렌더링 테스트
- ✅ 체크/언체크 상태 테스트
- ✅ Disabled 상태 테스트
- ✅ 커스텀 className 적용 테스트

#### Dialog 컴포넌트 (`__tests__/components/dialog.test.tsx`)
- ✅ 기본 렌더링 테스트
- ✅ 열기/닫기 동작 테스트
- ✅ ESC 키 닫기 테스트 (jsdom 제한으로 스킵)
- ✅ 커스텀 className 적용 테스트

#### Form 컴포넌트 (`__tests__/components/form.test.tsx`)
- ✅ 기본 렌더링 테스트
- ✅ 필드 검증 테스트
- ✅ 에러 메시지 표시 테스트
- ✅ 폼 제출 테스트

#### Card 컴포넌트 (`__tests__/components/card.test.tsx`)
- ✅ 기본 렌더링 테스트
- ✅ 모든 하위 컴포넌트 테스트 (Header, Content, Footer)
- ✅ 커스텀 className 적용 테스트

#### Badge 컴포넌트 (`__tests__/components/badge.test.tsx`)
- ✅ 기본 렌더링 테스트
- ✅ Variant 스타일 테스트 (secondary, destructive, outline)
- ✅ 커스텀 className 적용 테스트

#### Label 컴포넌트 (`__tests__/components/label.test.tsx`)
- ✅ 기본 렌더링 테스트
- ✅ htmlFor 속성 테스트
- ✅ 커스텀 className 적용 테스트

### 2. 유틸리티 함수 테스트

#### Utils 라이브러리 (`__tests__/lib/utils.test.ts`)
- ✅ `cn` 함수 - 클래스 이름 병합 테스트
- ✅ 조건부 클래스 처리 테스트
- ✅ Tailwind 클래스 중복 병합 테스트
- ✅ null/undefined 처리 테스트
- ✅ 객체/배열 형태 클래스 처리 테스트

#### 상수 라이브러리 (`__tests__/lib/constants.test.ts`)
- ✅ QR_CODE_TYPES 상수 정의 확인
- ✅ 각 타입별 필수 속성 검증
- ✅ 개별 QR 코드 타입별 상세 속성 테스트

#### QR 유틸리티 (`__tests__/lib/qr-utils.test.ts`)
- ✅ QR 코드 텍스트 검증 함수
- ✅ QR 코드 타입 추론 함수 (URL, email, Wi-Fi, location, SMS)
- ✅ QR 코드 옵션 검증 함수

#### CSV 유틸리티 (`__tests__/lib/csv-utils.test.ts`)
- ✅ CSV 파싱 함수
- ✅ CSV 생성 함수
- ✅ 에러 처리 테스트
- ✅ 특수 문자 처리 테스트

#### 다운로드 유틸리티 (`__tests__/lib/download-utils.test.ts`)
- ✅ 파일 다운로드 유틸리티
- ✅ QR 설정 파싱 함수
- ✅ 에러 처리 테스트

### 3. 커스텀 Hook 테스트

#### useIsMobile Hook (`__tests__/hooks/use-mobile.test.tsx`)
- ✅ 데스크톱/모바일 화면 크기 감지 테스트
- ✅ 768px 경계값 테스트
- ✅ matchMedia API 모킹 및 호출 확인
- ✅ 컴포넌트 언마운트 시 이벤트 리스너 제거 테스트

#### useToast Hook (`__tests__/hooks/use-toast.test.tsx`)
- ✅ 토스트 추가/제거 테스트
- ✅ 타이머 기반 자동 제거 테스트
- ✅ 다양한 토스트 타입 테스트

### 4. 비즈니스 로직 테스트 (부분 완료)

#### QR 코드 생성 (`__tests__/actions/qr-code-generator.test.ts`)
- ✅ 기본 QR 코드 생성 (PNG/SVG) - 8/10 통과
- ❌ 저장 기능 - User ID 검증 이슈
- ✅ 에러 처리 (빈 텍스트, 잘못된 크기)
- ✅ 옵션 적용 (색상, 마진 등)

#### QR 코드 관리 (`__tests__/actions/qr-code-management.test.ts`)
- ❌ 모든 테스트 실패 - Mock 이슈
- 구현된 테스트: 목록 조회, 즐겨찾기, 삭제, 통계

#### API 라우트 (`__tests__/api/qrcodes.test.ts`)
- ❌ 대부분 실패 - RLS Mock 이슈
- 구현된 테스트: GET 요청, 필터링, 페이지네이션

## 테스트 실행 명령어

```bash
# 모든 테스트 실행
npm test

# 워치 모드로 테스트 실행
npm run test:watch

# 커버리지 포함 테스트 실행
npm run test:coverage

# CI 환경용 테스트 실행
npm run test:ci

# 특정 테스트 파일만 실행
npm test -- --testPathPatterns=button.test.tsx

# 특정 테스트 이름 패턴으로 실행
npm test -- --testNamePattern="QR Code Generator"
```

## 모킹 설정

### jest.setup.ts에서 설정된 모킹

1. **Next.js 모킹**
   - `next/navigation`: useRouter, useSearchParams, usePathname
   - `next/image`: 간단한 img 태그로 모킹
   - `next/headers`: headers 함수 모킹

2. **인증 모킹**
   - `@/auth`: NextAuth 관련 함수들
   - 세션 및 사용자 정보 모킹

3. **브라우저 API 모킹**
   - `window.matchMedia`: 반응형 디자인 테스트용
   - Canvas 관련 API: QR 코드 생성 테스트용
   - DOM API 폴리필: Radix UI 호환성

4. **데이터베이스 모킹**
   - Prisma 클라이언트 기본 모킹
   - RLS (Row Level Security) 함수 모킹

5. **로깅 시스템 모킹**
   - Unified Logging 모킹
   - 에러 로깅 억제

## 테스트 작성 가이드라인

1. **명확한 테스트 이름**: 한국어로 "~해야 한다" 형식 사용
2. **독립적인 테스트**: 각 테스트는 다른 테스트에 의존하지 않음
3. **모킹 활용**: 외부 의존성은 적절히 모킹
4. **사용자 관점**: 실제 사용자 행동을 시뮬레이션
5. **예외 상황**: 에러 케이스와 엣지 케이스도 테스트

## 디버깅 팁

1. **테스트 실패 시**: `screen.debug()`를 사용해 DOM 구조 확인
2. **비동기 테스트**: `await`와 `waitFor` 적절히 사용
3. **이벤트 테스트**: `userEvent`를 `fireEvent`보다 우선 사용
4. **모킹 확인**: `jest.fn()`의 호출 횟수와 인자 검증

## 작업 진행 상황 (2025년 6월 30일)

### 🔧 현재 진행 중인 작업

Mock 시스템 개선을 통한 비즈니스 로직 테스트 안정화 작업 중

#### 완료된 개선사항

1. **Mock 파일 구조 정리**
   - `__tests__/__mocks__/` 디렉토리의 TypeScript 모킹 파일 업데이트
   - `__mocks__/@/lib/` 디렉토리의 JavaScript 모킹 파일 업데이트
   - 일관된 Mock 인터페이스 구현

2. **RLS (Row Level Security) Mock 개선**
   - `validateUserId` 함수 Mock에서 User ID 검증 완전 우회 구현
   - `withRLS`, `withRLSTransaction` 등 모든 RLS 함수 비동기 처리 개선
   - 콜백 함수 실행 보장

3. **Prisma Mock 확장**
   - `groupBy` 메소드 추가로 통계 쿼리 지원
   - `$transaction` 메소드 추가로 트랜잭션 처리 지원
   - `logEntry` 모델 추가로 로깅 지원
   - 모든 메소드에 기본 resolved 값 설정

4. **Unified Logging Mock 완성**
   - `UnifiedLogging` 클래스 구조 완전 구현
   - 모든 로그 타입 (API, AUTH, AUDIT, ERROR, QR_GENERATION) 지원
   - 테스트 환경에서 로그 에러 완전 억제

#### 수정된 파일 목록

```text
__tests__/__mocks__/
├── prisma.ts          # ✅ groupBy, $transaction, logEntry 추가
├── rls-utils.ts       # ✅ 비동기 처리 및 User ID 검증 우회
└── unified-logging.ts # ✅ 완전한 UnifiedLogging 클래스 구현

__mocks__/@/lib/
├── rls-utils.js       # ✅ validateUserId 함수 Mock 추가
└── unified-logging.js # ✅ UnifiedLogging 클래스 추가

테스트 파일 (사용자 수정)
├── qr-code-management.test.ts # 🔄 진행 중
├── qr-code-generator.test.ts  # 🔄 진행 중
└── qrcodes.test.ts           # 🔄 진행 중
```

### 🔍 다음 작업 계획

#### 즉시 해결해야 할 이슈

1. **User ID 검증 Mock 완성**
   - 테스트에서 사용되는 TEST_USER_ID의 유효한 CUID/UUID 형식 보장
   - RLS Mock이 실제로 검증을 우회하는지 확인
   - `validateUserId` 호출 체인 추적 및 완전 Mock 처리

2. **Prisma Mock 동작 검증**
   - 모든 Prisma 메소드가 적절한 Mock 데이터 반환하는지 확인
   - 특히 `count`, `groupBy`, `$transaction` 메소드 동작 확인
   - 테스트별 Mock 반환값 설정

3. **테스트 데이터 정리**
   - Mock 함수들이 실제 테스트에서 기대하는 형태의 데이터 반환하도록 설정
   - 각 테스트 케이스별 Mock 설정 검토

#### 단기 목표 (다음 세션)

1. **비즈니스 로직 테스트 100% 통과**
   - QR 코드 생성 액션: 8/10 → 10/10
   - QR 코드 관리 액션: 0/5 → 5/5  
   - API 라우트: 1/4 → 4/4

2. **커버리지 개선**
   - 현재 ~10% → 25% 이상 목표
   - 비즈니스 로직 커버리지 크게 향상 예상

3. **Mock 시스템 안정화**
   - 모든 Mock이 일관되게 동작하도록 보장
   - 테스트 간 Mock 상태 격리 확인

#### 중기 목표 (1-2주)

1. **전체 커버리지 50% 달성**
2. **추가 컴포넌트 테스트 작성**
3. **Integration 테스트 도입**

#### 장기 목표 (1개월)

1. **전체 커버리지 80% 달성**
2. **E2E 테스트 환경 구축**
3. **성능 및 접근성 테스트 추가**

### 🚨 알려진 이슈 및 해결 방안

#### 현재 실패하는 테스트들

1. **QR 코드 관리 (5개 실패)**

   ```text
   Error: Invalid user ID format: must be CUID or UUID
   ```

   - **원인**: RLS Mock이 아직 완전히 우회되지 않음
   - **해결 방안**: `validateUserId` Mock 호출 체인 완전 차단

2. **QR 코드 생성 (2개 실패)**

   ```text
   Error: Cannot read properties of undefined (reading 'create')
   ```

   - **원인**: Prisma Mock의 트랜잭션 처리 미완성
   - **해결 방안**: `$transaction` Mock 개선

3. **API 라우트 (3개 실패)**

   ```text
   Error: Invalid user ID format: must be CUID or UUID
   ```

   - **원인**: RLS Mock 우회 미완성
   - **해결 방안**: API 레벨 RLS Mock 개선

### 📋 체크리스트 (다음 세션용)

#### 필수 확인 사항

- [ ] RLS Mock이 `validateUserId` 완전 우회하는지 확인
- [ ] Prisma Mock의 모든 메소드가 적절한 값 반환하는지 확인
- [ ] Unified Logging Mock이 에러 없이 동작하는지 확인
- [ ] TEST_USER_ID가 유효한 CUID 형식인지 확인

#### 다음 세션 테스트 실행 명령어

```bash
# 실패하는 테스트만 실행
npm test -- __tests__/actions/qr-code-management.test.ts
npm test -- __tests__/actions/qr-code-generator.test.ts
npm test -- __tests__/api/qrcodes.test.ts

# 커버리지 포함 전체 테스트
npm test -- --coverage --passWithNoTests
```

## 커버리지 목표

- **현재**: 9.65% (UI 컴포넌트, Hook, 유틸리티는 거의 100%)
- **다음 세션 목표**: 25% 이상 (비즈니스 로직 Mock 완성 후)
- **단기 목표**: 50% 이상 (비즈니스 로직 포함)
- **장기 목표**: 80% 이상 (전체 애플리케이션)

---

**최종 업데이트**: 2025년 6월 30일 (Mock 개선 작업 진행 중)  
**테스트 성공률**: 94.2% (163/173) - Mock 완성 후 99% 이상 예상  
**주요 성과**: UI 컴포넌트 및 유틸리티 테스트 완성, Mock 인프라 대폭 개선  
**다음 작업**: User ID 검증 Mock 완성 → 비즈니스 로직 테스트 안정화
