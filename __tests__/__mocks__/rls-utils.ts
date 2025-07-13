import { prisma } from "./prisma";

// Mock 버전의 validateUserId는 항상 성공
export const validateUserId = jest.fn((userId: string) => {
  // Test에서는 유효성 검사를 무시하고 항상 통과
  return;
});

// Mock 버전의 RLS 함수들은 Prisma 클라이언트를 반환
export const withRLS = jest.fn(async (userId: string) => {
  return prisma;
});

export const withRLSTransaction = jest.fn(
  async (userId: string, callback: any) => {
    if (typeof callback === "function") {
      return await callback(prisma);
    }
    return callback;
  },
);

export const withAuthenticatedRLS = jest.fn(async (session: any) => {
  return prisma;
});

export const withSystemRLS = jest.fn(async (callback: any) => {
  if (typeof callback === "function") {
    return await callback(prisma);
  }
  return prisma;
});

export const withAdminRLS = jest.fn(async (callback: any) => {
  if (typeof callback === "function") {
    return await callback(prisma);
  }
  return prisma;
});

export const resetRLS = jest.fn();

export const setupRLS = jest.fn();

export const cleanupRLS = jest.fn();
