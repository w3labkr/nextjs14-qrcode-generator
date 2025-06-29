# 종속성 관리 문서

## 개요

QR Code Generator 프로젝트의 모든 종속성과 각각의 역할을 설명합니다.

## 패키지 통계

- **총 패키지 수**: 101개
- **dependencies**: 75개
- **devDependencies**: 26개
- **프로젝트 버전**: v1.5.5

## 핵심 프레임워크

### Next.js 및 React
- **next**: 14.2.30 - React 기반 풀스택 프레임워크
- **react**: ^18 - 사용자 인터페이스 구축을 위한 JavaScript 라이브러리
- **react-dom**: ^18 - React 컴포넌트를 DOM에 렌더링

### TypeScript
- **typescript**: ^5 - JavaScript의 정적 타입 슈퍼셋

## 인증 및 보안

### NextAuth.js
- **next-auth**: ^5.0.0-beta.28 - Next.js를 위한 완전한 인증 솔루션
- **@auth/prisma-adapter**: ^2.10.0 - Prisma를 위한 NextAuth.js 어댑터
- **auth**: ^1.2.3 - 추가 인증 유틸리티
- **jose**: ^6.0.11 - JWT 토큰 처리

## 데이터베이스 및 ORM

### Prisma
- **@prisma/client**: ^6.10.1 - Prisma 클라이언트
- **prisma**: ^6.10.1 - Prisma CLI 및 스키마 엔진

### PostgreSQL
- **pg**: ^8.16.2 - PostgreSQL 클라이언트

### Supabase
- **@supabase/supabase-js**: ^2.50.0 - Supabase JavaScript 클라이언트
- **@supabase/ssr**: ^0.6.1 - 서버사이드 렌더링을 위한 Supabase 클라이언트

## UI 프레임워크 및 컴포넌트

### Tailwind CSS
- **tailwindcss**: ^3.4.1 - 유틸리티 우선 CSS 프레임워크
- **tailwind-merge**: ^3.3.1 - Tailwind CSS 클래스 병합 유틸리티
- **tailwindcss-animate**: ^1.0.7 - Tailwind CSS 애니메이션 플러그인

### Radix UI (48개 UI 컴포넌트 기반)
- **@radix-ui/react-accordion**: ^1.2.11
- **@radix-ui/react-alert-dialog**: ^1.1.14
- **@radix-ui/react-aspect-ratio**: ^1.1.7
- **@radix-ui/react-avatar**: ^1.1.10
- **@radix-ui/react-checkbox**: ^1.3.2
- **@radix-ui/react-collapsible**: ^1.1.11
- **@radix-ui/react-context-menu**: ^2.2.15
- **@radix-ui/react-dialog**: ^1.1.14
- **@radix-ui/react-dropdown-menu**: ^2.1.15
- **@radix-ui/react-hover-card**: ^1.1.14
- **@radix-ui/react-label**: ^2.1.7
- **@radix-ui/react-menubar**: ^1.1.15
- **@radix-ui/react-navigation-menu**: ^1.2.13
- **@radix-ui/react-popover**: ^1.1.14
- **@radix-ui/react-progress**: ^1.1.7
- **@radix-ui/react-radio-group**: ^1.3.7
- **@radix-ui/react-scroll-area**: ^1.2.9
- **@radix-ui/react-select**: ^2.2.5
- **@radix-ui/react-separator**: ^1.1.7
- **@radix-ui/react-slider**: ^1.3.5
- **@radix-ui/react-slot**: ^1.2.3
- **@radix-ui/react-switch**: ^1.2.5
- **@radix-ui/react-tabs**: ^1.1.12
- **@radix-ui/react-toggle**: ^1.1.9
- **@radix-ui/react-toggle-group**: ^1.1.10
- **@radix-ui/react-tooltip**: ^1.2.7

### 추가 UI 컴포넌트
- **cmdk**: ^1.1.1 - 명령 팔레트 인터페이스
- **vaul**: ^1.1.2 - 모바일 드로어 컴포넌트
- **input-otp**: ^1.4.2 - OTP 입력 컴포넌트
- **lucide-react**: ^0.515.0 - 아이콘 라이브러리

### 레이아웃 및 상호작용
- **embla-carousel-react**: ^8.6.0 - 캐러셀 컴포넌트
- **react-resizable-panels**: ^3.0.3 - 크기 조정 가능한 패널
- **overlay-kit**: ^1.8.2 - 오버레이 및 모달 관리

## 상태 관리 및 폼

### 상태 관리
- **zustand**: ^5.0.5 - 경량 상태 관리 라이브러리

### 폼 관리
- **react-hook-form**: ^7.58.0 - 성능이 뛰어난 폼 라이브러리
- **@hookform/resolvers**: ^5.1.1 - React Hook Form 리졸버

### 유효성 검사
- **zod**: ^3.25.64 - TypeScript 기반 스키마 유효성 검사

## 데이터 패칭 및 상태

### React Query
- **@tanstack/react-query**: ^5.80.7 - 서버 상태 관리 및 캐싱
- **@tanstack/react-table**: ^8.21.3 - 테이블 컴포넌트

## QR 코드 생성

### QR 코드 라이브러리
- **qr-code-styling**: ^1.9.2 - 고급 QR 코드 커스터마이징
- **qr-code-styling-node**: ^1.5.0 - 서버사이드 QR 코드 스타일링
- **qrcode**: ^1.5.4 - 기본 QR 코드 생성
- **qrcode.react**: ^4.2.0 - React QR 코드 컴포넌트
- **canvas**: ^3.1.0 - 서버사이드 캔버스 렌더링

## 유틸리티 및 헬퍼

### HTTP 클라이언트
- **axios**: ^1.10.0 - HTTP 클라이언트 라이브러리

### 유틸리티 라이브러리
- **@toss/utils**: ^1.6.1 - Toss 유틸리티 라이브러리
- **es-toolkit**: ^1.39.5 - 현대적인 JavaScript 유틸리티
- **clsx**: ^2.1.1 - 조건부 클래스명 구성
- **class-variance-authority**: ^0.7.1 - 컴포넌트 variant 처리

### 날짜 및 시간
- **date-fns**: ^4.1.0 - 날짜 조작 라이브러리
- **dayjs**: ^1.11.13 - 경량 날짜 라이브러리
- **react-day-picker**: ^9.7.0 - 날짜 선택기 컴포넌트

### 쿠키 및 세션
- **cookies-next**: ^4.3.0 - 쿠키 관리

### 기타 유틸리티
- **qs**: ^6.14.0 - 쿼리 스트링 파싱
- **jsdom**: ^26.1.0 - 서버사이드 DOM 조작

## 한국화 및 지역화

### 주소 검색
- **react-daum-postcode**: ^3.2.0 - 한국 주소 검색

## 알림 및 토스트

### 알림 시스템
- **sonner**: ^2.0.5 - 토스트 알림 라이브러리

## 차트 및 데이터 시각화

### 차트 라이브러리
- **recharts**: ^2.15.3 - 데이터 시각화 라이브러리

## 테마 관리

### 테마 시스템
- **next-themes**: ^0.4.6 - Next.js 테마 관리

## 브라우저 호환성

### 호환성 도구
- **browserslist**: ^4.25.0 - 브라우저 호환성 설정

## 개발 도구 (devDependencies)

### TypeScript 지원
- **@types/node**: ^20 - Node.js 타입 정의
- **@types/react**: ^18 - React 타입 정의
- **@types/react-dom**: ^18 - React DOM 타입 정의
- **@types/pg**: ^8.15.4 - PostgreSQL 타입 정의
- **@types/qs**: ^6.14.0 - qs 타입 정의
- **@types/qrcode**: ^1.5.5 - qrcode 타입 정의
- **@types/jsdom**: ^21.1.7 - jsdom 타입 정의

### 린팅 및 코드 품질
- **eslint**: ^8.57.1 - JavaScript/TypeScript 린터
- **eslint-config-next**: 14.2.30 - Next.js ESLint 설정
- **eslint-config-prettier**: ^10.1.5 - Prettier와 ESLint 통합
- **eslint-import-resolver-typescript**: ^4.4.3 - TypeScript import 해결
- **eslint-plugin-import**: ^2.31.0 - import/export 린팅
- **eslint-plugin-prettier**: ^5.4.1 - Prettier ESLint 플러그인
- **eslint-plugin-react**: ^7.37.5 - React 린팅 규칙
- **eslint-plugin-react-hooks**: ^5.2.0 - React Hooks 린팅
- **eslint-plugin-tailwindcss**: ^3.18.0 - Tailwind CSS 린팅
- **@typescript-eslint/eslint-plugin**: ^8.34.0 - TypeScript ESLint 플러그인
- **@typescript-eslint/parser**: ^8.34.0 - TypeScript ESLint 파서
- **@next/eslint-plugin-next**: ^15.3.3 - Next.js ESLint 플러그인

### 코드 포매팅
- **prettier**: ^3.5.3 - 코드 포매터
- **prettier-plugin-prisma**: ^5.0.0 - Prisma 스키마 포매팅
- **prettier-plugin-tailwindcss**: ^0.6.12 - Tailwind CSS 클래스 정렬

### 스타일링 도구
- **postcss**: ^8 - CSS 변환 도구

### TypeScript 실행
- **tsx**: ^4.20.3 - TypeScript 실행기
- **ts-node**: ^10.9.2 - Node.js TypeScript 지원

## 패키지 관리 전략

### 업데이트 정책
- **메이저 버전**: 신중한 검토 후 업데이트
- **마이너 버전**: 정기적 업데이트
- **패치 버전**: 적극적 업데이트

### 스크립트 명령어
```bash
# 최신 버전으로 업그레이드
npm run upgrade:latest

# 패키지 재설치
npm run reinstall

# 클린 설치
npm run clean
```

## 보안 고려사항

### 정기 감사
```bash
# 보안 취약점 검사
npm audit

# 취약점 자동 수정
npm audit fix
```

### 업데이트 주기
- **보안 업데이트**: 즉시 적용
- **정기 업데이트**: 월 1회
- **메이저 업데이트**: 분기별 검토

## 라이선스 정보

모든 종속성은 MIT, Apache 2.0, 또는 호환 가능한 오픈소스 라이선스를 사용합니다.
