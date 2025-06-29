# API 문서

## 개요

QR Code Generator의 API 엔드포인트와 Server Actions에 대한 문서입니다.

## API Routes

### 인증 관련 API

#### `GET /api/auth/[...nextauth]`
NextAuth.js 인증 엔드포인트

#### `POST /api/auth/[...nextauth]`
NextAuth.js 인증 처리

### QR 코드 관련 API

#### `GET /api/qrcodes`
사용자의 QR 코드 목록 조회

**응답:**
```json
{
  "qrcodes": [
    {
      "id": "string",
      "type": "URL | TEXTAREA | WIFI | EMAIL | SMS | VCARD | LOCATION",
      "data": "object",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

#### `POST /api/qrcodes`
새로운 QR 코드 생성

**요청 본문:**
```json
{
  "type": "URL | TEXTAREA | WIFI | EMAIL | SMS | VCARD | LOCATION",
  "data": "object",
  "style": "object"
}
```

#### `DELETE /api/qrcodes/[id]`
QR 코드 삭제

### Cron 작업 API

#### `POST /api/cron/log-cleanup`
로그 정리 작업 실행

**헤더:**
```
Authorization: Bearer {CRON_SECRET}
```

#### `GET /api/cron/log-cleanup`
로그 정리 통계 조회

## Server Actions

### 계정 관리 (`app/actions/account-management.ts`)

#### `updateProfile(data: ProfileUpdateData)`
사용자 프로필 업데이트

#### `deleteAccount()`
사용자 계정 삭제

### QR 코드 관리 (`app/actions/qr-code-management.ts`)

#### `createQRCode(data: QRCodeCreateData)`
새로운 QR 코드 생성

#### `updateQRCode(id: string, data: QRCodeUpdateData)`
기존 QR 코드 업데이트

#### `deleteQRCode(id: string)`
QR 코드 삭제

#### `getUserQRCodes()`
사용자의 QR 코드 목록 조회

### 데이터 관리 (`app/actions/data-management.ts`)

#### `exportUserData()`
사용자 데이터 내보내기

#### `importUserData(data: ImportData)`
사용자 데이터 가져오기

### 로그 관리 (`app/actions/log-management.ts`)

#### `getLogs(filters?: LogFilters)`
시스템 로그 조회

#### `cleanupOldLogs()`
오래된 로그 정리

## 인증

모든 보호된 엔드포인트는 NextAuth.js 세션이 필요합니다.

### 세션 확인
```typescript
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }
  
  // API 로직
}
```

## 에러 처리

API는 표준 HTTP 상태 코드를 사용합니다:

- `200`: 성공
- `201`: 생성됨
- `400`: 잘못된 요청
- `401`: 인증되지 않음
- `403`: 권한 없음
- `404`: 찾을 수 없음
- `500`: 서버 오류

### 에러 응답 형식
```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "details": "추가 정보 (선택사항)"
}
```

## 데이터 타입

### QRCodeType
```typescript
type QRCodeType = 
  | "URL" 
  | "TEXTAREA" 
  | "WIFI" 
  | "EMAIL" 
  | "SMS" 
  | "VCARD" 
  | "LOCATION"
```

### QRCodeData
각 타입별로 다른 데이터 구조를 가집니다:

#### URL
```typescript
{
  url: string
}
```

#### TEXTAREA
```typescript
{
  text: string
}
```

#### WIFI
```typescript
{
  ssid: string
  password: string
  security: "WPA" | "WEP" | "nopass"
  hidden: boolean
}
```

#### EMAIL
```typescript
{
  to: string
  subject?: string
  body?: string
}
```

#### SMS
```typescript
{
  phone: string
  message?: string
}
```

#### VCARD
```typescript
{
  firstName: string
  lastName: string
  organization?: string
  phone?: string
  email?: string
  url?: string
}
```

#### LOCATION
```typescript
{
  latitude: number
  longitude: number
  query?: string
}
```

## 사용 예시

### QR 코드 생성
```typescript
const response = await fetch('/api/qrcodes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'URL',
    data: { url: 'https://example.com' },
    style: {
      width: 300,
      height: 300,
      type: 'svg'
    }
  })
})

const qrcode = await response.json()
```

### Server Action 사용
```typescript
import { createQRCode } from '@/app/actions/qr-code-management'

// 컴포넌트에서
const handleSubmit = async (data) => {
  const result = await createQRCode(data)
  if (result.success) {
    // 성공 처리
  }
}
```
