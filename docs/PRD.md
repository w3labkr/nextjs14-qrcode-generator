# **오픈소스 QR 코드 생성기: 제품 요구사항 정의서 (PRD)**

## **1. 소개**

이 문서는 누구나 자유롭게 사용할 수 있는 웹 기반 오픈소스 QR 코드 생성기의 제품 요구사항을 정의합니다. 본 프로젝트는 **Next.js 14**, **Tailwind CSS**, **Shadcn UI** 기술 스택을 활용하여, 사용자에게 강력한 QR 코드 생성 및 커스터마이징 경험을 제공하는 것을 목표로 합니다.

* **프로젝트 비전**: 회원가입### **3.3. 현재 프로젝트 구조**

프로젝트는 Next.js 14 App Router 구조를 기반으로 체계적으로 구성되어 있습니다.

```
nextjs14-qrcode-generator/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # 루트 레이아웃
│   ├── page.tsx                 # 홈페이지
│   ├── globals.css              # 전역 스타일
│   ├── actions/                 # Server Actions
│   │   ├── qr-code-generator.ts # QR 코드 생성 로직
│   │   ├── qr-code-management.ts # QR 코드 CRUD
│   │   ├── template-management.ts # 템플릿 관리
│   │   └── data-management.ts   # 데이터 관리
│   ├── api/                     # API Routes
│   │   ├── auth/               # NextAuth.js 인증 API
│   │   ├── email/              # 이메일 API
│   │   └── qrcodes/            # QR 코드 관리 API
│   ├── auth/                    # 인증 관련 페이지
│   │   ├── signin/             # 로그인 페이지
│   │   ├── error/              # 인증 오류 페이지
│   │   └── verify-request/     # 이메일 인증 페이지
│   ├── dashboard/               # 대시보드 (로그인 사용자)
│   │   ├── layout.tsx          # 대시보드 레이아웃
│   │   ├── page.tsx            # 대시보드 홈
│   │   ├── history/            # QR 코드 히스토리
│   │   ├── templates/          # 템플릿 관리
│   │   ├── profile/            # 프로필 관리
│   │   └── settings/           # 설정
│   └── qrcode/                  # QR 코드 생성 메인 페이지
│       └── page.tsx
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                      # Shadcn UI 컴포넌트 (47개)
│   │   ├── accordion.tsx        # 아코디언 컴포넌트
│   │   ├── address-search.tsx   # 주소 검색 컴포넌트 (한국 주소 API)
│   │   ├── alert-dialog.tsx     # 알림 대화상자
│   │   ├── button.tsx           # 버튼 컴포넌트
│   │   ├── card.tsx             # 카드 컴포넌트
│   │   ├── dialog.tsx           # 대화상자
│   │   ├── drawer.tsx           # 모바일 drawer
│   │   ├── input-otp.tsx        # OTP 입력 컴포넌트
│   │   ├── resizable.tsx        # 크기 조절 가능한 패널
│   │   ├── sidebar.tsx          # 사이드바 컴포넌트
│   │   └── ... (기타 40개 UI 컴포넌트)
│   ├── qr-code-forms/           # QR 코드 유형별 폼
│   │   ├── url-form.tsx
│   │   ├── text-form.tsx
│   │   ├── wifi-form.tsx
│   │   ├── vcard-form.tsx
│   │   ├── email-form.tsx
│   │   ├── sms-form.tsx
│   │   └── location-form.tsx
│   ├── qr-code-frames/          # QR 코드 프레임 선택
│   │   ├── frame-selector.tsx
│   │   └── index.tsx
│   ├── template-manager/        # 템플릿 관리
│   │   ├── template-list.tsx
│   │   ├── save-template-dialog.tsx
│   │   ├── edit-template-dialog.tsx
│   │   └── loading-skeleton.tsx
│   ├── auth-provider.tsx        # 인증 제공자
│   ├── github-badge.tsx         # GitHub 배지
│   ├── new-qr-code-button.tsx   # 새 QR 코드 버튼
│   ├── page-header.tsx          # 페이지 헤더
│   ├── qr-code-preview-card.tsx # QR 코드 미리보기
│   ├── qr-code-preview-with-frame.tsx # 프레임 포함 미리보기
│   ├── qr-code-settings-panel.tsx # 설정 패널
│   ├── qr-code-tabs.tsx         # QR 코드 탭
│   ├── tailwind-indicator.tsx   # Tailwind 개발 인디케이터
│   ├── token-status-indicator.tsx # 토큰 상태 인디케이터
│   ├── user-nav.tsx             # 사용자 네비게이션
│   └── user-profile.tsx         # 사용자 프로필
├── hooks/                       # 커스텀 훅 & 상태 관리
│   ├── use-template.ts          # 템플릿 관리 훅
│   ├── use-mobile.tsx           # 모바일 감지 훅
│   └── use-token-refresh.ts     # 토큰 갱신 훅
├── lib/                         # 유틸리티 & 설정
│   ├── prisma.ts               # Prisma 클라이언트
│   ├── utils.ts                # 공통 유틸리티
│   ├── constants.ts            # 상수 정의
│   ├── auth-utils.ts           # 인증 관련 유틸리티
│   ├── csv-utils.ts            # CSV 처리 유틸리티
│   ├── rls-utils.ts            # RLS 유틸리티
│   └── supabase/               # Supabase 설정
├── types/                       # TypeScript 타입 정의
│   ├── qr-code.ts              # QR 코드 타입
│   ├── qr-code-server.ts       # 서버사이드 QR 타입
│   ├── data-manager.ts         # 데이터 관리 타입
│   ├── next-auth.d.ts          # NextAuth 타입 확장
│   └── environment.d.ts        # 환경변수 타입
├── prisma/                      # 데이터베이스
│   ├── schema.prisma           # Prisma 스키마
│   └── migrations/             # 데이터베이스 마이그레이션
├── public/                      # 정적 자산
├── docs/                        # 프로젝트 문서
│   ├── PRD.md                  # 제품 요구사항 정의서 (현재 파일)
│   ├── DEPENDENCIES.md         # 의존성 문서
│   └── RLS_SETUP.md            # RLS 설정 가이드
├── auth.config.ts              # NextAuth 설정
├── auth.ts                     # NextAuth 인증 로직
├── components.json             # Shadcn UI 설정
├── tailwind.config.ts          # Tailwind CSS 설정
├── next.config.mjs             # Next.js 설정
├── package.json                # 패키지 의존성 (70+ 패키지)
└── tsconfig.json               # TypeScript 설정
```

### **3.4. 주요 패키지 및 라이브러리**

현재 프로젝트에서 사용 중인 주요 패키지들입니다 (총 70개 이상의 패키지):

**핵심 프레임워크:**
* `next@14.2.30` - Next.js 프레임워크
* `react@^18` - React 라이브러리
* `typescript@^5` - TypeScript

**인증 & 데이터베이스:**
* `next-auth@^5.0.0-beta.28` - NextAuth.js v5 인증
* `@auth/prisma-adapter@^2.10.0` - Prisma 어댑터
* `@prisma/client@^6.10.1` - Prisma ORM 클라이언트
* `@supabase/supabase-js@^2.50.0` - Supabase 클라이언트
* `@supabase/ssr@^0.6.1` - Supabase SSR

**QR 코드 생성:**
* `qr-code-styling@^1.9.2` - 고급 QR 코드 스타일링
* `qr-code-styling-node@^1.5.0` - Node.js 서버 사이드 QR 코드 스타일링
* `qrcode@^1.5.4` - 기본 QR 코드 생성
* `qrcode.react@^4.2.0` - React QR 코드 컴포넌트
* `canvas@^3.1.0` - 서버사이드 캔버스 렌더링

**UI 컴포넌트 (Radix UI 기반 47개):**
* `@radix-ui/react-*` - 27개의 다양한 UI 프리미티브 (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toggle, tooltip 등)
* `lucide-react@^0.515.0` - 아이콘 라이브러리
* `tailwindcss@^3.4.1` - CSS 프레임워크
* `tailwind-merge@^3.3.1` - 클래스 병합 유틸리티
* `tailwindcss-animate@^1.0.7` - CSS 애니메이션
* `class-variance-authority@^0.7.1` - 컴포넌트 변형 관리
* `clsx@^2.1.1` - 조건부 클래스 이름

**상태 관리 & 폼:**
* `zustand@^5.0.5` - 전역 상태 관리
* `react-hook-form@^7.58.0` - 폼 상태 관리
* `@hookform/resolvers@^5.1.1` - 폼 검증 리졸버
* `zod@^3.25.64` - 스키마 검증
* `@tanstack/react-query@^5.80.7` - 서버 상태 관리
* `@tanstack/react-table@^8.21.3` - 데이터 테이블 관리

**UI/UX 라이브러리:**
* `sonner@^2.0.5` - 토스트 알림
* `react-day-picker@^9.7.0` - 날짜 선택기
* `embla-carousel-react@^8.6.0` - 캐러셀 컴포넌트
* `recharts@^2.15.3` - 차트 및 데이터 시각화
* `react-resizable-panels@^3.0.3` - 크기 조절 가능한 패널
* `vaul@^1.1.2` - 모바일 drawer 컴포넌트
* `cmdk@^1.1.1` - 명령 팔레트
* `input-otp@^1.4.2` - OTP 입력 컴포넌트

**유틸리티 & 서비스:**
* `axios@^1.10.0` - HTTP 클라이언트
* `qs@^6.14.0` - 쿼리 스트링 파싱
* `cookies-next@^4.3.0` - 쿠키 관리
* `jsdom@^26.1.0` - 서버사이드 DOM 조작
* `jose@^6.0.11` - JWT 처리
* `date-fns@^4.1.0` - 날짜 유틸리티
* `dayjs@^1.11.13` - 경량 날짜 라이브러리
* `react-daum-postcode@^3.2.0` - 한국 주소 검색 API

**개발 도구:**
* `eslint@^8.57.1` - 코드 린팅 
* `prettier@^3.5.3` - 코드 포매팅
* `@typescript-eslint/*` - TypeScript ESLint
* `eslint-plugin-*` - 다양한 ESLint 플러그인 (import, react, tailwindcss 등)
* `prettier-plugin-*` - Prettier 플러그인 (prisma, tailwindcss)
* `ts-node@^10.9.2` - TypeScript 실행
* `tsx@^4.20.3` - TypeScript 실행 도구

### **3.5. 개발자 경험 (DX) 개선**

오픈소스 프로젝트로서 개발자들이 쉽게 기여하고 테스트할 수 있도록 개발 환경을 최적화합니다.

**개발 워크플로우 최적화:**

* **빠른 설정**: 최소한의 환경변수로 로컬 개발 시작 가능
* **핫 리로딩**: Next.js Turbopack을 활용한 빠른 개발 서버
* **타입 안전성**: TypeScript와 Prisma의 완전한 타입 추론 지원
* **코드 품질**: ESLint, Prettier를 통한 일관된 코드 스타일 유지
* **컴포넌트 기반 구조**: 47개의 재사용 가능한 UI 컴포넌트
* **모듈식 아키텍처**: 명확한 디렉토리 구조와 관심사 분리
* **Git 워크플로우**: `.gitmessage.txt` 기반 일관된 커밋 메시지
* **환경 설정**: `.editorconfig`, `.prettier.json` 등 개발 환경 표준화
* **자동화**: `pre-commit.sh` 훅을 통한 코드 품질 자동 검증누구나 즉시 사용할 수 있는 강력하고 아름다운 정적 QR 코드 생성 도구를 제공하는 동시에, 로그인한 사용자에게는 QR 코드 히스토리 관리와 고급 기능을 제공하여 정보 공유의 장벽을 낮춥니다.
* **핵심 목표**:
    * 다양한 유형의 정적 QR 코드를 즉시 생성하는 기능을 제공합니다.
    * 색상, 로고, 모양 등 광범위한 사용자 정의 옵션을 통해 사용자가 브랜드 아이덴티티를 반영할 수 있도록 지원합니다.
    * Next.js 14를 기반으로 빠르고 반응성이 뛰어난 사용자 경험을 보장합니다.
    * 로그인한 사용자에게는 생성한 QR 코드의 히스토리 관리와 고해상도 다운로드 등 프리미엄 기능을 제공합니다.
    * 오픈소스로 코드를 공개하여 누구나 기여하고 활용할 수 있는 생태계를 구축합니다.
* **타겟 사용자**:
    * **일반 사용자**: Wi-Fi 정보, 웹사이트 링크 등 개인적인 용도로 빠르고 쉽게 QR 코드를 만들고 싶은 모든 사람.
    * **디자이너 및 마케터**: 브랜드 가이드라인에 맞춰 로고와 특정 색상이 포함된 맞춤형 QR 코드를 제작해야 하는 전문가.
    * **개발자**: 프로젝트에 QR 코드 생성 기능이 필요하거나, 오픈소스 프로젝트에 기여하고 싶은 개발자.

---

## **2. 기능 요구사항**

본 프로젝트는 익명 사용자를 위한 정적 QR 코드 생성과 로그인 사용자를 위한 개인화된 QR 코드 관리 기능을 모두 지원합니다.

### **2.1. 정적 QR 코드 생성**

사용자가 입력한 정보를 기반으로 영구적으로 작동하는 정적 QR 코드를 생성합니다. 생성된 코드는 스캔 횟수에 제한이 없으며, 인터넷 연결 없이도 스캔될 수 있는 정보를 담을 수 있습니다.

* **핵심 원칙**: 모든 QR 코드 생성 기능은 무료로 제공되며, 상업적 목적으로도 자유롭게 사용할 수 있습니다.
* **제외 기능**: 데이터 추적 및 생성 후 콘텐츠 수정 기능은 제공하지 않습니다.

### **2.2. 지원 QR 코드 콘텐츠 유형**

다양한 활용 사례를 지원하기 위해 다음과 같은 정적 콘텐츠 유형을 지원해야 합니다.

| 콘텐츠 유형 | 주요 활용 사례 |
| :--- | :--- |
| **URL/웹사이트** | 웹사이트, 랜딩 페이지, 온라인 리소스 공유 |
| **텍스트** | 간단한 메시지, 지침, 제품 정보 등 공유 |
| **이메일** | 미리 채워진 수신자, 제목으로 이메일 앱 실행 |
| **SMS/전화번호** | 미리 채워진 수신 번호, 메시지로 문자 앱 또는 전화 앱 실행 |
| **Wi-Fi** | SSID, 비밀번호 등 네트워크 정보를 저장하여 간편한 Wi-Fi 접속 지원 |
| **vCard/MeCard** | 이름, 전화번호, 이메일, 주소 등 연락처 정보 공유 |
| **지도** | Google 지도 링크 공유 |

### **2.3. QR 코드 사용자 정의**

브랜드 아이덴티티를 통합하고 시각적 매력을 높여 스캔율을 높이는 데 매우 중요한 기능입니다.

* **색상 변경**: 전경색, 배경색, 그라데이션 색상을 자유롭게 선택할 수 있으며, QR 코드의 눈(Eye) 부분 색상도 개별적으로 설정할 수 있습니다. 스캔 오류 방지를 위해 반전된 색상 선택 시 경고 메시지를 표시해야 합니다.
* **로고 삽입**: 브랜드 로고(PNG, JPG, SVG 등)를 QR 코드 중앙에 추가하여 브랜드 인지도를 높일 수 있습니다. QR 코드의 오류 수정 기능(Error Correction)을 활용하여 로고가 있어도 스캔이 가능하도록 구현합니다.
* **모양 및 패턴 변경**: QR 코드 본체의 패턴과 눈(Eye)의 모양(프레임 및 눈동자)을 다양하게 변경할 수 있습니다.
* **프레임 추가**: "스캔해 주세요"와 같은 클릭 유도 문구(CTA)를 포함한 다양한 디자인의 프레임을 추가하여 스캔율을 높입니다.

### **2.4. 다운로드 및 공유**

생성된 QR 코드는 다양한 형식으로 즉시 다운로드할 수 있어야 합니다.

* **기본 지원 형식** (모든 사용자 이용 가능):
    * **PNG**: 디지털 및 일반 인쇄용으로 적합한 이미지 형식 (최대 1024x1024 픽셀)
    * **SVG**: 크기를 조정해도 품질이 저하되지 않는 벡터 형식
    * **JPG**: 웹 사용에 적합한 압축 이미지 형식 (최대 1024x1024 픽셀)

* **프리미엄 지원 형식** (로그인 사용자 전용):
    * **고해상도 PNG**: 인쇄용 고해상도 이미지 (최대 4096x4096 픽셀)
    * **고해상도 JPG**: 인쇄용 고해상도 이미지 (최대 4096x4096 픽셀)
    * **PDF**: 인쇄 및 공유에 용이한 문서 형식

* **다운로드 제한**: 익명 사용자는 기본 해상도(1024x1024)까지, 로그인 사용자는 인쇄용 고해상도(4096x4096)까지 다운로드 가능합니다.

### **2.5. 사용자 인증 및 QR 코드 히스토리 관리**

로그인한 사용자를 위한 개인화된 QR 코드 관리 기능을 제공합니다.

* **인증 시스템**:
  * **OAuth 로그인**: Google OAuth를 통한 간편 로그인 지원
  * **세션 관리**: 보안이 강화된 JWT 기반 세션 관리
  * **선택적 로그인**: 로그인 없이도 모든 QR 코드 생성 기능을 사용할 수 있으며, 로그인 시에만 추가 기능 제공

* **QR 코드 히스토리 관리**:
  * **자동 저장**: 로그인한 사용자가 생성한 모든 QR 코드를 자동으로 데이터베이스에 저장
  * **히스토리 조회**: 사용자가 생성한 QR 코드 목록을 시간순으로 조회 가능
  * **재사용**: 이전에 생성한 QR 코드를 다시 다운로드하거나 수정하여 새로 생성
  * **고해상도 다운로드**: 저장된 QR 코드를 고해상도(4096x4096) 및 PDF 형식으로 다운로드
  * **즐겨찾기**: 자주 사용하는 QR 코드를 즐겨찾기로 표시하여 빠른 접근 제공
  * **검색 및 필터링**: QR 코드 유형, 생성 날짜, 제목 등으로 검색 및 필터링 기능

* **개인화 기능**:
  * **개인 템플릿**: 사용자가 자주 사용하는 색상, 로고, 프레임 설정을 템플릿으로 저장
  * **통계 대시보드**: 생성한 QR 코드 개수, 유형별 통계 등 개인 사용 통계 제공

---

## **3. 기술 구현 계획**

하이브리드 아키텍처를 통해 익명 사용자를 위한 정적 사이트와 로그인 사용자를 위한 데이터베이스 기반 기능을 모두 지원합니다.

| 기술 스택 | 주요 활용 기능/아키텍처 | 구현 고려사항/장점 |
| :--- | :--- | :--- |
| **Next.js 14** | App Router, 서버 컴포넌트 & SSR | 파일 시스템 기반의 직관적인 라우팅을 제공하며, 빠른 초기 로딩 속도와 검색 엔진 최적화(SEO)에 유리합니다. |
| | 서버 액션 (Server Actions) | QR 코드 생성 로직을 서버에서 처리하여 클라이언트의 부담을 줄이고, 일관된 생성 결과를 보장할 수 있습니다. |
| | API Routes | 사용자 인증 및 QR 코드 CRUD 작업을 위한 RESTful API 엔드포인트를 제공합니다. |
| | 성능 최적화 (Turbopack) | 로컬 개발 서버의 빠른 구동 및 코드 업데이트 속도로 개발 생산성을 높입니다. |
| **NextAuth.js v5** | OAuth 인증, 세션 관리 | Google OAuth를 통한 안전하고 편리한 인증 시스템을 제공합니다. JWT 기반 세션과 토큰 자동 갱신 기능을 지원합니다. |
| | Prisma 어댑터 | 사용자 세션과 계정 정보를 데이터베이스에 안전하게 저장하고 관리합니다. (@auth/prisma-adapter 사용) |
| **Supabase PostgreSQL** | 완전관리형 PostgreSQL 데이터베이스 | 빠른 응답 속도와 실시간 기능을 제공하며, 강력한 SQL 기능과 확장성을 제공합니다. |
| | 실시간 기능 & 보안 | 실시간 구독 기능과 Row Level Security(RLS)를 통해 데이터 보안과 사용자 경험을 향상시킵니다. |
| **Prisma ORM** | 타입 안전 데이터베이스 접근 | TypeScript와 완벽히 통합된 타입 안전한 데이터베이스 쿼리를 제공하여 개발 생산성과 코드 품질을 높입니다. |
| | 마이그레이션 관리 | 데이터베이스 스키마 변경을 안전하게 관리하고 버전 제어를 통해 협업을 용이하게 합니다. |
| **QR 코드 생성 라이브러리** | qr-code-styling, qrcode, qrcode.react | 고급 스타일링과 기본 생성 기능을 조합하여 다양한 요구사항을 만족시킵니다. canvas 라이브러리로 서버사이드 렌더링을 지원합니다. |
| **Tailwind CSS** | 유틸리티 우선(Utility-First) CSS | HTML 내에서 직접 클래스를 조합하여 빠르고 일관된 반응형 UI를 구축할 수 있습니다. tailwind-merge와 clsx로 조건부 스타일링을 지원합니다. |
| **Shadcn UI + Radix UI** | 재사용 가능한 컴포넌트 컬렉션 | Radix UI 기반의 45개 이상의 컴포넌트를 제공하며, 접근성과 커스터마이징을 모두 지원합니다. |
| **상태 관리** | React Hook Form + Zustand | 폼 상태는 react-hook-form으로, 전역 상태는 zustand로 관리하여 성능과 개발 경험을 최적화합니다. |
| **데이터 페칭** | TanStack Query (React Query) | 서버 상태 관리와 캐싱으로 API 호출을 최적화하고 사용자 경험을 향상시킵니다. |
| **UI/UX 라이브러리** | 통합된 사용자 경험 제공 | lucide-react 아이콘, sonner 토스트, recharts 차트, embla-carousel 등으로 풍부한 인터랙션을 제공합니다. |

---

## **3.1. 데이터베이스 스키마 설계**

사용자 인증과 QR 코드 히스토리 관리를 위한 데이터베이스 스키마입니다.

```prisma
// 사용자 테이블 (NextAuth.js 기본 스키마)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  qrCodes       QrCode[]
  templates     QrTemplate[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

-- QR 코드 히스토리 테이블
model QrCode {
  id         String   @id @default(cuid())
  userId     String
  type       String   -- URL, TEXT, WIFI, EMAIL, SMS, VCARD, LOCATION
  title      String?  -- 사용자가 지정한 제목
  content    String   -- QR 코드에 포함된 실제 데이터
  settings   String   -- 색상, 로고, 모양 등 커스터마이징 설정 (JSON 문자열)
  isFavorite Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])
  @@index([userId, type])
  @@map("qr_codes")
}

-- 사용자 템플릿 테이블
model QrTemplate {
  id        String   @id @default(cuid())
  userId    String
  name      String   -- 템플릿 이름
  settings  String   -- 색상, 로고, 모양 등 설정 (JSON 문자열)
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("qr_templates")
}
```

**보안 기능 (Row Level Security)**:

* 모든 테이블에 RLS(Row Level Security) 정책이 적용되어 사용자는 자신의 데이터만 접근 가능
* Prisma 스키마에 RLS 설정 가이드가 포함되어 있어 데이터 보안을 강화

### **3.2. API 설계**

사용자 인증과 QR 코드 관리를 위한 API 엔드포인트입니다.

* **인증 관련 API**:
  * `GET /api/auth/session` - 현재 사용자 세션 정보 조회
  * `POST /api/auth/signin` - OAuth 로그인 (Auth.js 제공)
  * `POST /api/auth/signout` - 로그아웃 (Auth.js 제공)

* **QR 코드 관리 API**:
  * `GET /api/qrcodes` - 사용자의 QR 코드 목록 조회 (페이지네이션, 필터링, 검색 지원)
  * `POST /api/qrcodes` - 새 QR 코드 생성 및 저장
  * `GET /api/qrcodes/:id` - 특정 QR 코드 상세 정보 조회
  * `PUT /api/qrcodes/:id` - QR 코드 정보 업데이트 (제목, 즐겨찾기 상태 등)
  * `DELETE /api/qrcodes/:id` - QR 코드 삭제
  * `POST /api/qrcodes/:id/favorite` - 즐겨찾기 토글
  * `GET /api/qrcodes/:id/download` - 고해상도 QR 코드 다운로드 (로그인 사용자 전용)

---

## **3.3. 개발자 경험 (DX) 개선**

오픈소스 프로젝트로서 개발자들이 쉽게 기여하고 테스트할 수 있도록 개발 환경을 최적화합니다.

### **3.3.1. 개발 워크플로우 최적화**

* **빠른 설정**: 최소한의 환경변수로 로컬 개발 시작 가능
* **핫 리로딩**: Next.js Turbopack을 활용한 빠른 개발 서버
* **타입 안전성**: TypeScript와 Prisma의 완전한 타입 추론 지원
* **코드 품질**: ESLint, Prettier를 통한 일관된 코드 스타일 유지

---

## **4. 현재 구현 상태 및 향후 개발 로드맵**

프로젝트는 현재 **2단계 완료** 상태이며, 핵심 기능들이 모두 구현되어 있습니다.

### **4.1. 현재 구현 완료된 기능 (2024.12 기준)**

**✅ 1단계 MVP 기능 (완료)**:
* ✅ URL, 텍스트, Wi-Fi, vCard, 이메일, SMS, 위치 등 7가지 QR 코드 유형 지원
* ✅ 고급 사용자 정의 기능 (색상, 로고, 모양, 패턴, 프레임)
* ✅ PNG, SVG, JPG 형식 다운로드 지원
* ✅ 모바일 반응형 UI 구현

**✅ 2단계 인증 시스템 및 데이터베이스 기능 (완료)**:
* ✅ NextAuth.js v5 기반 Google OAuth 인증 시스템
* ✅ Supabase PostgreSQL 데이터베이스 연동
* ✅ Prisma ORM 및 마이그레이션 시스템
* ✅ Row Level Security (RLS) 기반 데이터 보안
* ✅ QR 코드 히스토리 관리 (생성, 조회, 삭제, 즐겨찾기)
* ✅ 개인 템플릿 저장 및 관리 기능
* ✅ 고해상도 다운로드 (로그인 사용자 전용)
* ✅ 대시보드 및 사용자 프로필 관리

**✅ 추가 구현된 고급 기능**:
* ✅ 45개 이상의 Shadcn UI 컴포넌트 통합
* ✅ TanStack Query 기반 서버 상태 관리
* ✅ Zustand 전역 상태 관리
* ✅ React Hook Form 기반 폼 관리
* ✅ 실시간 QR 코드 미리보기
* ✅ 모바일 감지 및 터치 최적화
* ✅ 토큰 자동 갱신 시스템
* ✅ 주소 검색 기능 (한국 주소 API 연동)

### **4.2. 3단계: 커뮤니티 및 혁신 (진행 중)**

**🔄 현재 진행 중인 기능**:
* 🔄 통계 대시보드 확장
* 🔄 API 엔드포인트 문서화
* 🔄 성능 최적화 및 코드 분할

**📋 계획된 기능**:
* 📋 외부 서비스 연동을 위한 공개 API 제공
* 📋 QR 코드 배치 생성 기능
* 📋 커뮤니티 템플릿 갤러리
* 📋 PWA (Progressive Web App) 기능
* 📋 다국어 지원 (i18n)
* 📋 고급 분석 도구
* 📋 QR 코드 인쇄 최적화

### **4.3. 향후 확장 계획**

**단기 목표 (2025 Q1-Q2)**:
* PDF 다운로드 형식 추가
* 더 많은 프레임 및 스타일 템플릿
* 사용자 피드백 시스템
* 성능 메트릭 대시보드

**중기 목표 (2025 Q3-Q4)**:
* 동적 QR 코드 기능 검토
* 엔터프라이즈 기능 (팀 관리, 브랜드 키트)
* 모바일 앱 개발 검토
* AI 기반 디자인 추천

**장기 목표 (2026+)**:
* 글로벌 서비스 확장
* 다양한 플랫폼 통합 (Figma, Canva 플러그인)
* 블록체인 기반 QR 코드 인증
* IoT 디바이스 연동
  * **결과물**:
    * 다른 서비스나 애플리케이션에서 쉽게 QR 코드를 생성할 수 있는 **간단한 API 엔드포인트** 제공.
    * **통계 대시보드 및 고급 분석 기능**.
    * 프로젝트 기여자를 위한 명확한 가이드라인 문서 작성 및 커뮤니티 활성화.
    * 사용자들이 디자인한 QR 코드 템플릿을 공유하고 사용할 수 있는 템플릿 갤러리 기능 탐색.

---

## **5. 보안 및 개인정보보호**

사용자 데이터 보호와 개인정보보호를 위한 보안 방침입니다.

### **5.1. 데이터 보안**

* **최소 데이터 수집**: 서비스 제공에 필요한 최소한의 정보만 수집 (OAuth 제공자로부터 받은 기본 프로필 정보)
* **데이터 암호화**:
  * 전송 중 데이터 암호화 (HTTPS/TLS)
  * 저장된 민감 정보 암호화 (토큰, 세션 정보)
* **세션 보안**:
  * JWT 기반 안전한 세션 관리
  * 세션 만료 시간 설정 및 자동 갱신
* **데이터베이스 보안**:
  * Turso의 내장 보안 기능 활용
  * 데이터베이스 접근 권한 최소화

### **5.2. 개인정보보호**

* **선택적 로그인**: 로그인 없이도 모든 기본 기능 사용 가능
* **데이터 소유권**: 사용자가 생성한 모든 데이터에 대한 완전한 소유권 보장
* **데이터 삭제권**: 사용자가 언제든지 자신의 계정과 모든 데이터를 삭제할 수 있는 기능 제공
* **투명성**: 수집하는 데이터와 사용 목적에 대한 명확한 안내
* **제3자 공유 금지**: 사용자 데이터를 제3자와 공유하지 않음

### **5.3. 준수 사항**

* **GDPR 준수**: 유럽 일반 데이터 보호 규정 준수
* **개인정보보호법 준수**: 한국 개인정보보호법 준수
* **오픈소스 라이선스**: MIT 라이선스 하에 코드 공개

---

## **6. 현재 구현 상태 및 기술적 성과**

프로젝트는 예정된 개발 로드맵을 성공적으로 완료하고 추가 기능까지 구현한 상태입니다.

### **6.1. 기술적 성과 및 메트릭**

**✅ 완료된 주요 마일스톤**:

* **코드베이스 규모**: 170+ 파일, 99개 npm 패키지
* **컴포넌트 시스템**: 47개의 재사용 가능한 UI 컴포넌트
* **QR 코드 유형**: 7가지 유형 완전 지원 (URL, TEXTAREA, WIFI, EMAIL, SMS, VCARD, LOCATION)
* **사용자 인증**: NextAuth.js v5 기반 Google OAuth 완전 구현
* **데이터베이스**: Supabase PostgreSQL + Prisma ORM 완전 연동
* **보안**: Row Level Security (RLS) 전체 테이블 적용
* **반응형 UI**: 모바일 퍼스트 디자인 완료
* **개발 도구**: TypeScript, ESLint, Prettier 완전 적용
* **UI 라이브러리**: 27개 Radix UI 프리미티브 기반 shadcn/ui 통합
* **상태 관리**: Zustand + React Query + React Hook Form 완전 구현

### **6.2. 현재 프로덕션 준비 상태**

**🚀 프로덕션 준비 완료**:

* ✅ **성능 최적화**: Next.js 14 App Router + Turbopack
* ✅ **코드 품질**: TypeScript + ESLint + Prettier 완전 적용
* ✅ **에러 핸들링**: 전역 에러 바운더리 및 사용자 친화적 오류 처리
* ✅ **접근성**: Radix UI 기반 WCAG 준수 컴포넌트
* ✅ **SEO 최적화**: 서버 사이드 렌더링 및 메타데이터 최적화
* ✅ **환경변수 관리**: 개발/프로덕션 환경 분리

### **6.3. 기술 부채 및 개선 포인트**

**🔧 지속적 개선 영역**:

* **성능 모니터링**: 실시간 성능 메트릭 대시보드 필요
* **테스트 커버리지**: 단위 테스트 및 E2E 테스트 확대
* **국제화**: 다국어 지원 인프라 구축
* **캐싱 전략**: Redis 도입을 통한 고성능 캐싱
* **이미지 최적화**: Next.js Image 컴포넌트 활용 확대

---

## **7. 프로젝트 버전 및 업데이트 이력**

### **7.1. 현재 버전 정보**

* **프로젝트 버전**: v1.2.104 (2025년 6월 기준)
* **Next.js**: 14.2.30
* **Node.js 요구사항**: `.nvmrc` 파일 기반 버전 관리
* **패키지 관리**: npm 기반 의존성 관리

### **7.2. 주요 업데이트 포인트**

* **개발 환경 표준화**: 에디터 설정, 코드 포매팅, 린트 규칙 완비
* **보안 강화**: Row Level Security (RLS) 전면 적용
* **성능 최적화**: Turbopack 개발 서버, 코드 분할 최적화
* **개발자 경험**: GitHub Copilot 지침, 커밋 메시지 템플릿 제공
* **문서화**: 상세한 PRD, 의존성 문서, RLS 설정 가이드 완비
