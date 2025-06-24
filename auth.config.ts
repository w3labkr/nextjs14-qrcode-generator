import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { TOKEN_CONFIG } from "@/lib/constants";
import {
  validateAuthEnvironment,
  logAuthEnvironment,
} from "@/lib/env-validation";

// 확장된 JWT 타입 정의
interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  refreshTokenExpires?: number;
  rememberMe?: boolean;
  error?: string;
}

// 확장된 Session 타입 정의
interface ExtendedSession extends Session {
  accessTokenExpires?: number;
  rememberMe?: boolean;
  error?: string;
}

// 리프레시 토큰 함수
async function refreshAccessToken(token: ExtendedJWT): Promise<ExtendedJWT> {
  try {
    // Google OAuth2 토큰 갱신 예시
    if (token.refreshToken) {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.AUTH_GOOGLE_ID!,
          client_secret: process.env.AUTH_GOOGLE_SECRET!,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        }),
        method: "POST",
      });

      const refreshedTokens = await response.json();

      if (!response.ok) {
        throw refreshedTokens;
      }

      const now = Math.floor(Date.now() / 1000);

      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        accessTokenExpires: now + (refreshedTokens.expires_in ?? 3600),
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      };
    }

    throw new Error("리프레시 토큰이 없습니다");
  } catch (error) {
    console.error("토큰 갱신 중 오류 발생:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: "openid email profile",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: false, // 디버그 모드 비활성화
  events: {
    async signIn({ user, account, profile }) {
      // 환경 변수 검증 로그 (필요시에만 활성화)
      if (process.env.AUTH_DEBUG === "true") {
        logAuthEnvironment();
        console.log("로그인 시도:", {
          provider: account?.provider,
          userId: user.id,
          email: user.email,
        });
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      const extendedToken = token as ExtendedJWT;

      // 초기 로그인 시 토큰 설정
      if (account && user) {
        const now = Math.floor(Date.now() / 1000);
        const expiresIn =
          account.expires_in || TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES_IN;
        const accessTokenExpires = now + expiresIn;

        // 기본적으로 기억하기를 false로 설정
        // (클라이언트에서 로그인 후 세션 업데이트를 통해 설정)
        const rememberMe = false;

        // 기억하기 설정에 따른 리프레시 토큰 만료 시간 계산
        const refreshTokenExpires = rememberMe
          ? now + TOKEN_CONFIG.SESSION_MAX_AGE_REMEMBER
          : now + TOKEN_CONFIG.SESSION_MAX_AGE_DEFAULT;

        // 개발 환경에서만 로그 출력
        if (process.env.AUTH_DEBUG === "true") {
          console.log("로그인 시 기억하기 설정:", rememberMe);
          console.log(
            "세션 만료 시간:",
            new Date(
              (rememberMe
                ? now + TOKEN_CONFIG.SESSION_MAX_AGE_REMEMBER
                : now + TOKEN_CONFIG.SESSION_MAX_AGE_DEFAULT) * 1000,
            ),
          );
        }

        return {
          ...extendedToken,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires,
          refreshTokenExpires,
          rememberMe,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        };
      }

      // 세션 업데이트 시 사용자 정보 갱신
      if (trigger === "update" && session) {
        extendedToken.name = session.name || extendedToken.name;
        extendedToken.email = session.email || extendedToken.email;
        extendedToken.picture = session.image || extendedToken.picture;

        // rememberMe 값이 세션 업데이트에 포함된 경우 토큰에 반영
        if (typeof (session as any).rememberMe === "boolean") {
          const prevRememberMe = extendedToken.rememberMe;
          extendedToken.rememberMe = (session as any).rememberMe;

          // 기억하기 설정이 변경된 경우 리프레시 토큰 만료 시간 재계산
          if (prevRememberMe !== extendedToken.rememberMe) {
            const now = Math.floor(Date.now() / 1000);
            extendedToken.refreshTokenExpires = extendedToken.rememberMe
              ? now + TOKEN_CONFIG.SESSION_MAX_AGE_REMEMBER
              : now + TOKEN_CONFIG.SESSION_MAX_AGE_DEFAULT;

            if (process.env.AUTH_DEBUG === "true") {
              console.log(
                "기억하기 설정 변경으로 인한 세션 만료 시간 업데이트:",
                new Date(extendedToken.refreshTokenExpires * 1000),
              );
            }
          }

          if (process.env.AUTH_DEBUG === "true") {
            console.log(
              "세션 업데이트로 rememberMe 설정:",
              extendedToken.rememberMe,
            );
          }
        }
      }

      const now = Math.floor(Date.now() / 1000);

      // 기억하기가 설정되지 않은 경우 토큰 자동 갱신하지 않음
      if (!extendedToken.rememberMe) {
        // 액세스 토큰이 만료된 경우 에러 반환
        if (
          extendedToken.accessTokenExpires &&
          now >= extendedToken.accessTokenExpires
        ) {
          if (process.env.AUTH_DEBUG === "true") {
            console.log("기억하기 미설정 - 토큰 만료");
          }
          return {
            ...extendedToken,
            error: "AccessTokenExpired",
          };
        }
        return extendedToken;
      }

      // 기억하기가 설정된 경우에만 자동 갱신 로직 실행
      // 액세스 토큰이 설정된 시간 이상 유효한 경우 그대로 반환
      if (
        extendedToken.accessTokenExpires &&
        now <
          extendedToken.accessTokenExpires -
            TOKEN_CONFIG.REFRESH_THRESHOLD_SECONDS
      ) {
        return extendedToken;
      }

      // 리프레시 토큰이 만료된 경우
      if (
        !extendedToken.refreshTokenExpires ||
        now >= extendedToken.refreshTokenExpires
      ) {
        if (process.env.AUTH_DEBUG === "true") {
          console.log("리프레시 토큰 만료");
        }
        return {
          ...extendedToken,
          error: "RefreshAccessTokenError",
        };
      }

      // 액세스 토큰 갱신 시도
      try {
        const refreshedToken = await refreshAccessToken(extendedToken);
        if (process.env.AUTH_DEBUG === "true") {
          console.log("토큰 갱신 성공");
        }
        return refreshedToken;
      } catch (error) {
        if (process.env.AUTH_DEBUG === "true") {
          console.error("토큰 갱신 실패:", error);
        }
        return {
          ...extendedToken,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedJWT;
      const extendedSession = session as ExtendedSession;

      // 토큰 에러가 있는 경우에도 기본 세션 반환 (로그아웃은 클라이언트에서 처리)
      if (extendedToken.error) {
        extendedSession.error = extendedToken.error;
        return extendedSession;
      }

      // JWT strategy를 사용하는 경우 token 정보를 session에 복사
      if (extendedToken && extendedSession.user) {
        extendedSession.user.id = extendedToken.sub || extendedSession.user.id;
        extendedSession.user.name =
          extendedToken.name || extendedSession.user.name;
        extendedSession.user.email =
          extendedToken.email || extendedSession.user.email;
        extendedSession.user.image =
          extendedToken.picture || extendedSession.user.image;

        // 토큰 만료 정보 및 기억하기 설정 추가
        extendedSession.accessTokenExpires = extendedToken.accessTokenExpires;
        extendedSession.rememberMe = extendedToken.rememberMe;
      }
      return extendedSession;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnHistory = nextUrl.pathname.startsWith("/history");
      const isOnAuth = nextUrl.pathname.startsWith("/auth");

      if (isOnDashboard || isOnHistory) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
