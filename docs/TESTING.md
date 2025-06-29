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

### 3. 커스텀 Hook 테스트

#### useIsMobile Hook (`__tests__/hooks/use-mobile.test.tsx`)
- ✅ 데스크톱/모바일 화면 크기 감지 테스트
- ✅ 768px 경계값 테스트
- ✅ matchMedia API 모킹 및 호출 확인
- ✅ 컴포넌트 언마운트 시 이벤트 리스너 제거 테스트

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
```

## 모킹 설정

### jest.setup.ts에서 설정된 모킹

1. **Next.js 모킹**
   - `next/navigation`: useRouter, useSearchParams, usePathname
   - `next/image`: 간단한 img 태그로 모킹

2. **인증 모킹**
   - `@/auth`: NextAuth 관련 함수들
   - Prisma 클라이언트 모킹

3. **브라우저 API 모킹**
   - `window.matchMedia`: 반응형 디자인 테스트용
   - Canvas 관련 API: QR 코드 생성 테스트용

## 테스트 결과

현재 테스트 현황:
- **테스트 스위트**: 6개 (모두 통과)
- **개별 테스트**: 46개 (모두 통과)
- **테스트된 컴포넌트**: Button, Input, Textarea (100% 커버리지)
- **테스트된 유틸리티**: cn 함수, QR 유틸리티, 상수
- **테스트된 Hook**: useIsMobile

## 추가 테스트 권장사항

### 우선순위 높음
1. **QR 코드 생성 로직**: `app/actions/qr-code-generator.ts`
2. **Form 컴포넌트들**: QR 코드 입력 폼들
3. **API Routes**: QR 코드 관련 API 엔드포인트
4. **인증 로직**: 로그인/로그아웃 플로우

### 우선순위 중간
1. **데이터 테이블**: 히스토리 페이지의 QR 코드 목록
2. **다운로드 기능**: QR 코드 다운로드 유틸리티
3. **CSV 처리**: 데이터 가져오기/내보내기 기능

### 우선순위 낮음
1. **레이아웃 컴포넌트들**: 페이지 레이아웃
2. **스타일링 관련**: 테마, 반응형 디자인
3. **기타 UI 컴포넌트들**: Badge, Alert 등

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

## 커버리지 목표

- **문**: 80% 이상
- **브랜치**: 80% 이상
- **함수**: 80% 이상
- **라인**: 80% 이상

현재는 테스트된 특정 파일들만 100% 커버리지를 달성했으며, 전체 프로젝트 커버리지는 낮은 상태입니다. 점진적으로 테스트를 추가하여 커버리지를 향상시킬 예정입니다.
