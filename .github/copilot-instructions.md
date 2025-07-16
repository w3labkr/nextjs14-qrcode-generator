# 코파일럿 지침

이 파일은 이 프로젝트에서 코드 생성 및 기타 작업을 수행할 때 GitHub Copilot이 참조할 가이드라인을 제공합니다.

## 프로젝트 개요

이 프로젝트는 Next.js 14로 구축된 QR 코드 생성기입니다. TypeScript, Tailwind CSS, shadcn/ui를 포함한 현대적인 기술 스택을 활용하여 견고하고 잘 구조화된 애플리케이션을 구축합니다. 포괄적인 로깅, 보안 및 테스트 기능을 갖춘 빠르고 안정적이며 사용자 친화적인 QR 코드 생성 경험을 제공하는 것이 목표입니다.

## 일반 지침

* **응답 언어**: 모든 제안과 응답을 **한국어**로 제공해주세요.
* **맥락 유지**: 현재 작업 중인 파일, 주변 코드, 기타 관련된 열린 파일을 바탕으로 맥락을 이해하고 활용하여 코드를 제안하세요.
* **코드 스타일 준수**: 프로젝트의 기존 코드 스타일(들여쓰기, 명명 규칙 등)을 파악하고 일관된 스타일로 코드를 생성하세요.
* **코드 가독성**: 간결함보다 코드 가독성을 우선시하세요. 설명적인 변수명, 명확한 함수명, 논리적인 코드 구조를 사용하세요. 복잡한 로직은 더 작고 이해하기 쉬운 부분으로 나누세요.
* **불필요한 주석 피하기**: 코드 생성 시 **주석을 추가하지 마세요.** 개발자가 필요에 따라 수동으로 주석을 추가할 것입니다.
* **관용적 코드**: 특정 프로그래밍 언어와 프레임워크의 일반적인 관용구와 모범 사례를 사용하여 코드를 작성하세요.
* **모듈화 및 재사용성**: 가능한 경우 코드를 모듈화하고 재사용 가능하게 만드는 것을 고려하세요.
* **오류 처리**: 적절한 오류 처리 메커니즘을 제안하도록 노력하세요.

## 기술 스택별 지침

### Next.js

* **App Router**: 라우팅, 레이아웃, 서버 컴포넌트에는 App Router를 활용하세요.
* **Server Actions**: 서버 측에서 데이터 변경 및 페칭에는 Server Actions를 사용하세요.
* **API Routes**: 클라이언트 측 데이터 페칭에는 API Routes를 사용하세요.
* **HTTP 클라이언트**: 일관된 오류 처리와 요청/응답 인터셉터를 보장하기 위해 `fetch` 대신 `axios`를 모든 API 호출에 사용하세요.

### React

* **상태 관리**: `useState` 대신 폼 상태 관리에는 `react-hook-form`을 선호하세요. 전역 상태 관리에는 `Zustand`를 사용하세요.
* **컴포넌트화**: 복잡한 컴포넌트를 더 작고 재사용 가능한 컴포넌트로 나누세요.
* **데이터 페칭**: 서버 상태 관리와 캐싱에는 `@tanstack/react-query`를 사용하세요.

### 인증

* **NextAuth.js**: Prisma 어댑터와 함께 NextAuth.js v5.0.0-beta.28을 인증에 사용하세요.
* **데이터베이스**: 인증 데이터는 `@auth/prisma-adapter`를 사용하여 저장됩니다.

### 데이터베이스

* **Prisma**: PostgreSQL과 함께 Prisma를 ORM으로 사용하세요.
* **Supabase**: 프로덕션 데이터베이스는 Row Level Security(RLS)가 적용된 Supabase PostgreSQL을 사용합니다.

### QR 코드 생성

* **라이브러리**: 고급 QR 코드 커스터마이징에는 `qr-code-styling`, 서버 측 스타일링에는 `qr-code-styling-node`, 기본 생성에는 `qrcode`, React 컴포넌트에는 `qrcode.react`를 사용하세요.
* **Canvas**: 서버 측 QR 코드 렌더링에는 `canvas` 라이브러리를 사용하세요.

### shadcn/ui

* **컴포넌트 사용**: shadcn/ui 컴포넌트를 사용할 때는 `@/components/ui/...`에서 import하세요.
* **컴포넌트 생성**: 새 컴포넌트를 생성할 때는 shadcn/ui 컴포넌트의 기존 구조와 스타일을 따르세요.
* **Radix UI**: 모든 UI 컴포넌트는 Radix UI 프리미티브를 기반으로 구축됩니다.

### Tailwind CSS

* **유틸리티 우선**: Tailwind CSS의 유틸리티 우선 접근 방식을 채택하세요.
* **`tailwind-merge`**: 충돌하는 CSS 클래스를 처리하기 위해 `tailwind-merge` 라이브러리를 사용하세요.
* **`clsx`**: 조건부 클래스명에는 `clsx` 라이브러리를 사용하세요.
* **애니메이션**: 컴포넌트 애니메이션에는 `tailwindcss-animate`를 사용하세요.

### 폼 처리

* **React Hook Form**: 폼 검증에는 `@hookform/resolvers`와 함께 `react-hook-form`을 사용하세요.
* **검증**: 스키마 검증과 타입 안전성을 위해 `zod`를 사용하세요.
* **필드 검증**: 타입 안전성과 애플리케이션 전반의 일관된 검증 규칙을 보장하기 위해 항상 Zod 스키마를 폼 필드 데이터 검증에 사용하세요.

### Zustand

* **상태 관리**: 전역 상태 관리에는 Zustand를 사용하세요. `hooks` 디렉토리에 스토어를 생성하세요.

### UI 컴포넌트

* **테이블**: 데이터 테이블에는 `@tanstack/react-table` v8.21.3을 사용하세요.
* **알림**: 토스트 알림에는 `sonner` v2.0.5를 사용하세요.
* **날짜 선택기**: 날짜 처리에는 `date-fns` v4.1.0과 함께 `react-day-picker` v9.7.0을 사용하세요.
* **차트**: 데이터 시각화에는 `recharts` v2.15.3을 사용하세요.
* **아이콘**: 아이콘에는 `lucide-react` v0.515.0을 사용하세요.
* **캐러셀**: 캐러셀 컴포넌트에는 `embla-carousel-react` v8.6.0을 사용하세요.
* **패널**: 크기 조정 가능한 레이아웃 패널에는 `react-resizable-panels` v3.0.3을 사용하세요.
* **드로어**: 모바일 드로어 컴포넌트에는 `vaul` v1.1.2를 사용하세요.
* **명령**: 명령 팔레트 인터페이스에는 `cmdk` v1.1.1을 사용하세요.
* **OTP**: OTP 입력 컴포넌트에는 `input-otp` v1.4.2를 사용하세요.
* **Radix UI**: 모든 UI 컴포넌트는 accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toggle, toggle-group, tooltip을 포함한 Radix UI 프리미티브를 기반으로 구축됩니다.

### 유틸리티

* **HTTP 클라이언트**: HTTP 요청에는 `axios` v1.10.0을 사용하세요.
* **쿼리 문자열**: 쿼리 문자열 파싱에는 `qs` v6.14.0을 사용하세요.
* **쿠키**: 쿠키 관리에는 `cookies-next` v4.3.0을 사용하세요.
* **DOM 조작**: 서버 측 DOM 작업에는 `jsdom` v26.1.0을 사용하세요.
* **JWT**: JWT 토큰 처리에는 `jose` v6.0.11을 사용하세요.
* **날짜 라이브러리**: 날짜 조작에는 `date-fns` v4.1.0을, 경량 날짜 작업에는 `dayjs` v1.11.13을 사용하세요.
* **주소 검색**: 한국 주소 검색 기능에는 `react-daum-postcode` v3.2.0을 사용하세요.
* **유틸리티 함수**: 현대적인 유틸리티 함수를 위해 `@toss/utils` v1.6.1과 `es-toolkit` v1.39.5를 사용하세요.
* **브라우저 호환성**: 브라우저 호환성 구성에는 `browserslist` v4.25.0을 사용하세요.
* **인증 라이브러리**: 추가 인증 유틸리티를 위해 `auth` v1.2.3을 사용하세요.
* **레이아웃 관리**: 오버레이 및 모달 관리에는 `overlay-kit` v1.8.2를 사용하세요.
* **데이터베이스**: PostgreSQL 클라이언트 연결에는 `pg` v8.16.2를 사용하세요.
* **CSS 유틸리티**: 컴포넌트 변형 처리에는 `class-variance-authority` v0.7.1을, 클래스 병합에는 `tailwind-merge` v3.3.1을 사용하세요.
* **테마**: 테마 관리에는 `next-themes` v0.4.6을 사용하세요.
* **개발 도구**: TypeScript 실행에는 `tsx` v4.20.3을, Node.js TypeScript 지원에는 `ts-node` v10.9.2를 사용하세요.

## 디렉토리 구조

* `app/`: 애플리케이션의 라우트, 레이아웃, 페이지를 포함합니다.
  * `actions/`: 데이터 변경 및 비즈니스 로직을 위한 서버 액션 (account-management, data-management, log-management, qr-code-generator, qr-code-management, qr-code).
  * `api/`: 클라이언트 측 데이터 페칭을 위한 API 라우트 (auth, cron, qrcodes).
  * `auth/`: 인증 관련 페이지 (signin, error).
  * `dashboard/`: 보호된 대시보드 페이지 및 기능 (account, dashboard, history, settings, admin).
    * `admin/`: 로그 관리 및 정리를 포함한 관리 기능.
  * `qrcode/`: 컴포넌트가 포함된 QR 코드 생성 메인 페이지.
    * `components/`: QR 코드 전용 컴포넌트 (card-email, card-location, card-preview, card-sms, card-style, card-textarea, card-url, card-vcard, card-wifi, qr-handlers, qrcode-form).
* `components/`: 재사용 가능한 컴포넌트를 포함합니다.
  * `ui/`: shadcn/ui 컴포넌트 (accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, data-table, date-picker, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle-group, toggle, tooltip을 포함한 48개 컴포넌트).
  * 기타 유틸리티 컴포넌트 (access-denied-alert, address-search, client-only, github-badge, history-button, loading-spinner, log-statistics, new-qr-code-button, tailwind-indicator, unauthenticated, user-nav, user-profile).
* `lib/`: 유틸리티 함수와 상수를 포함합니다.
  * 데이터베이스 연결 (prisma.ts), 다운로드 유틸리티 (download-utils.ts), QR 코드 유틸리티, 인증 헬퍼 (auth-helpers.ts, auth-server.ts, auth-utils.ts), API 로깅 (api-logging.ts), 통합 로깅 (unified-logging.ts), RLS 관리 (rls-manager.ts, rls-utils.ts), 환경 검증 (env-validation.ts), CSV 유틸리티 (csv-utils.ts), 로그 유틸리티 (log-utils.ts, log-cleanup.ts), 로깅 미들웨어 (logging-middleware.ts), 상수 (constants.ts), 일반 유틸리티 (utils.ts).
  * `supabase/`: Supabase 클라이언트 및 관련 유틸리티.
* `hooks/`: 커스텀 훅과 Zustand 스토어를 포함합니다.
  * 모바일 감지 (`use-mobile.tsx`), 로그인 정보 기억 기능 (`use-remember-me.ts`), 토큰 새로고침 (`use-token-refresh.ts`), 토스트 알림 (`use-toast.ts`)을 위한 커스텀 훅.
* `types/`: TypeScript 타입 정의를 포함합니다.
  * QR 코드, 환경, 인증, RLS, 로그 등에 대한 타입 정의.
* `public/`: 정적 자산을 포함합니다.
  * PWA 매니페스트, 서비스 워커, 폰트, 스크린샷 등.
* `prisma/`: 데이터베이스 스키마와 마이그레이션을 포함합니다.
* `docs/`: 프로젝트 문서를 포함합니다.
  * PROJECT.md (프로젝트 개요 및 기술 스택)
  * API.md (API 엔드포인트 및 Server Actions 문서)
  * DEPLOYMENT.md (배포 가이드 및 환경 설정)
  * DEVELOPMENT.md (개발 가이드 및 코딩 스타일)
* `context/`: React 컨텍스트 프로바이더를 포함합니다.
  * 인증 프로바이더 (`auth-provider.tsx`)와 클라이언트 프로바이더 (`client-providers.tsx`).
* `config/`: 애플리케이션 구성을 포함합니다.
  * `app.ts`: 애플리케이션 구성 상수.
* `scripts/`: 유틸리티 스크립트를 포함합니다.
  * `backup-logs.sql`: 로그 데이터 백업을 위한 SQL 스크립트.
  * `cleanup-old-logs.sql`: 오래된 로그 항목 정리를 위한 SQL 스크립트.
  * `setup-rls.sh`: RLS 설정 스크립트.
  * `setup-unified-rls.sql`: 통합 RLS 설정을 위한 SQL 스크립트.
  * `test-unified-logging.ts`: 통합 로깅 시스템 테스트를 위한 TypeScript 스크립트.
* `screenshots/`: 문서용 애플리케이션 스크린샷을 포함합니다.
  * 모든 QR 코드 유형 및 대시보드 페이지의 스크린샷.

## 특정 작업 지침

* **Git 커밋 메시지**: Git 커밋 메시지를 생성할 때는 프로젝트 루트에 있는 `.gitmessage.txt` 파일을 참조하여 그 형식과 내용을 따르세요.

## 개발 스크립트

프로젝트에는 개발 및 유지보수를 위한 여러 npm 스크립트가 포함되어 있습니다:

* **개발**: `npm run dev` - Turbo 모드로 개발 서버를 시작합니다
* **빌드**: `npm run build` - Prisma 클라이언트를 생성하고 애플리케이션을 빌드합니다
* **테스트**:
  * `npm run test` - 모든 테스트를 실행합니다
  * `npm run test:watch` - 워치 모드에서 테스트를 실행합니다
  * `npm run test:coverage` - 커버리지 리포트와 함께 테스트를 실행합니다
  * `npm run test:ci` - 커버리지와 함께 CI/CD용 테스트를 실행합니다
* **정리**:
  * `npm run clean` - node_modules, .next, package-lock.json을 제거하고 npm 캐시를 지웁니다
  * `npm run clean:files` - 파일만 제거합니다
  * `npm run clean:cache` - npm 캐시만 지웁니다
* **패키지 관리**:
  * `npm run upgrade:latest` - 모든 패키지를 최신 버전으로 업데이트합니다
  * `npm run reinstall` - 모든 패키지를 완전히 재설치합니다
* **로깅 시스템**:
  * `npm run logs:test` - 통합 로깅 시스템을 테스트합니다
  * `npm run logs:cleanup` - 오래된 로그 항목을 정리합니다
  * `npm run logs:backup` - 로그 데이터를 백업합니다
  * `npm run logs:auto-cleanup` - API를 통해 오래된 로그 항목을 자동으로 정리합니다
  * `npm run logs:stats` - 로그 정리 통계를 보여줍니다
* **RLS (Row Level Security)**:
  * `npm run rls:test` - RLS 포괄적 기능을 테스트합니다
  * `npm run rls:validate` - RLS 정책을 검증합니다
  * `npm run rls:benchmark` - RLS 성능을 벤치마크합니다
* **문서화**: `npm run docs:update` - 문서 업데이트 체크리스트를 보여줍니다

## 피드백 및 개선

Copilot의 제안이 기대에 부합하지 않는 경우, 적극적으로 수정하고 피드백을 제공하여 Copilot이 향후 더 나은 제안을 할 수 있도록 도와주세요.

## 테스트 및 품질 보장

### TDD (테스트 주도 개발) 지침

* **TDD 접근법**: 모든 새로운 기능 개발에 대해 Red-Green-Refactor 사이클을 따르세요:
  1. **Red**: 실패하는 테스트를 먼저 작성하세요
  2. **Green**: 테스트를 통과하는 최소한의 코드를 작성하세요
  3. **Refactor**: 테스트를 유지하면서 코드를 개선하세요
* **테스트 커버리지 목표**: 모든 모듈에서 **90% 이상**의 테스트 커버리지를 유지하세요
* **테스트 우선 개발**: 새로운 기능을 구현하기 전에 항상 테스트를 작성하세요
* **코드 품질 게이트**: 새 코드는 병합 전에 모든 테스트를 통과하고 커버리지 임계값을 충족해야 합니다

### 테스트 프레임워크 및 도구

* **테스트 러너**: React 컴포넌트를 위한 jest-environment-jsdom과 함께 Jest v30.0.3
* **테스트 라이브러리**:
  * 컴포넌트 테스트를 위한 `@testing-library/react` v16.3.0
  * DOM 어설션을 위한 `@testing-library/jest-dom` v6.6.3
  * 사용자 상호작용 시뮬레이션을 위한 `@testing-library/user-event` v14.6.1
* **테스트 구조**: 소스 구조를 미러링하는 `__tests__/` 디렉토리에 테스트를 구성하세요
* **모킹 전략**: 외부 의존성, 데이터베이스 호출, API 요청에 Jest 모킹을 사용하세요
* **커버리지 리포팅**: 상세한 분석을 위해 HTML 출력으로 커버리지 리포트를 생성하세요

### 현재 테스트 상태 (2025년 7월 16일 기준)

* **테스트 스위트**: 104개 파일 (77개 통과, 27개 실패)
* **테스트 케이스**: 1,696개 총계 (1,586개 통과, 110개 실패)
* **성공률**: 93.5%
* **현재 커버리지**:
  * Statements: 55.31% (목표: 90%)
  * Branches: 48.15% (목표: 90%)
  * Functions: 55.94% (목표: 90%)
  * Lines: 55.82% (목표: 90%)

### 테스트 모범 사례

* **컴포넌트 테스트**: 구현 세부사항이 아닌 컴포넌트 동작을 테스트하세요
* **단위 테스트**: 개별 함수와 유틸리티를 독립적으로 테스트하세요
* **통합 테스트**: 적절한 모킹과 함께 API 라우트와 서버 액션을 테스트하세요
* **오류 처리**: 성공과 실패 시나리오 모두를 테스트하세요
* **에지 케이스**: 경계 조건과 오류 상태에 대한 테스트를 포함하세요
* **접근성**: 해당하는 경우 접근성 테스트를 포함하세요
* **성능**: 테스트 실행 시간을 모니터링하고 느린 테스트를 최적화하세요

### 테스트 개선 우선순위

현재 테스트 상태를 기반으로 다음 영역에 즉각적인 주의가 필요합니다:

1. **테스트 안정성**: 27개의 실패하는 테스트 스위트 수정 (DOM 설정, 모킹, 환경 호환성 문제)
2. **커버리지 개선**: 현재 55%에서 목표 90%로 커버리지 증가
   * 비즈니스 로직 함수 및 API 라우트에 집중
   * 중요한 사용자 플로우에 대한 통합 테스트 추가
   * 컴포넌트 테스트 커버리지 개선
3. **Jest 구성**: Next.js 및 NextAuth와의 ES 모듈 호환성 문제 해결
4. **모킹 전략**: 외부 의존성 및 브라우저 API에 대한 모킹 전략 개선
5. **테스트 환경**: 일관된 결과를 위한 테스트 환경 안정화

### 해결해야 할 테스트 품질 문제

* **NextAuth 모듈**: 통합 테스트에서 ES 모듈 import 문제 해결
* **DOM 설정**: 컴포넌트 테스트에서 createRoot DOM 요소 문제 해결
* **쿠키 테스트**: 브라우저 환경 테스트에서 쿠키 접근 실패 해결
* **API 모킹**: 통합 로깅 및 인증 모킹 개선
* **스냅샷 테스트**: 오래된 스냅샷 업데이트 및 스냅샷 안정성 개선

## 프로젝트 현재 상태

* **버전**: v1.5.105 (2025년 7월 16일 기준)
* **패키지 수**: 108개 npm 패키지 (75개 의존성 + 33개 개발 의존성)
* **UI 컴포넌트**: 48개 shadcn/ui 컴포넌트
* **테스트 파일**: 103개의 포괄적인 커버리지를 가진 테스트 파일
* **QR 코드 유형**: 7가지 지원 유형 (URL, TEXTAREA, WIFI, EMAIL, SMS, VCARD, LOCATION)
* **인증**: Google OAuth 및 GitHub OAuth를 지원하는 NextAuth.js v5.0.0-beta.28
* **데이터베이스**: Prisma ORM v6.10.1과 함께 Supabase PostgreSQL
* **보안**: 통합 로깅 시스템과 함께 구현된 Row Level Security (RLS)
* **상태 관리**: 전역 상태 관리를 위해 구현된 Zustand v5.0.5 스토어
* **폼 처리**: Zod v3.25.64 검증과 통합된 React Hook Form v7.58.0
* **쿼리 관리**: 서버 상태 관리를 위한 React Query v5.80.7
* **코드 품질**: 엄격한 규칙으로 구성된 ESLint, Prettier, TypeScript
* **개발**: Turbo 모드가 활성화된 빠른 개발을 위한 Next.js 14.2.30
* **로깅**: API, 인증, 감사, 오류 추적을 위한 포괄적인 통합 로깅 시스템
* **테스트**: 90% 커버리지를 목표로 하는 포괄적인 테스트 스위트와 함께 Jest v30.0.3
* **PWA**: 오프라인 지원을 포함한 Progressive Web App 기능
