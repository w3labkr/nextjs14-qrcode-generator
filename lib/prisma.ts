import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 서버 환경에서만 Prisma 클라이언트 초기화
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient();
};

// 클라이언트 사이드에서는 undefined 반환, 서버 사이드에서만 Prisma 클라이언트 반환
export const prisma = (() => {
  if (typeof window !== "undefined") {
    // 브라우저 환경에서는 undefined 반환
    return undefined as any;
  }

  // 서버 환경에서만 Prisma 클라이언트 초기화
  return globalForPrisma.prisma || createPrismaClient();
})();

// 개발 환경에서 글로벌 변수에 저장
if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
