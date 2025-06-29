# 프로젝트 구조 문서

## 개요

QR Code Generator 프로젝트의 디렉토리 구조와 각 파일의 역할을 설명합니다.

## 루트 디렉토리

```
nextjs14-qrcode-generator/
├── app/                    # Next.js 14 App Router
├── components/             # 재사용 가능한 React 컴포넌트
├── config/                 # 애플리케이션 설정
├── context/                # React Context 프로바이더
├── docs/                   # 프로젝트 문서
├── hooks/                  # 커스텀 훅 및 Zustand 스토어
├── lib/                    # 유틸리티 함수 및 라이브러리
├── prisma/                 # 데이터베이스 스키마 및 마이그레이션
├── public/                 # 정적 자산
├── screenshots/            # 애플리케이션 스크린샷
├── scripts/                # 유틸리티 스크립트
└── types/                  # TypeScript 타입 정의
```

## 상세 구조

### `app/` - Next.js App Router

#### 루트 파일
- `layout.tsx` - 전역 레이아웃
- `page.tsx` - 홈페이지
- `error.tsx` - 에러 페이지
- `globals.css` - 전역 스타일

#### `actions/` - Server Actions
서버 사이드 비즈니스 로직을 처리하는 Server Actions:

- `account-management.ts` - 사용자 계정 관리 액션
- `data-management.ts` - 데이터 내보내기/가져오기 액션
- `index.ts` - 액션 내보내기 인덱스
- `log-management.ts` - 로그 관리 액션
- `qr-code-generator.ts` - QR 코드 생성 액션
- `qr-code-management.ts` - QR 코드 CRUD 액션
- `qr-code.ts` - QR 코드 유틸리티 액션

#### `api/` - API Routes
클라이언트 사이드 데이터 패칭을 위한 API 엔드포인트:

```
api/
├── admin/           # 관리자 API
├── auth/            # NextAuth.js 인증 API
├── cron/            # Cron 작업 API
└── qrcodes/         # QR 코드 관련 API
```

#### `auth/` - 인증 관련 페이지
- `error/` - 인증 에러 페이지
- `signin/` - 로그인 페이지

#### `dashboard/` - 보호된 대시보드 영역
- `layout.tsx` - 대시보드 레이아웃
- `page.tsx` - 대시보드 메인 페이지
- `account/` - 계정 설정 페이지
- `admin/` - 관리자 기능 (로그 관리 및 정리)
- `dashboard/` - 대시보드 상세 페이지
- `history/` - QR 코드 히스토리 페이지
- `settings/` - 사용자 설정 페이지

#### `qrcode/` - QR 코드 생성 메인 페이지
- `layout.tsx` - QR 코드 페이지 레이아웃
- `page.tsx` - QR 코드 생성기 메인 페이지
- `components/` - QR 코드 특화 컴포넌트들

##### QR 코드 컴포넌트 세부사항
```
components/
├── card-email.tsx       # 이메일 QR 코드 폼
├── card-location.tsx    # 위치 QR 코드 폼
├── card-preview.tsx     # QR 코드 미리보기
├── card-sms.tsx         # SMS QR 코드 폼
├── card-style.tsx       # QR 코드 스타일 설정
├── card-textarea.tsx    # 텍스트 QR 코드 폼
├── card-url.tsx         # URL QR 코드 폼
├── card-vcard.tsx       # vCard QR 코드 폼
├── card-wifi.tsx        # WiFi QR 코드 폼
├── qr-handlers.ts       # QR 코드 이벤트 핸들러
└── qrcode-form.tsx      # 메인 QR 코드 폼
```

### `components/` - 재사용 가능한 컴포넌트

#### `ui/` - Shadcn/ui 컴포넌트 (48개)
Radix UI 기반의 고품질 UI 컴포넌트들:

```
ui/
├── accordion.tsx        # 아코디언 컴포넌트
├── alert-dialog.tsx     # 알림 다이얼로그
├── alert.tsx           # 알림 컴포넌트
├── aspect-ratio.tsx    # 비율 래퍼
├── avatar.tsx          # 아바타 컴포넌트
├── badge.tsx           # 배지 컴포넌트
├── breadcrumb.tsx      # 브레드크럼 네비게이션
├── button.tsx          # 버튼 컴포넌트
├── calendar.tsx        # 캘린더 컴포넌트
├── card.tsx            # 카드 컨테이너
├── carousel.tsx        # 캐러셀 컴포넌트
├── chart.tsx           # 차트 컴포넌트
├── checkbox.tsx        # 체크박스
├── collapsible.tsx     # 접을 수 있는 컨테이너
├── command.tsx         # 명령 팔레트
├── context-menu.tsx    # 컨텍스트 메뉴
├── data-table.tsx      # 데이터 테이블
├── date-picker.tsx     # 날짜 선택기
├── dialog.tsx          # 다이얼로그 모달
├── drawer.tsx          # 드로어 컴포넌트
├── dropdown-menu.tsx   # 드롭다운 메뉴
├── form.tsx            # 폼 컴포넌트
├── hover-card.tsx      # 호버 카드
├── input-otp.tsx       # OTP 입력
├── input.tsx           # 입력 필드
├── label.tsx           # 라벨 컴포넌트
├── menubar.tsx         # 메뉴바
├── navigation-menu.tsx # 네비게이션 메뉴
├── pagination.tsx      # 페이지네이션
├── popover.tsx         # 팝오버
├── progress.tsx        # 프로그레스 바
├── radio-group.tsx     # 라디오 그룹
├── resizable.tsx       # 크기 조정 가능한 패널
├── scroll-area.tsx     # 스크롤 영역
├── select.tsx          # 선택 드롭다운
├── separator.tsx       # 구분선
├── sheet.tsx           # 시트 컴포넌트
├── sidebar.tsx         # 사이드바
├── skeleton.tsx        # 스켈레톤 로딩
├── slider.tsx          # 슬라이더
├── sonner.tsx          # 토스트 알림
├── switch.tsx          # 스위치 토글
├── table.tsx           # 테이블 컴포넌트
├── tabs.tsx            # 탭 컴포넌트
├── textarea.tsx        # 텍스트 영역
├── toggle-group.tsx    # 토글 그룹
├── toggle.tsx          # 토글 버튼
└── tooltip.tsx         # 툴팁
```

#### 기타 유틸리티 컴포넌트
- `access-denied-alert.tsx` - 접근 거부 알림
- `address-search.tsx` - 주소 검색 컴포넌트
- `client-only.tsx` - 클라이언트 전용 래퍼
- `github-badge.tsx` - GitHub 배지
- `history-button.tsx` - 히스토리 버튼
- `loading-spinner.tsx` - 로딩 스피너
- `log-statistics.tsx` - 로그 통계 컴포넌트
- `new-qr-code-button.tsx` - 새 QR 코드 버튼
- `tailwind-indicator.tsx` - Tailwind 브레이크포인트 표시기
- `unauthenticated.tsx` - 비인증 상태 컴포넌트
- `user-nav.tsx` - 사용자 네비게이션
- `user-profile.tsx` - 사용자 프로필 컴포넌트

### `config/` - 애플리케이션 설정
- `app.ts` - 애플리케이션 설정 상수

### `context/` - React Context 프로바이더
- `auth-provider.tsx` - 인증 컨텍스트 프로바이더
- `client-providers.tsx` - 클라이언트 프로바이더 래퍼

### `docs/` - 프로젝트 문서
- `API.md` - API 엔드포인트 및 Server Actions 문서
- `DEPENDENCIES.md` - 종속성 관리 문서
- `DEPLOYMENT.md` - 배포 가이드 및 환경 설정
- `DEVELOPMENT.md` - 개발 가이드 및 코딩 스타일
- `PROJECT.md` - 프로젝트 개요 및 기술 스택

### `hooks/` - 커스텀 훅 및 Zustand 스토어
- `use-mobile.tsx` - 모바일 디바이스 감지 훅
- `use-remember-me.ts` - 로그인 기억하기 기능 훅
- `use-toast.ts` - 토스트 알림 훅
- `use-token-refresh.ts` - 토큰 갱신 훅

### `lib/` - 유틸리티 함수 및 라이브러리

#### 핵심 라이브러리
- `prisma.ts` - Prisma 데이터베이스 연결
- `utils.ts` - 일반 유틸리티 함수
- `constants.ts` - 애플리케이션 상수

#### 인증 관련
- `auth-helpers.ts` - 인증 헬퍼 함수
- `auth-server.ts` - 서버사이드 인증 유틸리티
- `auth-utils.ts` - 인증 유틸리티

#### 로깅 시스템
- `unified-logging.ts` - 통합 로깅 시스템
- `api-logging.ts` - API 요청 로깅
- `error-logging.ts` - 에러 로깅
- `log-cleanup.ts` - 로그 정리 기능
- `log-utils.ts` - 로그 유틸리티
- `logging-middleware.ts` - 로깅 미들웨어
- `logging-examples.ts` - 로깅 사용 예제

#### 보안 및 RLS
- `rls-manager.ts` - Row Level Security 매니저
- `rls-utils.ts` - RLS 유틸리티

#### 기타 유틸리티
- `download-utils.ts` - 파일 다운로드 유틸리티
- `env-validation.ts` - 환경 변수 검증
- `csv-utils.ts` - CSV 처리 유틸리티

#### `supabase/` - Supabase 관련 유틸리티
Supabase 클라이언트 및 관련 유틸리티들

### `prisma/` - 데이터베이스 관련
- `schema.prisma` - Prisma 데이터베이스 스키마
- `migrations/` - 데이터베이스 마이그레이션 파일들

### `public/` - 정적 자산
- `favicon.ico` - 파비콘
- PWA 매니페스트, 서비스 워커, 폰트, 스크린샷 등

### `screenshots/` - 애플리케이션 스크린샷
문서화를 위한 애플리케이션 스크린샷들:
- `admin-logs-cleanup.JPG` - 관리자 로그 정리 화면
- `admin-logs.JPG` - 관리자 로그 관리 화면
- `app.JPG` - 메인 애플리케이션 화면
- `dashboard-*.JPG` - 대시보드 페이지들
- `qrcode-*.JPG` - 각 QR 코드 타입별 스크린샷

### `scripts/` - 유틸리티 스크립트
시스템 관리 및 유지보수를 위한 스크립트들:
- `backup-logs.sql` - 로그 데이터 백업 SQL
- `cleanup-old-logs.sql` - 오래된 로그 정리 SQL
- `migrate-logging-system.sh` - 로깅 시스템 마이그레이션
- `setup-rls.sh` - RLS 설정 스크립트
- `setup-unified-rls.sql` - 통합 RLS 설정 SQL
- `test-unified-logging.ts` - 통합 로깅 시스템 테스트

### `types/` - TypeScript 타입 정의
- `data-manager.ts` - 데이터 관리 타입
- `environment.d.ts` - 환경 변수 타입
- `logs.ts` - 로깅 시스템 타입
- `next-auth.d.ts` - NextAuth.js 타입 확장
- `qr-code-server.ts` - 서버 사이드 QR 코드 타입
- `qr-code.ts` - 클라이언트 사이드 QR 코드 타입
- `rls.ts` - Row Level Security 타입

## 파일 명명 규칙

### 컴포넌트
- React 컴포넌트: `kebab-case.tsx`
- Hook: `use-*.ts`
- 유틸리티: `kebab-case.ts`

### 디렉토리
- 모든 디렉토리: `kebab-case`
- 페이지 디렉토리: Next.js 라우팅 규칙 준수

### 타입 정의
- 타입 파일: `kebab-case.ts`
- 인터페이스: `PascalCase`
- 타입 별칭: `PascalCase`

## 코드 구조 원칙

### 관심사의 분리
- UI 컴포넌트는 `components/` 디렉토리
- 비즈니스 로직은 `lib/` 또는 `actions/`
- 타입 정의는 `types/` 디렉토리

### 재사용성
- 공통 컴포넌트는 `components/ui/`
- 페이지별 컴포넌트는 해당 페이지 디렉토리 내부
- 유틸리티 함수는 `lib/` 디렉토리

### 모듈화
- 각 기능별로 독립적인 모듈 구성
- 명확한 책임 분리
- 순환 의존성 방지

## 빌드 및 배포 구조

### Next.js 빌드
```
.next/              # Next.js 빌드 출력
└── static/         # 정적 자산 최적화 버전
```

### 환경 설정
- `.env.local` - 로컬 개발 환경 변수
- `.env.example` - 환경 변수 템플릿
- `vercel.json` - Vercel 배포 설정

이 구조는 확장성, 유지보수성, 그리고 개발자 경험을 최적화하도록 설계되었습니다.
