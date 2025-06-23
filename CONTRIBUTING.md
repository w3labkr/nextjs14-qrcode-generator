# 🤝 프로젝트 기여 가이드

저희 오픈소스 QR 코드 생성기 프로젝트에 관심을 가져주셔서 감사합니다! 여러분의 기여는 프로젝트를 더욱 발전시키는 데 큰 힘이 됩니다. 🎉

## 📋 기여할 수 있는 방법

### 🐛 버그 리포트
- 버그를 발견하시면 [Issues](https://github.com/w3labkr/nextjs14-qrcode-generator/issues)에 상세한 재현 방법과 함께 등록해주세요
- 스크린샷이나 에러 로그가 있으면 더욱 도움이 됩니다

### 💡 기능 제안
- 새로운 QR 코드 유형, UI 개선, 성능 최적화 등 아이디어가 있으시면 언제든 제안해주세요
- [Discussions](https://github.com/w3labkr/nextjs14-qrcode-generator/discussions)에서 커뮤니티와 토론할 수 있습니다

### 💻 코드 기여
- 버그 수정, 새로운 기능 추가, 코드 리팩토링 등
- TypeScript, React, Next.js 경험이 있으시면 더욱 환영합니다

### 📖 문서 개선
- README, 코드 주석, 가이드 문서 등의 개선
- 다국어 지원을 위한 번역 작업

### 🎨 디자인 및 UI/UX
- 새로운 QR 코드 프레임 디자인
- 사용자 경험 개선
- 모바일 최적화

## 🚀 개발 환경 설정

### 1. 저장소 Fork 및 Clone

```bash
# 1. GitHub에서 저장소를 Fork합니다
# 2. Fork한 저장소를 로컬에 Clone합니다
git clone https://github.com/YOUR-USERNAME/nextjs14-qrcode-generator.git
cd nextjs14-qrcode-generator

# 3. 원본 저장소를 upstream으로 추가합니다
git remote add upstream https://github.com/w3labkr/nextjs14-qrcode-generator.git
```

### 2. 개발 환경 준비

```bash
# Node.js 18+ 필요
node --version

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 환경 변수를 설정하세요

# 데이터베이스 설정 (Supabase)
npx prisma generate
npx prisma migrate dev --name init

# 개발 서버 실행
npm run dev
```

### 3. 브랜치 전략

```bash
# 최신 main 브랜치로 업데이트
git checkout main
git pull upstream main

# 새로운 기능 브랜치 생성
git checkout -b feat/새로운-기능-이름
# 또는 버그 수정의 경우
git checkout -b fix/버그-설명
```

## 📝 코딩 스타일 가이드

### TypeScript 규칙
- 모든 코드는 TypeScript로 작성
- `any` 타입 사용 금지 (불가피한 경우 주석으로 이유 명시)
- 타입 정의는 `types/` 디렉토리에 정리

### React 컴포넌트
- 함수형 컴포넌트만 사용
- Props 인터페이스는 컴포넌트 상단에 정의
- 커스텀 훅은 `hooks/` 디렉토리에 작성

### 코드 포매팅
```bash
# ESLint 규칙 검사
npm run lint

# Prettier 자동 포매팅 (설정은 자동으로 적용됩니다)
# VSCode 사용 시 저장할 때 자동 포매팅됩니다
```

### 커밋 메시지 규칙

프로젝트의 `.gitmessage.txt` 파일을 참고하여 일관된 커밋 메시지를 작성해주세요:

```bash
# Conventional Commits 형식 사용
feat: 새로운 QR 코드 유형 추가
fix: Wi-Fi QR 코드 생성 버그 수정
docs: README 파일 업데이트
style: 코드 포매팅 개선
refactor: QR 코드 생성 로직 리팩토링
test: 단위 테스트 추가
chore: 의존성 패키지 업데이트
```

## 🔍 Pull Request 가이드

### PR 생성 전 체크리스트
- [ ] 코드가 정상적으로 동작하는지 테스트
- [ ] ESLint 오류가 없는지 확인 (`npm run lint`)
- [ ] 타입 에러가 없는지 확인 (`npm run build`)
- [ ] 변경 사항에 대한 설명을 명확히 작성

### PR 템플릿

```markdown
## 변경 사항 요약
- 무엇을 변경했는지 간략히 설명

## 변경 이유
- 왜 이 변경이 필요한지 설명

## 테스트 방법
- 어떻게 테스트했는지 설명
- 스크린샷이 있으면 첨부

## 체크리스트
- [ ] 로컬에서 정상 동작 확인
- [ ] ESLint 통과
- [ ] 타입 검사 통과
- [ ] 관련 문서 업데이트 (필요시)
```

## 🧪 테스트 가이드

### 수동 테스트
```bash
# 개발 서버에서 테스트
npm run dev

# 프로덕션 빌드 테스트
npm run build
npm start
```

### 테스트해야 할 주요 기능
- QR 코드 생성 (7가지 유형)
- 사용자 인증 (Google OAuth)
- QR 코드 히스토리 관리
- 다운로드 기능 (PNG, SVG, JPG)
- 반응형 디자인 (모바일, 태블릿, 데스크톱)

## 📚 프로젝트 구조 이해

```
app/                    # Next.js 14 App Router
├── actions/           # Server Actions
├── api/               # API Routes
├── dashboard/         # 사용자 대시보드
└── qrcode/           # QR 코드 생성 페이지

components/            # React 컴포넌트
├── ui/               # Shadcn UI 컴포넌트 (45개+)
├── qr-code-forms/    # QR 코드 유형별 폼
└── template-manager/ # 템플릿 관리

hooks/                 # 커스텀 훅 & Zustand 스토어
lib/                   # 유틸리티 함수
types/                 # TypeScript 타입 정의
prisma/                # 데이터베이스 스키마
```

## 🔒 보안 고려사항

- 사용자 입력 검증을 철저히 해주세요
- XSS, CSRF 등 보안 취약점을 고려해주세요
- 개인정보는 최소한으로 수집하고 안전하게 처리해주세요
- 환경 변수에는 민감한 정보를 절대 커밋하지 마세요

## 🆘 도움이 필요하신가요?

- **질문**: [GitHub Discussions](https://github.com/w3labkr/nextjs14-qrcode-generator/discussions)
- **버그 신고**: [GitHub Issues](https://github.com/w3labkr/nextjs14-qrcode-generator/issues)
- **보안 문의**: [SECURITY.md](./SECURITY.md) 참고

## 🎉 기여자 인정

모든 기여자들은 프로젝트의 성공에 중요한 역할을 합니다. 기여해주신 모든 분들께 감사드립니다!

---

**함께 만들어가는 오픈소스 프로젝트, 여러분의 참여를 기다립니다! 💪**
