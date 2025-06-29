import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 서버 환경에서만 Prisma 클라이언트 초기화
const createPrismaClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("PrismaClient는 서버 환경에서만 사용할 수 있습니다.");
  }
  return new PrismaClient();
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
