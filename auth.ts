import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
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
    maxAge: 30 * 24 * 60 * 60, // 30 days (리프레시 토큰 만료 시간)
    updateAge: 24 * 60 * 60, // 24 hours (세션 업데이트 주기)
  },
  jwt: {
    maxAge: 60 * 60, // 1 hour (액세스 토큰 만료 시간)
  },
  ...authConfig,
});
