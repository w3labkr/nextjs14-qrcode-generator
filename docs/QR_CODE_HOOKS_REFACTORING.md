# QR Code Generator Hooks 리팩토링

## 개요

`useQrCodeGenerator` 훅이 너무 많은 책임을 가지고 있어서 가독성과 유지보수성을 개선하기 위해 리팩토링을 진행했습니다.

## 리팩토링 결과

### 1. 타입 정의 분리 (`types/qr-code.ts`)

공통으로 사용되는 타입들을 별도 파일로 분리했습니다:

- `QrCodeFormat`: QR 코드 포맷 타입
- `QrCodeType`: QR 코드 타입
- `FrameOptions`: 프레임 옵션 설정
- `QrCodeSettings`: QR 코드 설정 전체
- `QrCodeState`: QR 코드 상태
- `EditModeState`: 편집 모드 상태
- `TemplateState`: 템플릿 상태

### 2. 기능별 훅 분리

#### `useQrCodeSettings`

QR 코드의 모든 설정(색상, 로고, 크기, 프레임 등)을 관리합니다.

**주요 기능:**

- 설정 값 상태 관리
- 템플릿 설정 로드
- 현재 설정을 QrCodeOptions 형태로 변환
- 로고 파일 업로드 처리

#### `useEditMode`

QR 코드 편집 모드를 관리합니다.

**주요 기능:**

- 편집 모드 상태 관리
- URL 파라미터에서 편집 정보 파싱
- 편집할 QR 코드 데이터 로드
- 편집 모드 종료

#### `useTemplate`

템플릿 관련 기능을 관리합니다.

**주요 기능:**

- 기본 템플릿 자동 로드
- 로컬 스토리지에서 템플릿 설정 복원
- 템플릿 적용 상태 추적

#### `useQrCodeGeneration`

QR 코드 생성 관련 로직을 담당합니다.

**주요 기능:**

- 일반 QR 코드 생성
- 고해상도 QR 코드 생성
- 포맷 변경 처리
- 편집 모드에서의 업데이트
- PDF 변환 처리

#### `useQrCodeUtils`

유틸리티 함수들을 제공합니다.

**주요 기능:**

- 초기 효과 처리 (계정 삭제 메시지 등)
- 다운로드 파일명 생성

### 3. 메인 훅 개선

`useQrCodeGenerator`는 이제 다음과 같은 역할만 합니다:

- 각 특화된 훅들을 조합
- 전체적인 상태 오케스트레이션
- 컴포넌트에게 통합된 API 제공
- 템플릿 적용 후 자동 생성 로직

## 개선 효과

### 1. **관심사 분리 (Separation of Concerns)**

- 각 훅이 명확한 단일 책임을 가지게 됨
- 코드의 응집도 향상

### 2. **가독성 향상**

- 각 파일이 특정 기능에만 집중
- 코드 이해가 쉬워짐

### 3. **재사용성 증대**

- 개별 훅들을 다른 컴포넌트에서도 활용 가능
- 모듈화된 구조

### 4. **테스트 용이성**

- 각 기능을 독립적으로 테스트 가능
- 목(Mock) 작성이 쉬워짐

### 5. **유지보수성 향상**

- 버그 수정이나 기능 추가 시 영향 범위 최소화
- 코드 변경이 더 안전해짐

## 사용법

기존 `useQrCodeGenerator` 훅의 API는 동일하게 유지되므로, 컴포넌트 코드의 변경 없이 개선된 구조를 사용할 수 있습니다.

```typescript
const {
  qrData,
  setQrData,
  activeTab,
  qrCode,
  isLoading,
  foregroundColor,
  setForegroundColor,
  handleGenerate,
  handleLoadTemplate,
  // ... 기타 모든 기존 API
} = useQrCodeGenerator();
```

## 폴더 구조

```text
hooks/
├── use-qr-code-generator.ts      # 메인 훅 (조합기)
├── use-qr-code-settings.ts       # QR 코드 설정 관리
├── use-edit-mode.ts              # 편집 모드 관리
├── use-template.ts               # 템플릿 관리
├── use-qr-code-generation.ts     # QR 코드 생성 로직
└── use-qr-code-utils.ts          # 유틸리티 함수

types/
└── qr-code.ts                    # QR 코드 관련 타입 정의
```
