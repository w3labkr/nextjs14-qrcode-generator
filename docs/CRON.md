# Vercel 크론잡 설정 가이드

## 개요

Supabase 무료 플랜에서는 1주일 동안 API 호출이 없으면 프로젝트가 일시 정지됩니다. 이를 방지하기 위해 Vercel 크론잡을 사용하여 매일 자동으로 데이터베이스에 간단한 조회를 실행합니다.

## 설정 방법

### 1. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

```bash
CRON_SECRET=your-secure-random-string-here
```

> 💡 **팁**: 32자 이상의 강력한 랜덤 문자열을 사용하세요.

### 2. Vercel 프로젝트 설정

`vercel.json` 파일이 프로젝트 루트에 이미 구성되어 있습니다:

```json
{
  "crons": [
    {
      "path": "/api/cron/keep-alive",
      "schedule": "0 12 * * *"
    }
  ]
}
```

### 3. 크론잡 스케줄

- **스케줄**: `0 12 * * *` (매일 UTC 12시)
- **한국 시간**: 매일 오후 9시 (UTC+9)
- **빈도**: 하루에 한 번

## API 엔드포인트

### `/api/cron/keep-alive`

데이터베이스 비활성화 방지를 위한 크론잡 엔드포인트입니다.

**메서드**: `GET`

**인증**: Bearer 토큰 (`CRON_SECRET`)

**응답 예시**:

```json
{
  "success": true,
  "timestamp": "2024-06-24T12:00:00.000Z",
  "userCount": 42,
  "message": "Database keep-alive successful"
}
```

## 보안

- API 엔드포인트는 `CRON_SECRET`으로 보호됩니다
- 크론잡만 이 엔드포인트에 접근할 수 있습니다
- 불법적인 접근 시 401 Unauthorized 응답

## 모니터링

### Vercel 대시보드

1. Vercel 프로젝트 대시보드로 이동
2. **Functions** 탭 클릭
3. 크론잡 실행 로그 확인

### 로그 확인

크론잡 실행 시 다음과 같은 로그가 출력됩니다:

```bash
[CRON] Keep-alive executed at 2024-06-24T12:00:00.000Z, user count: 42
```

## 문제 해결

### 크론잡이 실행되지 않는 경우

1. **환경 변수 확인**: `CRON_SECRET`이 올바르게 설정되었는지 확인
2. **Vercel 프로 플랜**: 크론잡은 Vercel Pro 플랜에서만 사용 가능
3. **배포 확인**: `vercel.json` 파일이 올바르게 배포되었는지 확인

### 데이터베이스 연결 오류

1. **DATABASE_URL 확인**: Supabase 연결 URL이 올바른지 확인
2. **네트워크 문제**: Supabase 서비스 상태 확인
3. **권한 문제**: 데이터베이스 접근 권한 확인

## 비용 최적화

- **최소한의 조회**: `count()` 연산만 실행하여 데이터 전송량 최소화
- **일일 1회**: 과도한 호출을 방지하여 Supabase API 제한 준수
- **로그 최소화**: 필요한 정보만 로깅

## 추가 정보

- [Vercel 크론잡 문서](https://vercel.com/docs/cron-jobs)
- [Supabase 프로젝트 일시정지 정책](https://supabase.com/docs/guides/platform/going-into-prod#pausing)

---

> ⚠️ **주의**: Vercel Pro 플랜($20/월)이 필요합니다. Hobby 플랜에서는 크론잡을 사용할 수 없습니다.
