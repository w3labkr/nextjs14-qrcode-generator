# 오픈소스 QR 코드 생성기

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 회원가입이나 로그인 없이 누구나 즉시 사용할 수 있는 강력하고 아름다운 정적 QR 코드 생성기

이 프로젝트는 Next.js 14, Tailwind CSS, Shadcn UI를 사용하여 구축된 오픈소스 QR 코드 생성기입니다. 사용자는 다양한 유형의 정적 QR 코드를 생성하고, 색상, 로고, 모양 등 광범위한 옵션을 통해 자유롭게 커스터마이징할 수 있습니다.

## ✨ 주요 기능

- **다양한 콘텐츠 유형 지원**: URL, 텍스트, Wi-Fi 정보를 QR 코드로 변환할 수 있습니다.
- **자유로운 커스터마이징**: 전경색, 배경색, 로고 삽입, QR 코드 둥글기 및 모서리 패턴 변경 등 세밀한 디자인 설정이 가능합니다.
- **고해상도 다운로드**: 생성된 QR 코드를 PNG, SVG, JPEG, PDF 등 다양한 형식으로 다운로드할 수 있습니다.
- **프레임 추가**: "스캔해 주세요!"와 같은 문구를 포함한 여러 유형의 프레임을 추가하여 사용자의 스캔을 유도할 수 있습니다.
- **Wi-Fi QR 코드 지원**: Wi-Fi 네트워크 정보를 쉽게 QR 코드로 변환하여 즉시 네트워크에 연결할 수 있습니다.
- **PWA 지원**: 오프라인 환경에서도 웹 애플리케이션을 사용할 수 있습니다.

## 🛠️ 기술 스택

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **QR Code Generation**: [qr-code-styling-node](https://www.npmjs.com/package/qr-code-styling-node), [qrcode](https://www.npmjs.com/package/qrcode)
- **PDF Generation**: [jsPDF](https://www.npmjs.com/package/jspdf)
- **Fonts**: Nanum Gothic (한글 지원)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 시작하기

### 1. 저장소 복제

```bash
git clone https://github.com/w3labkr/nextjs14-qrcode-generator.git
cd nextjs14-qrcode-generator
```

### 2. 종속성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

이제 브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 📘 문서

프로젝트의 추가 문서는 다음에서 확인할 수 있습니다:

- [기능 상세 설명](./docs/FEATURES.md) - 주요 기능 사용법 및 세부 설정
- [의존성 패키지 목록](./docs/DEPENDENCIES.md) - 프로젝트에 사용된 패키지 정보

## 🛡️ 보안

보안 취약점 보고나 관련 문의는 [SECURITY.md](./SECURITY.md) 파일을 참고해주세요.

## 🤝 기여 방법

이 프로젝트는 오픈소스이며, 여러분의 기여를 환영합니다. 버그 리포트, 기능 제안, 코드 기여 등 어떤 형태의 참여든 환영합니다.

자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md) 파일을 참고해주세요.

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참고해주세요.
