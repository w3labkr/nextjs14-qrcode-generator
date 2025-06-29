import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { appConfig } from "@/config/app";
import authConfig from "./auth.config";

// 서버 환경에서만 실행되는 인증 설정
let prismaAdapter: any = undefined;

// 서버 환경에서만 Prisma adapter 초기화
if (typeof window === "undefined") {
  try {
    const { prisma } = require("@/lib/prisma");
    if (prisma) {
      prismaAdapter = PrismaAdapter(prisma);
    }
  } catch (error) {
    console.warn("Prisma adapter 초기화 실패:", error);
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: prismaAdapter,
  session: {
    strategy: "jwt",
    // 기본 세션 만료 시간 (기억하기 설정에 따라 동적으로 결정)
    maxAge: appConfig.session.sessionMaxAgeRemember, // 최대 30일
    updateAge: 24 * 60 * 60, // 24시간마다 세션 업데이트
  },
  jwt: {
    maxAge: appConfig.session.sessionMaxAgeRemember, // JWT 토큰 최대 만료 시간
  },
  trustHost: true, // 다중 호스트 환경에서 신뢰할 수 있는 호스트로 설정
  experimental: {
    enableWebAuthn: false,
  },
  ...authConfig,
});
