# DEPENDENCIES

## Table of Contents

- [DEPENDENCIES](#dependencies)
  - [Table of Contents](#table-of-contents)
  - [Current Package Summary](#current-package-summary)
  - [주요 패키지 분석 (v1.4.24)](#주요-패키지-분석-v1424)
    - [Core Framework \& Language](#core-framework--language)
    - [Authentication \& Database](#authentication--database)
    - [QR Code Generation (4개 패키지)](#qr-code-generation-4개-패키지)
    - [UI Framework \& Components (46개 shadcn/ui 컴포넌트)](#ui-framework--components-46개-shadcnui-컴포넌트)
    - [State Management \& Forms](#state-management--forms)
    - [Data \& HTTP](#data--http)
    - [Advanced UI Components](#advanced-ui-components)
    - [Utilities \& Tools](#utilities--tools)
    - [Development Tools (30개 devDependencies)](#development-tools-30개-devdependencies)
  - [Git](#git)
  - [Next.js](#nextjs)
  - [shadcn](#shadcn)
  - [Tailwindcss](#tailwindcss)
  - [Zustand](#zustand)
  - [Axios](#axios)
  - [React Query](#react-query)
  - [Browserslist](#browserslist)
  - [Jose (JsonWebToken)](#jose-jsonwebtoken)
  - [Day.js](#dayjs)
  - [qs](#qs)
  - [cookies-next](#cookies-next)
  - [es-toolkit](#es-toolkit)
  - [QRCode](#qrcode)
  - [Auth.js](#authjs)
  - [Supabase \& PostgreSQL](#supabase--postgresql)
  - [ESLint](#eslint)
  - [Prettier](#prettier)
  - [Troubleshooting](#troubleshooting)

## Current Package Summary

**Project Version**: v1.4.24 (as of 2025년 6월 29일)

**Total Packages**: 100+ (73 dependencies + 30 devDependencies)

**Core Technologies**:

- Next.js 14.2.30
- React 18
- TypeScript 5
- Node.js (managed via .nvmrc)

**UI Components**: 46 shadcn/ui components based on Radix UI primitives

**QR Code Types**: 7 supported types (URL, TEXTAREA, WIFI, EMAIL, SMS, VCARD, LOCATION)

**File Count**: 171 TypeScript/JavaScript files

## 주요 패키지 분석 (v1.4.24)

현재 프로젝트에서 사용중인 주요 패키지들을 카테고리별로 정리했습니다:

### Core Framework & Language
- **next@14.2.30** - Next.js 프레임워크 (App Router)
- **react@^18** - React 라이브러리
- **react-dom@^18** - React DOM
- **typescript@^5** - TypeScript 언어

### Authentication & Database
- **next-auth@^5.0.0-beta.28** - NextAuth.js v5 인증
- **@auth/prisma-adapter@^2.10.0** - Prisma 어댑터
- **@prisma/client@^6.10.1** - Prisma 클라이언트
- **@supabase/supabase-js@^2.50.0** - Supabase JavaScript 클라이언트
- **@supabase/ssr@^0.6.1** - Supabase SSR 지원
- **pg@^8.16.2** - PostgreSQL 클라이언트

### QR Code Generation (4개 패키지)
- **qr-code-styling@^1.9.2** - 고급 QR 코드 스타일링
- **qr-code-styling-node@^1.5.0** - 서버사이드 QR 코드 스타일링
- **qrcode@^1.5.4** - 기본 QR 코드 생성
- **qrcode.react@^4.2.0** - React QR 코드 컴포넌트
- **canvas@^3.1.0** - 서버사이드 Canvas 렌더링

### UI Framework & Components (46개 shadcn/ui 컴포넌트)
- **@radix-ui/react-*** - 28개 UI 프리미티브 패키지
- **tailwindcss@^3.4.1** - CSS 프레임워크
- **tailwind-merge@^3.3.1** - Tailwind 클래스 병합
- **tailwindcss-animate@^1.0.7** - 애니메이션
- **class-variance-authority@^0.7.1** - 컴포넌트 변형 관리
- **clsx@^2.1.1** - 조건부 CSS 클래스
- **lucide-react@^0.515.0** - 아이콘 라이브러리

### State Management & Forms
- **zustand@^5.0.5** - 전역 상태 관리
- **react-hook-form@^7.58.0** - 폼 라이브러리
- **@hookform/resolvers@^5.1.1** - 폼 검증 리졸버
- **zod@^3.25.64** - 스키마 검증 및 타입 안전성

### Data & HTTP
- **@tanstack/react-query@^5.80.7** - 서버 상태 관리
- **@tanstack/react-table@^8.21.3** - 테이블 컴포넌트
- **axios@^1.10.0** - HTTP 클라이언트

### Advanced UI Components
- **sonner@^2.0.5** - 토스트 알림
- **next-themes@^0.4.6** - 다크/라이트 모드
- **react-day-picker@^9.7.0** - 날짜 선택기
- **embla-carousel-react@^8.6.0** - 캐러셀
- **react-resizable-panels@^3.0.3** - 크기 조절 패널
- **vaul@^1.1.2** - 모바일 Drawer
- **cmdk@^1.1.1** - 커맨드 팔레트
- **input-otp@^1.4.2** - OTP 입력
- **recharts@^2.15.3** - 차트 라이브러리

### Utilities & Tools
- **date-fns@^4.1.0** - 날짜 유틸리티
- **dayjs@^1.11.13** - 경량 날짜 라이브러리
- **qs@^6.14.0** - 쿼리 스트링 파싱
- **cookies-next@^4.3.0** - 쿠키 관리
- **jsdom@^26.1.0** - 서버사이드 DOM
- **jose@^6.0.11** - JWT 토큰 처리
- **react-daum-postcode@^3.2.0** - 한국 주소 검색
- **@toss/utils@^1.6.1** - Toss 유틸리티
- **es-toolkit@^1.39.5** - 모던 유틸리티
- **overlay-kit@^1.8.2** - 오버레이 관리
- **auth@^1.2.3** - 추가 인증 유틸리티

### Development Tools (30개 devDependencies)
- **prisma@^6.10.1** - Prisma CLI
- **eslint@^8.57.1** + 관련 플러그인들 - 코드 린팅
- **prettier@^3.5.3** + 플러그인들 - 코드 포매팅
- **@types/*** - TypeScript 타입 정의
- **tsx@^4.20.3** - TypeScript 실행
- **ts-node@^10.9.2** - Node.js TypeScript 지원

## Git

Auto-increments patch version and stages files on commit

```bash
$ chmod +x pre-commit.sh
$ ./pre-commit.sh
```

## Next.js

Automatic Installation

```shell
$ npx create-next-app@14.2.30 .

✔ Would you like to use TypeScript? Yes
✔ Would you like to use ESLint? Yes
✔ Would you like to use Tailwind CSS? Yes
✔ Would you like to use `src/` directory? No
✔ Would you like to use App Router? (recommended) Yes
✔ Would you like to customize the default import alias (@/*)? No
```

```shell
node -v > .nvmrc
```

[How to set up a new Next.js project](https://nextjs.org/docs/app/getting-started/installation)

## shadcn

Run the init command to create a new Next.js project or to setup an existing one:

```shell
npx shadcn@latest init -d
```

Use the add command to add components and dependencies to your project.

```shell
npx shadcn@latest add -a
```

This will add/install all shadcn components (overwrite if present).

```shell
npx shadcn@latest add -a -y -o
```

Add `tanstack/react-table` dependency:

```shell
npm install @tanstack/react-table
```

Add the Toaster component. Edit `app/layout.tsx`:

```javascript
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
```

[Install and configure Next.js](https://ui.shadcn.com/docs/installation/next)

## Tailwindcss

Install Tailwind CSS

```shell
npm install -D tailwindcss@3 postcss autoprefixer
```

Add Tailwind to your PostCSS configuration. `postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

[Get started with Tailwind CSS](https://tailwindcss.com/docs/installation/using-postcss)

## Zustand

Bear necessities for state management in React

```shell
npm install zustand
```

## Axios

```shell
npm install axios
```

## React Query

Powerful asynchronous state management, server-state utilities and data fetching for the web. TS/JS, React Query, Solid Query, Svelte Query and Vue Query.

```shell
npm install @tanstack/react-query
```

## Browserslist

Share target browsers between different front-end tools, like Autoprefixer, Stylelint and babel-preset-env.

```shell
npm install browserslist
```

Edit `package.json`:

```json
{
  "browserslist": [
    "defaults and fully supports es6-module",
    "maintained node versions"
  ],
}
```

## Jose (JsonWebToken)

JWA, JWS, JWE, JWT, JWK, JWKS for Node.js, Browser, Cloudflare Workers, Deno, Bun, and other Web-interoperable runtimes.

```shell
npm install jose
```

## Day.js

Day.js 2kB immutable date-time library alternative to Moment.js with the same modern API.

```shell
npm install dayjs
```

## qs

A querystring parser with nesting support

```shell
npm install qs @types/qs
```

## cookies-next

Getting, setting and removing cookies on both client and server with next.js

```shell
npm i cookies-next@4
```

## es-toolkit

```shell
npm install es-toolkit @toss/utils overlay-kit
```

## QRCode

```shell
npm install qrcode.react
```

## Auth.js

Prisma

```shell
npm install @prisma/client @auth/prisma-adapter
npm install prisma --save-dev
```

```shell
npx prisma migrate dev
```

```shell
npx prisma generate
```

## Supabase & PostgreSQL

Supabase is an open-source Firebase alternative with a PostgreSQL database.

```shell
npm install @prisma/client
npm install prisma --save-dev
```

Install the PostgreSQL client for Node.js:

```shell
npm install pg @types/pg
```

Create a `prisma` directory and add a `schema.prisma` file:

```shell
npx prisma generate
```

Initialize Prisma with PostgreSQL:

```shell
npx prisma migrate dev --name init
```

## ESLint

ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.

```shell
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks
npm install --save-dev eslint-plugin-import eslint-import-resolver-typescript
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev @next/eslint-plugin-next
```

Find and fix problems in your JavaScript code.

```shell
npx eslint ./app
npx eslint --fix ./{app,components,config,context,hooks,lib,schemas,store,types,utils}
```

## Prettier

Prettier is an opinionated code formatter.

```shell
npm install --save-dev prettier eslint-plugin-prettier eslint-config-prettier
npm install --save-dev eslint-plugin-tailwindcss prettier-plugin-tailwindcss
npm install --save-dev prettier-plugin-prisma
```

To format a file in-place.

```shell
npx prettier --check "./app/**/*.{ts,tsx}"
npx prettier --write "./{app,components,config,context,hooks,lib,schemas,store,types,utils}/**/*.{ts,tsx}"
```

## Troubleshooting

ESLint: Plugin "react-hooks" was conflicted between ".eslintrc.js" and ".eslintrc.js » eslint-config-next » plugin:react-hooks/recommended".

```shell
npm --save-dev install eslint-plugin-react-hooks@4
```

[DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.

```shell
nvm use v20.18.3
node -v > .nvmrc
```
