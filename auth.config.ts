import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
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
    async jwt({ token, user, account }) {
      // 개발자 로그인 처리
      if (account?.provider === "dev-login") {
        token.sub = "dev-user";
        token.name = "개발자";
        token.email = "dev@example.com";
        token.picture = null;
      }
      return token;
    },
    async session({ session, token }) {
      // JWT strategy를 사용하는 경우 token 정보를 session에 복사
      if (token) {
        session.user.id = token.sub || "dev-user";
        session.user.name = token.name || "개발자";
        session.user.email = token.email || "dev@example.com";
        session.user.image = token.picture || null;
      }
      return session;
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
