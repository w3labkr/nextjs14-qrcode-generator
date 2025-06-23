import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { TOKEN_CONFIG } from "@/lib/constants";
import authConfig from "./auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    // 기본 세션 만료 시간 (기억하기 설정에 따라 동적으로 결정)
    maxAge: TOKEN_CONFIG.SESSION_MAX_AGE_REMEMBER, // 최대 30일
    updateAge: 24 * 60 * 60, // 24시간마다 세션 업데이트
  },
  jwt: {
    maxAge: TOKEN_CONFIG.SESSION_MAX_AGE_REMEMBER, // JWT 토큰 최대 만료 시간
  },
  ...authConfig,
});
