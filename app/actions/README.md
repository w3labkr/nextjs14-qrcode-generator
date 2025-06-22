# QR 코드 액션 파일 구조

기존의 `qr-code.ts` 파일이 너무 커져서 기능별로 분리했습니다.

## 파일 구조

```
app/actions/
├── index.ts                    # 모든 액션의 통합 export
├── qr-code.ts                  # 호환성을 위한 레거시 파일
├── qr-code-generator.ts        # QR 코드 생성 관련 기능
├── qr-code-management.ts       # QR 코드 CRUD 관리 기능
├── template-management.ts      # 템플릿 관리 기능
├── data-management.ts          # 데이터 가져오기/내보내기 기능
└── account-management.ts       # 계정 관리 기능

types/
└── qr-code-server.ts          # 서버 액션 관련 타입 정의

lib/utils/
└── qr-code-helpers.ts         # 헬퍼 함수들
```

## 각 파일의 기능

### `qr-code-generator.ts`
- `generateQrCode()` - 기본 QR 코드 생성
- `generateHighResQrCode()` - 고해상도 QR 코드 생성 (로그인 사용자 전용)
- `generateAndSaveQrCode()` - QR 코드 생성 및 자동 저장

### `qr-code-management.ts`
- `getUserQrCodes()` - 사용자의 QR 코드 목록 조회
- `saveQrCode()` - QR 코드 저장
- `updateQrCode()` - QR 코드 업데이트
- `deleteQrCode()` - QR 코드 삭제
- `toggleQrCodeFavorite()` - 즐겨찾기 토글
- `getQrCodeStats()` - QR 코드 통계 조회

### `template-management.ts`
- `getUserTemplates()` - 사용자 템플릿 목록 조회
- `saveTemplate()` - 템플릿 저장
- `updateTemplate()` - 템플릿 업데이트
- `deleteTemplate()` - 템플릿 삭제
- `getDefaultTemplate()` - 기본 템플릿 조회

### `data-management.ts`
- `exportUserData()` - 사용자 데이터 내보내기
- `importUserData()` - 사용자 데이터 가져오기

### `account-management.ts`
- `deleteAccount()` - 계정 삭제

### `qr-code-helpers.ts`
- `inferQrCodeType()` - QR 코드 컨텐츠 기반 타입 추정

## 사용 방법

### 기존 코드 (호환성 유지)
```typescript
import { generateQrCode, saveTemplate } from "@/app/actions/qr-code";
```

### 새로운 방식 (권장)
```typescript
// 통합 import
import { generateQrCode, saveTemplate } from "@/app/actions";

// 또는 개별 파일에서 import
import { generateQrCode } from "@/app/actions/qr-code-generator";
import { saveTemplate } from "@/app/actions/template-management";
```

### 타입 import
```typescript
import type { QrCodeOptions, QrCodeType } from "@/types/qr-code-server";
```

## 마이그레이션 가이드

기존 코드를 수정할 필요는 없습니다. `qr-code.ts`는 모든 기능을 re-export하므로 기존 import 구문이 그대로 작동합니다.

새로운 코드를 작성할 때는 다음 방식을 권장합니다:

1. **통합 export 사용**: `@/app/actions`에서 모든 것을 import
2. **타입 정의 분리**: `@/types/qr-code-server`에서 타입 import
3. **기능별 파일**: 특정 기능만 필요한 경우 해당 파일에서 직접 import

## 장점

1. **관심사 분리**: 각 파일이 명확한 책임을 가짐
2. **유지보수 용이**: 작은 파일로 분리되어 수정이 쉬움
3. **재사용성**: 필요한 기능만 선택적으로 import 가능
4. **타입 안전성**: 타입 정의가 별도 파일로 분리되어 관리 용이
5. **코드 가독성**: 각 파일의 목적이 명확함
