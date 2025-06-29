# QR Code Generator 프로젝트

## 개요

Next.js 14를 기반으로 한 현대적인 QR 코드 생성기입니다. TypeScript, Tailwind CSS, shadcn/ui를 활용하여 안정적이고 사용자 친화적인 QR 코드 생성 경험을 제공합니다.

## 주요 기능

- **다양한 QR 코드 타입**: URL, 텍스트, WiFi, 이메일, SMS, vCard, 위치 정보
- **사용자 인증**: NextAuth.js v5를 통한 Google OAuth 및 GitHub OAuth 인증
- **데이터베이스**: Supabase PostgreSQL과 Prisma ORM
- **보안**: Row Level Security(RLS) 적용
- **반응형 UI**: shadcn/ui 컴포넌트 기반의 모던한 인터페이스
- **데이터 관리**: QR 코드 히스토리 및 사용자 계정 관리
- **통합 로깅**: 포괄적인 로깅 시스템으로 API, 인증, 감사, 에러 추적
- **관리자 기능**: 로그 관리 및 시스템 정리 기능

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (48개 컴포넌트)
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Data Fetching**: TanStack Query

### Backend
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5.0.0-beta.28
- **Security**: Row Level Security (RLS)

### QR Code Libraries
- `qr-code-styling`: 고급 QR 코드 커스터마이징
- `qr-code-styling-node`: 서버사이드 스타일링
- `qrcode`: 기본 QR 코드 생성
- `qrcode.react`: React 컴포넌트

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/              # API Routes
│   ├── auth/             # 인증 페이지
│   ├── dashboard/        # 대시보드 (보호된 영역)
│   └── qrcode/           # QR 코드 생성 페이지
├── components/            # 재사용 가능한 컴포넌트
│   └── ui/               # shadcn/ui 컴포넌트 (48개)
├── lib/                  # 유틸리티 함수들
├── hooks/                # 커스텀 훅 및 Zustand 스토어
├── types/                # TypeScript 타입 정의
├── prisma/               # 데이터베이스 스키마
└── docs/                 # 프로젝트 문서
```

## 주요 패키지

**총 101개 패키지** (75개 dependencies + 26개 devDependencies)

### 핵심 Dependencies
- Next.js 14.2.30
- React 18
- TypeScript 5
- Tailwind CSS 3.4.1
- Prisma 6.10.1
- NextAuth.js 5.0.0-beta.28
- Zustand 5.0.5
- React Hook Form 7.58.0
- Zod 3.25.64
- TanStack Query 5.80.7

## 개발 환경 설정

### 필수 조건
- Node.js 18+ 
- npm 또는 yarn
- PostgreSQL (Supabase)

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

## 환경 변수

```env
# 데이터베이스
DATABASE_URL=
DIRECT_URL=

# 인증
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 애플리케이션
NEXT_PUBLIC_APP_URL=
CRON_SECRET=
```

## 배포

이 프로젝트는 Vercel에 최적화되어 있으며, Supabase PostgreSQL을 데이터베이스로 사용합니다.

### Vercel 배포 단계
1. GitHub 리포지토리 연결
2. 환경 변수 설정
3. 자동 배포 완료

## 라이센스

MIT License - 자세한 내용은 [LICENSE](../LICENSE) 파일을 참조하세요.
