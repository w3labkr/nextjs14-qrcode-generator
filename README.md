# 오픈소스 QR 코드 생성기

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.10.1-2D3748)](https://prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)

[![GitHub stars](https://img.shields.io/github/stars/w3labkr/nextjs14-qrcode-generator?style=social)](https://github.com/w3labkr/nextjs14-qrcode-generator/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/w3labkr/nextjs14-qrcode-generator?style=social)](https://github.com/w3labkr/nextjs14-qrcode-generator/network/members)
[![GitHub issues](https://img.shields.io/github/issues/w3labkr/nextjs14-qrcode-generator)](https://github.com/w3labkr/nextjs14-qrcode-generator/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/w3labkr/nextjs14-qrcode-generator)](https://github.com/w3labkr/nextjs14-qrcode-generator/pulls)

> 회원가입이나 로그인 없이 누구나 즉시 사용할 수 있는 강력하고 아름다운 정적 QR 코드 생성기

이 프로젝트는 **Next.js 14**, **Tailwind CSS**, **Shadcn UI**를 사용하여 구축된 오픈소스 QR 코드 생성기입니다. 7가지 유형의 정적 QR 코드를 생성하고, 46개의 UI 컴포넌트를 활용한 풍부한 커스터마이징 옵션을 제공합니다.

![SCREENSHOT](./SCREENSHOT.png)

## 🎯 프로젝트 키워드

`QR Code Generator` `Next.js 14` `React` `TypeScript` `Tailwind CSS` `Shadcn UI` `Prisma ORM` `Supabase` `NextAuth.js` `Google OAuth` `GitHub OAuth` `Progressive Web App` `Open Source` `MIT License`

## 🌐 라이브 데모

- **🚀 프로덕션**: [Live Demo](https://nextjs14-qrcode-generator.vercel.app) (Vercel에서 호스팅)
- **📖 스토리북**: [Component Gallery](https://storybook.nextjs14-qrcode-generator.vercel.app) (추후 제공 예정)

## ✨ 주요 기능

### 🎯 다양한 QR 코드 유형 지원 (7가지)
- **URL/웹사이트**: 웹사이트 링크를 QR 코드로 변환
- **텍스트**: 일반 텍스트 메시지를 QR 코드로 저장
- **Wi-Fi**: 네트워크 정보를 포함하여 즉시 Wi-Fi 연결 가능
- **vCard**: 연락처 정보를 QR 코드로 공유
- **이메일**: 미리 채워진 이메일 작성창 실행
- **SMS**: 특정 번호로 문자 메시지 전송
- **위치**: Google 지도 위치 정보 공유

### 🔐 사용자 인증 시스템
- **Google OAuth**: 안전하고 편리한 소셜 로그인
- **GitHub OAuth**: 개발자를 위한 GitHub 계정 연동
- **NextAuth.js v5**: 최신 인증 시스템으로 보안 강화
- **선택적 로그인**: 로그인 없이도 모든 기본 기능 사용 가능

### 📚 QR 코드 히스토리 관리 (로그인 사용자)
- **자동 저장**: 생성한 모든 QR 코드를 자동으로 데이터베이스에 저장
- **히스토리 조회**: 시간순으로 정렬된 QR 코드 목록 관리
- **즐겨찾기**: 자주 사용하는 QR 코드를 즐겨찾기로 표시
- **재사용**: 이전에 생성한 QR 코드를 쉽게 재다운로드
- **검색 및 필터링**: QR 코드 유형별 또는 키워드로 검색

### 🎨 고급 커스터마이징 기능
- **색상 설정**: 전경색, 배경색, 그라데이션 색상 자유 변경
- **로고 삽입**: 브랜드 로고를 QR 코드 중앙에 추가 (PNG, JPG, SVG 지원)
- **모양 변경**: QR 코드 패턴과 눈(Eye) 모양 다양하게 변경
- **프레임 추가**: "스캔해 주세요!" 등의 CTA 문구가 포함된 프레임
- **실시간 미리보기**: 설정 변경 시 즉시 미리보기 업데이트

### 💾 다중 다운로드 형식
- **기본 형식** (모든 사용자): PNG, SVG, JPG (최대 1024x1024)
- **고해상도** (로그인 사용자): 최대 4096x4096 픽셀 인쇄용 품질
- **벡터 형식**: 무한 확대 가능한 SVG 형식

### 📱 현대적 사용자 경험
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 완벽 지원
- **PWA 지원**: 오프라인 환경에서도 웹 애플리케이션 사용 가능
- **모바일 터치 최적화**: 터치 디바이스에서 직관적인 조작
- **다크/라이트 모드**: 사용자 선호에 따른 테마 전환

### 🛡️ 보안 및 개인정보보호
- **Row Level Security**: 데이터베이스 레벨에서 사용자 데이터 보호
- **최소 데이터 수집**: 서비스 제공에 필요한 최소한의 정보만 수집
- **GDPR 준수**: 유럽 일반 데이터 보호 규정 준수

### 📊 종합적 로깅 시스템
- **API 접근 로그**: 모든 API 요청 추적 및 모니터링
- **인증 이벤트 로그**: 로그인, 로그아웃, 토큰 갱신 기록
- **감사 로그**: 데이터 변경 이력 추적 (생성, 수정, 삭제)
- **에러 로그**: 시스템 오류 자동 기록 및 추적
- **관리자 활동 로그**: 관리자 작업 투명성 보장
- **실시간 통계**: 로그 데이터 기반 시스템 상태 모니터링

## 🛠️ 기술 스택

### 핵심 프레임워크
- **[Next.js 14.2.30](https://nextjs.org/)** - App Router 기반 React 프레임워크
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - 타입 안전성 보장
- **[Tailwind CSS 3.4.1](https://tailwindcss.com/)** - 유틸리티 기반 CSS 프레임워크

### UI 컴포넌트 및 디자인
- **[Shadcn UI](https://ui.shadcn.com/)** - 46개의 고품질 React 컴포넌트
- **[Radix UI](https://www.radix-ui.com/)** - 접근성을 고려한 UI 프리미티브
- **[Lucide React](https://lucide.dev/)** - 아름다운 SVG 아이콘 라이브러리
- **[Next Themes](https://github.com/pacocoursey/next-themes)** - 다크/라이트 모드 지원

### 인증 및 데이터베이스
- **[NextAuth.js v5](https://authjs.dev/)** - 차세대 인증 시스템
- **[Prisma 6.10.1](https://prisma.io/)** - 타입 안전한 ORM
- **[Supabase PostgreSQL](https://supabase.com/)** - 클라우드 데이터베이스 + Row Level Security
- **[@auth/prisma-adapter](https://authjs.dev/getting-started/adapters/prisma)** - NextAuth + Prisma 통합

### QR 코드 생성 라이브러리
- **[qr-code-styling](https://qr-code-styling.com/)** - 고급 QR 코드 커스터마이징
- **[qrcode](https://www.npmjs.com/package/qrcode)** - 빠른 QR 코드 생성
- **[canvas](https://www.npmjs.com/package/canvas)** - 서버사이드 이미지 렌더링

### 상태 관리 및 폼
- **[Zustand](https://zustand-demo.pmnd.rs/)** - 가벼운 전역 상태 관리
- **[React Hook Form](https://react-hook-form.com/)** - 성능 최적화된 폼 라이브러리
- **[Zod](https://zod.dev/)** - TypeScript 스키마 검증
- **[TanStack Query](https://tanstack.com/query)** - 서버 상태 관리 및 캐싱

### 개발 도구
- **[ESLint](https://eslint.org/)** + **[Prettier](https://prettier.io/)** - 코드 품질 및 스타일 관리
- **[Turbopack](https://turbo.build/pack)** - Next.js 14 고속 번들러

### 📊 통합 로깅 시스템
- **UnifiedLogger 클래스** - 모든 로그를 하나의 테이블로 통합 관리
- **로그 타입**: ACCESS, AUTH, AUDIT, ERROR, ADMIN, QR_GENERATION, SYSTEM
- **로그 레벨**: DEBUG, INFO, WARN, ERROR, FATAL
- **성능 측정** - PerformanceLogger를 통한 작업 시간 추적
- **자동 정리** - 오래된 로그의 자동 삭제로 스토리지 최적화
- **실시간 모니터링** - 로그 통계 및 필터링 기능

## 🚀 시작하기

### 전제 조건

- **Node.js 18+** 설치 필요
- **npm** 또는 **yarn** 패키지 매니저
- **Git** 버전 관리 시스템

### 1. 저장소 복제

```bash
git clone https://github.com/w3labkr/nextjs14-qrcode-generator.git
cd nextjs14-qrcode-generator
```

### 2. 종속성 설치

```bash
npm install
# 또는
yarn install
```

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일을 생성하고 필요한 환경 변수를 설정하세요:

```bash
cp .env.example .env.local
```

#### 필수 환경 변수

- `AUTH_SECRET`: Auth.js 세션 암호화용 비밀 키 (32자 이상 랜덤 문자열)
- `DATABASE_URL`: Supabase PostgreSQL 데이터베이스 연결 URL
- `DIRECT_URL`: Supabase Direct URL (마이그레이션용)

#### Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com/)에서 새 프로젝트를 생성합니다
2. 프로젝트 설정 → Database에서 연결 정보를 확인합니다
3. `.env.local` 파일에 다음과 같이 설정합니다:

   ```bash
   DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-[aws-region].pooler.supabase.com:5432/postgres"
   DIRECT_URL="postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-[aws-region].pooler.supabase.com:5432/postgres"
   ```

#### 선택적 환경 변수 (고급 기능)

**Google OAuth 소셜 로그인**:

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI에 `http://localhost:3000/api/auth/callback/google` 추가

   ```bash
   AUTH_GOOGLE_ID="your-google-client-id"
   AUTH_GOOGLE_SECRET="your-google-client-secret"
   ```

**GitHub OAuth 소셜 로그인**:

1. [GitHub Developer Settings](https://github.com/settings/developers)에서 OAuth App 생성
2. Authorization callback URL에 `http://localhost:3000/api/auth/callback/github` 추가

   ```bash
   AUTH_GITHUB_ID="your-github-client-id"
   AUTH_GITHUB_SECRET="your-github-client-secret"
   ```

**Supabase 데이터베이스 비활성화 방지 (Vercel 배포 시)**:

Vercel Pro 플랜에서 크론잡을 사용하여 Supabase 프로젝트 비활성화를 방지할 수 있습니다:

   ```bash
   CRON_SECRET="your-secure-random-string-here"
   ```

자세한 설정 방법은 [docs/CRON.md](./docs/CRON.md)를 참조하세요.

### 4. 데이터베이스 설정

Prisma를 사용하여 데이터베이스 스키마를 설정합니다:

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션 실행
npx prisma migrate dev --name init

# (선택사항) Prisma Studio로 데이터베이스 확인
npx prisma studio
```

### 5. Row Level Security (RLS) 설정

보안 강화를 위해 RLS를 활성화하는 것을 강력히 권장합니다:

```bash
# 자동 설정 스크립트 실행 (권장)
./scripts/setup-rls.sh

# 또는 수동으로 RLS 활성화
psql "$DATABASE_URL" -f prisma/migrations/enable_rls.sql

# RLS 테스트 실행
psql "$DATABASE_URL" -f prisma/migrations/test_rls.sql
```

RLS 상태는 개발 환경에서 `/dashboard/admin/rls-status` 페이지에서 확인할 수 있습니다.

자세한 RLS 설정 방법은 [docs/RLS_SETUP.md](./docs/RLS_SETUP.md)를 참조하세요.

### 6. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

### 7. 프로덕션 빌드

```bash
npm run build
npm start
```

이제 브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 📚 문서 및 가이드

프로젝트의 상세한 정보와 가이드는 다음 문서들을 참고하세요:

- **[📋 제품 요구사항 정의서 (PRD)](./docs/PRD.md)** - 프로젝트 비전, 기술 스택, 아키텍처 상세 설명
- **[📦 의존성 패키지 목록](./docs/DEPENDENCIES.md)** - 100+개 패키지 의존성 정보 및 사용 목적
- **[🗃️ RLS 설정 가이드](./docs/RLS.md)** - Row Level Security 데이터베이스 보안 설정
- **[⏰ 크론잡 설정 가이드](./docs/CRON.md)** - Vercel 크론잡을 통한 Supabase 비활성화 방지
- **[📊 로깅 시스템 가이드](./docs/LOGGING.md)** - 종합적 로깅 시스템 구조 및 활용법
- **[🔒 보안 정책](./SECURITY.md)** - 보안 취약점 보고 및 관련 정책
- **[🤝 기여 가이드](./CONTRIBUTING.md)** - 오픈소스 기여 방법 및 개발 가이드라인

## 📁 프로젝트 구조

```
nextjs14-qrcode-generator/
├── app/                    # Next.js 14 App Router
│   ├── actions/           # Server Actions (QR 생성, 관리)
│   ├── api/               # API Routes (인증, QR API)
│   ├── dashboard/         # 대시보드 (로그인 사용자 전용)
│   └── qrcode/           # QR 코드 생성 메인 페이지
│       └── components/   # QR 코드 관련 컴포넌트 (11개)
├── components/            # React 컴포넌트
│   ├── ui/               # Shadcn UI 컴포넌트 (46개)
│   └── ...               # 기타 유틸리티 컴포넌트
├── hooks/                 # 커스텀 훅 & Zustand 스토어 (3개)
├── lib/                   # 유틸리티 & 설정
├── types/                 # TypeScript 타입 정의 (7개)
├── prisma/                # 데이터베이스 스키마 & 마이그레이션
└── docs/                  # 프로젝트 문서 (8개)
```

## 🎯 사용법

### 기본 QR 코드 생성 (로그인 불필요)

1. **웹사이트 접속**: `http://localhost:3000` 또는 배포된 URL
2. **QR 코드 유형 선택**: URL, 텍스트, Wi-Fi, vCard, 이메일, SMS, 위치 중 선택
3. **내용 입력**: 선택한 유형에 맞는 정보 입력
4. **커스터마이징**: 색상, 로고, 모양, 프레임 등 원하는 스타일 설정
5. **다운로드**: PNG, SVG, JPG 형식으로 즉시 다운로드

### 고급 기능 사용 (로그인 필요)

1. **Google 로그인**: 우상단 로그인 버튼 클릭
2. **대시보드 접근**: 로그인 후 자동으로 대시보드로 이동
3. **히스토리 관리**: 생성한 모든 QR 코드 자동 저장 및 관리
4. **고해상도 다운로드**: 최대 4096x4096 픽셀 인쇄용 품질
5. **템플릿 저장**: 자주 사용하는 설정을 템플릿으로 저장
6. **즐겨찾기**: 중요한 QR 코드를 즐겨찾기로 표시

## 🌐 배포

### Vercel (권장)

1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 설정 (Supabase URL, Auth Secret 등)
3. 자동 배포 완료

### 기타 플랫폼

- **Netlify**: `npm run build` 후 `out` 폴더 배포
- **Docker**: Dockerfile을 사용한 컨테이너 배포
- **AWS/GCP**: 정적 호스팅 또는 서버리스 배포

## 🔧 개발 스크립트

```bash
# 개발 서버 실행 (Turbopack)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 코드 린팅
npm run lint

# 의존성 업데이트
npm run upgrade:latest

# 캐시 정리 및 재설치
npm run clean && npm run reinstall

# 통합 로그 시스템 관련
npm run logs:test        # 로그 시스템 테스트
npm run logs:cleanup     # 오래된 로그 정리
npm run logs:backup      # 로그 백업
npm run logs:setup-rls   # RLS 정책 설정
```

## 📊 통합 로그 시스템

이 프로젝트는 통합된 로그 시스템을 사용하여 모든 애플리케이션 활동을 단일 테이블로 관리합니다.

### 로그 타입

- **ACCESS**: API 접근 로그
- **AUTH**: 인증 관련 로그 (로그인, 로그아웃 등)
- **AUDIT**: 데이터 변경 감사 로그
- **ERROR**: 에러 로그
- **ADMIN**: 관리자 액션 로그
- **QR_GENERATION**: QR 코드 생성 로그
- **SYSTEM**: 시스템 로그

### 로그 사용 예제

```typescript
import { UnifiedLogger } from '@/lib/unified-logging';

// QR 코드 생성 로그
await UnifiedLogger.logQrGeneration({
  userId: 'user123',
  qrType: 'URL',
  size: '400x400',
  format: 'png',
  customization: { hasLogo: true }
});

// 에러 로그
await UnifiedLogger.logError({
  userId: 'user123',
  error: new Error('Something went wrong'),
  errorCode: 'QR_GENERATION_FAILED',
  additionalInfo: { context: 'additional data' }
});

// 로그 조회
const logs = await UnifiedLogger.getLogs({
  type: ['QR_GENERATION', 'ERROR'],
  userId: 'user123',
  limit: 100
});

// 로그 통계
const stats = await UnifiedLogger.getLogStats({
  startDate: new Date('2024-01-01'),
  endDate: new Date()
});
```

### 보안 (RLS - Row Level Security)

통합 로그 시스템은 Supabase의 RLS(Row Level Security)를 활용하여 데이터 보안을 보장합니다:

- 사용자는 자신의 로그만 조회 가능
- 관리자는 모든 로그 접근 가능
- 시스템 로그는 모든 사용자가 조회 가능
- 민감한 로그(AUDIT, ADMIN, ERROR)는 관리자만 접근 가능

## 🤝 기여 방법

이 프로젝트는 오픈소스이며, 커뮤니티의 기여를 적극 환영합니다! 🎉

### 기여할 수 있는 방법

- **🐛 버그 리포트**: 발견한 문제를 이슈로 등록
- **💡 기능 제안**: 새로운 아이디어나 개선사항 제안
- **💻 코드 기여**: 버그 수정, 기능 추가, 코드 개선
- **📖 문서 개선**: README, 가이드, 주석 등 문서 작성/수정
- **🎨 디자인**: UI/UX 개선, 새로운 프레임/템플릿 디자인
- **🌐 번역**: 다국어 지원을 위한 번역 작업

### 기여 프로세스

1. **Fork**: 이 저장소를 포크합니다
2. **Branch**: 새로운 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. **Commit**: 변경사항을 커밋합니다 (`git commit -m 'feat: add amazing feature'`)
4. **Push**: 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. **Pull Request**: 풀 리퀘스트를 생성합니다

### 개발 환경 설정

```bash
# 저장소 포크 후 클론
git clone https://github.com/YOUR-USERNAME/nextjs14-qrcode-generator.git
cd nextjs14-qrcode-generator

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 데이터베이스 설정
npx prisma generate
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

### 디버그 모드 설정

인증 시스템에서 과도한 로그가 출력되는 경우, 환경 변수를 통해 디버그 모드를 제어할 수 있습니다:

```bash
# .env.local 파일에 추가하여 인증 디버그 로그 활성화
AUTH_DEBUG=true

# 또는 비활성화 (기본값)
AUTH_DEBUG=false
```

**참고**: NextAuth.js의 기본 디버그 모드는 프로덕션 환경에서 자동으로 비활성화됩니다.

### 코딩 스타일 가이드

- **TypeScript**: 모든 코드는 TypeScript로 작성
- **ESLint + Prettier**: 자동 포매팅 및 린팅 규칙 준수
- **Conventional Commits**: 커밋 메시지는 `feat:`, `fix:`, `docs:` 등 규칙 준수
- **Component**: React 컴포넌트는 함수형 컴포넌트로 작성
- **Hooks**: 상태 관리는 Zustand, 폼은 React Hook Form 사용

자세한 기여 가이드라인은 **[CONTRIBUTING.md](./CONTRIBUTING.md)** 파일을 참고해주세요.

## 📜 라이선스

이 프로젝트는 **[MIT 라이선스](./LICENSE)**를 따릅니다.

```text
MIT License - 상업적/비상업적 목적으로 자유롭게 사용, 수정, 배포 가능
```

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움으로 만들어졌습니다:

- **[Next.js](https://nextjs.org/)** - React 기반 풀스택 프레임워크
- **[Shadcn/ui](https://ui.shadcn.com/)** - 아름다운 재사용 가능한 컴포넌트
- **[Tailwind CSS](https://tailwindcss.com/)** - 유틸리티 우선 CSS 프레임워크
- **[Prisma](https://prisma.io/)** - 타입 안전한 데이터베이스 도구
- **[Supabase](https://supabase.com/)** - 오픈소스 Firebase 대안

## 📞 지원 및 문의

- **🐛 버그 신고**: [GitHub Issues](https://github.com/w3labkr/nextjs14-qrcode-generator/issues)
- **💬 질문 및 토론**: [GitHub Discussions](https://github.com/w3labkr/nextjs14-qrcode-generator/discussions)
- **🔒 보안 문의**: [SECURITY.md](./SECURITY.md) 파일 참고

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/w3labkr/nextjs14-qrcode-generator?style=social)](https://github.com/w3labkr/nextjs14-qrcode-generator/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/w3labkr/nextjs14-qrcode-generator?style=social)](https://github.com/w3labkr/nextjs14-qrcode-generator/network/members)

**Made with ❤️ by the open source community**

</div>
