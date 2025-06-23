// 환경 변수 검증 유틸리티

export function validateAuthEnvironment() {
  const requiredVars = {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error("❌ 누락된 환경 변수:", missingVars);
    return false;
  }

  // Google OAuth ID 형식 검증
  const googleId = process.env.AUTH_GOOGLE_ID;
  if (googleId && !googleId.endsWith('.apps.googleusercontent.com')) {
    console.error("❌ Google OAuth ID 형식이 올바르지 않습니다");
    return false;
  }

  // NEXTAUTH_URL 형식 검증
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl && !nextAuthUrl.startsWith('http')) {
    console.error("❌ NEXTAUTH_URL이 http/https로 시작하지 않습니다");
    return false;
  }

  console.log("✅ 모든 필수 환경 변수가 설정되었습니다");
  return true;
}

export function logAuthEnvironment() {
  console.log("🔧 인증 환경 변수 상태:");
  console.log("- AUTH_SECRET:", process.env.AUTH_SECRET ? "✅ 설정됨" : "❌ 누락");
  console.log("- AUTH_GOOGLE_ID:", process.env.AUTH_GOOGLE_ID ? "✅ 설정됨" : "❌ 누락");
  console.log("- AUTH_GOOGLE_SECRET:", process.env.AUTH_GOOGLE_SECRET ? "✅ 설정됨" : "❌ 누락");
  console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "❌ 누락");
  console.log("- NODE_ENV:", process.env.NODE_ENV);
}
