# 프로젝트 개요 및 구조

## 📊 프로젝트 통계 (v1.4.31)

- **버전**: v1.4.31
- **마지막 업데이트**: 2025년 6월 29일
- **총 파일 수**: 170+ TypeScript/JavaScript 파일
- **총 패키지 수**: 100+ npm 패키지 (73 dependencies + 30 devDependencies)

## 🧩 주요 구성 요소

### UI 컴포넌트

- **46개 shadcn/ui 컴포넌트**: Radix UI 기반의 고품질 컴포넌트
- **7가지 QR 코드 타입**: URL, 텍스트, Wi-Fi, vCard, 이메일, SMS, 위치

### 기술 스택

- **Frontend**: Next.js 14.2.30, React 18, TypeScript 5
- **UI**: Tailwind CSS 3.4.1, shadcn/ui, Radix UI
- **인증**: NextAuth.js v5.0.0-beta.28 (Google OAuth)
- **데이터베이스**: Supabase PostgreSQL + Prisma ORM 6.10.1
- **상태 관리**: Zustand 5.0.5, React Query 5.80.7
- **폼 관리**: React Hook Form 7.58.0 + Zod 3.25.64

### 고급 기능

- **통합 로깅 시스템**: UnifiedLogger 클래스로 모든 로그 통합 관리
- **Row Level Security**: 데이터베이스 레벨 보안
- **PWA 지원**: Progressive Web App 기능
- **성능 최적화**: Turbopack, 이미지 최적화, 코드 분할

## 📁 프로젝트 구조

```text
nextjs14-qrcode-generator/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # 인증 관련 API
│   │   ├── cron/                 # 크론 작업 API
│   │   └── qrcodes/              # QR 코드 관련 API
│   ├── actions/                  # Server Actions
│   │   ├── account-management.ts # 계정 관리
│   │   ├── data-management.ts    # 데이터 관리
│   │   ├── log-management.ts     # 로그 관리
│   │   ├── qr-code-generator.ts  # QR 코드 생성
│   │   ├── qr-code-management.ts # QR 코드 관리
│   │   └── template-management.ts # 템플릿 관리
│   ├── auth/                     # 인증 페이지
│   │   ├── error/                # 인증 에러 페이지
│   │   └── signin/               # 로그인 페이지
│   ├── dashboard/                # 대시보드 (보호된 페이지)
│   │   ├── account/              # 계정 관리
│   │   ├── dashboard/            # 대시보드 메인
│   │   ├── history/              # QR 코드 히스토리
│   │   └── settings/             # 설정
│   ├── qrcode/                   # QR 코드 생성 페이지
│   │   └── components/           # QR 코드 전용 컴포넌트
│   ├── globals.css               # 전역 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈페이지
│   └── error.tsx                 # 에러 페이지
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                       # shadcn/ui 컴포넌트 (46개)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── command.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── resizable.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toggle.tsx
│   │   ├── tooltip.tsx
│   │   └── ... (총 46개)
│   ├── address-search.tsx        # 주소 검색 컴포넌트
│   ├── client-only.tsx           # 클라이언트 전용 컴포넌트
│   ├── github-badge.tsx          # GitHub 배지
│   ├── history-button.tsx        # 히스토리 버튼
│   ├── loading-spinner.tsx       # 로딩 스피너
│   ├── log-statistics.tsx        # 로그 통계
│   ├── new-qr-code-button.tsx    # 새 QR 코드 버튼
│   ├── tailwind-indicator.tsx    # Tailwind 인디케이터
│   ├── unauthenticated.tsx       # 비인증 사용자 컴포넌트
│   ├── user-nav.tsx              # 사용자 네비게이션
│   └── user-profile.tsx          # 사용자 프로필
├── config/                       # 설정 파일
│   └── app.ts                    # 앱 설정
├── context/                      # React 컨텍스트
│   ├── auth-provider.tsx         # 인증 프로바이더
│   └── client-providers.tsx      # 클라이언트 프로바이더
├── docs/                         # 프로젝트 문서
│   ├── CODE_OF_CONDUCT.md        # 행동 강령
│   ├── CONTRIBUTING.md           # 기여 가이드
│   ├── CRON.md                   # 크론 작업 문서
│   ├── DEPENDENCIES.md           # 의존성 문서
│   ├── LOGGING.md                # 로깅 시스템 문서
│   ├── PRD.md                    # 제품 요구사항 문서
│   ├── RLS.md                    # Row Level Security 문서
│   ├── SECURITY.md               # 보안 가이드
│   └── PROJECT.md                # 프로젝트 구조 (이 문서)
├── hooks/                        # 커스텀 훅
│   ├── use-mobile.tsx            # 모바일 감지 훅
│   ├── use-remember-me.ts        # 로그인 유지 훅
│   └── use-token-refresh.ts      # 토큰 새로고침 훅
├── lib/                          # 유틸리티 및 라이브러리
│   ├── supabase/                 # Supabase 클라이언트
│   ├── api-logging.ts            # API 로깅 유틸리티
│   ├── auth-helpers.ts           # 인증 헬퍼
│   ├── auth-server.ts            # 서버 사이드 인증
│   ├── auth-utils.ts             # 인증 유틸리티
│   ├── constants.ts              # 상수 정의
│   ├── csv-utils.ts              # CSV 유틸리티
│   ├── download-utils.ts         # 다운로드 유틸리티
│   ├── env-validation.ts         # 환경변수 검증
│   ├── error-logging.ts          # 에러 로깅
│   ├── log-utils.ts              # 로그 유틸리티
│   ├── logging-examples.ts       # 로깅 예제
│   ├── logging-middleware.ts     # 로깅 미들웨어
│   ├── prisma.ts                 # Prisma 클라이언트
│   ├── rls-manager.ts            # RLS 관리자
│   ├── rls-utils.ts              # RLS 유틸리티
│   ├── unified-logging.ts        # 통합 로깅 시스템
│   └── utils.ts                  # 일반 유틸리티
├── prisma/                       # 데이터베이스 스키마 및 마이그레이션
│   ├── migrations/               # Prisma 마이그레이션 파일들
│   └── schema.prisma             # 데이터베이스 스키마
├── public/                       # 정적 파일
│   ├── fonts/                    # 폰트 파일
│   ├── icons/                    # 아이콘 파일
│   ├── manifest.json             # PWA 매니페스트
│   ├── service-worker.js         # 서비스 워커
│   └── ...
├── scripts/                      # 유틸리티 스크립트
│   ├── backup-logs.sql           # 로그 백업 스크립트
│   ├── cleanup-old-logs.sql      # 오래된 로그 정리
│   ├── migrate-logging-system.sh # 로깅 시스템 마이그레이션
│   ├── setup-rls.sh              # RLS 설정 스크립트
│   ├── setup-unified-rls.sql     # 통합 RLS 설정
│   └── test-unified-logging.ts   # 통합 로깅 테스트
├── screenshots/                  # 프로젝트 스크린샷
│   ├── app.JPG                   # 앱 메인 화면
│   ├── dashboard-*.JPG           # 대시보드 스크린샷들
│   └── qrcode-*.JPG              # QR 코드 타입별 스크린샷들
├── types/                        # TypeScript 타입 정의
│   ├── data-manager.ts           # 데이터 관리 타입
│   ├── environment.d.ts          # 환경변수 타입
│   ├── logs.ts                   # 로그 타입
│   ├── next-auth.d.ts            # NextAuth 타입 확장
│   ├── qr-code.ts                # QR 코드 타입
│   ├── qr-code-server.ts         # 서버 사이드 QR 코드 타입
│   └── rls.ts                    # RLS 타입
├── .copilot-instructions.md      # GitHub Copilot 지침
├── .env.example                  # 환경변수 예제
├── .gitignore                    # Git 무시 파일
├── auth.config.ts                # NextAuth 설정
├── auth.ts                       # NextAuth 인증 설정
├── components.json               # shadcn/ui 설정
├── next.config.mjs               # Next.js 설정
├── package.json                  # 패키지 정의
├── postcss.config.mjs            # PostCSS 설정
├── README.md                     # 프로젝트 소개
├── tailwind.config.ts            # Tailwind CSS 설정
├── tsconfig.json                 # TypeScript 설정
└── vercel.json                   # Vercel 배포 설정
```

## 🎯 아키텍처 개요

### 1. Frontend 아키텍처

#### Next.js 14 App Router

- **App Router** 사용으로 파일 기반 라우팅
- **Server Components**와 **Client Components** 혼합 사용
- **Server Actions**를 통한 서버 사이드 데이터 뮤테이션

#### 상태 관리

- **Zustand**: 전역 상태 관리 (가벼운 Redux 대안)
- **React Hook Form**: 폼 상태 관리
- **TanStack Query**: 서버 상태 관리 및 캐싱

#### UI 컴포넌트 시스템

- **shadcn/ui**: 46개의 재사용 가능한 UI 컴포넌트
- **Radix UI**: 접근성이 보장된 UI 프리미티브
- **Tailwind CSS**: 유틸리티 기반 스타일링

### 2. Backend 아키텍처

#### 데이터베이스

- **Supabase PostgreSQL**: 클라우드 데이터베이스
- **Prisma ORM**: 타입 안전한 데이터베이스 접근
- **Row Level Security (RLS)**: 데이터베이스 레벨 보안

#### 인증 시스템

- **NextAuth.js v5**: 최신 인증 시스템
- **Google OAuth**: 소셜 로그인
- **@auth/prisma-adapter**: NextAuth와 Prisma 통합

#### 로깅 시스템

- **UnifiedLogger**: 통합 로깅 시스템
- **ApplicationLog 테이블**: 모든 로그를 하나의 테이블로 통합
- **자동 로그 정리**: 정기적인 오래된 로그 삭제

### 3. QR 코드 생성 시스템

#### 지원 QR 코드 타입 (7가지)

1. **URL**: 웹사이트 링크
2. **텍스트**: 일반 텍스트
3. **Wi-Fi**: 네트워크 정보
4. **vCard**: 연락처 정보
5. **이메일**: 이메일 정보
6. **SMS**: 문자 메시지
7. **위치**: 지도 위치

#### QR 코드 라이브러리

- **qr-code-styling**: 고급 커스터마이징
- **qrcode**: 기본 QR 코드 생성
- **canvas**: 서버 사이드 렌더링

## 🚀 주요 기능

### 1. 사용자 기능

- **즉시 사용**: 로그인 없이 모든 기본 기능 사용 가능
- **히스토리 관리**: 로그인 사용자의 QR 코드 히스토리 저장
- **커스터마이징**: 색상, 로고, 스타일 변경
- **다중 다운로드**: PNG, SVG, JPG 형식 지원

### 2. 관리자 기능

- **로그 모니터링**: 실시간 시스템 로그 확인
- **사용자 관리**: 사용자 계정 및 권한 관리
- **시스템 통계**: 사용량 및 성능 지표 확인

### 3. 보안 기능

- **RLS**: 데이터베이스 레벨 보안
- **CSRF 보호**: 요청 위조 방지
- **환경변수 검증**: 설정 값 유효성 검사

## 🔧 개발 도구 및 품질 관리

### 1. 코드 품질

- **TypeScript**: 타입 안전성 보장
- **ESLint**: 코드 스타일 및 품질 검사
- **Prettier**: 코드 포맷팅

### 2. 성능 최적화

- **Turbopack**: 빠른 개발 서버
- **이미지 최적화**: Next.js 내장 이미지 최적화
- **코드 분할**: 자동 코드 스플리팅

### 3. 배포 및 모니터링

- **Vercel**: 원클릭 배포
- **PWA**: Progressive Web App 지원
- **성능 모니터링**: 로그 기반 성능 추적

## ⚙️ 환경 설정

### 필수 환경변수

```env
# 데이터베이스
DATABASE_URL=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# OAuth 제공자
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 로깅 설정
LOG_LEVEL=INFO
LOG_RETENTION_DAYS=90
ADMIN_EMAILS=
```

## 📈 확장성 고려사항

### 1. 수평 확장

- **Stateless 아키텍처**: 서버 인스턴스 무상태 설계
- **데이터베이스 분리**: 읽기/쓰기 분리 가능
- **CDN 활용**: 정적 파일 배포 최적화

### 2. 기능 확장

- **QR 코드 타입 추가**: 모듈형 구조로 쉬운 확장
- **API 확장**: RESTful API 설계
- **국제화**: i18n 지원 준비

### 3. 성능 최적화

- **캐싱 전략**: React Query 기반 클라이언트 캐싱
- **로그 아카이빙**: 오래된 로그의 압축 및 아카이빙
- **이미지 최적화**: WebP 형식 지원 및 압축

## 🔧 개발 명령어

```bash
# 개발 서버 시작 (Turbopack)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 코드 린팅
npm run lint

# 의존성 전체 업데이트
npm run upgrade:latest

# 캐시 정리 및 재설치
npm run clean && npm run reinstall

# 통합 로그 시스템 관련
npm run logs:test        # 로그 시스템 테스트
npm run logs:cleanup     # 오래된 로그 정리
npm run logs:backup      # 로그 백업
npm run logs:setup-rls   # RLS 정책 설정

# 문서 업데이트 확인
npm run docs:update
```

## 📊 성능 지표

- **빌드 시간**: ~2분 (Turbopack 사용)
- **번들 크기**: 최적화된 코드 분할
- **Lighthouse 점수**: 90+ (성능, 접근성, SEO)
- **TypeScript 적용률**: 100%

## 🔮 유지보수 가이드

### 1. 정기적인 작업

- **의존성 업데이트**: 월 1회 패키지 업데이트
- **로그 정리**: 주 1회 오래된 로그 삭제
- **보안 패치**: 즉시 보안 업데이트 적용

### 2. 모니터링

- **에러 로그**: 실시간 에러 모니터링
- **성능 지표**: 응답 시간 및 사용량 추적
- **사용자 피드백**: 버그 리포트 및 기능 요청

### 3. 백업 및 복구

- **데이터베이스 백업**: 일일 자동 백업
- **코드 백업**: Git 기반 버전 관리
- **설정 백업**: 환경변수 및 설정 파일 백업

## 🔮 향후 계획

1. **실시간 기능**: WebSocket 기반 실시간 QR 코드 공유
2. **AI 통합**: QR 코드 디자인 자동 생성
3. **API 확장**: Public API 제공
4. **국제화**: 다국어 지원 (i18n)
5. **모바일 앱**: React Native 기반 모바일 앱

## 🤝 지원 및 기여

- **GitHub**: [w3labkr/nextjs14-qrcode-generator](https://github.com/w3labkr/nextjs14-qrcode-generator)
- **이슈 리포트**: GitHub Issues 활용
- **기여 가이드**: `docs/CONTRIBUTING.md` 참조
- **라이선스**: MIT License

## 🔧 최근 주요 업데이트

### 1. 문서 업데이트 (v1.4.31)

- ✅ `.copilot-instructions.md` 생성/업데이트
- ✅ `README.md` 배지 및 기술 스택 정보 업데이트
- ✅ `docs/DEPENDENCIES.md` 버전 정보 업데이트
- ✅ `docs/PROJECT.md` 신규 생성 (통합 문서)
- ✅ `docs/LOGGING.md` 통합 로깅 시스템 통합
- ✅ `package.json`에 문서 업데이트 스크립트 추가

### 2. 통합 로깅 시스템

- 6개 분리된 로그 테이블을 1개 통합 테이블로 최적화
- UnifiedLogger 클래스로 모든 로그 작업 통합
- 성능 측정 및 자동 정리 기능

### 3. 보안 강화

- Row Level Security (RLS) 구현
- NextAuth.js v5로 최신 인증 시스템 적용
- 환경변수 검증 시스템
