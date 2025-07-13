# TODO: 테스트 커버리지 90% 달성 계획

> **현재 상태 (2025년 1월 7일 기준)**
>
> - 테스트 커버리지: **12.95%** (목표: 90%)
>   - Statements: 12.95%
>   - Branches: 13.07%
>   - Functions: 11.57%
>   - Lines: 13.07%
> - 테스트 스위트: **29개 (모두 통과)** ✅
> - 테스트 케이스: **331개 (모두 통과)** ✅

## 🚨 우선순위 1: 실패한 테스트 수정

### 1.1 실패한 테스트 스위트 수정 ✅ **완료** (2024-12-19)

- [x] `__tests__/api/qrcodes.test.ts` - 기본 API 테스트 추가 완료 (2024-12-19 수정)
  - RLS 유틸리티의 CUID/UUID 검증 로직 수정
  - 테스트용 유효한 User ID 생성
  - Prisma 모킹 방식 개선으로 API 라우트 테스트 통과
- [x] `__tests__/actions/qr-code-generator.test.ts` - 로깅 시스템 모킹 오류 수정 (10/10 테스트 통과) ✅
  - Prisma 트랜잭션 모킹 개선
  - generateAndSaveQrCode 함수 반환 형태 표준화
  - 모든 QR 코드 생성 기능 테스트 통과
- [x] `__tests__/actions/qr-code-management.test.ts` - QR 코드 관리 액션 테스트 (5/5 테스트 통과) ✅
  - RLS 트랜잭션 모킹 완전 수정
  - 모든 CRUD 작업 테스트 통과
- [x] `__tests__/lib/constants.test.ts` - 100% 커버리지 달성 (2024-12-19 완료)
  - QR_CODE_TYPES, QR_CODE_TYPE_VALUES, GITHUB_REPO_URL, COPYRIGHT_TEXT 모든 상수 검증
  - 15개 테스트 케이스로 완전한 검증 구현

**결과**: 전체 26개 테스트 스위트, 298개 테스트 케이스 모두 통과 🎉
- [x] `__tests__/lib/utils.test.ts` - 88.05% 커버리지 달성 (2024-12-19 완료)
  - cn, inferQrCodeType, truncateContent, getTypeLabel, getTypeColor, getContentPreview, getQrCodeColor 함수 테스트
  - 41개 테스트 케이스로 유틸리티 함수 완전 검증
  - 10.44% → 88.05% 커버리지 대폭 향상
- [x] `__tests__/config/app.test.ts` - 신규 파일 생성 (2024-12-19 완료)
  - appConfig 객체의 모든 설정 속성 검증
  - 17개 테스트 케이스로 세션, 토큰, URL 설정 완전 검증
- [x] `__tests__/lib/auth-helpers.test.ts` - 신규 파일 생성 (2024-12-19 완료)
  - getAuthStatus 함수 100% 커버리지 달성
  - 10개 테스트 케이스로 인증 상태 검증 완전 구현
- [x] `__tests__/lib/auth-utils.test.ts` - 신규 파일 생성 (2024-12-19 완료)
  - setRememberMeCookie, getRememberMeCookie 함수 100% 커버리지 달성
  - 16개 테스트 케이스로 쿠키 관리 유틸리티 완전 검증
- [x] `__tests__/lib/env-validation.test.ts` - 신규 파일 생성 (2024-12-19 완료)
  - getAdminEmails, getLogLevel, getLogRetentionDays 함수 100% 커버리지 달성
  - 28개 테스트 케이스로 환경 변수 검증 유틸리티 완전 검증

## 📊 우선순위 2: 커버리지가 낮은 핵심 영역 개선

### 2.1 쉬운 라이브러리 함수 테스트 확장 (완료 영역)

- [x] `lib/constants.ts` - 100% 커버리지 달성 (2024-12-19 완료)
- [x] `lib/utils.ts` - 88.05% 커버리지 달성 (2024-12-19 완료)

### 2.2 Server Actions 테스트 확장 (현재: ~30%)

- [x] `app/actions/account-management.ts` 테스트 추가 (2025-07-13 완료)
  - 계정 정보 업데이트 함수
  - 계정 삭제 함수
  - OAuth 연결/해제 함수
  - 7개 테스트 케이스로 계정 관리 기능 완전 검증
- [x] `app/actions/data-management.ts` 테스트 추가 (2025-07-13 완료)
  - 데이터 내보내기 함수 (exportUserData)
  - 데이터 가져오기 함수 (importUserData)  
  - 8개 테스트 케이스로 데이터 관리 기능 완전 검증
- [x] `app/actions/log-management.ts` 테스트 추가 (2025-07-13 완료)
  - 로그 생성 함수들 (Access, Auth, Audit, Error, Admin, QR)
  - 로그 조회 함수 (getLogsAction)
  - 로그 통계 함수 (getLogStatsAction)
  - 로그 정리 함수 (cleanupOldLogsAction)
  - 18개 테스트 케이스로 로그 관리 기능 완전 검증

### 2.2 API Routes 테스트 확장 (현재: ~50%)

- [ ] `app/api/qrcodes/[id]/route.ts` 테스트 추가
  - GET: QR 코드 상세 조회
  - PUT: QR 코드 수정
  - DELETE: QR 코드 삭제
- [ ] `app/api/qrcodes/[id]/favorite/route.ts` 테스트 추가
  - POST: 즐겨찾기 추가
  - DELETE: 즐겨찾기 제거
- [ ] `app/api/qrcodes/generate/route.ts` 테스트 추가
  - POST: QR 코드 생성 및 반환
- [ ] `app/api/admin/**` 테스트 추가
  - 관리자 권한 확인
  - 로그 관리 API
  - 시스템 상태 확인

### 2.3 인증 관련 API 테스트 추가

- [ ] `app/api/auth/refresh/route.ts` 테스트 추가
  - 토큰 갱신 로직
  - 만료된 토큰 처리
- [ ] `app/api/cron/**` 테스트 추가
  - Keep-alive 엔드포인트
  - 로그 정리 크론 작업

## 🧩 우선순위 3: 컴포넌트 테스트 확장

### 3.1 QR 코드 생성 컴포넌트 테스트

- [ ] `app/qrcode/components/card-email.tsx` 테스트 추가
- [ ] `app/qrcode/components/card-location.tsx` 테스트 추가
- [ ] `app/qrcode/components/card-sms.tsx` 테스트 추가
- [ ] `app/qrcode/components/card-vcard.tsx` 테스트 추가
- [ ] `app/qrcode/components/card-wifi.tsx` 테스트 추가
- [ ] `app/qrcode/components/card-style.tsx` 테스트 추가
- [ ] `app/qrcode/components/card-preview.tsx` 테스트 추가
- [ ] `app/qrcode/components/qrcode-form.tsx` 테스트 추가

### 3.2 대시보드 컴포넌트 테스트

- [ ] `app/dashboard/dashboard/components/stats-cards.tsx` 테스트 추가
- [ ] `app/dashboard/dashboard/components/recent-qr-codes.tsx` 테스트 추가
- [ ] `app/dashboard/history/components/qr-code-card.tsx` 테스트 추가
- [ ] `app/dashboard/history/components/search-and-filters.tsx` 테스트 추가
- [ ] `app/dashboard/account/components/profile-form.tsx` 테스트 추가

### 3.3 인증 컴포넌트 테스트

- [ ] `app/auth/signin/components/google-signin-button.tsx` 테스트 추가
- [ ] `app/auth/signin/components/github-signin-button.tsx` 테스트 추가
- [ ] `app/auth/signin/components/remember-me-checkbox.tsx` 테스트 추가

### 3.4 공통 컴포넌트 테스트

- [ ] `components/user-nav.tsx` 테스트 추가
- [ ] `components/address-search.tsx` 테스트 추가
- [ ] `components/loading-spinner.tsx` 테스트 추가

## ⚙️ 우선순위 4: 유틸리티 및 라이브러리 함수 테스트

### 4.1 핵심 라이브러리 함수 테스트 (현재: ~25%)

- [x] `lib/auth-helpers.ts` 테스트 추가 (2024-12-19 완료)
- [ ] `lib/auth-server.ts` 테스트 추가
- [x] `lib/auth-utils.ts` 테스트 추가 (2024-12-19 완료)
- [ ] `lib/download-utils.ts` 테스트 확장 (기존 테스트 개선)
- [ ] `lib/log-utils.ts` 테스트 추가
- [ ] `lib/log-cleanup.ts` 테스트 추가

### 4.2 환경 및 설정 테스트

- [x] `lib/env-validation.ts` 테스트 추가 (2024-12-19 완료)
- [x] `config/app.ts` 테스트 추가 (2024-12-19 완료)

## 🎯 우선순위 5: 커스텀 훅 테스트 확장

### 5.1 기존 훅 테스트 확장

- [ ] `hooks/use-mobile.tsx` 테스트 확장 (반응형 테스트)
- [ ] `hooks/use-toast.ts` 테스트 확장 (이미 100% 완료)

### 5.2 새로운 훅 테스트 추가

- [ ] `hooks/use-remember-me.ts` 테스트 추가
- [ ] `hooks/use-token-refresh.ts` 테스트 추가

## 📋 우선순위 6: 통합 테스트 및 E2E 테스트

### 6.1 통합 테스트

- [ ] QR 코드 생성 → 저장 → 조회 플로우 테스트
- [ ] 사용자 인증 → 대시보드 접근 플로우 테스트
- [ ] 관리자 권한 → 로그 관리 플로우 테스트

### 6.2 에러 시나리오 테스트

- [ ] 네트워크 오류 처리 테스트
- [ ] 데이터베이스 연결 실패 테스트
- [ ] 권한 없는 접근 처리 테스트

## 🛠️ 테스트 인프라 개선

### 6.1 Jest 설정 최적화

- [ ] `jest.config.js` 커버리지 임계값을 90%로 상향 조정
- [ ] 테스트 성능 최적화 (병렬 실행, 캐싱)

### 6.2 모킹 전략 개선

- [ ] `__mocks__` 디렉토리 구조 최적화
- [ ] 공통 모킹 유틸리티 함수 생성
- [ ] 데이터베이스 모킹 전략 표준화

### 6.3 CI/CD 통합

- [ ] GitHub Actions에 테스트 커버리지 체크 추가
- [ ] PR에 커버리지 리포트 자동 코멘트 추가
- [ ] 커버리지 배지 README에 추가

## 📊 진행 상황 추적

### 마일스톤

- [x] **마일스톤 1**: 실패한 테스트 모두 수정 (목표: 100% 통과) ✅ **완료** (2025-07-13)
- [ ] **마일스톤 2**: 커버리지 30% 달성 (Server Actions + API Routes)
- [ ] **마일스톤 3**: 커버리지 60% 달성 (컴포넌트 테스트 추가)
- [ ] **마일스톤 4**: 커버리지 80% 달성 (유틸리티 함수 테스트 추가)
- [ ] **마일스톤 5**: 커버리지 90% 달성 (통합 테스트 및 에지 케이스)

### 주간 목표

- [x] **1주차**: 실패한 테스트 수정 + Server Actions 테스트 추가 ✅ **완료** (2025-07-13)
  - 모든 실패한 테스트 수정 완료 (26개 스위트, 298개 테스트 모두 통과)
- [ ] **2주차**: API Routes 테스트 완성
- [ ] **3주차**: QR 코드 관련 컴포넌트 테스트 추가
- [ ] **4주차**: 대시보드 및 인증 컴포넌트 테스트 추가
- [ ] **5주차**: 유틸리티 함수 테스트 추가
- [ ] **6주차**: 통합 테스트 및 최종 커버리지 달성

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

1. 비즈니스 로직이 복잡한 함수
2. 외부 API와 상호작용하는 함수
3. 사용자 인터랙션이 중요한 컴포넌트
4. 에러 처리 로직
5. 엣지 케이스 및 경계 조건
