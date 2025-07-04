"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withRLS, withRLSTransaction } from "@/lib/rls-utils";
import { ensureUserExists } from "@/lib/utils";
import {
  QrCodeGenerationOptions,
  SaveQrCodeData,
} from "@/types/qr-code-server";
import { generateQrCode } from "./qr-code-generator";
import { UnifiedLogger } from "@/lib/unified-logging";

export async function getUserQrCodes(page = 1, limit = 10) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = await withRLS(session.user.id);
  const skip = (page - 1) * limit;

  const [qrCodes, totalCount] = await Promise.all([
    db.qrCode.findMany({
      where: {
        userId: session.user.id, // 현재 사용자의 QR 코드만 조회
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    db.qrCode.count({
      where: {
        userId: session.user.id, // 현재 사용자의 QR 코드만 카운트
      },
    }),
  ]);

  return {
    qrCodes,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function toggleQrCodeFavorite(qrCodeId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id; // 타입 안전성을 위해 미리 추출

  try {
    return await withRLSTransaction(userId, async (tx) => {
      const qrCode = await tx.qrCode.findFirst({
        where: {
          id: qrCodeId,
          userId: userId, // 현재 사용자의 QR 코드만 조회
        },
      });

      if (!qrCode) {
        throw new Error("QR Code not found");
      }

      const updatedQrCode = await tx.qrCode.update({
        where: {
          id: qrCodeId,
          userId: userId, // 현재 사용자의 QR 코드만 수정
        },
        data: {
          isFavorite: !qrCode.isFavorite,
        },
      });

      // 감사 로그 기록
      await UnifiedLogger.logAudit({
        userId,
        action: updatedQrCode.isFavorite
          ? "FAVORITE_QR_CODE"
          : "UNFAVORITE_QR_CODE",
        tableName: "qr_codes",
        recordId: qrCodeId,
        newValues: { isFavorite: updatedQrCode.isFavorite },
        oldValues: { isFavorite: qrCode.isFavorite },
      });

      return updatedQrCode;
    });
  } catch (error) {
    // 에러 로그 기록
    await UnifiedLogger.logError({
      userId,
      error: error instanceof Error ? error : new Error(String(error)),
      additionalInfo: { action: "TOGGLE_QR_CODE_FAVORITE", qrCodeId },
    });
    throw error;
  }
}

export async function deleteQrCode(qrCodeId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id; // 타입 안전성을 위해 미리 추출

  try {
    return await withRLSTransaction(userId, async (tx) => {
      const qrCode = await tx.qrCode.findFirst({
        where: {
          id: qrCodeId,
          userId: userId, // 현재 사용자의 QR 코드만 조회
        },
      });

      if (!qrCode) {
        throw new Error("QR Code not found");
      }

      await tx.qrCode.delete({
        where: {
          id: qrCodeId,
          userId: userId, // 현재 사용자의 QR 코드만 삭제
        },
      });

      // 감사 로그 기록
      await UnifiedLogger.logAudit({
        userId,
        action: "DELETE_QR_CODE",
        tableName: "qr_codes",
        recordId: qrCodeId,
      });

      return { success: true };
    });
  } catch (error) {
    // 에러 로그 기록
    await UnifiedLogger.logError({
      userId,
      error: error instanceof Error ? error : new Error(String(error)),
      additionalInfo: { action: "DELETE_QR_CODE", qrCodeId },
    });
    throw error;
  }
}

export async function updateQrCode(
  qrCodeId: string,
  options: QrCodeGenerationOptions,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existingQrCode = await prisma.qrCode.findFirst({
      where: {
        id: qrCodeId,
        userId: session.user.id,
      },
    });

    if (!existingQrCode) {
      return { success: false, error: "QR Code not found" };
    }

    const qrCodeDataUrl = await generateQrCode(options);

    const updatedQrCode = await prisma.qrCode.update({
      where: {
        id: qrCodeId,
        userId: session.user.id, // 현재 사용자의 QR 코드만 수정
      },
      data: {
        type: options.qrType,
        title: options.title || null,
        content: options.text,
        settings: JSON.stringify({
          color: options.color,
          width: options.width,
          margin: options.margin,
          logo: options.logo,
          dotsOptions: options.dotsOptions,
          cornersSquareOptions: options.cornersSquareOptions,
          frameOptions: options.frameOptions,
        }),
      },
    });

    // 감사 로그 기록
    await UnifiedLogger.logAudit({
      userId: session.user.id,
      action: "UPDATE_QR_CODE",
      tableName: "qr_codes",
      recordId: qrCodeId,
    });

    return {
      success: true,
      qrCodeDataUrl,
      updatedQrCode,
    };
  } catch (error) {
    console.error("Error updating QR code:", error);

    // 에러 로그 기록
    await UnifiedLogger.logError({
      userId: session?.user?.id,
      error: error instanceof Error ? error : new Error(String(error)),
      additionalInfo: { action: "UPDATE_QR_CODE", qrCodeId },
    });

    return { success: false, error: "Failed to update QR code" };
  }
}

export async function saveQrCode(data: SaveQrCodeData) {
  try {
    const { session } = await ensureUserExists();

    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    const savedQrCode = await prisma.qrCode.create({
      data: {
        userId: session.user.id,
        type: data.type,
        title: data.title || null,
        content: data.content,
        settings: JSON.stringify(data.settings),
        isFavorite: false,
      },
    });

    // 감사 로그 기록
    await UnifiedLogger.logAudit({
      userId: session.user.id,
      action: "CREATE_QR_CODE",
      tableName: "qr_codes",
      recordId: savedQrCode.id,
    });

    return {
      success: true,
      qrCode: {
        ...savedQrCode,
        settings: JSON.parse(savedQrCode.settings),
      },
    };
  } catch (error) {
    console.error("QR 코드 저장 실패:", error);

    // 에러 로그 기록
    await UnifiedLogger.logError({
      userId: undefined, // session을 못 가져온 경우를 대비
      error: error instanceof Error ? error : new Error(String(error)),
      additionalInfo: { action: "SAVE_QR_CODE", data },
    });

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "QR 코드 저장에 실패했습니다.",
    };
  }
}

export async function getQrCodeStats() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, favorites, thisMonth, typeStats] = await Promise.all([
      prisma.qrCode.count({ where: { userId } }),
      prisma.qrCode.count({ where: { userId, isFavorite: true } }),
      prisma.qrCode.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.qrCode.groupBy({
        by: ["type"],
        where: { userId },
        _count: true,
      }),
    ]);

    const byType = typeStats.reduce(
      (acc: Record<string, number>, stat: any) => {
        acc[stat.type] = stat._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      success: true,
      stats: {
        total,
        favorites,
        thisMonth,
        byType,
      },
    };
  } catch (error) {
    console.error("QR 코드 통계 조회 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "통계를 불러오는데 실패했습니다.",
    };
  }
}

export async function clearQrCodeHistory() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    const userId = session.user.id;

    // 사용자의 모든 QR 코드 삭제
    const result = await prisma.qrCode.deleteMany({
      where: {
        userId,
      },
    });

    return {
      success: true,
      message: `${result.count}개의 QR 코드가 삭제되었습니다.`,
      deletedCount: result.count,
    };
  } catch (error) {
    console.error("QR 코드 히스토리 초기화 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "히스토리 초기화에 실패했습니다.",
    };
  }
}
