# TODO: 테스트 커버리지 90% 달성 계획

> **현재 상태 (2025년 7월 13일 업데이트)**
>
> - 프로젝트 버전: **v1.5.49**
> - 테스트 결과: **581개 중 557개 통과 (95.9% 성공률)** ⚠️
> - 테스트 스위트: **50개 중 46개 통과 (92% 성공률)**
> - 코드 커버리지: **27.72%**
>   - Statements: 27.72% (1184/4270)
>   - Branches: 23.56% (465/1973)
>   - Functions: 27.33% (170/622)
>   - Lines: 28.05% (1144/4077)

## 🚨 우선순위 1: 실패한 테스트 수정 (24개 실패)

### 1.1 RecentQrCodes 컴포넌트 테스트 수정 🔴 **실패**

- [ ] `__tests__/app/dashboard/dashboard/components/recent-qr-codes.test.tsx` - 3개 테스트 실패
  - **문제**: getTypeLabel 함수가 한국어 레이블을 반환하지 않고 원시 타입 값 반환
  - **증상**:
    - 화면에는 "url", "vcard", "text" 표시되지만 테스트는 "URL", "연락처", "텍스트" 찾음
    - truncateContent 함수 모킹이 호출되지 않음
  - **해결 방법**: 실제 렌더링 결과에 맞춰 테스트 수정 필요

### 1.2 QrCodeCard 컴포넌트 테스트 수정 🔴 **실패**

- [ ] `__tests__/app/dashboard/history/components/qr-code-card.test.tsx` - 1개 테스트 실패
  - **문제**: getTypeLabel 함수의 한국어 레이블 변환 문제
  - **증상**: "URL" 텍스트를 찾을 수 없음 (원시 "url" 값만 렌더링됨)
  - **해결 방법**: RecentQrCodes와 동일한 방식으로 수정 필요

### 1.3 QrcodeForm 컴포넌트 테스트 수정 � **실패**

- [ ] `__tests__/app/qrcode/components/qrcode-form.test.tsx` - 11개 테스트 실패
  - **문제 분석**:
    - `card-textarea`, `card-location`, `card-vcard` 등 testId 누락
    - 탭 상태 전환 로직 문제 (data-state="active" 변경 안됨)
    - 폼 제출 핸들러 동작 오류
  - **해결 방법**: 실제 컴포넌트에 data-testid 속성 추가 필요

### 1.4 SearchAndFilters 컴포넌트 테스트 수정 🔴 **실패**

- [ ] `__tests__/app/dashboard/history/components/search-and-filters.test.tsx` - 9개 테스트 실패
  - **문제**: 컴포넌트 렌더링 및 필터링 로직 테스트 실패
  - **상세 분석 필요**: 실패 원인 파악 및 수정 방안 도출

### 1.5 모킹 시스템 개선 🔧

- [ ] `getTypeLabel` 함수 모킹 표준화
  - 한국어 레이블 vs 원시 타입 값 일관성 문제 해결
  - 모든 관련 테스트 파일에 동일한 모킹 전략 적용
- [ ] 컴포넌트별 data-testid 속성 추가
- [ ] Next.js, NextAuth, Prisma 모킹 개선

## 📊 우선순위 2: 커버리지 확장 - 핵심 영역 우선 개선 (현재 27.72%)

### 2.1 라이브러리 함수 테스트 확장 - 0% 영역 우선

- [ ] `app/` 디렉토리 테스트 추가 (현재 0%)
  - `app/layout.tsx`, `app/page.tsx`, `app/error.tsx` 테스트
  - App Router 및 레이아웃 컴포넌트 기능 검증
- [ ] `lib/auth-server.ts` 테스트 추가 (현재 0%)
  - 서버 사이드 인증 로직 테스트
  - NextAuth.js와의 통합 테스트
- [ ] `lib/log-utils.ts` 테스트 추가 (현재 추정 낮음)
  - 로그 유틸리티 함수들 테스트
  - 로그 포맷팅, 필터링 기능 검증
- [ ] `lib/log-cleanup.ts` 테스트 추가 (현재 추정 낮음)
  - 로그 정리 로직 테스트
  - 배치 작업 및 스케줄링 테스트
- [ ] `lib/unified-logging.ts` 테스트 확장 (현재 추정 낮음)
  - 통합 로깅 시스템 완전 테스트
  - 다양한 로그 레벨 및 타입 검증

### 2.2 Server Actions 테스트 확장 (현재 48.08%)

- [ ] `app/actions/qr-code.ts` 테스트 추가
  - QR 코드 CRUD 작업 테스트
  - 복잡한 비즈니스 로직 검증
- [ ] 기존 Server Actions 테스트 커버리지 확장
  - 에러 시나리오 추가
  - 권한 검증 로직 강화
  - 입력 유효성 검사 강화

### 2.3 API Routes 테스트 확장 (상대적으로 양호)

- [ ] 기존 API 테스트의 에지 케이스 추가
  - 잘못된 요청 처리
  - 권한 없는 접근 처리
  - 대용량 데이터 처리
- [ ] 새로운 API 엔드포인트 테스트 추가

## 🧩 우선순위 3: 컴포넌트 테스트 확장

### 3.1 누락된 컴포넌트 테스트 추가

- [ ] `app/dashboard/account/components/profile-form.tsx` 테스트 추가
  - 프로필 수정 폼
  - 유효성 검증 및 제출 처리
- [ ] `app/dashboard/admin/` 하위 컴포넌트들
  - 관리자 페이지 컴포넌트들
  - 시스템 로그 관리 기능

### 3.2 인증 관련 컴포넌트 테스트

- [ ] `app/auth/signin/components/` 하위 컴포넌트들
  - Google, GitHub 로그인 버튼
  - Remember Me 체크박스
  - 로그인 폼 통합 테스트

### 3.3 공통 컴포넌트 테스트

- [ ] `components/user-nav.tsx` 테스트 추가
  - 사용자 네비게이션 메뉴
  - 로그아웃 기능 테스트
- [ ] `components/address-search.tsx` 테스트 추가
  - 주소 검색 API 통합
  - 검색 결과 처리
- [ ] `components/loading-spinner.tsx` 테스트 추가
  - 로딩 상태 표시
  - 접근성 기능 검증

## ⚙️ 우선순위 4: 유틸리티 및 고급 기능 테스트

### 4.1 RLS (Row Level Security) 테스트

- [ ] `lib/rls-manager.ts` 테스트 추가
  - RLS 정책 관리 로직
  - 권한 검증 및 데이터 접근 제어
- [ ] `lib/rls-utils.ts` 테스트 확장
  - RLS 유틸리티 함수 완전 커버리지
  - 복잡한 권한 시나리오 테스트

### 4.2 CSV 및 데이터 처리 테스트

- [ ] `lib/csv-utils.ts` 테스트 확장
  - 대용량 CSV 처리
  - 다양한 데이터 포맷 지원

### 4.3 환경 설정 및 구성 테스트

- [ ] `lib/env-validation.ts` 테스트 확장
  - 환경 변수 유효성 검증
  - 다양한 환경별 설정 테스트

## 🎯 우선순위 5: 커스텀 훅 및 상태 관리 테스트

### 5.1 새로운 훅 테스트 추가

- [ ] `hooks/use-remember-me.ts` 테스트 추가
  - 쿠키 기반 로그인 상태 유지
  - 세션 관리 로직
- [ ] `hooks/use-token-refresh.ts` 테스트 추가
  - 자동 토큰 갱신 로직
  - 만료 처리 및 재인증

### 5.2 기존 훅 테스트 확장

- [ ] `hooks/use-mobile.tsx` 테스트 확장
  - 반응형 브레이크포인트 테스트
  - 디바이스 변경 시나리오

## 📋 우선순위 6: 통합 테스트 및 E2E 시나리오

### 6.1 사용자 플로우 통합 테스트

- [ ] QR 코드 생성 → 저장 → 대시보드 조회 전체 플로우
- [ ] 사용자 가입 → 로그인 → 프로필 수정 플로우
- [ ] 관리자 로그인 → 로그 관리 → 시스템 관리 플로우

### 6.2 에러 시나리오 및 복구 테스트

- [ ] 네트워크 오류 시 사용자 경험
- [ ] 데이터베이스 연결 실패 처리
- [ ] 권한 없는 접근 및 보안 테스트

## 🛠️ 테스트 인프라 개선

### 6.1 Jest 설정 최적화

- [ ] `jest.config.js` 커버리지 임계값을 단계적으로 상향 조정
  - 현재: 27.72% → 1단계: 40% → 2단계: 60% → 3단계: 80% → 최종: 90%
- [ ] 테스트 성능 최적화 (병렬 실행, 캐싱)
- [ ] 플레이키 테스트 안정화

### 6.2 모킹 전략 개선

- [ ] `__mocks__` 디렉토리 구조 최적화
- [ ] 공통 모킹 유틸리티 함수 생성 (`getTypeLabel`, `prisma`, `next-auth` 등)
- [ ] 데이터베이스 모킹 전략 표준화

### 6.3 CI/CD 통합

- [ ] GitHub Actions에 테스트 커버리지 체크 추가
- [ ] PR에 커버리지 리포트 자동 코멘트 추가
- [ ] 커버리지 배지 README에 추가

## 📊 진행 상황 추적

### 마일스톤

- [ ] **마일스톤 1**: 실패한 테스트 모두 수정 (목표: 100% 통과) � **진행중**
- [ ] **마일스톤 2**: 커버리지 40% 달성 (핵심 Server Actions + 0% 영역 개선)
- [ ] **마일스톤 3**: 커버리지 60% 달성 (컴포넌트 테스트 추가)
- [ ] **마일스톤 4**: 커버리지 80% 달성 (유틸리티 함수 테스트 추가)
- [ ] **마일스톤 5**: 커버리지 90% 달성 (통합 테스트 및 에지 케이스)

### 주간 목표

- [ ] **1주차**: 실패한 테스트 수정 완료 (50개 스위트 모두 통과)
- [ ] **2주차**: 0% 커버리지 영역 집중 개선 (커버리지 40%+)
- [ ] **3주차**: 누락된 컴포넌트 테스트 추가 (커버리지 60%+)
- [ ] **4주차**: RLS 및 로깅 시스템 테스트 추가 (커버리지 75%+)
- [ ] **5주차**: 통합 테스트 및 에지 케이스 추가 (커버리지 85%+)
- [ ] **6주차**: 최종 최적화 및 90% 커버리지 달성

## 📝 참고사항

### TDD 접근 방식

모든 새로운 기능 개발 시:

1. **Red**: 실패하는 테스트 먼저 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 개선 (테스트는 계속 통과)

### 커버리지 품질 기준

- **Statements**: 90% 이상
- **Branches**: 90% 이상
- **Functions**: 90% 이상
- **Lines**: 90% 이상

### 테스트 작성 우선순위

1. **현재 0% 커버리지 영역** (최우선)
2. 비즈니스 로직이 복잡한 함수
3. 외부 API와 상호작용하는 함수
4. 사용자 인터랙션이 중요한 컴포넌트
5. 에러 처리 로직
6. 엣지 케이스 및 경계 조건

### 현재 완료된 테스트 영역

**API Routes (상대적으로 양호)**:

- `app/api/qrcodes/**` - QR 코드 CRUD API
- `app/api/admin/**` - 관리자 기능 API
- `app/api/auth/refresh` - 토큰 갱신 API
- `app/api/cron/**` - 크론잡 API

**Server Actions (48.08% 완료)**:

- `app/actions/account-management.ts` - 계정 관리
- `app/actions/data-management.ts` - 데이터 관리
- `app/actions/log-management.ts` - 로그 관리
- `app/actions/qr-code-generator.ts` - QR 코드 생성
- `app/actions/qr-code-management.ts` - QR 코드 관리

**QR 코드 컴포넌트 (대부분 완료)**:

- `app/qrcode/components/card-*.tsx` - 모든 QR 코드 타입 컴포넌트
- `app/qrcode/components/qrcode-form.tsx` - 메인 폼 컴포넌트 (테스트 수정 필요)

**대시보드 컴포넌트 (일부 완료, 수정 필요)**:

- `app/dashboard/dashboard/components/*.tsx` - 통계 및 최근 QR 코드 (테스트 수정 필요)

**유틸리티 함수 (일부 완료)**:

- `lib/constants.ts` - 완료
- `lib/utils.ts` - 부분 완료
- `lib/auth-helpers.ts` - 완료
- `lib/auth-utils.ts` - 완료
- `lib/env-validation.ts` - 완료
- `config/app.ts` - 완료

**UI 컴포넌트 (대부분 완료)**:

- 48개 shadcn/ui 컴포넌트 중 대부분 테스트 완료

**커스텀 훅 (일부 완료)**:

- `hooks/use-mobile.tsx` - 기본 테스트 완료
- `hooks/use-toast.ts` - 완료
