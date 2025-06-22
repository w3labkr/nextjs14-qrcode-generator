import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// 확장된 JWT 타입 정의
interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  refreshTokenExpires?: number;
  error?: string;
}

// 확장된 Session 타입 정의
interface ExtendedSession extends Session {
  accessTokenExpires?: number;
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

    // 개발 모드의 경우 단순히 새로운 만료 시간 설정
    if (token.sub === "dev-user") {
      const now = Math.floor(Date.now() / 1000);
      return {
        ...token,
        accessTokenExpires: now + 60 * 60, // 1시간 연장
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
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM,
    }),
    // 개발 모드에서만 활성화되는 Credentials 프로바이더
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            id: "dev-login",
            name: "개발자 로그인",
            credentials: {
              email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
              // 개발 모드에서만 허용
              if (process.env.NODE_ENV !== "development") {
                return null;
              }

              // 개발용 사용자 정보 반환
              return {
                id: "dev-user",
                name: "개발자",
                email: "dev@example.com",
                image: null,
              };
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      const extendedToken = token as ExtendedJWT;

      // 초기 로그인 시 토큰 설정
      if (account && user) {
        const now = Math.floor(Date.now() / 1000);
        const accessTokenExpires = now + 60 * 60; // 1시간
        const refreshTokenExpires = now + 30 * 24 * 60 * 60; // 30일

        return {
          ...extendedToken,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires,
          refreshTokenExpires,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        };
      }

      // 개발자 로그인 처리
      if (account?.provider === "dev-login") {
        const now = Math.floor(Date.now() / 1000);
        return {
          ...extendedToken,
          sub: "dev-user",
          name: "개발자",
          email: "dev@example.com",
          picture: null,
          accessTokenExpires: now + 60 * 60, // 1시간
          refreshTokenExpires: now + 30 * 24 * 60 * 60, // 30일
        };
      }

      // 액세스 토큰이 아직 유효한 경우
      const now = Math.floor(Date.now() / 1000);
      if (
        extendedToken.accessTokenExpires &&
        now < extendedToken.accessTokenExpires
      ) {
        // 세션 업데이트 시 토큰 갱신
        if (trigger === "update" && session) {
          extendedToken.name = session.name || extendedToken.name;
          extendedToken.email = session.email || extendedToken.email;
        }
        return extendedToken;
      }

      // 액세스 토큰이 만료되었지만 리프레시 토큰이 유효한 경우
      if (
        extendedToken.refreshTokenExpires &&
        now < extendedToken.refreshTokenExpires
      ) {
        try {
          const refreshedToken = await refreshAccessToken(extendedToken);
          return refreshedToken;
        } catch (error) {
          console.error("토큰 갱신 실패:", error);
          // 리프레시 실패 시 로그아웃 처리
          return {
            ...extendedToken,
            error: "RefreshAccessTokenError",
          };
        }
      }

      // 리프레시 토큰도 만료된 경우
      return {
        ...extendedToken,
        error: "RefreshAccessTokenError",
      };
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

        // 토큰 만료 정보 추가
        extendedSession.accessTokenExpires = extendedToken.accessTokenExpires;
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
