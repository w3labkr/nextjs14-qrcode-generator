# QR Code Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.10.1-2D3748?logo=prisma)](https://www.prisma.io/)
[![codecov](https://codecov.io/gh/w3labkr/nextjs14-qrcode-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/w3labkr/nextjs14-qrcode-generator)
[![Test Coverage](https://github.com/w3labkr/nextjs14-qrcode-generator/actions/workflows/test-coverage.yml/badge.svg)](https://github.com/w3labkr/nextjs14-qrcode-generator/actions/workflows/test-coverage.yml)

Next.js 14 기반의 현대적이고 강력한 QR 코드 생성기입니다. TypeScript, Tailwind CSS, shadcn/ui를 활용하여 사용자 친화적이고 안전한 QR 코드 생성 경험을 제공합니다.

## ✨ 주요 기능

### 🎯 다양한 QR 코드 타입 지원

- **URL**: 웹사이트 링크
- **텍스트**: 일반 텍스트 정보
- **WiFi**: 무선 네트워크 연결 정보
- **이메일**: 이메일 주소 및 제목, 본문
- **SMS**: 전화번호 및 메시지
- **vCard**: 개인 연락처 정보
- **위치**: 지도 좌표 및 주소

### 🔐 보안 및 인증

- **NextAuth.js v5**: Google OAuth, GitHub OAuth 지원
- **Row Level Security (RLS)**: 데이터베이스 수준의 보안
- **통합 로깅 시스템**: API, 인증, 감사, 에러 추적

### 💎 사용자 경험

- **반응형 디자인**: 모든 디바이스에서 최적화된 UI
- **shadcn/ui**: 48개의 모던한 UI 컴포넌트
- **다크/라이트 테마**: 사용자 선호도에 따른 테마 전환
- **실시간 미리보기**: QR 코드 실시간 생성 및 미리보기

### 📊 데이터 관리

- **히스토리 관리**: 생성된 QR 코드 기록 저장
- **계정 관리**: 사용자 프로필 및 설정
- **관리자 기능**: 시스템 로그 및 데이터 정리

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn
- PostgreSQL 데이터베이스 (Supabase 권장)

### 설치 및 실행

1. **저장소 클론**

```bash
git clone https://github.com/w3labkr/nextjs14-qrcode-generator.git
cd nextjs14-qrcode-generator
```

2. **의존성 설치**

```bash
npm install
```

3. **환경 변수 설정**

```bash
cp .env.example .env.local
```

다음 환경 변수를 설정하세요:

```env
# 데이터베이스
DATABASE_URL="your-postgresql-url"
DIRECT_URL="your-postgresql-direct-url"

# NextAuth.js
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth 제공자
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Supabase (선택사항)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# 크론 작업
CRON_SECRET="your-cron-secret"
```

4. **데이터베이스 설정**

```bash
npx prisma generate
npx prisma db push
```

5. **개발 서버 시작**

```bash
npm run dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 🏗️ 기술 스택

### Frontend

- **[Next.js 14](https://nextjs.org/)**: React 기반 풀스택 프레임워크 (App Router)
- **[TypeScript](https://www.typescriptlang.org/)**: 타입 안전성을 위한 정적 타입 언어
- **[Tailwind CSS](https://tailwindcss.com/)**: 유틸리티 우선 CSS 프레임워크
- **[shadcn/ui](https://ui.shadcn.com/)**: Radix UI 기반 컴포넌트 라이브러리
- **[Zustand](https://zustand-demo.pmnd.rs/)**: 경량 상태 관리 라이브러리
- **[React Hook Form](https://react-hook-form.com/)**: 성능 최적화된 폼 라이브러리
- **[TanStack Query](https://tanstack.com/query)**: 서버 상태 관리

### Backend

- **[Supabase](https://supabase.com/)**: PostgreSQL 데이터베이스 및 백엔드 서비스
- **[Prisma](https://www.prisma.io/)**: 타입 안전 ORM
- **[NextAuth.js v5](https://authjs.dev/)**: 인증 라이브러리
- **[Zod](https://zod.dev/)**: 스키마 검증 라이브러리

### QR Code 생성

- **[qr-code-styling](https://github.com/kozakdenys/qr-code-styling)**: 고급 QR 코드 커스터마이징
- **[qrcode](https://github.com/soldair/node-qrcode)**: 기본 QR 코드 생성
- **[canvas](https://github.com/Automattic/node-canvas)**: 서버사이드 캔버스 렌더링

### 개발 도구

- **[ESLint](https://eslint.org/)**: 코드 품질 검사
- **[Prettier](https://prettier.io/)**: 코드 포맷팅
- **[TypeScript](https://www.typescriptlang.org/)**: 정적 타입 검사

## 📱 스크린샷

![스크린샷](./SCREENSHOT.png)

## 📚 문서

자세한 문서는 `/docs` 폴더에서 확인할 수 있습니다:

- **[프로젝트 개요](docs/PROJECT.md)**: 전체 프로젝트 구조 및 기능
- **[API 문서](docs/API.md)**: API 엔드포인트 및 Server Actions
- **[배포 가이드](docs/DEPLOYMENT.md)**: 프로덕션 배포 방법
- **[개발 가이드](docs/DEVELOPMENT.md)**: 개발 환경 설정 및 가이드라인
- **[의존성 목록](docs/DEPENDENCIES.md)**: 사용된 라이브러리 및 패키지
- **[프로젝트 구조](docs/PROJECT_STRUCTURE.md)**: 상세 디렉토리 구조

## 🛠️ 개발 스크립트

```bash
# 개발 서버 (Turbo 모드)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm run start

# 린팅
npm run lint

# 종속성 업데이트
npm run upgrade:latest

# 프로젝트 정리
npm run clean

# 로깅 시스템 마이그레이션
npm run migrate:logging

# 로그 정리
npm run logs:cleanup

# 로그 백업
npm run logs:backup

# 로그 통계
npm run logs:stats
```

## 🔧 환경 설정

### 데이터베이스 설정

1. **Supabase 프로젝트 생성** (권장)
   - [Supabase](https://supabase.com/)에서 새 프로젝트 생성
   - PostgreSQL 연결 문자열 복사

2. **RLS (Row Level Security) 활성화**

```bash
npm run logs:setup-rls
```

3. **로깅 시스템 초기화**

```bash
npm run migrate:logging
```

### OAuth 제공자 설정

#### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI 추가: `{your-domain}/api/auth/callback/google`

#### GitHub OAuth

1. GitHub Settings > Developer settings > OAuth Apps
2. 새 OAuth 앱 생성
3. Authorization callback URL: `{your-domain}/api/auth/callback/github`

## 📊 프로젝트 현황

- **버전**: v1.5.5
- **패키지 수**: 101개 (의존성 75개 + 개발 의존성 26개)
- **UI 컴포넌트**: 48개 shadcn/ui 컴포넌트
- **지원 QR 코드 타입**: 7가지
- **인증**: Google OAuth, GitHub OAuth
- **보안**: Row Level Security (RLS) 적용
- **PWA**: Progressive Web App 지원

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👨‍💻 개발자

**w3labkr**

- GitHub: [@w3labkr](https://github.com/w3labkr)

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받았습니다:

- [Next.js](https://nextjs.org/) - React 기반 풀스택 프레임워크
- [shadcn/ui](https://ui.shadcn.com/) - 아름다운 UI 컴포넌트 라이브러리
- [Supabase](https://supabase.com/) - 오픈소스 Firebase 대안
- [Prisma](https://www.prisma.io/) - 차세대 ORM
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 우선 CSS 프레임워크

---

<div align="center">
  <p>⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!</p>
</div>
