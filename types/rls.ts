import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";

/**
 * RLS가 적용된 Prisma 클라이언트 타입
 */
export type RLSPrismaClient = PrismaClient;

/**
 * RLS 트랜잭션 콜백 타입
 */
export type RLSTransactionCallback<T> = (tx: PrismaClient) => Promise<T>;

/**
 * NextAuth 세션 타입 (RLS용)
 */
export interface RLSSession {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

/**
 * RLS 테스트 결과 타입
 */
export interface RLSTestResult {
  qrCodesCount: number;
  templatesCount: number;
  success: boolean;
  userId: string;
  timestamp: string;
}

/**
 * RLS 에러 타입
 */
export class RLSError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userId?: string,
  ) {
    super(message);
    this.name = "RLSError";
  }
}

/**
 * RLS 컨텍스트 타입
 */
export interface RLSContext {
  userId: string;
  sessionId?: string;
  timestamp: Date;
}
