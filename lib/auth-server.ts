import axios from "axios";
import { UnifiedLogger } from "@/lib/unified-logging";

// 서버 전용 인증 유틸리티 함수들
export async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.AUTH_GOOGLE_ISSUER}/oauth2/v4/token`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const refreshedTokens = response.data;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("토큰 갱신 중 오류 발생:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export async function handleSignIn(user: any, account: any, profile: any) {
  try {
    if (typeof window !== "undefined") {
      return true; // 클라이언트 사이드에서는 기본 동작
    }

    // 동적으로 prisma import
    const { prisma } = await import("@/lib/prisma");
    if (!prisma) {
      return true; // prisma가 없으면 기본 동작
    }

    // 로그인 성공 로그 기록
    await UnifiedLogger.logAuth({
      userId: user.id || user.email,
      action: "LOGIN",
      authAction: "LOGIN",
    });

    return true;
  } catch (error) {
    console.error("로그인 처리 중 오류:", error);

    try {
      const { prisma } = await import("@/lib/prisma");
      if (prisma) {
        await UnifiedLogger.logError({
          userId: user?.id || null,
          error: error instanceof Error ? error : new Error(String(error)),
          additionalInfo: { action: "LOGIN_PROCESS" },
        });
      }
    } catch (logError) {
      console.error("로그 기록 실패:", logError);
    }

    return false;
  }
}

export async function handleSignOut(session: any) {
  try {
    if (typeof window !== "undefined") {
      return; // 클라이언트 사이드에서는 기본 동작
    }

    // 동적으로 prisma import
    const { prisma } = await import("@/lib/prisma");
    if (!prisma) {
      return; // prisma가 없으면 기본 동작
    }

    // 로그아웃 로그 기록
    await UnifiedLogger.logAuth({
      userId: session?.user?.id || session?.user?.email,
      action: "LOGOUT",
      authAction: "LOGOUT",
    });
  } catch (error) {
    console.error("로그아웃 처리 중 오류:", error);

    try {
      const { prisma } = await import("@/lib/prisma");
      if (prisma) {
        await UnifiedLogger.logError({
          userId: session?.user?.id || null,
          error: error instanceof Error ? error : new Error(String(error)),
          additionalInfo: { action: "LOGOUT_PROCESS" },
        });
      }
    } catch (logError) {
      console.error("로그 기록 실패:", logError);
    }
  }
}
