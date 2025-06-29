# 배포 가이드

## 개요

QR Code Generator 프로젝트의 배포 방법과 설정에 대한 가이드입니다.

## 배포 플랫폼

### Vercel (권장)

이 프로젝트는 Vercel에 최적화되어 있습니다.

#### 1. 사전 준비

**필요한 계정:**
- GitHub 계정
- Vercel 계정
- Supabase 계정
- Google Cloud Console (OAuth용)

#### 2. Supabase 설정

```sql
-- 1. 새 프로젝트 생성
-- Supabase 대시보드에서 새 프로젝트 생성

-- 2. 데이터베이스 URL 확인
-- Settings > Database > Connection string
```

#### 3. Google OAuth 설정

1. Google Cloud Console에서 새 프로젝트 생성
2. APIs & Services > Credentials로 이동
3. OAuth 2.0 Client ID 생성
4. 승인된 리디렉션 URI 추가:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

#### 4. Vercel 배포

1. GitHub에 프로젝트 푸시
2. Vercel에서 새 프로젝트 import
3. 환경 변수 설정 (아래 참조)
4. 배포 완료

#### 5. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

```env
# 데이터베이스
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[dbname]
DIRECT_URL=postgresql://[user]:[password]@[host]:[port]/[dbname]

# NextAuth.js
NEXTAUTH_SECRET=random-secret-string
NEXTAUTH_URL=https://your-domain.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 애플리케이션
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
CRON_SECRET=random-cron-secret
```

#### 6. 데이터베이스 마이그레이션

배포 후 데이터베이스 마이그레이션을 실행하세요:

```bash
# 로컬에서 프로덕션 DB에 마이그레이션
npx prisma migrate deploy
```

### Docker 배포

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# 의존성 설치
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 소스 코드와 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경 변수 설정
ENV NEXT_TELEMETRY_DISABLED 1

# Prisma 생성 및 빌드
RUN npx prisma generate
RUN npm run build

# 프로덕션 이미지
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - CRON_SECRET=${CRON_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=qrcode_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## 환경별 설정

### 개발 환경

```env
# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/qrcode_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 스테이징 환경

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://staging.your-domain.com"
NEXT_PUBLIC_APP_URL="https://staging.your-domain.com"
```

### 프로덕션 환경

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 배포 후 확인사항

### 1. 상태 확인

```bash
# 애플리케이션 상태
curl https://your-domain.com/api/health

# 데이터베이스 연결
curl https://your-domain.com/api/db-check
```

### 2. 로그 모니터링

Vercel 대시보드의 Functions 탭에서 로그를 확인하세요.

### 3. 성능 모니터링

- Vercel Analytics 활성화
- Web Vitals 모니터링
- Database 성능 확인

## 보안 설정

### 1. 환경 변수 보안

- 모든 민감한 정보는 환경 변수로 관리
- `.env.local`은 Git에서 제외
- 프로덕션에서는 강력한 시크릿 사용

### 2. CORS 설정

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
```

### 3. 데이터베이스 보안

- RLS (Row Level Security) 활성화
- 최소 권한 원칙 적용
- 정기적인 백업 설정

## 문제 해결

### 일반적인 배포 오류

#### 1. 빌드 실패
```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 의존성 재설치
npm ci
```

#### 2. 데이터베이스 연결 오류
- DATABASE_URL 형식 확인
- 네트워크 연결 확인
- Supabase 프로젝트 상태 확인

#### 3. 환경 변수 오류
- 모든 필수 환경 변수 설정 확인
- 값에 특수 문자가 있는 경우 따옴표 사용

### 성능 최적화

#### 1. 이미지 최적화
```typescript
// next.config.mjs
const nextConfig = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
}
```

#### 2. 캐싱 설정
```typescript
// API 응답 캐싱
export async function GET() {
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
```

## 유지보수

### 정기 작업

1. **주간**
   - 로그 확인 및 정리
   - 성능 메트릭 검토
   - 보안 업데이트 확인

2. **월간**
   - 의존성 업데이트
   - 데이터베이스 백업 확인
   - 사용량 분석

3. **분기별**
   - 보안 감사
   - 성능 최적화
   - 사용자 피드백 검토
