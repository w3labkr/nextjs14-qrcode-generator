# 개발 가이드

## 개발 환경 설정

### 필수 조건

- Node.js 18 이상
- npm 또는 yarn
- Git
- VSCode (권장)

### 로컬 설정

```bash
# 저장소 클론
git clone https://github.com/your-username/nextjs14-qrcode-generator.git
cd nextjs14-qrcode-generator

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 데이터베이스 설정 (Supabase 또는 로컬 PostgreSQL)
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

## 프로젝트 구조

### 디렉토리 구조

```
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   │   ├── account-management.ts
│   │   ├── data-management.ts
│   │   ├── log-management.ts
│   │   ├── qr-code-generator.ts
│   │   ├── qr-code-management.ts
│   │   └── template-management.ts
│   ├── api/              # API Routes
│   │   ├── auth/         # NextAuth.js
│   │   ├── cron/         # Cron 작업
│   │   └── qrcodes/      # QR 코드 API
│   ├── auth/             # 인증 페이지
│   ├── dashboard/        # 보호된 대시보드
│   └── qrcode/           # QR 코드 생성
├── components/            # 재사용 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   └── [utility-components]
├── lib/                  # 유틸리티 함수
├── hooks/                # 커스텀 훅 & 스토어
├── types/                # TypeScript 타입
└── prisma/               # 데이터베이스 스키마
```

## 코딩 스타일

### TypeScript

```typescript
// 타입 우선 접근
interface User {
  id: string
  email: string
  name?: string
}

// 함수 타입 정의
type QRCodeGenerator = (data: QRCodeData) => Promise<string>

// 컴포넌트 Props
interface QRCodeFormProps {
  onSubmit: (data: QRCodeData) => void
  defaultValues?: Partial<QRCodeData>
}
```

### React 컴포넌트

```typescript
// 함수 컴포넌트 사용
export function QRCodeForm({ onSubmit, defaultValues }: QRCodeFormProps) {
  // React Hook Form 사용
  const form = useForm<QRCodeData>({
    resolver: zodResolver(qrCodeSchema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* 폼 내용 */}
      </form>
    </Form>
  )
}
```

### CSS/Tailwind

```tsx
// Tailwind 유틸리티 클래스 사용
<div className="flex items-center justify-between p-4 border rounded-lg">
  <span className="text-sm font-medium">QR 코드</span>
  <Button variant="outline" size="sm">
    다운로드
  </Button>
</div>

// shadcn/ui 컴포넌트 활용
<Card>
  <CardHeader>
    <CardTitle>QR 코드 생성</CardTitle>
  </CardHeader>
  <CardContent>
    {/* 내용 */}
  </CardContent>
</Card>
```

## 상태 관리

### Zustand 스토어

```typescript
// hooks/use-qr-store.ts
interface QRStore {
  qrCodes: QRCode[]
  currentQR: QRCode | null
  setQRCodes: (qrCodes: QRCode[]) => void
  setCurrentQR: (qr: QRCode | null) => void
}

export const useQRStore = create<QRStore>((set) => ({
  qrCodes: [],
  currentQR: null,
  setQRCodes: (qrCodes) => set({ qrCodes }),
  setCurrentQR: (currentQR) => set({ currentQR }),
}))
```

### React Hook Form

```typescript
// 폼 스키마 정의
const qrCodeSchema = z.object({
  type: z.enum(['URL', 'TEXTAREA', 'WIFI', 'EMAIL', 'SMS', 'VCARD', 'LOCATION']),
  data: z.object({
    // 타입별 데이터 스키마
  }),
  style: z.object({
    width: z.number().min(100).max(1000),
    height: z.number().min(100).max(1000),
  }).optional(),
})

// 컴포넌트에서 사용
const form = useForm<QRCodeData>({
  resolver: zodResolver(qrCodeSchema),
})
```

## 데이터베이스

### Prisma 스키마

```prisma
model QRCode {
  id        String   @id @default(cuid())
  type      QRCodeType
  data      Json
  style     Json?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("qr_codes")
}
```

### 마이그레이션

```bash
# 새 마이그레이션 생성
npx prisma migrate dev --name add_qr_code_table

# 프로덕션 마이그레이션
npx prisma migrate deploy

# 스키마 동기화
npx prisma db push
```

## API 개발

### Server Actions

```typescript
'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function createQRCode(data: QRCodeCreateData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('인증이 필요합니다')
  }

  try {
    const qrCode = await prisma.qRCode.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return { success: true, qrCode }
  } catch (error) {
    console.error('QR 코드 생성 실패:', error)
    return { success: false, error: 'QR 코드 생성에 실패했습니다' }
  }
}
```

### API Routes

```typescript
// app/api/qrcodes/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  // API 로직
  return Response.json({ qrCodes })
}
```

## 테스트

### 단위 테스트

```typescript
// __tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { generateQRCode } from '@/lib/qr-utils'

describe('QR 코드 유틸리티', () => {
  it('URL QR 코드를 생성해야 함', async () => {
    const result = await generateQRCode({
      type: 'URL',
      data: { url: 'https://example.com' },
    })
    
    expect(result).toBeDefined()
    expect(result.type).toBe('URL')
  })
})
```

### 컴포넌트 테스트

```typescript
// __tests__/components/qr-form.test.tsx
import { render, screen } from '@testing-library/react'
import { QRCodeForm } from '@/components/qr-form'

describe('QRCodeForm', () => {
  it('폼이 올바르게 렌더링되어야 함', () => {
    render(<QRCodeForm onSubmit={jest.fn()} />)
    
    expect(screen.getByLabelText('QR 코드 타입')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '생성' })).toBeInTheDocument()
  })
})
```

## 디버깅

### 개발 도구

```typescript
// 개발 환경에서만 로그 출력
if (process.env.NODE_ENV === 'development') {
  console.log('디버그:', data)
}

// 에러 로깅
import { logError } from '@/lib/error-logging'

try {
  // 코드 실행
} catch (error) {
  logError('QR 코드 생성 실패', error, { userId, data })
  throw error
}
```

### Next.js 디버깅

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## 성능 최적화

### 이미지 최적화

```typescript
import Image from 'next/image'

// Next.js Image 컴포넌트 사용
<Image
  src="/qr-code.png"
  alt="QR 코드"
  width={300}
  height={300}
  priority={true}
/>
```

### 코드 분할

```typescript
// 동적 임포트 사용
import dynamic from 'next/dynamic'

const QRCodePreview = dynamic(() => import('@/components/qr-code-preview'), {
  loading: () => <div>로딩 중...</div>,
  ssr: false,
})
```

### 메모이제이션

```typescript
import { useMemo, useCallback } from 'react'

function QRCodeList({ qrCodes }: { qrCodes: QRCode[] }) {
  const sortedQRCodes = useMemo(() => {
    return qrCodes.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [qrCodes])

  const handleDelete = useCallback((id: string) => {
    // 삭제 로직
  }, [])

  return (
    // 렌더링
  )
}
```

## 보안

### 입력 검증

```typescript
import { z } from 'zod'

// Zod 스키마로 입력 검증
const urlSchema = z.string().url('올바른 URL을 입력하세요')
const emailSchema = z.string().email('올바른 이메일을 입력하세요')

// 서버에서 검증
export async function createQRCode(data: unknown) {
  const validatedData = qrCodeSchema.parse(data)
  // 처리 로직
}
```

### CSRF 보호

```typescript
// Server Actions는 자동으로 CSRF 보호
'use server'

export async function updateProfile(formData: FormData) {
  // 자동으로 CSRF 토큰 검증됨
}
```

## Git 워크플로우

### 브랜치 전략

```bash
# 기능 개발
git checkout -b feature/qr-code-styling
git commit -m "feat: QR 코드 스타일링 기능 추가"
git push origin feature/qr-code-styling

# 버그 수정
git checkout -b fix/qr-code-generation
git commit -m "fix: QR 코드 생성 오류 수정"
git push origin fix/qr-code-generation
```

### 커밋 메시지

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 업데이트
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드/설정 관련 변경
```

## 유용한 명령어

```bash
# 개발 서버 (Turbo 모드)
npm run dev

# 프로덕션 빌드
npm run build

# 타입 체크
npx tsc --noEmit

# 린트 검사
npm run lint

# 코드 포매팅
npx prettier --write .

# 데이터베이스 리셋
npx prisma migrate reset

# 의존성 업데이트
npm run upgrade:latest
```
