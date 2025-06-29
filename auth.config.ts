import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import axios from "axios";
import { appConfig } from "@/config/app";
import { prisma } from "@/lib/prisma";
import {
  validateAuthEnvironment,
  logAuthEnvironment,
} from "@/lib/env-validation";
import { createAuthLog, createErrorLog } from "@/lib/log-utils";

// 확장된 JWT 타입 정의
interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  refreshTokenExpires?: number;
  rememberMe?: boolean;
  error?: string;
  currentProvider?: string;
}

// 확장된 Session 타입 정의
interface ExtendedSession extends Session {
  accessTokenExpires?: number;
  rememberMe?: boolean;
  error?: string;
  currentProvider?: string;
}

// 리프레시 토큰 함수
async function refreshAccessToken(token: ExtendedJWT): Promise<ExtendedJWT> {
  try {
    // Google OAuth2 토큰 갱신 예시
    if (token.refreshToken) {
      const response = await axios.post(
        "https://oauth2.googleapis.com/token",
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

      if (response.status !== 200) {
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
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email",
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
      // 로그인 성공 로그 기록
      try {
        await createAuthLog({
          userId: user.id,
          action: "LOGIN",
        });
      } catch (error) {
        console.error("로그인 로그 기록 실패:", error);
      }

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
    async signOut() {
      // 로그아웃 로그 기록은 클라이언트에서 처리
      console.log("사용자가 로그아웃했습니다");
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !user.email) return false;

      // OAuth 제공자의 경우 계정 연결 처리
      if (account.provider === "google" || account.provider === "github") {
        try {
          // 같은 이메일로 기존 사용자 확인
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true },
          });

          if (existingUser) {
            // 같은 제공자로 이미 연결된 계정이 있는지 확인
            const hasAccountWithProvider = existingUser.accounts.some(
              (existingAccount) =>
                existingAccount.provider === account.provider,
            );

            // 같은 제공자로 계정이 없으면 새 계정 연결
            if (!hasAccountWithProvider) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  refresh_token: account.refresh_token,
                },
              });

              // 사용자 정보 업데이트 (필요한 경우)
              if (profile?.name && !existingUser.name) {
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { name: profile.name },
                });
              }

              if (profile?.image && !existingUser.image) {
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { image: profile.image },
                });
              }
            }
          }

          return true;
        } catch (error) {
          console.error("계정 연결 처리 중 오류:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      const extendedToken = token as ExtendedJWT;

      // 초기 로그인 시 토큰 설정
      if (account && user) {
        const now = Math.floor(Date.now() / 1000);
        const expiresIn =
          account.expires_in || appConfig.session.accessTokenExpiresIn;
        const accessTokenExpires = now + expiresIn;

        // 기본적으로 기억하기를 false로 설정
        // (클라이언트에서 로그인 후 세션 업데이트를 통해 설정)
        const rememberMe = false;

        // 기억하기 설정에 따른 리프레시 토큰 만료 시간 계산
        const refreshTokenExpires = rememberMe
          ? now + appConfig.session.sessionMaxAgeRemember
          : now + appConfig.session.sessionMaxAgeDefault;

        // 개발 환경에서만 로그 출력
        if (process.env.AUTH_DEBUG === "true") {
          console.log("로그인 시 기억하기 설정:", rememberMe);
          console.log(
            "세션 만료 시간:",
            new Date(
              (rememberMe
                ? now + appConfig.session.sessionMaxAgeRemember
                : now + appConfig.session.sessionMaxAgeDefault) * 1000,
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
          currentProvider: account.provider, // 현재 로그인한 프로바이더 저장
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
              ? now + appConfig.session.sessionMaxAgeRemember
              : now + appConfig.session.sessionMaxAgeDefault;

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
            appConfig.session.refreshThresholdSeconds
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

        // 토큰 갱신 성공 로그
        try {
          await createAuthLog({
            userId: refreshedToken.sub || undefined,
            action: "REFRESH",
          });
        } catch (logError) {
          console.error("토큰 갱신 로그 기록 실패:", logError);
        }

        if (process.env.AUTH_DEBUG === "true") {
          console.log("토큰 갱신 성공");
        }
        return refreshedToken;
      } catch (error) {
        // 토큰 갱신 실패 로그
        try {
          await createAuthLog({
            userId: extendedToken.sub || undefined,
            action: "FAIL",
          });
          await createErrorLog({
            userId: extendedToken.sub || undefined,
            errorMessage: `토큰 갱신 실패: ${error instanceof Error ? error.message : String(error)}`,
          });
        } catch (logError) {
          console.error("토큰 갱신 실패 로그 기록 실패:", logError);
        }

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
        extendedSession.currentProvider = extendedToken.currentProvider; // 현재 프로바이더 정보 추가
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
